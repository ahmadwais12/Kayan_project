import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { TaxonomyManager, type TaxonomyItem } from "@/components/admin/taxonomy-manager";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function DepartmentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePermission("team.manage");
  const query = await searchParams;

  const [departments, counts] = await Promise.all([
    prisma.department.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    prisma.teamMember.groupBy({ by: ["departmentId"], where: { deletedAt: null }, _count: { _all: true } }),
  ]);
  const usage = new Map(counts.map((row) => [row.departmentId, row._count._all]));

  const items: TaxonomyItem[] = departments.map((department) => ({
    id: department.id,
    name: department.name,
    slug: department.slug,
    description: department.description,
    sortOrder: department.sortOrder,
    isActive: department.isActive,
    usage: usage.get(department.id) || 0,
  }));

  return (
    <div>
      <PageHeader
        title="Departments"
        description="Departments group team members by discipline, such as Architecture or Construction."
        breadcrumb={[{ label: "Team", href: "/admin/team" }, { label: "Departments" }]}
        actions={
          <Button asChild variant="outline">
            <Link href="/admin/team">
              <ArrowLeft className="size-4" /> Back to team
            </Link>
          </Button>
        }
      />
      <AdminFlash {...flashFromQuery(query)} />
      <TaxonomyManager
        entity="department"
        noun="department"
        items={items}
        editId={query.edit}
        description="Department names appear on team profiles and may be used to filter the team page."
      />
    </div>
  );
}
