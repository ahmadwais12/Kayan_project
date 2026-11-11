import { prisma } from "@/lib/prisma";
import { getTranslationMap, withTranslations } from "@/lib/i18n/content";
import type { Locale } from "@/lib/i18n/config";
import type { PublicNavItem } from "@/components/public/site-header";

export async function getNavigationTree(location: "header" | "footer", locale: Locale = "en") {
  const rows = await prisma.navigationItem.findMany({
    where: { location, isActive: true },
    orderBy: { sortOrder: "asc" },
  });
  const items = await withTranslations("navigation", rows, locale, ["label"]);

  const nodes = new Map<string, PublicNavItem>(
    items.map((item) => [
      item.id,
      {
        id: item.id,
        label: item.label,
        url: item.url,
        openInNewTab: item.openInNewTab,
        children: [],
      },
    ]),
  );

  const roots: PublicNavItem[] = [];
  for (const item of items) {
    const node = nodes.get(item.id)!;
    if (item.parentId && nodes.has(item.parentId)) {
      nodes.get(item.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

export async function getFooterExtras(locale: Locale = "en") {
  const [rows, socials, serviceRows] = await Promise.all([
    prisma.footerSetting.findMany(),
    prisma.socialLink.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.service.findMany({
      where: { isPublished: true, deletedAt: null },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
      take: 6,
      select: { id: true, title: true, slug: true },
    }),
  ]);

  const [services, footerTranslations] = await Promise.all([
    withTranslations("service", serviceRows, locale, ["title"]),
    getTranslationMap("footerSetting", locale),
  ]);
  const values = Object.fromEntries(
    rows.map((row) => [row.key, footerTranslations.get(`${row.key}:value`) || row.value]),
  );
  return {
    socials,
    services,
    newsletterHeading: values.newsletterHeading || "",
    newsletterNote: values.newsletterNote || values.footerNote || "",
  };
}
