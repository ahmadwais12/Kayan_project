"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/auth/guards";
import { checked, field, numberField, redirectWith } from "@/lib/form-helpers";
import { logAudit } from "@/lib/audit";

type Gate = NonNullable<Awaited<ReturnType<typeof authorize>>["session"]>;

async function gateFor(permission: "content.manage") {
  const gate = await authorize(permission);
  return gate;
}

function failure(path: string, error?: string | null): never {
  redirect(redirectWith(path, "error", error || "Unauthorized"));
}

const text = (max: number) => z.string().trim().max(max).optional().default("");

/* ---------------------------------- Testimonials --------------------------------- */

const TESTIMONIALS = "/admin/testimonials";

const testimonialInput = z.object({
  clientName: z.string().trim().min(2, "Client name is required").max(160),
  clientTitle: text(160),
  clientCompany: text(160),
  photoUrl: text(500),
  content: z.string().trim().min(10, "Testimonial text is required").max(3000),
  rating: z.number().int().min(1).max(5),
  isPublished: z.boolean(),
  sortOrder: z.number().int().min(0).max(9999),
});

export async function saveTestimonial(formData: FormData) {
  const gate = await gateFor("content.manage");
  if (gate.error || !gate.session) failure(TESTIMONIALS, gate.error);

  const id = field(formData, "id");
  const parsed = testimonialInput.safeParse({
    clientName: field(formData, "clientName"),
    clientTitle: field(formData, "clientTitle"),
    clientCompany: field(formData, "clientCompany"),
    photoUrl: field(formData, "photoUrl"),
    content: field(formData, "content"),
    rating: numberField(formData, "rating", 5),
    isPublished: checked(formData, "isPublished"),
    sortOrder: numberField(formData, "sortOrder"),
  });
  if (!parsed.success) failure(TESTIMONIALS, parsed.error.issues[0]?.message);

  const data = {
    ...parsed.data,
    clientTitle: parsed.data.clientTitle || null,
    clientCompany: parsed.data.clientCompany || null,
    photoUrl: parsed.data.photoUrl || null,
  };

  const saved = id
    ? await prisma.testimonial.update({ where: { id }, data })
    : await prisma.testimonial.create({ data });

  await logAudit({
    userId: gate.session.user.id,
    action: id ? "testimonial.update" : "testimonial.create",
    entity: "Testimonial",
    entityId: saved.id,
    meta: { clientName: saved.clientName },
  });

  revalidatePath("/");
  revalidatePath("/testimonials");
  revalidatePath(TESTIMONIALS);
  redirect(`${TESTIMONIALS}?saved=1`);
}

export async function deleteTestimonial(formData: FormData) {
  const gate = await gateFor("content.manage");
  if (gate.error || !gate.session) failure(TESTIMONIALS, gate.error);

  const id = field(formData, "id");
  const item = await prisma.testimonial.findUnique({ where: { id } });
  if (!item) redirect(redirectWith(TESTIMONIALS, "error", "Testimonial not found"));

  await prisma.testimonial.delete({ where: { id } });
  await logAudit({
    userId: gate.session.user.id,
    action: "testimonial.delete",
    entity: "Testimonial",
    entityId: id,
    meta: { clientName: item.clientName },
  });
  revalidatePath("/");
  revalidatePath(TESTIMONIALS);
  redirect(`${TESTIMONIALS}?deleted=1`);
}

/* -------------------------------------- FAQ -------------------------------------- */

const FAQS = "/admin/faqs";

const faqInput = z.object({
  question: z.string().trim().min(4, "Question is required").max(500),
  answer: z.string().trim().min(4, "Answer is required").max(8000),
  categoryId: text(40),
  sortOrder: z.number().int().min(0).max(9999),
  isActive: z.boolean(),
  showOnService: z.boolean(),
});

export async function saveFaq(formData: FormData) {
  const gate = await gateFor("content.manage");
  if (gate.error || !gate.session) failure(FAQS, gate.error);

  const id = field(formData, "id");
  const parsed = faqInput.safeParse({
    question: field(formData, "question"),
    answer: field(formData, "answer"),
    categoryId: field(formData, "categoryId"),
    sortOrder: numberField(formData, "sortOrder"),
    isActive: checked(formData, "isActive"),
    showOnService: checked(formData, "showOnService"),
  });
  if (!parsed.success) failure(FAQS, parsed.error.issues[0]?.message);

  const data = {
    question: parsed.data.question,
    answer: parsed.data.answer,
    categoryId: parsed.data.categoryId || null,
    sortOrder: parsed.data.sortOrder,
    isActive: parsed.data.isActive,
    showOnService: parsed.data.showOnService,
  };

  const saved = id
    ? await prisma.fAQ.update({ where: { id }, data })
    : await prisma.fAQ.create({ data });

  await logAudit({
    userId: gate.session.user.id,
    action: id ? "faq.update" : "faq.create",
    entity: "FAQ",
    entityId: saved.id,
    meta: { question: saved.question },
  });

  revalidatePath("/faq");
  revalidatePath(FAQS);
  redirect(`${FAQS}?saved=1`);
}

