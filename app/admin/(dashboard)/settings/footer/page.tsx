import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { SettingsTabs } from "@/components/admin/settings-tabs";
import { SubmitButton, FieldHelp } from "@/components/admin/form-kit";
import { saveFooterSettings } from "@/actions/settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label, Textarea } from "@/components/ui/input";

export const dynamic = "force-dynamic";

export default async function FooterSettingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePermission("settings.manage");
  const [rows, query] = await Promise.all([
    prisma.footerSetting.findMany({ orderBy: { key: "asc" } }),
    searchParams,
  ]);

  return (
    <div>
      <PageHeader
        title="Footer settings"
        description="Supporting copy blocks used in the footer. The footer menu itself is controlled under Navigation."
        breadcrumb={[{ label: "Settings", href: "/admin/settings" }, { label: "Footer" }]}
      />
      <SettingsTabs active="/admin/settings/footer" />
      <AdminFlash {...flashFromQuery(query)} />

      <form action={saveFooterSettings} className="space-y-5">
        <Card>
          <CardHeader><CardTitle>Footer copy</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {rows.length === 0 ? (
              <p className="text-sm text-muted-foreground">No footer settings are available yet.</p>
            ) : (
              rows.map((row) => (
                <div key={row.key}>
                  <Label htmlFor={`footer-${row.key}`}>{labelFor(row.key)}</Label>
                  <Textarea
                    id={`footer-${row.key}`}
                    name={`footer:${row.key}`}
                    defaultValue={row.value}
                    rows={row.value.length > 120 ? 4 : 2}
                    maxLength={8000}
                  />
                </div>
              ))
            )}
            <FieldHelp>
              The footer introduction and copyright line are edited in General settings. Newsletter consent text belongs here if you add it.
            </FieldHelp>
          </CardContent>
        </Card>
        <SubmitButton>Save footer</SubmitButton>
      </form>
    </div>
  );
}

function labelFor(key: string) {
  const labels: Record<string, string> = {
    newsletterHeading: "Newsletter heading",
    newsletterNote: "Newsletter note / consent text",
    footerNote: "Small print",
  };
  return labels[key] || key.replace(/([A-Z])/g, " $1").replace(/^./, (value) => value.toUpperCase());
}
