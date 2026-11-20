import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { SettingsTabs } from "@/components/admin/settings-tabs";
import { NavigationItemForm } from "@/components/admin/navigation-item-form";

export const dynamic = "force-dynamic";

export default async function NewNavigationItemPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requirePermission("settings.manage");
  const [items, query] = await Promise.all([
    prisma.navigationItem.findMany({ orderBy: [{ location: "asc" }, { sortOrder: "asc" }, { label: "asc" }] }),
    searchParams,
  ]);
  return (
    <div>
      <PageHeader title="Add menu item" description="Add a link to the site header or footer." breadcrumb={[{ label: "Settings", href: "/admin/settings" }, { label: "Navigation", href: "/admin/settings/navigation" }, { label: "New item" }]} />
      <SettingsTabs active="/admin/settings/navigation" />
      <AdminFlash {...flashFromQuery(query)} />
      <NavigationItemForm parents={items.filter((item) => item.location === "header" && !item.parentId)} />
    </div>
  );
}