export async function deleteFaq(formData: FormData) {
  const gate = await gateFor("content.manage");
  if (gate.error || !gate.session) failure(FAQS, gate.error);

  const id = field(formData, "id");
  const item = await prisma.fAQ.findUnique({ where: { id } });
  if (!item) redirect(redirectWith(FAQS, "error", "FAQ not found"));

  await prisma.fAQ.delete({ where: { id } });
  await logAudit({
    userId: gate.session.user.id,
    action: "faq.delete",
    entity: "FAQ",
    entityId: id,
    meta: { question: item.question },
  });
  revalidatePath("/faq");
  revalidatePath(FAQS);
  redirect(`${FAQS}?deleted=1`);
}

/* ----------------------------------- Timeline ----------------------------------- */

const TIMELINE = "/admin/timeline";

const milestoneInput = z.object({
  year: z.string().trim().min(1, "Year is required").max(20),
  title: z.string().trim().min(2, "Title is required").max(180),
  description: text(4000),
  imageUrl: text(500),
  sortOrder: z.number().int().min(0).max(9999),
  isPublished: z.boolean(),
});

export async function saveMilestone(formData: FormData) {
  const gate = await gateFor("content.manage");
  if (gate.error || !gate.session) failure(TIMELINE, gate.error);

  const id = field(formData, "id");
  const parsed = milestoneInput.safeParse({
    year: field(formData, "year"),
    title: field(formData, "title"),
    description: field(formData, "description"),
    imageUrl: field(formData, "imageUrl"),
    sortOrder: numberField(formData, "sortOrder"),
    isPublished: checked(formData, "isPublished"),
  });
  if (!parsed.success) failure(TIMELINE, parsed.error.issues[0]?.message);

  const data = {
    year: parsed.data.year,
    title: parsed.data.title,
    description: parsed.data.description || null,
    imageUrl: parsed.data.imageUrl || null,
    sortOrder: parsed.data.sortOrder,
    isPublished: parsed.data.isPublished,
  };

  const saved = id
    ? await prisma.companyMilestone.update({ where: { id }, data })
    : await prisma.companyMilestone.create({ data });

  await logAudit({
    userId: gate.session.user.id,
    action: id ? "milestone.update" : "milestone.create",
    entity: "CompanyMilestone",
    entityId: saved.id,
    meta: { year: saved.year, title: saved.title },
  });

  revalidatePath("/about");
  revalidatePath(TIMELINE);
  redirect(`${TIMELINE}?saved=1`);
}

export async function deleteMilestone(formData: FormData) {
  const gate = await gateFor("content.manage");
  if (gate.error || !gate.session) failure(TIMELINE, gate.error);

  const id = field(formData, "id");
  const item = await prisma.companyMilestone.findUnique({ where: { id } });
  if (!item) redirect(redirectWith(TIMELINE, "error", "Milestone not found"));

  await prisma.companyMilestone.delete({ where: { id } });
  await logAudit({
    userId: gate.session.user.id,
    action: "milestone.delete",
    entity: "CompanyMilestone",
    entityId: id,
    meta: { year: item.year, title: item.title },
  });
  revalidatePath("/about");
  revalidatePath(TIMELINE);
  redirect(`${TIMELINE}?deleted=1`);
}

/* ------------------------------ Process & values -------------------------------- */

const CONTENT = "/admin/content";

const statInput = z.object({
  label: z.string().trim().min(1, "Label is required").max(120),
  value: z.string().trim().min(1, "Value is required").max(40),
  suffix: text(20),
  icon: text(80),
  sortOrder: z.number().int().min(0).max(9999),
  isActive: z.boolean(),
});

const coreValueInput = z.object({
  title: z.string().trim().min(2, "Title is required").max(160),
  description: z.string().trim().min(2, "Description is required").max(3000),
  icon: text(80),
  sortOrder: z.number().int().min(0).max(9999),
  isActive: z.boolean(),
});

const processInput = z.object({
  title: z.string().trim().min(2, "Title is required").max(160),
  description: z.string().trim().min(2, "Description is required").max(3000),
  imageUrl: text(500),
  sortOrder: z.number().int().min(0).max(9999),
  isActive: z.boolean(),
});

const whyInput = z.object({
  title: z.string().trim().min(2, "Title is required").max(160),
  description: z.string().trim().min(2, "Description is required").max(3000),
  icon: text(80),
  sortOrder: z.number().int().min(0).max(9999),
  isActive: z.boolean(),
});

