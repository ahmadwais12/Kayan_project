import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { TaxonomyManager, type TaxonomyItem } from "@/components/admin/taxonomy-manager";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function ServiceCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePermission("services.manage");
  const query = await searchParams;

  const [categories, counts] = await Promise.all([
    prisma.serviceCategory.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    prisma.service.groupBy({ by: ["categoryId"], where: { deletedAt: null }, _count: { _all: true } }),
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
        title="Service categories"
        description="Group related services together for the services overview."
        breadcrumb={[{ label: "Services", href: "/admin/services" }, { label: "Categories" }]}
        actions={
          <Button asChild variant="outline">
            <Link href="/admin/services">
              <ArrowLeft className="size-4" /> Back to services
            </Link>
          </Button>
        }
      />
      <AdminFlash {...flashFromQuery(query)} />
      <TaxonomyManager
        entity="serviceCategory"
        noun="category"
        items={items}
        editId={query.edit}
        description="A category appears above the service cards. Services without a category remain available in the full list."
      />
    </div>
  );
}
