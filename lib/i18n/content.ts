import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { getSettings, type CompanySettings } from "@/lib/settings";
import { getLocale } from "@/lib/i18n/server";
import type { Locale } from "@/lib/i18n/config";

export type TranslatableEntity = {
  label: string;
  description: string;
  fields: { key: string; label: string; multiline?: boolean }[];
};

export const TRANSLATABLE: Record<string, TranslatableEntity> = {
  setting: {
    label: "Company settings",
    description: "Studio name, tagline, descriptions, address and footer copy.",
    fields: [
      { key: "siteName", label: "Site name" },
      { key: "siteLegalName", label: "Legal name" },
      { key: "tagline", label: "Tagline" },
      { key: "siteDescription", label: "Site description", multiline: true },
      { key: "footerAbout", label: "Footer about", multiline: true },
      { key: "copyright", label: "Copyright" },
      { key: "address", label: "Address", multiline: true },
      { key: "workingHours", label: "Working hours" },
    ],
  },
  navigation: {
    label: "Navigation",
    description: "Header and footer menu labels.",
    fields: [{ key: "label", label: "Menu label" }],
  },
  homepage: {
    label: "Home page sections",
    description: "Titles, eyebrow text and descriptions of every home page section.",
    fields: [
      { key: "title", label: "Title" },
      { key: "subtitle", label: "Subtitle / eyebrow" },
      { key: "description", label: "Description", multiline: true },
      { key: "buttonLabel", label: "Primary button" },
      { key: "secondaryLabel", label: "Secondary button" },
    ],
  },
  service: {
    label: "Services",
    description: "Service titles, summaries, full descriptions and SEO copy.",
    fields: [
      { key: "title", label: "Title" },
      { key: "shortDescription", label: "Short description", multiline: true },
      { key: "description", label: "Full description", multiline: true },
      { key: "seoTitle", label: "SEO title" },
      { key: "seoDescription", label: "SEO description", multiline: true },
    ],
  },
  serviceCategory: {
    label: "Service categories",
    description: "Category names and descriptions.",
    fields: [
      { key: "name", label: "Name" },
      { key: "description", label: "Description", multiline: true },
    ],
  },
  project: {
    label: "Projects",
    description: "Project titles, location and the long-form case study copy.",
    fields: [
      { key: "title", label: "Title" },
      { key: "location", label: "Location" },
      { key: "description", label: "Description", multiline: true },
      { key: "challenges", label: "Challenges", multiline: true },
      { key: "solutions", label: "Solutions", multiline: true },
      { key: "architecturalDetails", label: "Architectural details", multiline: true },
      { key: "constructionDetails", label: "Construction details", multiline: true },
    ],
  },
  projectCategory: {
    label: "Project categories",
    description: "Category names and descriptions.",
    fields: [
      { key: "name", label: "Name" },
      { key: "description", label: "Description", multiline: true },
    ],
  },
  blog: {
    label: "Journal posts",
    description: "Article titles, excerpts and body content.",
    fields: [
      { key: "title", label: "Title" },
      { key: "excerpt", label: "Excerpt", multiline: true },
      { key: "content", label: "Content", multiline: true },
    ],
  },
  blogCategory: {
    label: "Journal categories",
    description: "Category names and descriptions.",
    fields: [
      { key: "name", label: "Name" },
      { key: "description", label: "Description", multiline: true },
    ],
  },
  blogTag: {
    label: "Journal tags",
    description: "Topic names shown on articles.",
    fields: [{ key: "name", label: "Name" }],
  },
  projectTag: {
    label: "Project tags",
    description: "Tags shown on project pages.",
    fields: [{ key: "name", label: "Name" }],
  },
  faqCategory: {
    label: "FAQ categories",
    description: "Group headings used on the FAQ page.",
    fields: [{ key: "name", label: "Name" }],
  },
  faq: {
    label: "FAQs",
    description: "Questions and answers published on the FAQ page.",
    fields: [
      { key: "question", label: "Question" },
      { key: "answer", label: "Answer", multiline: true },
    ],
  },
  department: {
    label: "Departments",
    description: "Team department names and descriptions.",
    fields: [
      { key: "name", label: "Name" },
      { key: "description", label: "Description", multiline: true },
    ],
  },
  teamMember: {
    label: "Team profiles",
    description: "Job titles and profile copy. Names are not translated.",
    fields: [
      { key: "jobTitle", label: "Job title" },
      { key: "bio", label: "Biography", multiline: true },
      { key: "skills", label: "Skills", multiline: true },
      { key: "education", label: "Education", multiline: true },
      { key: "experience", label: "Experience", multiline: true },
    ],
  },
  testimonial: {
    label: "Testimonials",
    description: "Client quotes, titles and company names.",
    fields: [
      { key: "content", label: "Quote", multiline: true },
      { key: "clientTitle", label: "Client title" },
      { key: "clientCompany", label: "Client company" },
    ],
  },
  galleryCategory: {
    label: "Gallery categories",
    description: "Category names used on the gallery page.",
    fields: [{ key: "name", label: "Name" }],
  },
  galleryMedia: {
    label: "Gallery items",
    description: "Titles and captions of gallery images and films.",
    fields: [
      { key: "title", label: "Title" },
      { key: "caption", label: "Caption", multiline: true },
    ],
  },
  milestone: {
    label: "Company milestones",
    description: "Timeline titles and descriptions.",
    fields: [
      { key: "title", label: "Title" },
      { key: "description", label: "Description", multiline: true },
    ],
  },
  coreValue: {
    label: "Core values",
    description: "Value titles and descriptions.",
    fields: [
      { key: "title", label: "Title" },
      { key: "description", label: "Description", multiline: true },
    ],
  },
  whyChoose: {
    label: "Why choose us",
    description: "Reasons and descriptions shown on the home and about pages.",
    fields: [
      { key: "title", label: "Title" },
      { key: "description", label: "Description", multiline: true },
    ],
  },
  processStep: {
    label: "Process steps",
    description: "Step titles and descriptions.",
    fields: [
      { key: "title", label: "Title" },
      { key: "description", label: "Description", multiline: true },
    ],
  },
  statistic: {
    label: "Company statistics",
    description: "Labels for the counters shown on the about and home pages.",
    fields: [{ key: "label", label: "Label" }],
  },
  serviceFeature: {
    label: "Service features",
    description: "Feature titles and descriptions listed on service pages.",
    fields: [
      { key: "title", label: "Title" },
      { key: "description", label: "Description", multiline: true },
    ],
  },
  serviceFAQ: {
    label: "Service questions",
    description: "Questions and answers listed on service pages.",
    fields: [
      { key: "question", label: "Question" },
      { key: "answer", label: "Answer", multiline: true },
    ],
  },
  projectFeature: {
    label: "Project features",
    description: "Feature titles and descriptions listed on project pages.",
    fields: [
      { key: "title", label: "Title" },
      { key: "description", label: "Description", multiline: true },
    ],
  },
  projectSpecification: {
    label: "Project specifications",
    description: "Specification labels and values listed on project pages.",
    fields: [
      { key: "label", label: "Label" },
      { key: "value", label: "Value" },
    ],
  },
  footerSetting: {
    label: "Footer copy",
    description: "Newsletter heading and footer notes.",
    fields: [{ key: "value", label: "Value", multiline: true }],
  },
};

