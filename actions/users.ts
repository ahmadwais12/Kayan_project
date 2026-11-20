"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/auth/guards";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { getSession } from "@/lib/auth/session";
import { checked, field, redirectWith } from "@/lib/form-helpers";
import { logAudit } from "@/lib/audit";
import { PERMISSIONS } from "@/lib/auth/permissions";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function back(path: string, type: "saved" | "error" | "deleted", message?: string): never {
  redirect(redirectWith(path, type, message));
}

const userSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(120),
  email: z.email("Enter a valid email address").max(200),
  roleId: z.string().trim().min(1, "Select a role"),
  isActive: z.boolean(),
  avatarUrl: z.string().trim().max(500).optional().default(""),
  password: z.string().max(200).optional().default(""),
});

export async function saveAdminUser(formData: FormData) {
  const gate = await authorize("users.manage");
  if (gate.error || !gate.session) back("/admin/users", "error", gate.error || "Unauthorized");

  const id = field(formData, "id");
  const parsed = userSchema.safeParse({
    name: field(formData, "name"),
    email: field(formData, "email").toLowerCase(),
    roleId: field(formData, "roleId"),
    isActive: checked(formData, "isActive"),
    avatarUrl: field(formData, "avatarUrl"),
    password: field(formData, "password"),
  });
  if (!parsed.success) back(id ? `/admin/users/${id}` : "/admin/users/new", "error", parsed.error.issues[0]?.message);

  const role = await prisma.role.findUnique({ where: { id: parsed.data.roleId } });
  if (!role) back(id ? `/admin/users/${id}` : "/admin/users/new", "error", "The selected role no longer exists");

  if (!id) {
    if (parsed.data.password.length < 12) {
      back("/admin/users/new", "error", "Set a password of at least 12 characters");
    }
    const existing = await prisma.adminUser.findUnique({ where: { email: parsed.data.email } });
    if (existing) back("/admin/users/new", "error", "A user with that email already exists");

    const created = await prisma.adminUser.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        roleId: role.id,
        isActive: parsed.data.isActive,
        avatarUrl: parsed.data.avatarUrl || null,
        passwordHash: await hashPassword(parsed.data.password),
      },
    });

    await logAudit({
      userId: gate.session.user.id,
      action: "user.create",
      entity: "AdminUser",
      entityId: created.id,
      meta: { email: created.email, role: role.slug },
    });

    revalidatePath("/admin/users");
    back("/admin/users", "saved", "User created.");
  }

  const existing = await prisma.adminUser.findUnique({ where: { id } });
  if (!existing || existing.deletedAt) back("/admin/users", "error", "User not found");

  if (existing.id === gate.session.user.id) {
    if (!parsed.data.isActive) back(`/admin/users/${id}`, "error", "You cannot deactivate your own account");
    if (existing.roleId !== role.id) back(`/admin/users/${id}`, "error", "You cannot change your own role");
  }

  const emailTaken = await prisma.adminUser.findFirst({
    where: { email: parsed.data.email, id: { not: id } },
  });
  if (emailTaken) back(`/admin/users/${id}`, "error", "Another user already uses that email");

  const demotingSuperAdmin =
    existing.roleId !== role.id &&
    role.slug !== "super-admin" &&
    (await prisma.role.findUnique({ where: { id: existing.roleId } }))?.slug === "super-admin";
  if (demotingSuperAdmin) {
    const remaining = await prisma.adminUser.count({
      where: { deletedAt: null, isActive: true, role: { slug: "super-admin" }, id: { not: id } },
    });
    if (remaining === 0) back(`/admin/users/${id}`, "error", "At least one active Super Admin is required");
  }

  if (!parsed.data.isActive && existing.id !== gate.session.user.id) {
    const otherSupers = await prisma.adminUser.count({
      where: {
        deletedAt: null,
        isActive: true,
        role: { slug: "super-admin" },
        id: { not: id },
      },
    });
    const existingRole = await prisma.role.findUnique({ where: { id: existing.roleId } });
    if (existingRole?.slug === "super-admin" && otherSupers === 0) {
      back(`/admin/users/${id}`, "error", "At least one active Super Admin is required");
    }
  }

  const updated = await prisma.adminUser.update({
    where: { id },
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      roleId: role.id,
      isActive: parsed.data.isActive,
      avatarUrl: parsed.data.avatarUrl || null,
      ...(parsed.data.password
        ? { passwordHash: await hashPassword(parsed.data.password) }
        : {}),
    },
  });

  if (parsed.data.password || !parsed.data.isActive) {
    await prisma.adminSession.deleteMany({
      where: { userId: id, ...(parsed.data.isActive ? {} : {}) },
    });
  }

  await logAudit({
    userId: gate.session.user.id,
    action: "user.update",
    entity: "AdminUser",
    entityId: updated.id,
    meta: { email: updated.email, role: role.slug, active: updated.isActive, passwordChanged: Boolean(parsed.data.password) },
  });

  revalidatePath("/admin/users");
  back("/admin/users", "saved", "User updated.");
}

