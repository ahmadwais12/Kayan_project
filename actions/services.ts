"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/auth/guards";
import { serviceSchema } from "@/lib/validations";
import { checked, field, jsonArray, numberField } from "@/lib/form-helpers";
import { logAudit } from "@/lib/audit";
import { saveFormTranslations } from "@/lib/i18n/form-translations";

export type ServiceState = { error?: string };

const imageSchema = z.object({
  url: z.string().trim().min(1),
  alt: z.string().optional().default(""),
});

const featureSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().optional().default(""),
});

const faqSchema = z.object({
  question: z.string().trim().min(2),
  answer: z.string().trim().min(2),
});

export async function saveService(
  _prev: ServiceState,
  formData: FormData,
): Promise<ServiceState> {
  const gate = await authorize("services.manage");
  if (gate.error || !gate.session) return { error: gate.error || "Unauthorized" };

  const id = field(formData, "id");
  const raw = {
    title: field(formData, "title"),
    slug: field(formData, "slug").toLowerCase(),
    categoryId: field(formData, "categoryId"),
    shortDescription: field(formData, "shortDescription"),
    description: field(formData, "description"),
    mainImage: field(formData, "mainImage"),
    isFeatured: checked(formData, "isFeatured"),
    isPublished: checked(formData, "isPublished"),
    sortOrder: numberField(formData, "sortOrder"),
    seoTitle: field(formData, "seoTitle"),
    seoDescription: field(formData, "seoDescription"),
    ogImage: field(formData, "ogImage"),
  };

  const parsed = serviceSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Please check the service fields." };
  }

  const conflict = await prisma.service.findFirst({
    where: id ? { slug: parsed.data.slug, NOT: { id } } : { slug: parsed.data.slug },
    select: { id: true },
  });
  if (conflict) return { error: "That URL slug is already used by another service." };

  const icon = field(formData, "icon") || null;
  const images = jsonArray(formData, "images", (value) => z.array(imageSchema).catch([]).parse(value));
  const features = jsonArray(formData, "features", (value) => z.array(featureSchema).catch([]).parse(value));
  const faqs = jsonArray(formData, "faqs", (value) => z.array(faqSchema).catch([]).parse(value));

  const base = {
    title: parsed.data.title,
    slug: parsed.data.slug,
    categoryId: parsed.data.categoryId || null,
    shortDescription: parsed.data.shortDescription,
    description: parsed.data.description,
    mainImage: parsed.data.mainImage || null,
    icon,
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
        ? await tx.service.update({ where: { id }, data: base })
        : await tx.service.create({ data: base });

      await tx.serviceImage.deleteMany({ where: { serviceId: record.id } });
      if (images.length) {
        await tx.serviceImage.createMany({
          data: images.map((image, index) => ({
            serviceId: record.id,
            url: image.url,
            alt: image.alt || null,
            sortOrder: index + 1,
          })),
        });
      }

      await tx.serviceFeature.deleteMany({ where: { serviceId: record.id } });
      if (features.length) {
        await tx.serviceFeature.createMany({
          data: features.map((feature, index) => ({
            serviceId: record.id,
            title: feature.title,
            description: feature.description || null,
            sortOrder: index + 1,
          })),
        });
      }

      await tx.serviceFAQ.deleteMany({ where: { serviceId: record.id } });
      if (faqs.length) {
        await tx.serviceFAQ.createMany({
          data: faqs.map((faq, index) => ({
            serviceId: record.id,
            question: faq.question,
            answer: faq.answer,
            sortOrder: index + 1,
          })),
        });
      }

      return record;
    });

    await saveFormTranslations("service", saved.id, formData, [
      "title",
      "shortDescription",
      "description",
      "seoTitle",
      "seoDescription",
    ]);

    await logAudit({
      userId: gate.session.user.id,
      action: id ? "service.update" : "service.create",
      entity: "Service",
      entityId: saved.id,
      meta: { title: saved.title, published: saved.isPublished },
    });

    revalidatePath("/");
    revalidatePath("/services");
    revalidatePath(`/services/${saved.slug}`);
    revalidatePath("/admin/services");
  } catch (error) {
    console.error(error);
    return { error: "The service could not be saved. Please try again." };
  }

  redirect(`/admin/services/${saved.id}?saved=1`);
}

export async function deleteService(formData: FormData) {
  const gate = await authorize("services.manage");
  if (gate.error || !gate.session) redirect("/admin/services?error=Unauthorized");

  const id = field(formData, "id");
  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) redirect("/admin/services?error=Service%20not%20found");

  await prisma.service.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      isPublished: false,
      slug: `${service.slug}-deleted-${Date.now()}`,
    },
  });

  await logAudit({
    userId: gate.session.user.id,
    action: "service.delete",
    entity: "Service",
    entityId: id,
    meta: { title: service.title },
  });

  revalidatePath("/");
  revalidatePath("/services");
  revalidatePath("/admin/services");
  redirect("/admin/services?deleted=1");
}
