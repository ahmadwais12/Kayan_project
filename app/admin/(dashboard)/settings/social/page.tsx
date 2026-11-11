import Link from "next/link";
import { Globe } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { SettingsTabs } from "@/components/admin/settings-tabs";
import { DeleteButton } from "@/components/admin/delete-button";
import { SubmitButton } from "@/components/admin/form-kit";
import { saveSocialLink, deleteSocialLink } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";

export const dynamic = "force-dynamic";

export default async function SocialSettingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePermission("settings.manage");
  const query = await searchParams;

  const links = await prisma.socialLink.findMany({ orderBy: [{ sortOrder: "asc" }, { platform: "asc" }] });
  const editing = query.edit ? links.find((link) => link.id === query.edit) : undefined;

  return (
    <div>
      <PageHeader
        title="Social media"
        description="Social profiles shown in the header, footer and contact page."
        breadcrumb={[{ label: "Settings", href: "/admin/settings" }, { label: "Social" }]}
      />
      <SettingsTabs active="/admin/settings/social" />
      <AdminFlash {...flashFromQuery(query)} />

      <div className="grid items-start gap-5 xl:grid-cols-[1fr_1.4fr]">
        <Card>
          <CardHeader><CardTitle>{editing ? "Edit social link" : "Add social link"}</CardTitle></CardHeader>
          <CardContent>
            <form action={saveSocialLink} className="space-y-4">
              <input type="hidden" name="id" value={editing?.id || ""} />
              <div>
                <Label htmlFor="platform">Platform</Label>
                <Input id="platform" name="platform" defaultValue={editing?.platform || ""} required maxLength={60} placeholder="Instagram" />
              </div>
              <div>
                <Label htmlFor="url">Profile URL</Label>
                <Input id="url" name="url" type="url" defaultValue={editing?.url || ""} required maxLength={500} placeholder="https://" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="label">Accessible label</Label>
                  <Input id="label" name="label" defaultValue={editing?.label || ""} maxLength={120} placeholder="Kayan Land on Instagram" />
                </div>
                <div>
                  <Label htmlFor="icon">Icon name</Label>
                  <Input id="icon" name="icon" defaultValue={editing?.icon || ""} maxLength={80} placeholder="Instagram" />
                </div>
              </div>
              <div>
                <Label htmlFor="sortOrder">Display order</Label>
                <Input id="sortOrder" name="sortOrder" type="number" min={0} defaultValue={editing?.sortOrder ?? 0} />
              </div>
              <label className="flex items-center justify-between gap-3 rounded-md border border-border/70 px-3 py-2.5">
                <span className="text-sm">Visible</span>
                <input type="checkbox" name="isActive" defaultChecked={editing?.isActive ?? true} className="size-4 accent-[#172B35]" />
              </label>
              <div className="flex items-center gap-2 pt-1">
                <SubmitButton>{editing ? "Save changes" : "Add link"}</SubmitButton>
                {editing && <Button asChild variant="outline"><Link href="/admin/settings/social">Cancel</Link></Button>}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          {links.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
                <Globe className="size-5" />
              </span>
              <p className="text-sm font-medium text-primary">No social links yet</p>
              <p className="max-w-sm text-sm text-muted-foreground">Add the studio&apos;s verified social profiles.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/70">
              {links.map((link) => (
                <div key={link.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-primary">{link.platform}</p>
                      {!link.isActive && <Badge variant="secondary">Hidden</Badge>}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{link.url}</p>
                  </div>
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/admin/settings/social?edit=${link.id}`}>Edit</Link>
                  </Button>
                  <DeleteButton
                    id={link.id}
                    action={deleteSocialLink}
                    title={`Delete ${link.platform}?`}
                    description="The link will be removed from the website."
                  />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