export type TranslationMap = Map<string, string>;

export async function getTranslationMap(
  entity: string,
  locale: Locale,
  ids?: string[],
): Promise<TranslationMap> {
  if (locale === "en") return new Map();
  const rows = await prisma.translation.findMany({
    where: {
      entity,
      locale,
      ...(ids && ids.length ? { entityId: { in: ids } } : {}),
    },
    select: { entityId: true, field: true, value: true },
  });
  const map: TranslationMap = new Map();
  for (const row of rows) map.set(`${row.entityId}:${row.field}`, row.value);
  return map;
}

export function tr(map: TranslationMap, id: string, field: string, fallback: string | null | undefined) {
  return map.get(`${id}:${field}`) || fallback || "";
}

export async function withTranslations<T extends { id: string }>(
  entity: string,
  rows: T[],
  locale: Locale,
  fields: string[],
): Promise<T[]> {
  if (locale === "en" || rows.length === 0) return rows;
  const map = await getTranslationMap(entity, locale, rows.map((row) => row.id));
  if (map.size === 0) return rows;
  return rows.map((row) => {
    const next: Record<string, unknown> = { ...row };
    for (const field of fields) {
      const value = map.get(`${row.id}:${field}`);
      if (value) next[field] = value;
    }
    return next as T;
  });
}