export async function deleteAdminUser(formData: FormData) {
  const gate = await authorize("users.manage");
  if (gate.error || !gate.session) back("/admin/users", "error", gate.error || "Unauthorized");

  const id = field(formData, "id");
  const user = await prisma.adminUser.findUnique({
    where: { id },
    include: { role: true },
  });
  if (!user || user.deletedAt) back("/admin/users", "error", "User not found");
  if (user.id === gate.session.user.id) back("/admin/users", "error", "You cannot delete your own account");

  if (user.role.slug === "super-admin") {
    const remaining = await prisma.adminUser.count({
      where: { deletedAt: null, isActive: true, role: { slug: "super-admin" }, id: { not: id } },
    });
    if (remaining === 0) back("/admin/users", "error", "At least one active Super Admin is required");
  }

  await prisma.$transaction([
    prisma.adminSession.deleteMany({ where: { userId: id } }),
    prisma.adminUser.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
        email: `${user.id}.deleted.${user.email}`.slice(0, 200),
      },
    }),
  ]);

  await logAudit({
    userId: gate.session.user.id,
    action: "user.delete",
    entity: "AdminUser",
    entityId: id,
    meta: { email: user.email },
  });

  revalidatePath("/admin/users");
  back("/admin/users", "deleted", "User removed.");
}

const roleSchema = z.object({
  name: z.string().trim().min(2, "Role name is required").max(80),
  description: z.string().trim().max(500).optional().default(""),
  permissions: z.array(z.string()),
});

export async function saveRole(formData: FormData) {
  const gate = await authorize("users.manage");
  if (gate.error || !gate.session) back("/admin/users/roles", "error", gate.error || "Unauthorized");

  const id = field(formData, "id");
  const allowed = new Set(PERMISSIONS.map((permission) => permission.key));
  const parsed = roleSchema.safeParse({
    name: field(formData, "name"),
    description: field(formData, "description"),
    permissions: formData.getAll("permissions").map(String).filter((key) => allowed.has(key as never)),
  });
  if (!parsed.success) back("/admin/users/roles", "error", parsed.error.issues[0]?.message);

  const permissionRows = await prisma.permission.findMany({
    where: { key: { in: parsed.data.permissions } },
    select: { id: true, key: true },
  });

  if (id) {
    const existing = await prisma.role.findUnique({ where: { id } });
    if (!existing) back("/admin/users/roles", "error", "Role not found");

    if (existing.slug === "super-admin") {
      const all = await prisma.permission.findMany({ select: { id: true } });
      await prisma.role.update({
        where: { id },
        data: { name: parsed.data.name, description: parsed.data.description || null },
      });
      await prisma.rolePermission.createMany({
        data: all.map((permission) => ({ roleId: id, permissionId: permission.id })),
        skipDuplicates: true,
      });
      await logAudit({
        userId: gate.session.user.id,
        action: "role.update",
        entity: "Role",
        entityId: id,
        meta: { name: parsed.data.name, superAdminLocked: true },
      });
      revalidatePath("/admin/users/roles");
      back("/admin/users/roles", "saved", "Role updated. Super Admin always keeps every permission.");
    }

    const assignedToSelf = await prisma.adminUser.count({
      where: { roleId: id, id: gate.session.user.id },
    });
    await prisma.$transaction([
      prisma.role.update({
        where: { id },
        data: {
          name: parsed.data.name,
          description: parsed.data.description || null,
          ...(existing.isSystem ? {} : { slug: slugify(parsed.data.name) || existing.slug }),
        },
      }),
      prisma.rolePermission.deleteMany({ where: { roleId: id } }),
      prisma.rolePermission.createMany({
        data: permissionRows.map((permission) => ({ roleId: id, permissionId: permission.id })),
        skipDuplicates: true,
      }),
    ]);

    await logAudit({
      userId: gate.session.user.id,
      action: "role.update",
      entity: "Role",
      entityId: id,
      meta: { name: parsed.data.name, permissions: permissionRows.length, ownRole: assignedToSelf > 0 },
    });

    revalidatePath("/admin/users");
    revalidatePath("/admin/users/roles");
    if (assignedToSelf > 0) {
      back("/admin/users/roles", "saved", "Role updated. Your own access may change on the next request.");
    }
    back("/admin/users/roles", "saved");
  }

  const slug = slugify(parsed.data.name);
  if (!slug) back("/admin/users/roles", "error", "Use letters or numbers in the role name");
  const duplicate = await prisma.role.findUnique({ where: { slug } });
  if (duplicate) back("/admin/users/roles", "error", "A role with that name already exists");

  const created = await prisma.role.create({
    data: {
      name: parsed.data.name,
      slug,
      description: parsed.data.description || null,
      permissions: {
        create: permissionRows.map((permission) => ({ permissionId: permission.id })),
      },
    },
  });

  await logAudit({
    userId: gate.session.user.id,
    action: "role.create",
    entity: "Role",
    entityId: created.id,
    meta: { name: created.name, permissions: permissionRows.length },
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin/users/roles");
  back("/admin/users/roles", "saved", "Role created.");
}

export async function deleteRole(formData: FormData) {
  const gate = await authorize("users.manage");
  if (gate.error || !gate.session) back("/admin/users/roles", "error", gate.error || "Unauthorized");

  const id = field(formData, "id");
  const role = await prisma.role.findUnique({
    where: { id },
    include: { _count: { select: { users: { where: { deletedAt: null } } } } },
  });
  if (!role) back("/admin/users/roles", "error", "Role not found");
  if (role.isSystem) back("/admin/users/roles", "error", "Built-in roles cannot be deleted");
  if (role._count.users > 0) back("/admin/users/roles", "error", "Move users to another role before deleting this one");

  await prisma.role.delete({ where: { id } });
  await logAudit({
    userId: gate.session.user.id,
    action: "role.delete",
    entity: "Role",
    entityId: id,
    meta: { name: role.name },
  });

  revalidatePath("/admin/users/roles");
  back("/admin/users/roles", "deleted", "Role removed.");
}

/* ----------------------------------- Profile ----------------------------------- */

const profileSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(120),
  email: z.email("Enter a valid email address").max(200),
  avatarUrl: z.string().trim().max(500).optional().default(""),
});

