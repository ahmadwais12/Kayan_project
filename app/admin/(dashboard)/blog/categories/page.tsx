import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { TaxonomyManager, type TaxonomyItem } from "@/components/admin/taxonomy-manager";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function BlogCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePermission("blog.manage");
  const query = await searchParams;

  const [categories, counts] = await Promise.all([
    prisma.blogCategory.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    prisma.blogPost.groupBy({ by: ["categoryId"], where: { deletedAt: null }, _count: { _all: true } }),
  ]);
  const usage = new Map(counts.map((row) => [row.categoryId, row._count._all]));

  const items: TaxonomyItem[] = categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    sortOrder: category.sortOrder,
    isActive: category.isActive,
    usage: usage.get(category.id) || 0,
  }));

  return (
    <div>
      <PageHeader
        title="Blog categories"
        description="Categories organise articles for readers and help with internal linking."
        breadcrumb={[{ label: "Blog", href: "/admin/blog" }, { label: "Categories" }]}
        actions={
          <Button asChild variant="outline">
            <Link href="/admin/blog">
              <ArrowLeft className="size-4" /> Back to blog
            </Link>
          </Button>
        }
      />
      <AdminFlash {...flashFromQuery(query)} />
      <TaxonomyManager
        entity="blogCategory"
        noun="category"
        items={items}
        editId={query.edit}
        description="Examples: Design notes, Materials, Construction diaries. Keep the list short so readers can browse easily."
      />
    </div>
  );
}
