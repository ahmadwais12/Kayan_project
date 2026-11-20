import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { SettingsTabs } from "@/components/admin/settings-tabs";
import { RedirectForm } from "@/components/admin/redirect-form";

export const dynamic = "force-dynamic";

export default async function NewRedirectPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requirePermission("settings.manage");
  const query = await searchParams;
  return <div><PageHeader title="Add redirect" description="Send an old site path to its new destination." breadcrumb={[{ label: "Settings", href: "/admin/settings" }, { label: "Redirects", href: "/admin/settings/redirects" }, { label: "New redirect" }]} /><SettingsTabs active="/admin/settings/redirects" /><AdminFlash {...flashFromQuery(query)} /><RedirectForm /></div>;
}
