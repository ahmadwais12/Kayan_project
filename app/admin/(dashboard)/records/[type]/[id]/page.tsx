import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { SmartImage } from "@/components/public/smart-image";
import { socialPlatformLabel } from "@/lib/social-platforms";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

type Field = { label: string; value?: string; href?: string; long?: boolean; ltr?: boolean };
type Related = { title: string; items: { title: string; body?: string }[] };
type ViewImage = { label: string; url: string };

type RecordView = {
  typeLabel: string;
  listHref: string;
  title: string;
  subtitle?: string;
  status?: { label: string; tone: "success" | "secondary" | "warning" | "info" | "danger" };
  editHref?: string;
  publicHref?: string;
  images: ViewImage[];
  groups: { title: string; fields: Field[] }[];
  related: Related[];
  note?: string;
};

const text = (value: string | number | null | undefined) =>
  value === null || value === undefined || value === "" ? undefined : String(value);
const yesNo = (value: boolean) => (value ? "Yes" : "No");

function FieldValue({ field }: { field: Field }) {
  return (
    <div className={field.long ? "sm:col-span-2" : undefined}>
      <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {field.label}
      </dt>
      <dd className="mt-1 text-sm text-primary">
        {field.value === undefined ? (
          <span className="text-muted-foreground">—</span>
        ) : field.href ? (
          <a
            href={field.href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex max-w-full items-center gap-1.5 break-all text-accent hover:underline"
          >
            {field.value}
            <ExternalLink className="size-3 shrink-0" />
          </a>
        ) : field.long ? (
          <p className="whitespace-pre-line leading-relaxed text-muted-foreground">{field.value}</p>
        ) : (
          <span className={field.ltr ? "price-ltr" : undefined}>{field.value}</span>
        )}
      </dd>
    </div>
  );
}

async function buildView(type: string, id: string): Promise<RecordView | null> {
  switch (type) {
    case "project": {
      await requirePermission("content.manage");
      const item = await prisma.project.findFirst({
        where: { id, deletedAt: null },
        include: {
          category: true,
          images: { orderBy: { sortOrder: "asc" } },
          specifications: { orderBy: { sortOrder: "asc" } },
          features: { orderBy: { sortOrder: "asc" } },
          videos: { orderBy: { sortOrder: "asc" } },
          tags: { include: { tag: true } },
        },
      });
      if (!item) return null;
      const images: ViewImage[] = [
        ...(item.coverImage ? [{ label: "Cover image", url: item.coverImage }] : []),
        ...(item.beforeImage ? [{ label: "Before image", url: item.beforeImage }] : []),
        ...(item.afterImage ? [{ label: "After image", url: item.afterImage }] : []),
        ...item.images.map((image, index) => ({ label: image.caption || `Gallery image ${index + 1}`, url: image.url })),
      ];
      return {
        typeLabel: "Projects",
        listHref: "/admin/projects",
        title: item.title,
        subtitle: [item.category?.name, item.location].filter(Boolean).join(" · ") || undefined,
        status: {
          label: item.status.replace("_", " ").toLowerCase(),
          tone: item.status === "COMPLETED" ? "success" : item.status === "ON_HOLD" ? "warning" : "info",
        },
        editHref: `/admin/projects/${item.id}`,
        publicHref: item.isPublished ? `/projects/${item.slug}` : undefined,
        images,
        groups: [
          {
            title: "Overview",
            fields: [
              { label: "Slug", value: item.slug },
              { label: "Category", value: item.category?.name },
              { label: "Location", value: item.location },
              { label: "Client", value: text(item.clientName) },
              { label: "Year", value: text(item.year) },
              { label: "Duration", value: text(item.duration) },
              { label: "Budget", value: text(formatPrice(item.budget)), ltr: true },
              { label: "Published", value: yesNo(item.isPublished) },
              { label: "Featured", value: yesNo(item.isFeatured) },
              { label: "Before / after", value: yesNo(item.showBeforeAfter) },
              { label: "Display order", value: String(item.sortOrder) },
              { label: "Last updated", value: formatDateTime(item.updatedAt) },
            ],
          },
          {
            title: "Description",
            fields: [
              { label: "Description", value: text(item.description), long: true },
              { label: "Challenges", value: text(item.challenges), long: true },
              { label: "Solutions", value: text(item.solutions), long: true },
              { label: "Architectural details", value: text(item.architecturalDetails), long: true },
              { label: "Construction details", value: text(item.constructionDetails), long: true },
            ],
          },
          {
            title: "SEO",
            fields: [
              { label: "SEO title", value: text(item.seoTitle) },
              { label: "OG image", value: text(item.ogImage), href: item.ogImage || undefined },
              { label: "SEO description", value: text(item.seoDescription), long: true },
            ],
          },
        ],
        related: [
          {
            title: "Specifications",
            items: item.specifications.map((row) => ({ title: row.label, body: row.value })),
          },
          {
            title: "Features",
            items: item.features.map((row) => ({ title: row.title, body: text(row.description) })),
          },
          { title: "Tags", items: item.tags.map((row) => ({ title: row.tag.name })) },
          { title: "Videos", items: item.videos.map((row) => ({ title: row.title || row.type, body: row.url })) },
        ],
      };
    }

    case "service": {
      await requirePermission("content.manage");
      const item = await prisma.service.findFirst({
        where: { id, deletedAt: null },
        include: {
          category: true,
          images: { orderBy: { sortOrder: "asc" } },
          features: { orderBy: { sortOrder: "asc" } },
          faqs: { orderBy: { sortOrder: "asc" } },
        },
      });
      if (!item) return null;
      return {
        typeLabel: "Services",
        listHref: "/admin/services",
        title: item.title,
        subtitle: item.shortDescription,
        status: { label: item.isPublished ? "Published" : "Draft", tone: item.isPublished ? "success" : "secondary" },
        editHref: `/admin/services/${item.id}`,
        publicHref: item.isPublished ? `/services/${item.slug}` : undefined,
        images: [
          ...(item.mainImage ? [{ label: "Main image", url: item.mainImage }] : []),
          ...item.images.map((image, index) => ({ label: image.alt || `Gallery image ${index + 1}`, url: image.url })),
        ],
        groups: [
          {
            title: "Overview",
            fields: [
              { label: "Slug", value: item.slug },
              { label: "Category", value: item.category?.name },
              { label: "Icon", value: text(item.icon) },
              { label: "Featured", value: yesNo(item.isFeatured) },
              { label: "Display order", value: String(item.sortOrder) },
              { label: "Created", value: formatDateTime(item.createdAt) },
              { label: "Last updated", value: formatDateTime(item.updatedAt) },
            ],
          },
          {
            title: "Content",
            fields: [
              { label: "Short description", value: text(item.shortDescription), long: true },
              { label: "Full description", value: text(item.description), long: true },
            ],
          },
          {
            title: "SEO",
            fields: [
              { label: "SEO title", value: text(item.seoTitle) },
              { label: "OG image", value: text(item.ogImage), href: item.ogImage || undefined },
              { label: "SEO description", value: text(item.seoDescription), long: true },
            ],
          },
        ],
        related: [
          { title: "Features", items: item.features.map((row) => ({ title: row.title, body: text(row.description) })) },
          { title: "FAQs", items: item.faqs.map((row) => ({ title: row.question, body: row.answer })) },
        ],
      };
    }

    case "post": {
      await requirePermission("content.manage");
      const item = await prisma.blogPost.findFirst({
        where: { id, deletedAt: null },
        include: { author: true, category: true, tags: { include: { tag: true } } },
      });
      if (!item) return null;
      return {
        typeLabel: "Blog",
        listHref: "/admin/blog",
        title: item.title,
        subtitle: item.excerpt,
        status: {
          label: item.status.toLowerCase(),
          tone: item.status === "PUBLISHED" ? "success" : item.status === "SCHEDULED" ? "info" : "secondary",
        },
        editHref: `/admin/blog/${item.id}`,
        publicHref: item.status === "PUBLISHED" ? `/blog/${item.slug}` : undefined,
        images: item.featuredImage ? [{ label: "Featured image", url: item.featuredImage }] : [],
        groups: [
          {
            title: "Overview",
            fields: [
              { label: "Slug", value: item.slug },
              { label: "Category", value: item.category?.name },
              { label: "Author", value: item.author?.name },
              { label: "Published at", value: item.publishedAt ? formatDateTime(item.publishedAt) : undefined },
              { label: "Reading time", value: `${item.readingTime} min` },
              { label: "Featured", value: yesNo(item.isFeatured) },
              { label: "Created", value: formatDateTime(item.createdAt) },
              { label: "Last updated", value: formatDateTime(item.updatedAt) },
            ],
          },
          {
            title: "Content",
            fields: [
              { label: "Excerpt", value: text(item.excerpt), long: true },
              { label: "Article", value: text(item.content), long: true },
            ],
          },
          {
            title: "SEO",
            fields: [
              { label: "SEO title", value: text(item.seoTitle) },
              { label: "OG image", value: text(item.ogImage), href: item.ogImage || undefined },
              { label: "SEO description", value: text(item.seoDescription), long: true },
            ],
          },
        ],
        related: [{ title: "Tags", items: item.tags.map((row) => ({ title: row.tag.name })) }],
      };
    }

    case "team": {
      await requirePermission("content.manage");
      const item = await prisma.teamMember.findFirst({
        where: { id, deletedAt: null },
        include: { department: true },
      });
      if (!item) return null;
      return {
        typeLabel: "Team",
        listHref: "/admin/team",
        title: item.name,
        subtitle: item.jobTitle,
        status: { label: item.isPublished ? "Published" : "Hidden", tone: item.isPublished ? "success" : "secondary" },
        editHref: `/admin/team/${item.id}`,
        publicHref: item.isPublished ? `/team/${item.slug}` : undefined,
        images: item.imageUrl ? [{ label: "Profile photo", url: item.imageUrl }] : [],
        groups: [
          {
            title: "Profile",
            fields: [
              { label: "Slug", value: item.slug },
              { label: "Department", value: item.department?.name },
              { label: "Email", value: text(item.email), href: item.email ? `mailto:${item.email}` : undefined },
              { label: "Display order", value: String(item.sortOrder) },
              { label: "Created", value: formatDateTime(item.createdAt) },
              { label: "Last updated", value: formatDateTime(item.updatedAt) },
            ],
          },
          {
            title: "Details",
            fields: [
              { label: "Bio", value: text(item.bio), long: true },
              { label: "Skills", value: text(item.skills), long: true },
              { label: "Education", value: text(item.education), long: true },
              { label: "Experience", value: text(item.experience), long: true },
            ],
          },
        ],
        related: [
          {
            title: "Links",
            items: [
              { title: "LinkedIn", body: text(item.linkedinUrl) },
              { title: "Instagram", body: text(item.instagramUrl) },
              { title: "Facebook", body: text(item.facebookUrl) },
              { title: "Website", body: text(item.websiteUrl) },
            ].filter((row) => row.body),
          },
        ],
      };
    }

    case "award": {
      await requirePermission("content.manage");
      const item = await prisma.award.findUnique({ where: { id } });
      if (!item) return null;
      return {
        typeLabel: "Awards",
        listHref: "/admin/awards",
        title: item.title,
        subtitle: item.issuer ?? undefined,
        status: { label: item.isPublished ? "Published" : "Hidden", tone: item.isPublished ? "success" : "secondary" },
        editHref: `/admin/awards/${item.id}/edit`,
        publicHref: "/about",
        images: item.imageUrl ? [{ label: "Award image", url: item.imageUrl }] : [],
        groups: [
          {
            title: "Overview",
            fields: [
              { label: "Issuer", value: text(item.issuer) },
              { label: "Year", value: text(item.year) },
              { label: "Display order", value: String(item.sortOrder) },
              { label: "Created", value: formatDateTime(item.createdAt) },
            ],
          },
          { title: "Description", fields: [{ label: "Description", value: text(item.description), long: true }] },
        ],
        related: [],
      };
    }

    case "video": {
      await requirePermission("content.manage");
      const item = await prisma.showcaseVideo.findUnique({ where: { id } });
      if (!item) return null;
      return {
        typeLabel: "Project videos",
        listHref: "/admin/videos",
        title: item.title,
        subtitle: item.description ?? undefined,
        status: { label: item.isPublished ? "Published" : "Hidden", tone: item.isPublished ? "success" : "secondary" },
        editHref: `/admin/videos/${item.id}/edit`,
        publicHref: item.isPublished ? "/" : undefined,
        images: item.thumbnailUrl ? [{ label: "Thumbnail", url: item.thumbnailUrl }] : [],
        groups: [
          {
            title: "Video details",
            fields: [
              { label: "YouTube link", value: text(item.youtubeUrl), href: item.youtubeUrl || undefined },
              { label: "Uploaded file", value: text(item.videoUrl), href: item.videoUrl || undefined },
              { label: "Display order", value: String(item.sortOrder) },
              { label: "Created", value: formatDateTime(item.createdAt) },
              { label: "Description", value: text(item.description), long: true },
            ],
          },
        ],
        related: [],
      };
    }

    case "testimonial": {
      await requirePermission("content.manage");
      const item = await prisma.testimonial.findUnique({ where: { id } });
      if (!item) return null;
      return {
        typeLabel: "Testimonials",
        listHref: "/admin/testimonials",
        title: item.clientName,
        subtitle: [item.clientTitle, item.clientCompany].filter(Boolean).join(" · ") || undefined,
        status: { label: item.isPublished ? "Published" : "Hidden", tone: item.isPublished ? "success" : "secondary" },
        editHref: `/admin/testimonials/${item.id}/edit`,
        publicHref: item.isPublished ? "/testimonials" : undefined,
        images: item.photoUrl ? [{ label: "Client photo", url: item.photoUrl }] : [],
        groups: [
          {
            title: "Client",
            fields: [
              { label: "Title", value: text(item.clientTitle) },
              { label: "Company", value: text(item.clientCompany) },
              { label: "Rating", value: `${item.rating} / 5` },
              { label: "Display order", value: String(item.sortOrder) },
              { label: "Created", value: formatDateTime(item.createdAt) },
            ],
          },
          { title: "Testimonial", fields: [{ label: "Content", value: item.content, long: true }] },
        ],
        related: [],
      };
    }

    case "gallery": {
      await requirePermission("gallery.manage");
      const item = await prisma.galleryMedia.findUnique({ where: { id }, include: { category: true } });
      if (!item) return null;
      return {
        typeLabel: "Gallery",
        listHref: "/admin/gallery",
        title: item.title || "Untitled gallery item",
        subtitle: item.category?.name,
        status: { label: item.isPublished ? "Published" : "Draft", tone: item.isPublished ? "success" : "secondary" },
        editHref: `/admin/gallery/${item.id}/edit`,
        publicHref: item.isPublished ? "/gallery" : undefined,
        images: [
          { label: "Media", url: item.url },
          ...(item.thumbnailUrl && item.thumbnailUrl !== item.url ? [{ label: "Thumbnail", url: item.thumbnailUrl }] : []),
        ],
        groups: [
          {
            title: "Details",
            fields: [
              { label: "Type", value: item.type },
              { label: "Category", value: item.category?.name },
              { label: "Dimensions", value: item.width && item.height ? `${item.width} × ${item.height}` : undefined },
              { label: "Display order", value: String(item.sortOrder) },
              { label: "Created", value: formatDateTime(item.createdAt) },
              { label: "File URL", value: item.url, href: item.url },
              { label: "Caption", value: text(item.caption), long: true },
            ],
          },
        ],
        related: [],
      };
    }

    case "faq": {
      await requirePermission("content.manage");
      const item = await prisma.fAQ.findUnique({ where: { id }, include: { category: true } });
      if (!item) return null;
      return {
        typeLabel: "FAQs",
        listHref: "/admin/faqs",
        title: item.question,
        subtitle: item.category?.name || "Uncategorised",
        status: { label: item.isActive ? "Active" : "Hidden", tone: item.isActive ? "success" : "secondary" },
        editHref: `/admin/faqs/${item.id}/edit`,
        publicHref: item.isActive ? "/faq" : undefined,
        images: [],
        groups: [
          {
            title: "Details",
            fields: [
              { label: "Category", value: item.category?.name },
              { label: "Shown beside services", value: yesNo(item.showOnService) },
              { label: "Display order", value: String(item.sortOrder) },
              { label: "Created", value: formatDateTime(item.createdAt) },
            ],
          },
          { title: "Answer", fields: [{ label: "Answer", value: item.answer, long: true }] },
        ],
        related: [],
      };
    }

    case "milestone": {
      await requirePermission("content.manage");
      const item = await prisma.companyMilestone.findUnique({ where: { id } });
      if (!item) return null;
      return {
        typeLabel: "Company timeline",
        listHref: "/admin/timeline",
        title: item.title,
        subtitle: item.year,
        status: { label: item.isPublished ? "Published" : "Hidden", tone: item.isPublished ? "success" : "secondary" },
        editHref: `/admin/timeline/${item.id}/edit`,
        publicHref: "/about",
        images: item.imageUrl ? [{ label: "Milestone image", url: item.imageUrl }] : [],
        groups: [
          {
            title: "Milestone",
            fields: [
              { label: "Year", value: item.year },
              { label: "Display order", value: String(item.sortOrder) },
              { label: "Description", value: text(item.description), long: true },
            ],
          },
        ],
        related: [],
      };
    }

    case "social": {
      await requirePermission("settings.manage");
      const item = await prisma.socialLink.findUnique({ where: { id } });
      if (!item) return null;
      return {
        typeLabel: "Social links",
        listHref: "/admin/social",
        title: socialPlatformLabel(item.platform),
        subtitle: item.label ?? undefined,
        status: { label: item.isActive ? "Visible" : "Hidden", tone: item.isActive ? "success" : "secondary" },
        editHref: `/admin/social/${item.id}/edit`,
        publicHref: "/",
        images: [],
        groups: [
          {
            title: "Link",
            fields: [
              { label: "Platform", value: item.platform },
              { label: "Destination", value: item.url, href: item.url },
              { label: "Label", value: text(item.label) },
              { label: "Icon override", value: text(item.icon) },
              { label: "Display order", value: String(item.sortOrder) },
            ],
          },
        ],
        related: [],
      };
    }

    case "subscriber": {
      await requirePermission("inquiries.manage");
      const item = await prisma.newsletterSubscriber.findUnique({ where: { id } });
      if (!item) return null;
      return {
        typeLabel: "Newsletter",
        listHref: "/admin/newsletter",
        title: item.email,
        subtitle: item.name ?? undefined,
        status: { label: item.isActive ? "Active" : "Inactive", tone: item.isActive ? "success" : "secondary" },
        images: [],
        groups: [
          {
            title: "Subscriber",
            fields: [
              { label: "Email", value: item.email },
              { label: "Name", value: text(item.name) },
              { label: "Source", value: text(item.source) },
              { label: "Joined", value: formatDateTime(item.createdAt) },
            ],
          },
        ],
        related: [],
      };
    }

    case "user": {
      await requirePermission("users.manage");
      const item = await prisma.adminUser.findFirst({ where: { id, deletedAt: null }, include: { role: true } });
      if (!item) return null;
      return {
        typeLabel: "Users",
        listHref: "/admin/users",
        title: item.name,
        subtitle: item.email,
        status: { label: item.isActive ? "Active" : "Inactive", tone: item.isActive ? "success" : "secondary" },
        editHref: `/admin/users/${item.id}`,
        images: item.avatarUrl ? [{ label: "Avatar", url: item.avatarUrl }] : [],
        groups: [
          {
            title: "Account",
            fields: [
              { label: "Email", value: item.email },
              { label: "Role", value: item.role.name },
              { label: "Role slug", value: item.role.slug },
              { label: "Last sign-in", value: item.lastLoginAt ? formatDateTime(item.lastLoginAt) : "Never" },
              { label: "Created", value: formatDateTime(item.createdAt) },
              { label: "Last updated", value: formatDateTime(item.updatedAt) },
            ],
          },
        ],
        related: [],
        note: "Passwords are stored as Argon2id hashes and are never shown.",
      };
    }

    case "section": {
      await requirePermission("content.manage");
      const item = await prisma.homepageSection.findUnique({ where: { id } });
      if (!item) return null;
      return {
        typeLabel: "Home page",
        listHref: "/admin/homepage",
        title: item.title || item.key,
        subtitle: item.subtitle ?? undefined,
        status: { label: item.isEnabled ? "Enabled" : "Disabled", tone: item.isEnabled ? "success" : "secondary" },
        editHref: `/admin/homepage/${item.id}/edit`,
        publicHref: "/",
        images: item.imageUrl ? [{ label: "Section image", url: item.imageUrl }] : [],
        groups: [
          {
            title: "Section",
            fields: [
              { label: "Key", value: item.key },
              { label: "Title", value: text(item.title) },
              { label: "Subtitle", value: text(item.subtitle) },
              { label: "Display order", value: String(item.sortOrder) },
              { label: "Button", value: text(item.buttonLabel), href: item.buttonUrl || undefined },
              { label: "Secondary button", value: text(item.secondaryLabel), href: item.secondaryUrl || undefined },
              { label: "Last updated", value: formatDateTime(item.updatedAt) },
              { label: "Description", value: text(item.description), long: true },
            ],
          },
        ],
        related: [],
      };
    }

    case "stat": {
      await requirePermission("content.manage");
      const item = await prisma.companyStatistic.findUnique({ where: { id } });
      if (!item) return null;
      return {
        typeLabel: "Company statistics",
        listHref: "/admin/content",
        title: `${item.value}${item.suffix ?? ""}`,
        subtitle: item.label,
        status: { label: item.isActive ? "Active" : "Hidden", tone: item.isActive ? "success" : "secondary" },
        editHref: `/admin/content/stats/${item.id}/edit`,
        publicHref: "/about",
        images: [],
        groups: [
          {
            title: "Statistic",
            fields: [
              { label: "Label", value: item.label },
              { label: "Value", value: item.value },
              { label: "Suffix", value: text(item.suffix) },
              { label: "Icon", value: text(item.icon) },
              { label: "Display order", value: String(item.sortOrder) },
            ],
          },
        ],
        related: [],
      };
    }

    case "value": {
      await requirePermission("content.manage");
      const item = await prisma.coreValue.findUnique({ where: { id } });
      if (!item) return null;
      return {
        typeLabel: "Core values",
        listHref: "/admin/content",
        title: item.title,
        status: { label: item.isActive ? "Active" : "Hidden", tone: item.isActive ? "success" : "secondary" },
        editHref: `/admin/content/values/${item.id}/edit`,
        publicHref: "/about",
        images: [],
        groups: [
          {
            title: "Value",
            fields: [
              { label: "Icon", value: text(item.icon) },
              { label: "Display order", value: String(item.sortOrder) },
              { label: "Description", value: item.description, long: true },
            ],
          },
        ],
        related: [],
      };
    }

    case "process-step": {
      await requirePermission("content.manage");
      const item = await prisma.processStep.findUnique({ where: { id } });
      if (!item) return null;
      return {
        typeLabel: "Process steps",
        listHref: "/admin/content",
        title: item.title,
        status: { label: item.isActive ? "Active" : "Hidden", tone: item.isActive ? "success" : "secondary" },
        editHref: `/admin/content/process/${item.id}/edit`,
        publicHref: "/about",
        images: item.imageUrl ? [{ label: "Step image", url: item.imageUrl }] : [],
        groups: [
          {
            title: "Step",
            fields: [
              { label: "Display order", value: String(item.sortOrder) },
              { label: "Description", value: item.description, long: true },
            ],
          },
        ],
        related: [],
      };
    }

    case "why": {
      await requirePermission("content.manage");
      const item = await prisma.whyChooseItem.findUnique({ where: { id } });
      if (!item) return null;
      return {
        typeLabel: "Why choose us",
        listHref: "/admin/content",
        title: item.title,
        status: { label: item.isActive ? "Active" : "Hidden", tone: item.isActive ? "success" : "secondary" },
        editHref: `/admin/content/why/${item.id}/edit`,
        publicHref: "/about",
        images: [],
        groups: [
          {
            title: "Item",
            fields: [
              { label: "Icon", value: text(item.icon) },
              { label: "Display order", value: String(item.sortOrder) },
              { label: "Description", value: item.description, long: true },
            ],
          },
        ],
        related: [],
      };
    }

    case "nav": {
      await requirePermission("settings.manage");
      const item = await prisma.navigationItem.findUnique({ where: { id }, include: { parent: true } });
      if (!item) return null;
      return {
        typeLabel: "Navigation",
        listHref: "/admin/settings/navigation",
        title: item.label,
        subtitle: item.url,
        status: { label: item.isActive ? "Visible" : "Hidden", tone: item.isActive ? "success" : "secondary" },
        editHref: `/admin/settings/navigation/${item.id}/edit`,
        images: [],
        groups: [
          {
            title: "Menu item",
            fields: [
              { label: "URL", value: item.url, href: item.url.startsWith("http") ? item.url : undefined },
              { label: "Location", value: item.location },
              { label: "Parent", value: item.parent?.label },
              { label: "Opens in new tab", value: yesNo(item.openInNewTab) },
              { label: "Display order", value: String(item.sortOrder) },
            ],
          },
        ],
        related: [],
      };
    }

    case "redirect": {
      await requirePermission("settings.manage");
      const item = await prisma.redirect.findUnique({ where: { id } });
      if (!item) return null;
      return {
        typeLabel: "Redirects",
        listHref: "/admin/settings/redirects",
        title: `${item.fromPath} → ${item.toPath}`,
        subtitle: `Status ${item.statusCode}`,
        status: { label: item.isActive ? "Active" : "Paused", tone: item.isActive ? "success" : "secondary" },
        editHref: `/admin/settings/redirects/${item.id}/edit`,
        images: [],
        groups: [
          {
            title: "Redirect",
            fields: [
              { label: "From path", value: item.fromPath },
              { label: "To path", value: item.toPath },
              { label: "Status code", value: String(item.statusCode) },
              { label: "Created", value: formatDateTime(item.createdAt) },
            ],
          },
        ],
        related: [],
      };
    }

    case "role": {
      await requirePermission("users.manage");
      const item = await prisma.role.findUnique({
        where: { id },
        include: {
          permissions: { include: { permission: true } },
          _count: { select: { users: { where: { deletedAt: null } } } },
        },
      });
      if (!item) return null;
      return {
        typeLabel: "Roles & permissions",
        listHref: "/admin/users/roles",
        title: item.name,
        subtitle: item.slug,
        status: { label: item.isSystem ? "Built-in" : "Custom", tone: item.isSystem ? "secondary" : "info" },
        editHref: `/admin/users/roles/${item.id}/edit`,
        images: [],
        groups: [
          {
            title: "Role",
            fields: [
              { label: "Slug", value: item.slug },
              { label: "Users", value: String(item._count.users) },
              { label: "Permissions", value: String(item.permissions.length) },
              { label: "Created", value: formatDateTime(item.createdAt) },
              { label: "Description", value: text(item.description), long: true },
            ],
          },
        ],
        related: [
          {
            title: "Permission keys",
            items: item.permissions.map((row) => ({ title: row.permission.label, body: row.permission.key })),
          },
        ],
      };
    }

    default:
      return null;
  }
}

export default async function RecordViewPage({ params }: { params: Promise<{ type: string; id: string }> }) {
  const { type, id } = await params;
  const view = await buildView(type, id);
  if (!view) notFound();

  return (
    <div>
      <PageHeader
        title={view.title}
        description={view.subtitle}
        breadcrumb={[{ label: view.typeLabel, href: view.listHref }, { label: "View" }]}
        actions={
          <>
            <Button asChild variant="outline">
              <Link href={view.listHref}>
                <ArrowLeft className="size-4" /> Back
              </Link>
            </Button>
            {view.publicHref && (
              <Button asChild variant="outline">
                <Link href={view.publicHref} target="_blank" rel="noreferrer">
                  <ExternalLink className="size-4" /> Open on site
                </Link>
              </Button>
            )}
            {view.editHref && (
              <Button asChild>
                <Link href={view.editHref}>
                  <Pencil className="size-4" /> Edit
                </Link>
              </Button>
            )}
          </>
        }
      />

      {view.status && (
        <div className="mb-5 flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant={view.status.tone} className="capitalize">{view.status.label}</Badge>
          <span>Read-only view of every saved field.</span>
        </div>
      )}

      {view.images.length > 0 && (
        <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {view.images.map((image) => (
            <figure key={`${image.label}-${image.url}`} className="overflow-hidden rounded-xl border border-border/80 bg-card">
              <div className="relative aspect-[4/3] bg-secondary">
                <SmartImage
                  src={image.url}
                  alt={image.label}
                  fill
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                />
              </div>
              <figcaption className="flex items-center justify-between gap-2 px-3 py-2 text-xs text-muted-foreground">
                <span className="truncate">{image.label}</span>
                <a href={image.url} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-1 hover:text-primary">
                  <ExternalLink className="size-3" />
                </a>
              </figcaption>
            </figure>
          ))}
        </div>
      )}

      <div className="space-y-5">
        {view.groups.map((group) => (
          <Card key={group.title} className="p-5">
            <h2 className="font-display text-lg text-primary">{group.title}</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              {group.fields.map((field) => (
                <FieldValue key={field.label} field={field} />
              ))}
            </dl>
          </Card>
        ))}

        {view.related
          .filter((group) => group.items.length > 0)
          .map((group) => (
            <Card key={group.title} className="overflow-hidden">
              <div className="border-b border-border/70 px-5 py-3">
                <h2 className="font-display text-lg text-primary">{group.title}</h2>
              </div>
              <div className="divide-y divide-border/70">
                {group.items.map((item, index) => (
                  <div key={`${item.title}-${index}`} className="px-5 py-3">
                    <p className="text-sm font-medium text-primary">{item.title}</p>
                    {item.body && (
                      <p className="mt-1 whitespace-pre-line break-words text-sm text-muted-foreground">{item.body}</p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          ))}
      </div>

      {view.note && <p className="mt-4 text-xs text-muted-foreground">{view.note}</p>}
    </div>
  );
}
