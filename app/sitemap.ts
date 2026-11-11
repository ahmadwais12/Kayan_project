import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getSeoSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const seo = await getSeoSettings();
  const base = (seo.canonicalBase || process.env.APP_URL || "http://localhost:3333").replace(/\/$/, "");
  const url = (path: string) => `${base}${path}`;

  const now = new Date();
  const staticEntries: MetadataRoute.Sitemap = [
    { url: url("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: url("/about"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: url("/services"), lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: url("/projects"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: url("/team"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: url("/testimonials"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: url("/gallery"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: url("/blog"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: url("/faq"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: url("/contact"), lastModified: now, changeFrequency: "yearly", priority: 0.7 },
    { url: url("/quote"), lastModified: now, changeFrequency: "yearly", priority: 0.7 },
  ];

  try {
    const [projects, services, team, posts, faqCount, legalSections] = await Promise.all([
      prisma.project.findMany({
        where: { isPublished: true, deletedAt: null },
        select: { slug: true, updatedAt: true },
      }),
      prisma.service.findMany({
        where: { isPublished: true, deletedAt: null },
        select: { slug: true, updatedAt: true },
      }),
      prisma.teamMember.findMany({
        where: { isPublished: true, deletedAt: null },
        select: { slug: true, updatedAt: true },
      }),
      prisma.blogPost.findMany({
        where: { status: "PUBLISHED", deletedAt: null, publishedAt: { lte: now } },
        select: { slug: true, updatedAt: true },
      }),
      prisma.fAQ.count({ where: { isActive: true } }),
      prisma.homepageSection.findMany({
        where: { key: { in: ["privacy", "terms"] } },
        select: { key: true, updatedAt: true, description: true },
      }),
    ]);

    const legalEntries: MetadataRoute.Sitemap = legalSections
      .filter((section) => section.description)
      .map((section) => ({
        url: url(`/${section.key}`),
        lastModified: section.updatedAt,
        changeFrequency: "yearly" as const,
        priority: 0.3,
      }));

    return [
      ...staticEntries.filter((entry) => !entry.url.endsWith("/faq") || faqCount > 0),
      ...legalEntries,
      ...services.map((service) => ({
        url: url(`/services/${service.slug}`),
        lastModified: service.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.8,
      })),
      ...projects.map((project) => ({
        url: url(`/projects/${project.slug}`),
        lastModified: project.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.8,
      })),
      ...team.map((member) => ({
        url: url(`/team/${member.slug}`),
        lastModified: member.updatedAt,
        changeFrequency: "yearly" as const,
        priority: 0.4,
      })),
      ...posts.map((post) => ({
        url: url(`/blog/${post.slug}`),
        lastModified: post.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
    ];
  } catch {
    return staticEntries;
  }
}
