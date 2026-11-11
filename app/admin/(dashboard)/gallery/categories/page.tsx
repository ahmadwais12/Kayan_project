import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { TaxonomyManager, type TaxonomyItem } from "@/components/admin/taxonomy-manager";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function GalleryCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePermission("gallery.manage");
  const query = await searchParams;

  const [categories, counts] = await Promise.all([
    prisma.galleryCategory.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    prisma.galleryMedia.groupBy({ by: ["categoryId"], _count: { _all: true } }),
  ]);
  const usage = new Map(counts.map((row) => [row.categoryId, row._count._all]));

  const items: TaxonomyItem[] = categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    sortOrder: category.sortOrder,
    isActive: category.isActive,
    usage: usage.get(category.id) || 0,
  }));

  return (
    <div>
      <PageHeader
        title="Gallery categories"
        description="Categories double as filter tabs on the public gallery."
        breadcrumb={[{ label: "Gallery", href: "/admin/gallery" }, { label: "Categories" }]}
        actions={
          <Button asChild variant="outline">
            <Link href="/admin/gallery">
              <ArrowLeft className="size-4" /> Back to gallery
            </Link>
          </Button>
        }
      />
      <AdminFlash {...flashFromQuery(query)} />
      <TaxonomyManager
        entity="galleryCategory"
        noun="category"
        items={items}
        editId={query.edit}
        description="Use broad categories such as Interiors, Exteriors or Construction progress."
      />
    </div>
  );
}