async function auditAndRedirect(
  gate: Gate,
  params: {
    action: string;
    entity: string;
    entityId: string;
    meta: Record<string, unknown>;
    paths: string[];
    success: string;
  },
) {
  await logAudit({
    userId: gate.user.id,
    action: params.action,
    entity: params.entity,
    entityId: params.entityId,
    meta: params.meta,
  });
  for (const path of params.paths) revalidatePath(path);
  redirect(params.success);
}

export async function saveCompanyStat(formData: FormData) {
  const gate = await gateFor("content.manage");
  if (gate.error || !gate.session) failure(CONTENT, gate.error);

  const id = field(formData, "id");
  const parsed = statInput.safeParse({
    label: field(formData, "label"),
    value: field(formData, "value"),
    suffix: field(formData, "suffix"),
    icon: field(formData, "icon"),
    sortOrder: numberField(formData, "sortOrder"),
    isActive: checked(formData, "isActive"),
  });
  if (!parsed.success) failure(CONTENT, parsed.error.issues[0]?.message);

  const data = {
    label: parsed.data.label,
    value: parsed.data.value,
    suffix: parsed.data.suffix || null,
    icon: parsed.data.icon || null,
    sortOrder: parsed.data.sortOrder,
    isActive: parsed.data.isActive,
  };

  const saved = id
    ? await prisma.companyStatistic.update({ where: { id }, data })
    : await prisma.companyStatistic.create({ data });

  await auditAndRedirect(gate.session, {
    action: id ? "statistic.update" : "statistic.create",
    entity: "CompanyStatistic",
    entityId: saved.id,
    meta: { label: saved.label },
    paths: ["/", "/about", CONTENT],
    success: `${CONTENT}?saved=1#stats`,
  });
}

export async function deleteCompanyStat(formData: FormData) {
  const gate = await gateFor("content.manage");
  if (gate.error || !gate.session) failure(CONTENT, gate.error);
  const id = field(formData, "id");

  const item = await prisma.companyStatistic.findUnique({ where: { id } });
  if (!item) redirect(redirectWith(CONTENT, "error", "Statistic not found"));
  await prisma.companyStatistic.delete({ where: { id } });

  await auditAndRedirect(gate.session, {
    action: "statistic.delete",
    entity: "CompanyStatistic",
    entityId: id,
    meta: { label: item.label },
    paths: ["/", "/about", CONTENT],
    success: `${CONTENT}?deleted=1#stats`,
  });
}

export async function saveCoreValue(formData: FormData) {
  const gate = await gateFor("content.manage");
  if (gate.error || !gate.session) failure(CONTENT, gate.error);

  const id = field(formData, "id");
  const parsed = coreValueInput.safeParse({
    title: field(formData, "title"),
    description: field(formData, "description"),
    icon: field(formData, "icon"),
    sortOrder: numberField(formData, "sortOrder"),
    isActive: checked(formData, "isActive"),
  });
  if (!parsed.success) failure(CONTENT, parsed.error.issues[0]?.message);

  const data = {
    title: parsed.data.title,
    description: parsed.data.description,
    icon: parsed.data.icon || null,
    sortOrder: parsed.data.sortOrder,
    isActive: parsed.data.isActive,
  };

  const saved = id
    ? await prisma.coreValue.update({ where: { id }, data })
    : await prisma.coreValue.create({ data });

  await auditAndRedirect(gate.session, {
    action: id ? "coreValue.update" : "coreValue.create",
    entity: "CoreValue",
    entityId: saved.id,
    meta: { title: saved.title },
    paths: ["/about", CONTENT],
    success: `${CONTENT}?saved=1#values`,
  });
}

export async function deleteCoreValue(formData: FormData) {
  const gate = await gateFor("content.manage");
  if (gate.error || !gate.session) failure(CONTENT, gate.error);
  const id = field(formData, "id");

  const item = await prisma.coreValue.findUnique({ where: { id } });
  if (!item) redirect(redirectWith(CONTENT, "error", "Value not found"));
  await prisma.coreValue.delete({ where: { id } });

  await auditAndRedirect(gate.session, {
    action: "coreValue.delete",
    entity: "CoreValue",
    entityId: id,
    meta: { title: item.title },
    paths: ["/about", CONTENT],
    success: `${CONTENT}?deleted=1#values`,
  });
}