type Categorised = { category: { id: string; name: string } | null };

export async function localizeCategoryNames<T extends Categorised>(
  entity: "serviceCategory" | "projectCategory" | "blogCategory",
  rows: T[],
  locale: Locale,
): Promise<T[]> {
  if (locale === "en") return rows;
  const categories = new Map<string, { id: string; name: string }>();
  for (const row of rows) {
    if (row.category) categories.set(row.category.id, row.category);
  }
  if (categories.size === 0) return rows;
  const localized = await withTranslations(entity, [...categories.values()], locale, ["name"]);
  const names = new Map(localized.map((category) => [category.id, category.name]));
  return rows.map((row) =>
    row.category
      ? { ...row, category: { ...row.category, name: names.get(row.category.id) || row.category.name } }
      : row,
  );
}

export const getLocalizedSettings = cache(async (): Promise<CompanySettings> => {
  const [base, locale] = await Promise.all([getSettings(), getLocale()]);
  if (locale === "en") return base;
  const rows = await prisma.translation.findMany({
    where: { entity: "setting", locale },
    select: { entityId: true, value: true },
  });
  if (!rows.length) return base;
  const values: Record<string, string> = { ...base };
  for (const row of rows) {
    if (row.entityId in values && row.value) values[row.entityId] = row.value;
  }
  return values as CompanySettings;
});

/* --------------------------------- Admin side -------------------------------- */

export type TranslationSourceRow = {
  id: string;
  label: string;
  hint?: string;
  values: Record<string, string>;
};

