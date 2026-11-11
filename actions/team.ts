"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/auth/guards";
import { teamSchema } from "@/lib/validations";
import { checked, field, numberField } from "@/lib/form-helpers";
import { logAudit } from "@/lib/audit";

export type TeamState = { error?: string };

export async function saveTeamMember(
  _prev: TeamState,
  formData: FormData,
): Promise<TeamState> {
  const gate = await authorize("team.manage");
  if (gate.error || !gate.session) return { error: gate.error || "Unauthorized" };

  const id = field(formData, "id");
  const raw = {
    name: field(formData, "name"),
    slug: field(formData, "slug").toLowerCase(),
    jobTitle: field(formData, "jobTitle"),
    departmentId: field(formData, "departmentId"),
    imageUrl: field(formData, "imageUrl"),
    bio: field(formData, "bio"),
    skills: field(formData, "skills"),
    education: field(formData, "education"),
    experience: field(formData, "experience"),
    email: field(formData, "email"),
    linkedinUrl: field(formData, "linkedinUrl"),
    instagramUrl: field(formData, "instagramUrl"),
    facebookUrl: field(formData, "facebookUrl"),
    websiteUrl: field(formData, "websiteUrl"),
    sortOrder: numberField(formData, "sortOrder"),
    isPublished: checked(formData, "isPublished"),
  };

  const parsed = teamSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Please check the team member fields." };
  }

  const conflict = await prisma.teamMember.findFirst({
    where: id ? { slug: parsed.data.slug, NOT: { id } } : { slug: parsed.data.slug },
    select: { id: true },
  });
  if (conflict) return { error: "That URL slug is already used by another team member." };

  const data = {
    name: parsed.data.name,
    slug: parsed.data.slug,
    jobTitle: parsed.data.jobTitle,
    departmentId: parsed.data.departmentId || null,
    imageUrl: parsed.data.imageUrl || null,
    bio: parsed.data.bio || null,
    skills: parsed.data.skills || null,
    education: parsed.data.education || null,
    experience: parsed.data.experience || null,
    email: parsed.data.email || null,
    linkedinUrl: parsed.data.linkedinUrl || null,
    instagramUrl: parsed.data.instagramUrl || null,
    facebookUrl: parsed.data.facebookUrl || null,
    websiteUrl: parsed.data.websiteUrl || null,
    sortOrder: parsed.data.sortOrder,
    isPublished: parsed.data.isPublished,
  };

  let saved;
  try {
    saved = id
      ? await prisma.teamMember.update({ where: { id }, data })
      : await prisma.teamMember.create({ data });
  } catch (error) {
    console.error(error);
    return { error: "The team member could not be saved. Please try again." };
  }

  await logAudit({
    userId: gate.session.user.id,
    action: id ? "team.update" : "team.create",
    entity: "TeamMember",
    entityId: saved.id,
    meta: { name: saved.name, published: saved.isPublished },
  });

  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/team");
  revalidatePath(`/team/${saved.slug}`);
  revalidatePath("/admin/team");
  redirect(`/admin/team/${saved.id}?saved=1`);
}

export async function deleteTeamMember(formData: FormData) {
  const gate = await authorize("team.manage");
  if (gate.error || !gate.session) redirect("/admin/team?error=Unauthorized");

  const id = field(formData, "id");
  const member = await prisma.teamMember.findUnique({ where: { id } });
  if (!member) redirect("/admin/team?error=Team%20member%20not%20found");

  await prisma.teamMember.update({
    where: { id },
    data: { deletedAt: new Date(), isPublished: false, slug: `${member.slug}-deleted-${Date.now()}` },
  });

  await logAudit({
    userId: gate.session.user.id,
    action: "team.delete",
    entity: "TeamMember",
    entityId: id,
    meta: { name: member.name },
  });

  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/team");
  revalidatePath("/admin/team");
  redirect("/admin/team?deleted=1");
}