export async function saveProcessStep(formData: FormData) {
  const gate = await gateFor("content.manage");
  if (gate.error || !gate.session) failure(CONTENT, gate.error);

  const id = field(formData, "id");
  const parsed = processInput.safeParse({
    title: field(formData, "title"),
    description: field(formData, "description"),
    imageUrl: field(formData, "imageUrl"),
    sortOrder: numberField(formData, "sortOrder"),
    isActive: checked(formData, "isActive"),
  });
  if (!parsed.success) failure(CONTENT, parsed.error.issues[0]?.message);

  const data = {
    title: parsed.data.title,
    description: parsed.data.description,
    imageUrl: parsed.data.imageUrl || null,
    sortOrder: parsed.data.sortOrder,
    isActive: parsed.data.isActive,
  };

  const saved = id
    ? await prisma.processStep.update({ where: { id }, data })
    : await prisma.processStep.create({ data });

  await auditAndRedirect(gate.session, {
    action: id ? "processStep.update" : "processStep.create",
    entity: "ProcessStep",
    entityId: saved.id,
    meta: { title: saved.title },
    paths: ["/", "/about", CONTENT],
    success: `${CONTENT}?saved=1#process`,
  });
}

export async function deleteProcessStep(formData: FormData) {
  const gate = await gateFor("content.manage");
  if (gate.error || !gate.session) failure(CONTENT, gate.error);
  const id = field(formData, "id");

  const item = await prisma.processStep.findUnique({ where: { id } });
  if (!item) redirect(redirectWith(CONTENT, "error", "Process step not found"));
  await prisma.processStep.delete({ where: { id } });

  await auditAndRedirect(gate.session, {
    action: "processStep.delete",
    entity: "ProcessStep",
    entityId: id,
    meta: { title: item.title },
    paths: ["/", "/about", CONTENT],
    success: `${CONTENT}?deleted=1#process`,
  });
}

export async function saveWhyItem(formData: FormData) {
  const gate = await gateFor("content.manage");
  if (gate.error || !gate.session) failure(CONTENT, gate.error);

  const id = field(formData, "id");
  const parsed = whyInput.safeParse({
    title: field(formData, "title"),
    description: field(formData, "description"),
    icon: field(formData, "icon"),
    sortOrder: numberField(formData, "sortOrder"),
    isActive: checked(formData, "isActive"),
  });
  if (!parsed.success) failure(CONTENT, parsed.error.issues[0]?.message);

  const data = {
    title: parsed.data.title,
    description: parsed.data.description,
    icon: parsed.data.icon || null,
    sortOrder: parsed.data.sortOrder,
    isActive: parsed.data.isActive,
  };

  const saved = id
    ? await prisma.whyChooseItem.update({ where: { id }, data })
    : await prisma.whyChooseItem.create({ data });

  await auditAndRedirect(gate.session, {
    action: id ? "whyItem.update" : "whyItem.create",
    entity: "WhyChooseItem",
    entityId: saved.id,
    meta: { title: saved.title },
    paths: ["/", "/about", CONTENT],
    success: `${CONTENT}?saved=1#why`,
  });
}

export async function deleteWhyItem(formData: FormData) {
  const gate = await gateFor("content.manage");
  if (gate.error || !gate.session) failure(CONTENT, gate.error);
  const id = field(formData, "id");

  const item = await prisma.whyChooseItem.findUnique({ where: { id } });
  if (!item) redirect(redirectWith(CONTENT, "error", "Item not found"));
  await prisma.whyChooseItem.delete({ where: { id } });

  await auditAndRedirect(gate.session, {
    action: "whyItem.delete",
    entity: "WhyChooseItem",
    entityId: id,
    meta: { title: item.title },
    paths: ["/", "/about", CONTENT],
    success: `${CONTENT}?deleted=1#why`,
  });
}

/* ------------------------------- Homepage sections ------------------------------ */

const HOMEPAGE = "/admin/homepage";

export async function saveHomepageSection(formData: FormData) {
  const gate = await gateFor("content.manage");
  if (gate.error || !gate.session) failure(HOMEPAGE, gate.error);

  const id = field(formData, "id");
  const section = await prisma.homepageSection.findUnique({ where: { id } });
  if (!section) redirect(redirectWith(HOMEPAGE, "error", "Section not found"));

  const data = {
    title: field(formData, "title") || null,
    subtitle: field(formData, "subtitle") || null,
    description: field(formData, "description") || null,
    imageUrl: field(formData, "imageUrl") || null,
    buttonLabel: field(formData, "buttonLabel") || null,
    buttonUrl: field(formData, "buttonUrl") || null,
    secondaryLabel: field(formData, "secondaryLabel") || null,
    secondaryUrl: field(formData, "secondaryUrl") || null,
    isEnabled: checked(formData, "isEnabled"),
    sortOrder: numberField(formData, "sortOrder"),
  };

  await prisma.homepageSection.update({ where: { id }, data });

  await auditAndRedirect(gate.session, {
    action: "homepage.update",
    entity: "HomepageSection",
    entityId: id,
    meta: { key: section.key },
    paths: ["/", HOMEPAGE],
    success: `${HOMEPAGE}?saved=1#${section.key}`,
  });
}