export async function loadTranslationSources(entity: string): Promise<TranslationSourceRow[]> {
  switch (entity) {
    case "setting": {
      const rows = await prisma.companySetting.findMany();
      const values: Record<string, string> = {};
      for (const row of rows) values[row.key] = row.value;
      return TRANSLATABLE.setting.fields.map((field) => ({
        id: field.key,
        label: field.label,
        hint: field.key,
        values: { value: values[field.key] || "" },
      }));
    }
    case "navigation": {
      const rows = await prisma.navigationItem.findMany({ orderBy: [{ location: "asc" }, { sortOrder: "asc" }] });
      return rows.map((row) => ({
        id: row.id,
        label: row.label,
        hint: `${row.location} · ${row.url}`,
        values: { label: row.label },
      }));
    }
    case "homepage": {
      const rows = await prisma.homepageSection.findMany({ orderBy: [{ sortOrder: "asc" }, { key: "asc" }] });
      return rows.map((row) => ({
        id: row.id,
        label: row.title || row.key,
        hint: row.key,
        values: {
          title: row.title || "",
          subtitle: row.subtitle || "",
          description: row.description || "",
          buttonLabel: row.buttonLabel || "",
          secondaryLabel: row.secondaryLabel || "",
        },
      }));
    }
    case "service": {
      const rows = await prisma.service.findMany({
        where: { deletedAt: null },
        orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
      });
      return rows.map((row) => ({
        id: row.id,
        label: row.title,
        hint: row.slug,
        values: {
          title: row.title,
          shortDescription: row.shortDescription,
          description: row.description,
          seoTitle: row.seoTitle || "",
          seoDescription: row.seoDescription || "",
        },
      }));
    }
    case "serviceCategory": {
      const rows = await prisma.serviceCategory.findMany({ orderBy: { sortOrder: "asc" } });
      return rows.map((row) => ({
        id: row.id,
        label: row.name,
        hint: row.slug,
        values: { name: row.name, description: row.description || "" },
      }));
    }
    case "project": {
      const rows = await prisma.project.findMany({
        where: { deletedAt: null },
        orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
      });
      return rows.map((row) => ({
        id: row.id,
        label: row.title,
        hint: row.location,
        values: {
          title: row.title,
          location: row.location,
          description: row.description,
          challenges: row.challenges || "",
          solutions: row.solutions || "",
          architecturalDetails: row.architecturalDetails || "",
          constructionDetails: row.constructionDetails || "",
        },
      }));
    }
    case "projectCategory": {
      const rows = await prisma.projectCategory.findMany({ orderBy: { sortOrder: "asc" } });
      return rows.map((row) => ({
        id: row.id,
        label: row.name,
        hint: row.slug,
        values: { name: row.name, description: row.description || "" },
      }));
    }
    case "blog": {
      const rows = await prisma.blogPost.findMany({
        where: { deletedAt: null },
        orderBy: { updatedAt: "desc" },
      });
      return rows.map((row) => ({
        id: row.id,
        label: row.title,
        hint: row.slug,
        values: { title: row.title, excerpt: row.excerpt, content: row.content },
      }));
    }
    case "blogCategory": {
      const rows = await prisma.blogCategory.findMany({ orderBy: { sortOrder: "asc" } });
      return rows.map((row) => ({
        id: row.id,
        label: row.name,
        hint: row.slug,
        values: { name: row.name, description: row.description || "" },
      }));
    }
    case "blogTag": {
      const rows = await prisma.blogTag.findMany({ orderBy: { name: "asc" } });
      return rows.map((row) => ({
        id: row.id,
        label: row.name,
        hint: row.slug,
        values: { name: row.name },
      }));
    }
    case "projectTag": {
      const rows = await prisma.projectTag.findMany({ orderBy: { name: "asc" } });
      return rows.map((row) => ({
        id: row.id,
        label: row.name,
        hint: row.slug,
        values: { name: row.name },
      }));
    }
    case "faqCategory": {
      const rows = await prisma.faqCategory.findMany({ orderBy: { sortOrder: "asc" } });
      return rows.map((row) => ({
        id: row.id,
        label: row.name,
        hint: row.slug,
        values: { name: row.name },
      }));
    }
    case "faq": {
      const rows = await prisma.fAQ.findMany({
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        include: { category: true },
      });
      return rows.map((row) => ({
        id: row.id,
        label: row.question,
        hint: row.category?.name,
        values: { question: row.question, answer: row.answer },
      }));
    }
    case "department": {
      const rows = await prisma.department.findMany({ orderBy: { sortOrder: "asc" } });
      return rows.map((row) => ({
        id: row.id,
        label: row.name,
        hint: row.slug,
        values: { name: row.name, description: row.description || "" },
      }));
    }
    case "teamMember": {
      const rows = await prisma.teamMember.findMany({
        where: { deletedAt: null },
        orderBy: { sortOrder: "asc" },
        include: { department: true },
      });
      return rows.map((row) => ({
        id: row.id,
        label: row.name,
        hint: `${row.jobTitle}${row.department ? ` · ${row.department.name}` : ""}`,
        values: {
          jobTitle: row.jobTitle,
          bio: row.bio || "",
          skills: row.skills || "",
          education: row.education || "",
          experience: row.experience || "",
        },
      }));
    }
    case "testimonial": {
      const rows = await prisma.testimonial.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] });
      return rows.map((row) => ({
        id: row.id,
        label: row.clientName,
        hint: row.clientCompany || row.clientTitle || undefined,
        values: {
          content: row.content,
          clientTitle: row.clientTitle || "",
          clientCompany: row.clientCompany || "",
        },
      }));
    }
    case "galleryCategory": {
      const rows = await prisma.galleryCategory.findMany({ orderBy: { sortOrder: "asc" } });
      return rows.map((row) => ({
        id: row.id,
        label: row.name,
        hint: row.slug,
        values: { name: row.name },
      }));
    }
    case "galleryMedia": {
      const rows = await prisma.galleryMedia.findMany({
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        include: { category: true },
      });
      return rows.map((row) => ({
        id: row.id,
        label: row.title || row.url,
        hint: row.category?.name || row.url,
        values: { title: row.title || "", caption: row.caption || "" },
      }));
    }
    case "milestone": {
      const rows = await prisma.companyMilestone.findMany({ orderBy: [{ year: "asc" }, { sortOrder: "asc" }] });
      return rows.map((row) => ({
        id: row.id,
        label: `${row.year} — ${row.title}`,
        hint: row.year,
        values: { title: row.title, description: row.description || "" },
      }));
    }
    case "coreValue": {
      const rows = await prisma.coreValue.findMany({ orderBy: { sortOrder: "asc" } });
      return rows.map((row) => ({
        id: row.id,
        label: row.title,
        values: { title: row.title, description: row.description },
      }));
    }
    case "whyChoose": {
      const rows = await prisma.whyChooseItem.findMany({ orderBy: { sortOrder: "asc" } });
      return rows.map((row) => ({
        id: row.id,
        label: row.title,
        values: { title: row.title, description: row.description },
      }));
    }
    case "processStep": {
      const rows = await prisma.processStep.findMany({ orderBy: { sortOrder: "asc" } });
      return rows.map((row) => ({
        id: row.id,
        label: row.title,
        values: { title: row.title, description: row.description },
      }));
    }
    case "statistic": {
      const rows = await prisma.companyStatistic.findMany({ orderBy: { sortOrder: "asc" } });
      return rows.map((row) => ({
        id: row.id,
        label: row.label,
        hint: `${row.value}${row.suffix || ""}`,
        values: { label: row.label },
      }));
    }
    case "serviceFeature": {
      const rows = await prisma.serviceFeature.findMany({
        orderBy: [{ serviceId: "asc" }, { sortOrder: "asc" }],
        include: { service: true },
      });
      return rows.map((row) => ({
        id: row.id,
        label: row.title,
        hint: row.service.title,
        values: { title: row.title, description: row.description || "" },
      }));
    }
    case "serviceFAQ": {
      const rows = await prisma.serviceFAQ.findMany({
        orderBy: [{ serviceId: "asc" }, { sortOrder: "asc" }],
        include: { service: true },
      });
      return rows.map((row) => ({
        id: row.id,
        label: row.question,
        hint: row.service.title,
        values: { question: row.question, answer: row.answer },
      }));
    }
    case "projectFeature": {
      const rows = await prisma.projectFeature.findMany({
        orderBy: [{ projectId: "asc" }, { sortOrder: "asc" }],
        include: { project: true },
      });
      return rows.map((row) => ({
        id: row.id,
        label: row.title,
        hint: row.project.title,
        values: { title: row.title, description: row.description || "" },
      }));
    }
    case "projectSpecification": {
      const rows = await prisma.projectSpecification.findMany({
        orderBy: [{ projectId: "asc" }, { sortOrder: "asc" }],
        include: { project: true },
      });
      return rows.map((row) => ({
        id: row.id,
        label: row.label,
        hint: row.project.title,
        values: { label: row.label, value: row.value },
      }));
    }
    case "footerSetting": {
      const rows = await prisma.footerSetting.findMany({ orderBy: { key: "asc" } });
      return rows.map((row) => ({
        id: row.key,
        label: row.key,
        values: { value: row.value },
      }));
    }
    default:
      return [];
  }
}