export async function saveProfile(formData: FormData) {
  const session = await getSession();
  if (!session) back("/admin/login", "error", "Your session has expired");

  const parsed = profileSchema.safeParse({
    name: field(formData, "name"),
    email: field(formData, "email").toLowerCase(),
    avatarUrl: field(formData, "avatarUrl"),
  });
  if (!parsed.success) back("/admin/profile", "error", parsed.error.issues[0]?.message);

  const taken = await prisma.adminUser.findFirst({
    where: { email: parsed.data.email, id: { not: session.user.id } },
  });
  if (taken) back("/admin/profile", "error", "That email is already in use");

  await prisma.adminUser.update({
    where: { id: session.user.id },
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      avatarUrl: parsed.data.avatarUrl || null,
    },
  });

  await logAudit({
    userId: session.user.id,
    action: "profile.update",
    entity: "AdminUser",
    entityId: session.user.id,
    meta: { email: parsed.data.email },
  });

  revalidatePath("/admin/profile");
  back("/admin/profile", "saved", "Profile saved.");
}

const passwordSchema = z
  .object({
    current: z.string().min(1, "Enter your current password"),
    password: z.string().min(12, "Use at least 12 characters for the new password").max(200),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "The new passwords do not match",
    path: ["confirm"],
  });

export async function changeOwnPassword(formData: FormData) {
  const session = await getSession();
  if (!session) back("/admin/login", "error", "Your session has expired");

  const parsed = passwordSchema.safeParse({
    current: field(formData, "current"),
    password: field(formData, "password"),
    confirm: field(formData, "confirm"),
  });
  if (!parsed.success) back("/admin/profile", "error", parsed.error.issues[0]?.message);

  const user = await prisma.adminUser.findUnique({ where: { id: session.user.id } });
  if (!user) back("/admin/profile", "error", "Account not found");

  const valid = await verifyPassword(user.passwordHash, parsed.data.current);
  if (!valid) back("/admin/profile", "error", "Your current password is incorrect");

  await prisma.$transaction([
    prisma.adminUser.update({
      where: { id: user.id },
      data: { passwordHash: await hashPassword(parsed.data.password) },
    }),
    prisma.adminSession.deleteMany({
      where: { userId: user.id, id: { not: session.sessionId } },
    }),
  ]);

  await logAudit({
    userId: user.id,
    action: "profile.password_change",
    entity: "AdminUser",
    entityId: user.id,
  });

  back("/admin/profile", "saved", "Password updated. Other sessions were signed out.");
}

export async function revokeOtherSessions() {
  const session = await getSession();
  if (!session) back("/admin/login", "error", "Your session has expired");

  const result = await prisma.adminSession.deleteMany({
    where: { userId: session.user.id, id: { not: session.sessionId } },
  });

  await logAudit({
    userId: session.user.id,
    action: "profile.revoke_sessions",
    entity: "AdminSession",
    meta: { revoked: result.count },
  });

  back("/admin/profile", "saved", `Signed out of ${result.count} other session${result.count === 1 ? "" : "s"}.`);
}
