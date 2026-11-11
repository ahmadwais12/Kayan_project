"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/auth/guards";
import { checked, field, numberField, redirectWith } from "@/lib/form-helpers";
import { logAudit } from "@/lib/audit";
import { MAX_SOCIAL_LINKS } from "@/lib/social-platforms";

const COMPANY_KEYS = [
  "siteName",
  "siteLegalName",
  "tagline",
  "siteDescription",
  "email",
  "phone",
  "whatsapp",
  "address",
  "workingHours",
  "mapEmbedUrl",
  "footerAbout",
  "copyright",
  "logoUrl",
  "faviconUrl",
  "instagramUrl",
  "facebookUrl",
  "linkedinUrl",
  "whatsappUrl",
  "primaryColor",
  "secondaryColor",
  "accentColor",
  "backgroundColor",
  "mutedColor",
  "whiteColor",
] as const;

const COLOR_KEYS = [
  "primaryColor",
  "secondaryColor",
  "accentColor",
  "backgroundColor",
  "mutedColor",
  "whiteColor",
] as const;

function hex(value: string) {
  return /^#[0-9a-fA-F]{6}$/.test(value) ? value : "#000000";
}

export async function saveCompanySettings(formData: FormData) {
  const gate = await authorize("settings.manage");
  if (gate.error || !gate.session) redirect(redirectWith("/admin/settings", "error", gate.error || "Unauthorized"));

  const returnTo = field(formData, "returnTo") || "/admin/settings";
  const safeReturn = returnTo.startsWith("/admin/") ? returnTo : "/admin/settings";
  let updated = 0;

  for (const key of COMPANY_KEYS) {
    if (!formData.has(key)) continue;
    const raw = field(formData, key);
    const value = COLOR_KEYS.includes(key as (typeof COLOR_KEYS)[number]) ? hex(raw) : raw.slice(0, 8000);
    await prisma.companySetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
    updated += 1;
  }

  if (updated === 0) redirect(redirectWith(safeReturn, "error", "No settings were submitted"));

  await logAudit({
    userId: gate.session.user.id,
    action: "settings.update",
    entity: "CompanySetting",
    meta: { keys: updated, path: safeReturn },
  });

  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/contact");
  revalidatePath("/admin/settings");
  redirect(redirectWith(safeReturn, "saved"));
}

const seoSchema = z.object({
  siteTitle: z.string().trim().min(2, "Site title is required").max(180),
  defaultDescription: z.string().trim().min(10, "Default description is required").max(400),
  ogImage: z.string().trim().max(500).optional().default(""),
  canonicalBase: z.string().trim().max(500).optional().default(""),
  robotsPolicy: z.string().trim().max(80).optional().default("index, follow"),
  googleVerification: z.string().trim().max(200).optional().default(""),
  bingVerification: z.string().trim().max(200).optional().default(""),
});

export async function saveSeoSettings(formData: FormData) {
  const gate = await authorize("settings.manage");
  if (gate.error || !gate.session) redirect(redirectWith("/admin/settings/seo", "error", gate.error || "Unauthorized"));

  const parsed = seoSchema.safeParse({
    siteTitle: field(formData, "siteTitle"),
    defaultDescription: field(formData, "defaultDescription"),
    ogImage: field(formData, "ogImage"),
    canonicalBase: field(formData, "canonicalBase"),
    robotsPolicy: field(formData, "robotsPolicy"),
    googleVerification: field(formData, "googleVerification"),
    bingVerification: field(formData, "bingVerification"),
  });
  if (!parsed.success) redirect(redirectWith("/admin/settings/seo", "error", parsed.error.issues[0]?.message));

  await prisma.sEOSetting.upsert({
    where: { id: "global" },
    update: parsed.data,
    create: { id: "global", ...parsed.data },
  });

  await logAudit({
    userId: gate.session.user.id,
    action: "seo.update",
    entity: "SEOSetting",
    entityId: "global",
  });

  revalidatePath("/");
  revalidatePath("/admin/settings/seo");
  redirect("/admin/settings/seo?saved=1");
}

/* --------------------------------- Navigation ---------------------------------- */

