import Link from "next/link";
import { Check, TriangleAlert } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { getSeoSettings } from "@/lib/settings";
import { getSeoAudit } from "@/lib/seo-audit";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { SettingsTabs } from "@/components/admin/settings-tabs";
import { SubmitButton, FieldHelp } from "@/components/admin/form-kit";
import { ImageInput } from "@/components/admin/image-input";
import { saveSeoSettings } from "@/actions/settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, NativeSelect, Textarea } from "@/components/ui/input";

export const dynamic = "force-dynamic";

export default async function SeoSettingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePermission("settings.manage");
  const [seo, media, audit, query] = await Promise.all([
    getSeoSettings(),
    prisma.media.findMany({ orderBy: { createdAt: "desc" }, take: 100, select: { id: true, url: true, alt: true } }),
    getSeoAudit(),
    searchParams,
  ]);

  return (
    <div>
      <PageHeader
        title="SEO settings"
        description="Defaults used across the site, including search appearance and verification codes."
        breadcrumb={[{ label: "Settings", href: "/admin/settings" }, { label: "SEO" }]}
      />
      <SettingsTabs active="/admin/settings/seo" />
      <AdminFlash {...flashFromQuery(query)} />

      <form action={saveSeoSettings} className="space-y-5">
        <Card>
          <CardHeader><CardTitle>Search appearance</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="siteTitle">Site title</Label>
              <Input id="siteTitle" name="siteTitle" defaultValue={seo.siteTitle} required maxLength={180} />
            </div>
            <div>
              <Label htmlFor="defaultDescription">Default meta description</Label>
              <Textarea id="defaultDescription" name="defaultDescription" defaultValue={seo.defaultDescription} rows={3} maxLength={400} required />
              <FieldHelp>Pages can override this with their own description.</FieldHelp>
            </div>
            <ImageInput
              name="ogImage"
              defaultValue={seo.ogImage}
              library={media}
              label="Default social sharing image"
              help="Used when a page does not have its own Open Graph image. Recommended 1200×630 pixels."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Technical</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="canonicalBase">Canonical base URL</Label>
              <Input id="canonicalBase" name="canonicalBase" defaultValue={seo.canonicalBase} placeholder="https://kayanland.com" />
              <FieldHelp>Include the protocol and no trailing slash. Used to build canonical URLs and the sitemap.</FieldHelp>
            </div>
            <div>
              <Label htmlFor="robotsPolicy">Robots policy</Label>
              <NativeSelect id="robotsPolicy" name="robotsPolicy" defaultValue={seo.robotsPolicy}>
                <option value="index, follow">index, follow</option>
                <option value="noindex, nofollow">noindex, nofollow</option>
                <option value="noindex, follow">noindex, follow</option>
              </NativeSelect>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="googleVerification">Google verification code</Label>
                <Input id="googleVerification" name="googleVerification" defaultValue={seo.googleVerification} maxLength={200} />
              </div>
              <div>
                <Label htmlFor="bingVerification">Bing verification code</Label>
                <Input id="bingVerification" name="bingVerification" defaultValue={seo.bingVerification} maxLength={200} />
              </div>
            </div>
          </CardContent>
        </Card>

        <SubmitButton>Save SEO settings</SubmitButton>
      </form>

      <Card className="mt-5">
        <CardHeader>
          <CardTitle>SEO health</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="border border-border/70 bg-secondary/40 p-3">
              <p className="text-[0.65rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">Indexing</p>
              <p className="mt-1 text-sm font-medium text-primary">
                {audit.technical.noindex ? "Blocked (noindex)" : "Open to indexing"}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{audit.technical.robotsPolicy}</p>
            </div>
            <div className="border border-border/70 bg-secondary/40 p-3">
              <p className="text-[0.65rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">Canonical base</p>
              <p className="mt-1 truncate text-sm font-medium text-primary">
                {audit.technical.canonicalBase || "Not set"}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {audit.technical.canonicalBase ? "Used for canonicals and sitemap" : "Set a canonical base URL above"}
              </p>
            </div>
            <div className="border border-border/70 bg-secondary/40 p-3">
              <p className="text-[0.65rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">Sitemap</p>
              {audit.technical.sitemapUrl ? (
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 block truncate text-sm font-medium text-primary underline-offset-2 hover:underline"
                >
                  {audit.technical.sitemapUrl}
                </a>
              ) : (
                <p className="mt-1 text-sm font-medium text-primary">Unavailable</p>
              )}
              <p className="mt-0.5 text-xs text-muted-foreground">
                {audit.technical.indexedPages} indexable URL(s)
              </p>
            </div>
            <div className="border border-border/70 bg-secondary/40 p-3">
              <p className="text-[0.65rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">Open issues</p>
              <p className="mt-1 text-sm font-medium text-primary">{audit.groups.length}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {audit.groups.length ? "Review the findings below" : "Content checks are clear"}
              </p>
            </div>
          </div>

          {audit.groups.length ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {audit.groups.map((group) => (
                <div key={group.key} className="border border-border/70 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="flex items-center gap-1.5 text-sm font-medium text-primary">
                        <TriangleAlert className="size-4 text-amber-600" aria-hidden="true" />
                        {group.label}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{group.hint}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-primary">
                      {group.count}
                    </span>
                  </div>
                  <ul className="mt-3 space-y-1.5 text-xs">
                    {group.items.map((item, index) => (
                      <li key={`${group.key}-${index}`}>
                        <Link href={item.href} className="text-foreground/80 underline-offset-2 hover:text-primary hover:underline">
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {group.count > group.items.length && (
                    <p className="mt-2 text-[0.68rem] text-muted-foreground">
                      Showing {group.items.length} of {group.count}.
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-start gap-2.5 border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              <Check className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>No metadata, alt-text, duplicate-title, or broken-link issues found in published content.</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
