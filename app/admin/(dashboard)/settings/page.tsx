import { requirePermission } from "@/lib/auth/guards";
import { getSettings } from "@/lib/settings";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { SettingsTabs } from "@/components/admin/settings-tabs";
import { SubmitButton } from "@/components/admin/form-kit";
import { saveCompanySettings } from "@/actions/settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";

export const dynamic = "force-dynamic";

export default async function GeneralSettingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePermission("settings.manage");
  const [settings, query] = await Promise.all([getSettings(), searchParams]);

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Company identity, contact details and footer text used throughout the website."
        breadcrumb={[{ label: "Settings" }]}
      />
      <SettingsTabs active="/admin/settings" />
      <AdminFlash {...flashFromQuery(query)} />

      <form action={saveCompanySettings} className="space-y-5">
        <input type="hidden" name="returnTo" value="/admin/settings" />

        <Card>
          <CardHeader><CardTitle>Identity</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="siteName">Site name</Label>
                <Input id="siteName" name="siteName" defaultValue={settings.siteName} required maxLength={120} />
              </div>
              <div>
                <Label htmlFor="siteLegalName">Legal company name</Label>
                <Input id="siteLegalName" name="siteLegalName" defaultValue={settings.siteLegalName} maxLength={180} />
              </div>
            </div>
            <div>
              <Label htmlFor="tagline">Tagline</Label>
              <Input id="tagline" name="tagline" defaultValue={settings.tagline} maxLength={200} />
            </div>
            <div>
              <Label htmlFor="siteDescription">Site description</Label>
              <Textarea id="siteDescription" name="siteDescription" defaultValue={settings.siteDescription} rows={3} maxLength={400} />
              <p className="mt-1.5 text-xs text-muted-foreground">Used as the default meta description when a page has none of its own.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Footer & copyright</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="footerAbout">Footer introduction</Label>
              <Textarea id="footerAbout" name="footerAbout" defaultValue={settings.footerAbout} rows={3} maxLength={500} />
            </div>
            <div>
              <Label htmlFor="copyright">Copyright line</Label>
              <Input id="copyright" name="copyright" defaultValue={settings.copyright} maxLength={200} />
            </div>
          </CardContent>
        </Card>

        <SubmitButton>Save settings</SubmitButton>
      </form>
    </div>
  );
}
