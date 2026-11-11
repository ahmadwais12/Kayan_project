import { requirePermission } from "@/lib/auth/guards";
import { getSettings } from "@/lib/settings";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { SettingsTabs } from "@/components/admin/settings-tabs";
import { SubmitButton, FieldHelp } from "@/components/admin/form-kit";
import { saveCompanySettings } from "@/actions/settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";

export const dynamic = "force-dynamic";

const COLORS = [
  { key: "primaryColor", label: "Primary", hint: "Deep brand colour used for headings, footer and buttons." },
  { key: "secondaryColor", label: "Secondary", hint: "Supporting dark tone, used for subdued text and panels." },
  { key: "accentColor", label: "Accent", hint: "Warm highlight for links, rules and interactive accents." },
  { key: "backgroundColor", label: "Background", hint: "Page background tint." },
  { key: "mutedColor", label: "Muted surface", hint: "Cards, alternating sections and quiet surfaces." },
  { key: "whiteColor", label: "White", hint: "Cards and content areas." },
] as const;

export default async function ThemeSettingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePermission("settings.manage");
  const [settings, query] = await Promise.all([getSettings(), searchParams]);

  return (
    <div>
      <PageHeader
        title="Theme"
        description="Brand colours are injected as CSS variables on every page. Choose colours with sufficient contrast for text."
        breadcrumb={[{ label: "Settings", href: "/admin/settings" }, { label: "Theme" }]}
      />
      <SettingsTabs active="/admin/settings/theme" />
      <AdminFlash {...flashFromQuery(query)} />

      <form action={saveCompanySettings} className="space-y-5">
        <input type="hidden" name="returnTo" value="/admin/settings/theme" />
        <Card>
          <CardHeader><CardTitle>Brand palette</CardTitle></CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            {COLORS.map((color) => {
              const value = settings[color.key] || "#000000";
              return (
                <div key={color.key}>
                  <Label htmlFor={color.key}>{color.label}</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      defaultValue={value}
                      aria-label={`${color.label} colour picker`}
                      onChange={(event) => {
                        const input = document.getElementById(color.key) as HTMLInputElement | null;
                        if (input) input.value = event.target.value;
                      }}
                      className="size-10 cursor-pointer rounded border border-border bg-transparent"
                    />
                    <Input id={color.key} name={color.key} defaultValue={value} pattern="^#[0-9a-fA-F]{6}$" required />
                  </div>
                  <FieldHelp>{color.hint}</FieldHelp>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Preview notes</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>The accent colour is also used for hover states. If you change it, check that it remains legible on white and on the primary colour.</p>
            <p>Colours are stored as six-digit hex values. The site falls back to the original palette if a value is invalid.</p>
          </CardContent>
        </Card>

        <SubmitButton>Save theme</SubmitButton>
      </form>
    </div>
  );
}
