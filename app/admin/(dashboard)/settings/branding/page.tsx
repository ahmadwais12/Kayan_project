import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { getSettings } from "@/lib/settings";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { SettingsTabs } from "@/components/admin/settings-tabs";
import { SubmitButton } from "@/components/admin/form-kit";
import { ImageInput } from "@/components/admin/image-input";
import { saveCompanySettings } from "@/actions/settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";

export const dynamic = "force-dynamic";

export default async function BrandingSettingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePermission("settings.manage");
  const [settings, media, query] = await Promise.all([
    getSettings(),
    prisma.media.findMany({ orderBy: { createdAt: "desc" }, take: 100, select: { id: true, url: true, alt: true } }),
    searchParams,
  ]);

  return (
    <div>
      <PageHeader
        title="Branding & logo"
        description="Upload the studio logo and favicon. Leave the logo empty to use the built-in KL monogram."
        breadcrumb={[{ label: "Settings", href: "/admin/settings" }, { label: "Branding" }]}
      />
      <SettingsTabs active="/admin/settings/branding" />
      <AdminFlash {...flashFromQuery(query)} />

      <form action={saveCompanySettings} className="space-y-5">
        <input type="hidden" name="returnTo" value="/admin/settings/branding" />
        <Card>
          <CardHeader><CardTitle>Logo</CardTitle></CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <ImageInput
              name="logoUrl"
              defaultValue={settings.logoUrl}
              library={media}
              label="Logo"
              help="A wide or square logo on a transparent or light background works best. PNG or WebP recommended."
            />
            <ImageInput
              name="faviconUrl"
              defaultValue={settings.faviconUrl}
              library={media}
              label="Favicon"
              help="Square PNG, at least 256×256 pixels. Used for browser tabs and bookmarks."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Display name</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="siteName">Site name</Label>
              <Input id="siteName" name="siteName" defaultValue={settings.siteName} required maxLength={120} />
            </div>
            <div>
              <Label htmlFor="tagline">Tagline</Label>
              <Input id="tagline" name="tagline" defaultValue={settings.tagline} maxLength={200} />
            </div>
          </CardContent>
        </Card>

        <SubmitButton>Save branding</SubmitButton>
      </form>
    </div>
  );
}
