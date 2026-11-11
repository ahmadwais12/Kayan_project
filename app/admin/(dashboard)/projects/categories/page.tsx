import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { TaxonomyManager, type TaxonomyItem } from "@/components/admin/taxonomy-manager";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function ProjectCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePermission("projects.manage");
  const query = await searchParams;

  const [categories, tagCounts] = await Promise.all([
    prisma.projectCategory.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    prisma.projectTagRelation.groupBy({ by: ["tagId"], _count: { _all: true } }),
  ]);

  const categoryCounts = await prisma.project.groupBy({
    by: ["categoryId"],
    where: { deletedAt: null },
    _count: { _all: true },
  });
  const counts = new Map(categoryCounts.map((row) => [row.categoryId, row._count._all]));
  const tagUsage = new Map(tagCounts.map((row) => [row.tagId, row._count._all]));

  const tags = await prisma.projectTag.findMany({ orderBy: { name: "asc" } });

  const items: TaxonomyItem[] = categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    sortOrder: category.sortOrder,
    isActive: category.isActive,
    usage: counts.get(category.id) || 0,
  }));

  const tagItems: TaxonomyItem[] = tags.map((tag) => ({
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
    usage: tagUsage.get(tag.id) || 0,
  }));

  const flash = flashFromQuery(query);

  return (
    <div>
      <PageHeader
        title="Project categories"
        description="Categories group projects on the portfolio page and filter bar. Tags are optional labels used for related projects."
        breadcrumb={[{ label: "Projects", href: "/admin/projects" }, { label: "Categories" }]}
        actions={
          <Button asChild variant="outline">
            <Link href="/admin/projects">
              <ArrowLeft className="size-4" /> Back to projects
            </Link>
          </Button>
        }
      />

      <AdminFlash {...flash} />

      <TaxonomyManager
        entity="projectCategory"
        noun="category"
        items={items}
        editId={query.edit}
        description="Use a short, clear name such as Residential, Commercial, Interiors or Landscape. The slug becomes part of the public filter URL."
      />

      <div className="mt-10">
        <h2 className="font-display text-xl text-primary">Project tags</h2>
        <p className="mb-4 mt-1 text-sm text-muted-foreground">
          Tags are entered on each project and can be used to surface related work.
        </p>
        <TaxonomyManager
          entity="projectTag"
          noun="tag"
          simple
          items={tagItems}
          editId={query.edit}
          description="Tags are created automatically when you type them on a project, but you can rename or remove them here."
        />
      </div>
    </div>
  );
}
