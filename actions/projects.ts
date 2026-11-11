"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/auth/guards";
import { projectSchema } from "@/lib/validations";
import { checked, field, jsonArray, numberField } from "@/lib/form-helpers";
import { slugify, parseList } from "@/lib/utils";
import { logAudit } from "@/lib/audit";

export type ProjectState = { error?: string };

const imageSchema = z.object({
  url: z.string().trim().min(1),
  alt: z.string().optional().default(""),
  caption: z.string().optional().default(""),
});

const specSchema = z.object({
  label: z.string().trim().min(1),
  value: z.string().trim().min(1),
});

const featureSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().optional().default(""),
});

function parseImages(value: unknown) {
  return z.array(imageSchema).catch([]).parse(value);
}
function parseSpecs(value: unknown) {
  return z.array(specSchema).catch([]).parse(value);
}
function parseFeatures(value: unknown) {
  return z.array(featureSchema).catch([]).parse(value);
}

export async function saveProject(
  _prev: ProjectState,
  formData: FormData,
): Promise<ProjectState> {
  const gate = await authorize("projects.manage");
  if (gate.error || !gate.session) return { error: gate.error || "Unauthorized" };

  const id = field(formData, "id");
  const raw = {
    title: field(formData, "title"),
    slug: field(formData, "slug").toLowerCase(),
    categoryId: field(formData, "categoryId"),
    clientName: field(formData, "clientName"),
    location: field(formData, "location"),
    year: field(formData, "year"),
    status: field(formData, "status", "COMPLETED"),
    duration: field(formData, "duration"),
    budget: field(formData, "budget"),
    description: field(formData, "description"),
    challenges: field(formData, "challenges"),
    solutions: field(formData, "solutions"),
    architecturalDetails: field(formData, "architecturalDetails"),
    constructionDetails: field(formData, "constructionDetails"),
    coverImage: field(formData, "coverImage"),
    beforeImage: field(formData, "beforeImage"),
    afterImage: field(formData, "afterImage"),
    showBeforeAfter: checked(formData, "showBeforeAfter"),
    isFeatured: checked(formData, "isFeatured"),
    isPublished: checked(formData, "isPublished"),
    sortOrder: numberField(formData, "sortOrder"),
    seoTitle: field(formData, "seoTitle"),
    seoDescription: field(formData, "seoDescription"),
    ogImage: field(formData, "ogImage"),
    tags: field(formData, "tags"),
  };

  const parsed = projectSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Please check the project fields." };
  }

  const conflict = await prisma.project.findFirst({
    where: id ? { slug: parsed.data.slug, NOT: { id } } : { slug: parsed.data.slug },
    select: { id: true },
  });
  if (conflict) return { error: "That URL slug is already used by another project." };

  const images = jsonArray(formData, "images", parseImages);
  const specifications = jsonArray(formData, "specifications", parseSpecs);
  const features = jsonArray(formData, "features", parseFeatures);
  const tags = parseList(parsed.data.tags);

  const base = {
    title: parsed.data.title,
    slug: parsed.data.slug,
    categoryId: parsed.data.categoryId,
    clientName: parsed.data.clientName || null,
    location: parsed.data.location,
    year: parsed.data.year || null,
    status: parsed.data.status,
    duration: parsed.data.duration || null,
    budget: parsed.data.budget || null,
    description: parsed.data.description,
    challenges: parsed.data.challenges || null,
    solutions: parsed.data.solutions || null,
    architecturalDetails: parsed.data.architecturalDetails || null,
    constructionDetails: parsed.data.constructionDetails || null,
    coverImage: parsed.data.coverImage || null,
    beforeImage: parsed.data.beforeImage || null,
    afterImage: parsed.data.afterImage || null,
    showBeforeAfter: parsed.data.showBeforeAfter,
    isFeatured: parsed.data.isFeatured,
    isPublished: parsed.data.isPublished,
    sortOrder: parsed.data.sortOrder,
    seoTitle: parsed.data.seoTitle || null,
    seoDescription: parsed.data.seoDescription || null,
    ogImage: parsed.data.ogImage || null,
  };

  let saved;
  try {
    saved = await prisma.$transaction(async (tx) => {
      const record = id
        ? await tx.project.update({ where: { id }, data: base })
        : await tx.project.create({ data: base });

      await tx.projectImage.deleteMany({ where: { projectId: record.id } });
      if (images.length) {
        await tx.projectImage.createMany({
          data: images.map((image, index) => ({
            projectId: record.id,
            url: image.url,
            alt: image.alt || null,
            caption: image.caption || null,
            sortOrder: index + 1,
          })),
        });
      }

      await tx.projectSpecification.deleteMany({ where: { projectId: record.id } });
      if (specifications.length) {
        await tx.projectSpecification.createMany({
          data: specifications.map((spec, index) => ({
            projectId: record.id,
            label: spec.label,
            value: spec.value,
            sortOrder: index + 1,
          })),
        });
      }

      await tx.projectFeature.deleteMany({ where: { projectId: record.id } });
      if (features.length) {
        await tx.projectFeature.createMany({
          data: features.map((feature, index) => ({
            projectId: record.id,
            title: feature.title,
            description: feature.description || null,
            sortOrder: index + 1,
          })),
        });
      }

      await tx.projectTagRelation.deleteMany({ where: { projectId: record.id } });
      for (const name of tags) {
        const slug = slugify(name);
        if (!slug) continue;
        const tag = await tx.projectTag.upsert({
          where: { slug },
          update: { name },
          create: { name, slug },
        });
        await tx.projectTagRelation.create({
          data: { projectId: record.id, tagId: tag.id },
        });
      }

      return record;
    });

    await logAudit({
      userId: gate.session.user.id,
      action: id ? "project.update" : "project.create",
      entity: "Project",
      entityId: saved.id,
      meta: { title: saved.title, published: saved.isPublished },
    });

    revalidatePath("/");
    revalidatePath("/projects");
    revalidatePath(`/projects/${saved.slug}`);
    revalidatePath("/admin/projects");
  } catch (error) {
    console.error(error);
    return { error: "The project could not be saved. Please try again." };
  }

  redirect(`/admin/projects/${saved.id}?saved=1`);
}

export async function deleteProject(formData: FormData) {
  const gate = await authorize("projects.manage");
  if (gate.error || !gate.session) redirect("/admin/projects?error=Unauthorized");

  const id = field(formData, "id");
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) redirect("/admin/projects?error=Project%20not%20found");

  await prisma.project.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      isPublished: false,
      slug: `${project.slug}-deleted-${Date.now()}`,
    },
  });

  await logAudit({
    userId: gate.session.user.id,
    action: "project.delete",
    entity: "Project",
    entityId: id,
    meta: { title: project.title },
  });

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/admin/projects");
  redirect("/admin/projects?deleted=1");
}
