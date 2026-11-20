import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { SettingsTabs } from "@/components/admin/settings-tabs";
import { RedirectForm } from "@/components/admin/redirect-form";

export const dynamic = "force-dynamic";

export default async function EditRedirectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePermission("settings.manage");
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const item = await prisma.redirect.findUnique({ where: { id } });
  if (!item) notFound();
  return <div><PageHeader title="Edit redirect" description="Update the source, destination, and redirect behavior." breadcrumb={[{ label: "Settings", href: "/admin/settings" }, { label: "Redirects", href: "/admin/settings/redirects" }, { label: "Edit redirect" }]} /><SettingsTabs active="/admin/settings/redirects" /><AdminFlash {...flashFromQuery(query)} /><RedirectForm item={item} /></div>;
}
