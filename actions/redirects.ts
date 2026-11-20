"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/auth/guards";
import { checked, field, numberField, redirectWith } from "@/lib/form-helpers";
import { logAudit } from "@/lib/audit";

const PATH = "/admin/settings/redirects";

function normalizePath(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const prefixed = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  if (prefixed === "/") return "/";
  return prefixed.replace(/\/+$/, "");
}

const redirectSchema = z.object({
  fromPath: z.string().trim().min(1, "Source path is required").max(500),
  toPath: z.string().trim().min(1, "Destination is required").max(500),
  statusCode: z
    .number()
    .int()
    .refine((value) => [301, 302, 307, 308].includes(value), "Choose a supported status code"),
  isActive: z.boolean(),
});

function invalid(message: string, returnTo = PATH): never {
  redirect(redirectWith(returnTo, "error", message));
}

export async function saveRedirect(formData: FormData) {
  const requestedReturnTo = field(formData, "returnTo");
  const formPath = requestedReturnTo.startsWith(`${PATH}/`) ? requestedReturnTo : PATH;
  const gate = await authorize("settings.manage");
  if (gate.error || !gate.session) {
    redirect(redirectWith(formPath, "error", gate.error || "Unauthorized"));
  }

  const id = field(formData, "id");
  const fromPath = normalizePath(field(formData, "fromPath"));
  const parsed = redirectSchema.safeParse({
    fromPath,
    toPath: field(formData, "toPath"),
    statusCode: numberField(formData, "statusCode", 301),
    isActive: checked(formData, "isActive"),
  });
  if (!parsed.success) invalid(parsed.error.issues[0]?.message || "Invalid redirect", formPath);

  const toPath = parsed.data.toPath;
  const internal = toPath.startsWith("/");

  if (!fromPath.startsWith("/") || fromPath.startsWith("//")) invalid("Source must be a path beginning with a single slash.", formPath);
  if (fromPath === "/") invalid("The home page cannot be redirected.", formPath);
  if (fromPath.includes("?") || fromPath.includes("#")) invalid("Source paths cannot contain query strings or fragments.", formPath);
  if (/^\/(admin|api|_next)(\/|$)/.test(fromPath)) invalid("Admin, API, and asset paths cannot be redirected.", formPath);
  if (!internal && !/^https?:\/\//i.test(toPath)) invalid("Destination must start with / or be a full http(s) URL.", formPath);
  if (internal && toPath.startsWith("//")) invalid("Destination cannot start with //.", formPath);
  if (internal && normalizePath(toPath) === fromPath) invalid("Source and destination are the same path.", formPath);

  const existing = await prisma.redirect.findUnique({ where: { fromPath } });
  if (existing && existing.id !== id) invalid("A redirect for this source path already exists.", formPath);

  const data = {
    fromPath,
    toPath,
    statusCode: parsed.data.statusCode,
    isActive: parsed.data.isActive,
  };

  const saved = id
    ? await prisma.redirect.update({ where: { id }, data })
    : await prisma.redirect.create({ data });

  await logAudit({
    userId: gate.session.user.id,
    action: id ? "redirect.update" : "redirect.create",
    entity: "Redirect",
    entityId: saved.id,
    meta: { fromPath: saved.fromPath, toPath: saved.toPath, statusCode: saved.statusCode, isActive: saved.isActive },
  });

  revalidatePath(PATH);
  redirect(redirectWith(PATH, "saved"));
}

export async function deleteRedirect(formData: FormData) {
  const gate = await authorize("settings.manage");
  if (gate.error || !gate.session) {
    redirect(redirectWith(PATH, "error", gate.error || "Unauthorized"));
  }

  const id = field(formData, "id");
  if (!id) invalid("Missing redirect identifier.");

  const removed = await prisma.redirect.deleteMany({ where: { id } });

  if (removed.count) {
    await logAudit({
      userId: gate.session.user.id,
      action: "redirect.delete",
      entity: "Redirect",
      entityId: id,
    });
  }

  revalidatePath(PATH);
  redirect(redirectWith(PATH, "deleted"));
}