const navSchema = z.object({
  label: z.string().trim().min(1, "Label is required").max(80),
  url: z.string().trim().min(1, "URL is required").max(300),
  location: z.enum(["header", "footer"]),
  parentId: z.string().optional().default(""),
  sortOrder: z.number().int().min(0).max(999),
  isActive: z.boolean(),
  openInNewTab: z.boolean(),
});

export async function saveNavigationItem(formData: FormData) {
  const gate = await authorize("settings.manage");
  if (gate.error || !gate.session) redirect(redirectWith("/admin/settings/navigation", "error", gate.error || "Unauthorized"));

  const id = field(formData, "id");
  const parsed = navSchema.safeParse({
    label: field(formData, "label"),
    url: field(formData, "url"),
    location: field(formData, "location", "header"),
    parentId: field(formData, "parentId"),
    sortOrder: numberField(formData, "sortOrder"),
    isActive: checked(formData, "isActive"),
    openInNewTab: checked(formData, "openInNewTab"),
  });
  if (!parsed.success) redirect(redirectWith("/admin/settings/navigation", "error", parsed.error.issues[0]?.message));

  const data = {
    label: parsed.data.label,
    url: parsed.data.url,
    location: parsed.data.location,
    parentId: parsed.data.parentId || null,
    sortOrder: parsed.data.sortOrder,
    isActive: parsed.data.isActive,
    openInNewTab: parsed.data.openInNewTab,
  };

  const saved = id
    ? await prisma.navigationItem.update({ where: { id }, data })
    : await prisma.navigationItem.create({ data });

  await logAudit({
    userId: gate.session.user.id,
    action: id ? "navigation.update" : "navigation.create",
    entity: "NavigationItem",
    entityId: saved.id,
    meta: { label: saved.label, location: saved.location },
  });

  revalidatePath("/");
  revalidatePath("/admin/settings/navigation");
  redirect("/admin/settings/navigation?saved=1");
}

export async function deleteNavigationItem(formData: FormData) {
  const gate = await authorize("settings.manage");
  if (gate.error || !gate.session) redirect(redirectWith("/admin/settings/navigation", "error", gate.error || "Unauthorized"));

  const id = field(formData, "id");
  const item = await prisma.navigationItem.findUnique({ where: { id } });
  if (!item) redirect(redirectWith("/admin/settings/navigation", "error", "Menu item not found"));

  await prisma.navigationItem.delete({ where: { id } });
  await logAudit({
    userId: gate.session.user.id,
    action: "navigation.delete",
    entity: "NavigationItem",
    entityId: id,
    meta: { label: item.label },
  });

  revalidatePath("/");
  revalidatePath("/admin/settings/navigation");
  redirect("/admin/settings/navigation?deleted=1");
}

/* --------------------------------- Social links -------------------------------- */

const socialSchema = z.object({
  platform: z.string().trim().min(2, "Platform is required").max(60),
  url: z.string().trim().url("Enter a full URL").max(500),
  label: z.string().trim().max(120).optional().default(""),
  icon: z.string().trim().max(80).optional().default(""),
  sortOrder: z.number().int().min(0).max(999),
  isActive: z.boolean(),
});

function socialReturn(formData: FormData) {
  const returnTo = field(formData, "returnTo");
  return returnTo.startsWith("/admin/") ? returnTo : "/admin/settings/social";
}

export async function saveSocialLink(formData: FormData) {
  const gate = await authorize("settings.manage");
  if (gate.error || !gate.session) redirect(redirectWith(socialReturn(formData), "error", gate.error || "Unauthorized"));

  const id = field(formData, "id");
  const returnTo = socialReturn(formData);
  const parsed = socialSchema.safeParse({
    platform: field(formData, "platform"),
    url: field(formData, "url"),
    label: field(formData, "label"),
    icon: field(formData, "icon"),
    sortOrder: numberField(formData, "sortOrder"),
    isActive: checked(formData, "isActive"),
  });
  if (!parsed.success) redirect(redirectWith(returnTo, "error", parsed.error.issues[0]?.message));

  if (!id) {
    const count = await prisma.socialLink.count();
    if (count >= MAX_SOCIAL_LINKS) {
      redirect(redirectWith(returnTo, "error", `You can add up to ${MAX_SOCIAL_LINKS} social links.`));
    }
  }

  const data = {
    platform: parsed.data.platform,
    url: parsed.data.url,
    label: parsed.data.label || null,
    icon: parsed.data.icon || null,
    sortOrder: parsed.data.sortOrder,
    isActive: parsed.data.isActive,
  };

  const saved = id
    ? await prisma.socialLink.update({ where: { id }, data })
    : await prisma.socialLink.create({ data });

  await logAudit({
    userId: gate.session.user.id,
    action: id ? "social.update" : "social.create",
    entity: "SocialLink",
    entityId: saved.id,
    meta: { platform: saved.platform },
  });

  revalidatePath("/");
  revalidatePath("/admin/settings/social");
  revalidatePath("/admin/social");
  redirect(redirectWith(returnTo, "saved"));
}

