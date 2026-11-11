import { prisma } from "@/lib/prisma";
import { getSeoSettings } from "@/lib/settings";

export type AuditItem = { label: string; href: string };

export type AuditGroup = {
  key: string;
  label: string;
  hint: string;
  count: number;
  items: AuditItem[];
};

export type SeoAudit = {
  technical: {
    robotsPolicy: string;
    canonicalBase: string;
    sitemapUrl: string;
    indexedPages: number;
    noindex: boolean;
  };
  groups: AuditGroup[];
};

const STATIC_PATHS = new Set([
  "/",
  "/about",
  "/services",
  "/projects",
  "/team",
  "/gallery",
  "/blog",
  "/faq",
  "/contact",
  "/quote",
  "/privacy",
  "/terms",
]);

const INTERNAL_LINK = /(?:\]\(|href=["'])(\/[^)"'\s]*)/g;

function missing(value: string | null | undefined) {
  return !value || !value.trim();
}

function linkTarget(raw: string) {
  const [path] = raw.split(/[?#]/);
  return path && path !== "/" ? path.replace(/\/+$/, "") : path || "/";
}

export async function getSeoAudit(): Promise<SeoAudit> {
  const seo = await getSeoSettings();

  const [services, projects, posts, serviceImageCount, projectImageCount, mediaImageCount, teamCount, legalCount] =
    await Promise.all([
      prisma.service.findMany({
        where: { isPublished: true, deletedAt: null },
        select: { id: true, title: true, slug: true, seoTitle: true, seoDescription: true, description: true },
      }),
      prisma.project.findMany({
        where: { isPublished: true, deletedAt: null },
        select: { id: true, title: true, slug: true, seoTitle: true, seoDescription: true, description: true },
      }),
      prisma.blogPost.findMany({
        where: { status: "PUBLISHED", deletedAt: null },
        select: { id: true, title: true, slug: true, seoTitle: true, seoDescription: true, excerpt: true, content: true },
      }),
      prisma.serviceImage.count({
        where: { OR: [{ alt: null }, { alt: "" }], service: { isPublished: true, deletedAt: null } },
      }),
      prisma.projectImage.count({
        where: { OR: [{ alt: null }, { alt: "" }], project: { isPublished: true, deletedAt: null } },
      }),
      prisma.media.count({ where: { OR: [{ alt: null }, { alt: "" }] } }),
      prisma.teamMember.count({ where: { isPublished: true, deletedAt: null } }),
      prisma.homepageSection.count({ where: { key: { in: ["privacy", "terms"] }, description: { not: null } } }),
    ]);

  const groups: AuditGroup[] = [];

  const missingServiceTitles = services.filter((item) => missing(item.seoTitle));
  const missingProjectTitles = projects.filter((item) => missing(item.seoTitle));
  const missingPostTitles = posts.filter((item) => missing(item.seoTitle));
  const titleItems = [
    ...missingServiceTitles.map((item) => ({ label: `Service · ${item.title}`, href: `/admin/services/${item.id}` })),
    ...missingProjectTitles.map((item) => ({ label: `Project · ${item.title}`, href: `/admin/projects/${item.id}` })),
    ...missingPostTitles.map((item) => ({ label: `Article · ${item.title}`, href: `/admin/blog/${item.id}` })),
  ];
  if (titleItems.length) {
    groups.push({
      key: "titles",
      label: "Missing SEO titles",
      hint: "Search and social results fall back to the content title.",
      count: titleItems.length,
      items: titleItems.slice(0, 5),
    });
  }

  const missingServiceDescriptions = services.filter((item) => missing(item.seoDescription));
  const missingProjectDescriptions = projects.filter((item) => missing(item.seoDescription));
  const missingPostDescriptions = posts.filter((item) => missing(item.seoDescription));
  const descriptionItems = [
    ...missingServiceDescriptions.map((item) => ({ label: `Service · ${item.title}`, href: `/admin/services/${item.id}` })),
    ...missingProjectDescriptions.map((item) => ({ label: `Project · ${item.title}`, href: `/admin/projects/${item.id}` })),
    ...missingPostDescriptions.map((item) => ({ label: `Article · ${item.title}`, href: `/admin/blog/${item.id}` })),
  ];
  if (descriptionItems.length) {
    groups.push({
      key: "descriptions",
      label: "Missing meta descriptions",
      hint: "Search engines will generate their own snippet from page content.",
      count: descriptionItems.length,
      items: descriptionItems.slice(0, 5),
    });
  }

  const altCount = serviceImageCount + projectImageCount + mediaImageCount;
  if (altCount > 0) {
    const items: AuditItem[] = [];
    if (mediaImageCount) items.push({ label: `${mediaImageCount} media library file(s)`, href: "/admin/media" });
    if (projectImageCount) items.push({ label: `${projectImageCount} project gallery image(s)`, href: "/admin/projects" });
    if (serviceImageCount) items.push({ label: `${serviceImageCount} service gallery image(s)`, href: "/admin/services" });
    groups.push({
      key: "alt",
      label: "Images missing alt text",
      hint: "Alt text is required for accessibility and image search.",
      count: altCount,
      items,
    });
  }

  const titleUsage = new Map<string, { count: number; label: string }>();
  for (const item of [...services, ...projects, ...posts]) {
    if (missing(item.seoTitle)) continue;
    const key = item.seoTitle!.trim().toLowerCase();
    const current = titleUsage.get(key);
    if (current) current.count += 1;
    else titleUsage.set(key, { count: 1, label: item.seoTitle!.trim() });
  }
  const duplicates = [...titleUsage.values()].filter((entry) => entry.count > 1);
  if (duplicates.length) {
    groups.push({
      key: "duplicates",
      label: "Duplicate SEO titles",
      hint: "Each indexable page should have a distinct title.",
      count: duplicates.length,
      items: duplicates.slice(0, 5).map((entry) => ({
        label: `“${entry.label}” used ${entry.count} times`,
        href: "/admin/settings/seo",
      })),
    });
  }

  const known = new Set(STATIC_PATHS);
  for (const service of services) known.add(`/services/${service.slug}`);
  for (const project of projects) known.add(`/projects/${project.slug}`);
  for (const post of posts) known.add(`/blog/${post.slug}`);
  const team = await prisma.teamMember.findMany({
    where: { isPublished: true, deletedAt: null },
    select: { slug: true },
  });
  for (const member of team) known.add(`/team/${member.slug}`);

  const broken: AuditItem[] = [];
  const sources = [
    ...posts.map((post) => ({ label: `Article · ${post.title}`, href: `/admin/blog/${post.id}`, content: post.content })),
    ...services.map((service) => ({
      label: `Service · ${service.title}`,
      href: `/admin/services/${service.id}`,
      content: service.description,
    })),
    ...projects.map((project) => ({
      label: `Project · ${project.title}`,
      href: `/admin/projects/${project.id}`,
      content: project.description,
    })),
  ];

  for (const source of sources) {
    INTERNAL_LINK.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = INTERNAL_LINK.exec(source.content)) !== null) {
      const target = linkTarget(match[1]);
      if (!target || target.startsWith("/api") || target.startsWith("/admin")) continue;
      if (target.startsWith("/storage") || target.startsWith("/uploads")) continue;
      if (/\.[a-z0-9]{2,5}$/i.test(target)) continue;
      if (known.has(target)) continue;
      broken.push({ label: `${source.label} → ${target}`, href: source.href });
      break;
    }
  }

  if (broken.length) {
    groups.push({
      key: "links",
      label: "Broken internal links",
      hint: "These paths do not match a known page or published item.",
      count: broken.length,
      items: broken.slice(0, 5),
    });
  }

  const canonicalBase = (seo.canonicalBase || process.env.APP_URL || "").replace(/\/$/, "");
  const indexedPages =
    STATIC_PATHS.size +
    services.length +
    projects.length +
    posts.length +
    teamCount +
    Math.min(legalCount, 2);

  return {
    technical: {
      robotsPolicy: seo.robotsPolicy,
      canonicalBase,
      sitemapUrl: canonicalBase ? `${canonicalBase}/sitemap.xml` : "",
      indexedPages,
      noindex: seo.robotsPolicy.toLowerCase().includes("noindex"),
    },
    groups,
  };
}
