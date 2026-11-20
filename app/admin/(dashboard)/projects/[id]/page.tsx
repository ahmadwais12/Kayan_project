import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { ProjectForm } from "@/components/admin/project-form";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";
import { loadFormTranslations } from "@/lib/i18n/form-translations";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePermission("projects.manage");
  const { id } = await params;
  const query = await searchParams;

  const [project, categories, media, translations] = await Promise.all([
    prisma.project.findFirst({
      where: { id, deletedAt: null },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        specifications: { orderBy: { sortOrder: "asc" } },
        features: { orderBy: { sortOrder: "asc" } },
        tags: { include: { tag: true } },
      },
    }),
    prisma.projectCategory.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
    prisma.media.findMany({ orderBy: { createdAt: "desc" }, take: 100, select: { id: true, url: true, alt: true } }),
    loadFormTranslations("project", id, [
      "title",
      "location",
      "description",
      "challenges",
      "solutions",
      "architecturalDetails",
      "constructionDetails",
    ]),
  ]);

  if (!project) notFound();

  const flash = flashFromQuery(query);

  return (
    <div>
      <PageHeader
        title={project.title}
        description={`Last updated ${formatDateTime(project.updatedAt)}`}
        breadcrumb={[{ label: "Projects", href: "/admin/projects" }, { label: project.title }]}
        actions={
          <>
            {project.isPublished && (
              <Button asChild variant="outline">
                <Link href={`/projects/${project.slug}`} target="_blank" rel="noreferrer">
                  View live <ExternalLink className="size-3.5" />
                </Link>
              </Button>
            )}
            <Button asChild variant="outline">
              <Link href="/admin/projects">All projects</Link>
            </Button>
          </>
        }
      />

      <AdminFlash {...flash} />

      <ProjectForm
        categories={categories}
        library={media}
        translations={translations}
        values={{
          id: project.id,
          title: project.title,
          slug: project.slug,
          categoryId: project.categoryId,
          clientName: project.clientName || "",
          location: project.location,
          year: project.year || "",
          status: project.status,
          duration: project.duration || "",
          budget: project.budget || "",
          description: project.description,
          challenges: project.challenges || "",
          solutions: project.solutions || "",
          architecturalDetails: project.architecturalDetails || "",
          constructionDetails: project.constructionDetails || "",
          coverImage: project.coverImage || "",
          beforeImage: project.beforeImage || "",
          afterImage: project.afterImage || "",
          showBeforeAfter: project.showBeforeAfter,
          isFeatured: project.isFeatured,
          isPublished: project.isPublished,
          sortOrder: project.sortOrder,
          seoTitle: project.seoTitle || "",
          seoDescription: project.seoDescription || "",
          ogImage: project.ogImage || "",
          tags: project.tags.map((relation) => relation.tag.name).join(", "),
          images: project.images.map((image) => ({
            url: image.url,
            alt: image.alt || "",
            caption: image.caption || "",
          })),
          specifications: project.specifications.map((spec) => ({ label: spec.label, value: spec.value })),
          features: project.features.map((feature) => ({
            title: feature.title,
            description: feature.description || "",
          })),
        }}
      />
    </div>
  );
}