export async function deleteSocialLink(formData: FormData) {
  const gate = await authorize("settings.manage");
  if (gate.error || !gate.session) redirect(redirectWith(socialReturn(formData), "error", gate.error || "Unauthorized"));

  const id = field(formData, "id");
  const returnTo = socialReturn(formData);
  const item = await prisma.socialLink.findUnique({ where: { id } });
  if (!item) redirect(redirectWith(returnTo, "error", "Social link not found"));

  await prisma.socialLink.delete({ where: { id } });
  await logAudit({
    userId: gate.session.user.id,
    action: "social.delete",
    entity: "SocialLink",
    entityId: id,
    meta: { platform: item.platform },
  });

  revalidatePath("/");
  revalidatePath("/admin/settings/social");
  revalidatePath("/admin/social");
  redirect(redirectWith(returnTo, "deleted"));
}

export async function reorderSocialLink(formData: FormData) {
  const gate = await authorize("settings.manage");
  if (gate.error || !gate.session) redirect(redirectWith(socialReturn(formData), "error", gate.error || "Unauthorized"));

  const id = field(formData, "id");
  const direction = field(formData, "direction");
  const returnTo = socialReturn(formData);

  const links = await prisma.socialLink.findMany({
    orderBy: [{ sortOrder: "asc" }, { platform: "asc" }],
  });
  const index = links.findIndex((link) => link.id === id);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= links.length) {
    redirect(redirectWith(returnTo, "error", "That link cannot move further in this direction."));
  }

  const reordered = [...links];
  [reordered[index], reordered[target]] = [reordered[target], reordered[index]];

  await prisma.$transaction(
    reordered.map((link, position) =>
      prisma.socialLink.update({
        where: { id: link.id },
        data: { sortOrder: (position + 1) * 10 },
      }),
    ),
  );

  await logAudit({
    userId: gate.session.user.id,
    action: "social.reorder",
    entity: "SocialLink",
    entityId: id,
    meta: { direction },
  });

  revalidatePath("/");
  revalidatePath("/admin/settings/social");
  revalidatePath("/admin/social");
  redirect(redirectWith(returnTo, "saved"));
}

/* ------------------------------------ Footer ----------------------------------- */

export async function saveFooterSettings(formData: FormData) {
  const gate = await authorize("settings.manage");
  if (gate.error || !gate.session) redirect(redirectWith("/admin/settings/footer", "error", gate.error || "Unauthorized"));

  let updated = 0;
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("footer:")) continue;
    if (typeof value !== "string") continue;
    const settingKey = key.slice("footer:".length);
    if (!/^[a-zA-Z][a-zA-Z0-9]{0,80}$/.test(settingKey)) continue;
    await prisma.footerSetting.upsert({
      where: { key: settingKey },
      update: { value: value.slice(0, 8000) },
      create: { key: settingKey, value: value.slice(0, 8000) },
    });
    updated += 1;
  }

  if (updated === 0) redirect(redirectWith("/admin/settings/footer", "error", "No footer fields were submitted"));

  await logAudit({
    userId: gate.session.user.id,
    action: "footer.update",
    entity: "FooterSetting",
    meta: { keys: updated },
  });

  revalidatePath("/");
  revalidatePath("/admin/settings/footer");
  redirect("/admin/settings/footer?saved=1");
}
