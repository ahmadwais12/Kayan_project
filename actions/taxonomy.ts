"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/auth/guards";
import { checked, field, numberField, redirectWith } from "@/lib/form-helpers";
import { slugify } from "@/lib/utils";
import { logAudit } from "@/lib/audit";
import { saveFormTranslations } from "@/lib/i18n/form-translations";
import { TAXONOMY_KEYS, TAXONOMY_META as META, type TaxonomyEntity } from "@/lib/taxonomy";

const entitySchema = z.enum(TAXONOMY_KEYS);

const taxonomySchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(120),
  slug: z.string().trim().max(160).optional().default(""),
  description: z.string().trim().max(2000).optional().default(""),
  sortOrder: z.number().int().min(0).max(9999),
  isActive: z.boolean(),
});

type MinimalDelegate = {
  findFirst: (args: { where: Record<string, unknown>; select?: Record<string, boolean> }) => Promise<{ id: string } | null>;
  create: (args: { data: Record<string, unknown> }) => Promise<{ id: string }>;
  update: (args: { where: { id: string }; data: Record<string, unknown> }) => Promise<{ id: string }>;
  delete: (args: { where: { id: string } }) => Promise<unknown>;
};

function delegateFor(entity: TaxonomyEntity) {
  const map: Record<TaxonomyEntity, unknown> = {
    projectCategory: prisma.projectCategory,
    serviceCategory: prisma.serviceCategory,
    blogCategory: prisma.blogCategory,
    blogTag: prisma.blogTag,
    projectTag: prisma.projectTag,
    department: prisma.department,
    galleryCategory: prisma.galleryCategory,
    faqCategory: prisma.faqCategory,
  };
  return map[entity] as MinimalDelegate;
}

async function usageCount(entity: TaxonomyEntity, id: string) {
  switch (entity) {
    case "projectCategory":
      return prisma.project.count({ where: { categoryId: id, deletedAt: null } });
    case "serviceCategory":
      return prisma.service.count({ where: { categoryId: id, deletedAt: null } });
    case "blogCategory":
      return prisma.blogPost.count({ where: { categoryId: id, deletedAt: null } });
    case "blogTag":
      return prisma.blogPostTag.count({ where: { tagId: id } });
    case "projectTag":
      return prisma.projectTagRelation.count({ where: { tagId: id } });
    case "department":
      return prisma.teamMember.count({ where: { departmentId: id, deletedAt: null } });
    case "galleryCategory":
      return prisma.galleryMedia.count({ where: { categoryId: id } });
    case "faqCategory":
      return prisma.fAQ.count({ where: { categoryId: id } });
    default:
      return 0;
  }
}

function parseEntity(value: string): TaxonomyEntity | null {
  const result = entitySchema.safeParse(value);
  return result.success ? result.data : null;
}

export async function saveTaxonomy(formData: FormData) {
  const entity = parseEntity(field(formData, "entity"));
  if (!entity) redirect("/admin?error=Unknown%20taxonomy%20type");
  const meta = META[entity];
  const requestedReturnTo = field(formData, "returnTo");
  const formPath = requestedReturnTo.startsWith(`/admin/taxonomy/${entity}/`)
    ? requestedReturnTo
    : meta.path;

  const gate = await authorize(meta.permission);
  if (gate.error || !gate.session) {
    redirect(redirectWith(meta.path, "error", gate.error || "Unauthorized"));
  }

  const id = field(formData, "id");
  const raw = {
    name: field(formData, "name"),
    slug: field(formData, "slug"),
    description: field(formData, "description"),
    sortOrder: numberField(formData, "sortOrder"),
    isActive: checked(formData, "isActive"),
  };
  const parsed = taxonomySchema.safeParse(raw);
  if (!parsed.success) {
    redirect(redirectWith(formPath, "error", parsed.error.issues[0]?.message || "Check the fields"));
  }

  const name = parsed.data.name;
  const slug = slugify(parsed.data.slug || name);
  if (!slug) redirect(redirectWith(formPath, "error", "A valid slug is required"));

  const delegate = delegateFor(entity);

  const conflict = await delegate.findFirst({
    where: { OR: [{ slug }, { name }], ...(id ? { NOT: { id } } : {}) },
    select: { id: true },
  });
  if (conflict) {
    redirect(redirectWith(meta.path, "error", "That name or slug is already in use"));
  }

  const data: Record<string, unknown> = meta.simple
    ? { name, slug }
    : {
        name,
        slug,
        description: parsed.data.description || null,
        sortOrder: parsed.data.sortOrder,
        isActive: parsed.data.isActive,
      };

  let savedId = id;
  try {
    if (id) {
      await delegate.update({ where: { id }, data });
    } else {
      const created = await delegate.create({ data });
      savedId = created.id;
    }
  } catch (error) {
    console.error(error);
    redirect(redirectWith(meta.path, "error", `The ${meta.label} could not be saved`));
  }

  await saveFormTranslations(entity, savedId, formData, ["name", "description"]);

  await logAudit({
    userId: gate.session.user.id,
    action: id ? `${entity}.update` : `${entity}.create`,
    entity: meta.entity,
    entityId: savedId,
    meta: { name, slug },
  });

  revalidatePath(meta.path);
  revalidatePath("/admin/projects");
  revalidatePath("/admin/services");
  revalidatePath("/admin/team");
  revalidatePath("/admin/blog");
  revalidatePath("/admin/gallery");
  revalidatePath("/admin/faqs");
  revalidatePath("/");

  redirect(redirectWith(meta.path, "saved"));
}

export async function deleteTaxonomy(formData: FormData) {
  const entity = parseEntity(field(formData, "entity"));
  if (!entity) redirect("/admin?error=Unknown%20taxonomy%20type");
  const meta = META[entity];

  const gate = await authorize(meta.permission);
  if (gate.error || !gate.session) {
    redirect(redirectWith(meta.path, "error", gate.error || "Unauthorized"));
  }

  const id = field(formData, "id");
  if (!id) redirect(redirectWith(meta.path, "error", "Missing item"));

  const used = await usageCount(entity, id);
  if (used > 0) {
    redirect(
      redirectWith(
        meta.path,
        "error",
        `This ${meta.label} is still used by ${used} item${used === 1 ? "" : "s"}. Reassign them first.`,
      ),
    );
  }

  await delegateFor(entity).delete({ where: { id } });

  await logAudit({
    userId: gate.session.user.id,
    action: `${entity}.delete`,
    entity: meta.entity,
    entityId: id,
  });

  revalidatePath(meta.path);
  revalidatePath("/");
  redirect(redirectWith(meta.path, "deleted"));
}
