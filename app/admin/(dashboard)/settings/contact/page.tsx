import { requirePermission } from "@/lib/auth/guards";
import { getSettings } from "@/lib/settings";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { SettingsTabs } from "@/components/admin/settings-tabs";
import { SubmitButton, FieldHelp } from "@/components/admin/form-kit";
import { saveCompanySettings } from "@/actions/settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { LocalizedField } from "@/components/admin/localized-field";
import { loadKeyedTranslations } from "@/lib/i18n/form-translations";

export const dynamic = "force-dynamic";

export default async function ContactSettingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePermission("settings.manage");
  const [settings, query, translations] = await Promise.all([
    getSettings(),
    searchParams,
    loadKeyedTranslations("setting", ["workingHours", "address"]),
  ]);

  return (
    <div>
      <PageHeader
        title="Contact information"
        description="These details appear on the contact page, in the footer and in structured data. Only publish verified information."
        breadcrumb={[{ label: "Settings", href: "/admin/settings" }, { label: "Contact" }]}
      />
      <SettingsTabs active="/admin/settings/contact" />
      <AdminFlash {...flashFromQuery(query)} />

      <form action={saveCompanySettings} className="space-y-5">
        <input type="hidden" name="returnTo" value="/admin/settings/contact" />
        <Card>
          <CardHeader><CardTitle>Contact details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" defaultValue={settings.email} placeholder="studio@example.com" />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" defaultValue={settings.phone} placeholder="+00 000 000 0000" dir="ltr" className="phone-ltr" />
              </div>
              <div>
                <Label htmlFor="whatsapp">WhatsApp number</Label>
                <Input id="whatsapp" name="whatsapp" defaultValue={settings.whatsapp} placeholder="+00 000 000 0000" dir="ltr" className="phone-ltr" />
              </div>
            </div>
            <LocalizedField id="workingHours" name="workingHours" label="Working hours" defaultValue={settings.workingHours} translations={translations} maxLength={200} />
            <LocalizedField id="address" name="address" label="Address" defaultValue={settings.address} translations={translations} multiline rows={3} maxLength={500} help="Leave blank until the address is confirmed. Empty fields are hidden from the website." />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Map</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="mapEmbedUrl">Google Maps embed URL</Label>
              <Input id="mapEmbedUrl" name="mapEmbedUrl" defaultValue={settings.mapEmbedUrl} placeholder="https://www.google.com/maps/embed?pb=…" />
              <FieldHelp>
                Paste only the <code>src</code> value from a Google Maps embed code. The map is only shown when this is set.
              </FieldHelp>
            </div>
          </CardContent>
        </Card>

        <SubmitButton>Save contact details</SubmitButton>
      </form>
    </div>
  );
}
