import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { SettingsTabs } from "@/components/admin/settings-tabs";
import { NavigationItemForm } from "@/components/admin/navigation-item-form";

export const dynamic = "force-dynamic";

export default async function EditNavigationItemPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePermission("settings.manage");
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const [item, items] = await Promise.all([
    prisma.navigationItem.findUnique({ where: { id } }),
    prisma.navigationItem.findMany({ orderBy: [{ location: "asc" }, { sortOrder: "asc" }, { label: "asc" }] }),
  ]);
  if (!item) notFound();
  return (
    <div>
      <PageHeader title="Edit menu item" description="Update this header or footer link." breadcrumb={[{ label: "Settings", href: "/admin/settings" }, { label: "Navigation", href: "/admin/settings/navigation" }, { label: "Edit item" }]} />
      <SettingsTabs active="/admin/settings/navigation" />
      <AdminFlash {...flashFromQuery(query)} />
      <NavigationItemForm item={item} parents={items.filter((entry) => entry.location === "header" && !entry.parentId)} />
    </div>
  );
}
