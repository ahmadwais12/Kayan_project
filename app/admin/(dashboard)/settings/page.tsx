import { requirePermission } from "@/lib/auth/guards";
import { getSettings } from "@/lib/settings";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { SettingsTabs } from "@/components/admin/settings-tabs";
import { SubmitButton } from "@/components/admin/form-kit";
import { saveCompanySettings } from "@/actions/settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LocalizedField } from "@/components/admin/localized-field";
import { loadKeyedTranslations } from "@/lib/i18n/form-translations";

export const dynamic = "force-dynamic";

const TEXT_KEYS = ["siteName", "siteLegalName", "tagline", "siteDescription", "footerAbout", "copyright"];

export default async function GeneralSettingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePermission("settings.manage");
  const [settings, query, translations] = await Promise.all([
    getSettings(),
    searchParams,
    loadKeyedTranslations("setting", TEXT_KEYS),
  ]);

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
            <LocalizedField id="siteName" name="siteName" label="Site name" defaultValue={settings.siteName} translations={translations} required maxLength={120} />
            <LocalizedField id="siteLegalName" name="siteLegalName" label="Legal company name" defaultValue={settings.siteLegalName} translations={translations} maxLength={180} />
            <LocalizedField id="tagline" name="tagline" label="Tagline" defaultValue={settings.tagline} translations={translations} maxLength={200} />
            <LocalizedField id="siteDescription" name="siteDescription" label="Site description" defaultValue={settings.siteDescription} translations={translations} multiline rows={3} maxLength={400} help="Used as the default meta description when a page has none of its own." />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Footer & copyright</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <LocalizedField id="footerAbout" name="footerAbout" label="Footer introduction" defaultValue={settings.footerAbout} translations={translations} multiline rows={3} maxLength={500} />
            <LocalizedField id="copyright" name="copyright" label="Copyright line" defaultValue={settings.copyright} translations={translations} maxLength={200} />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <SubmitButton>Save settings</SubmitButton>
        </div>
      </form>
    </div>
  );
}
