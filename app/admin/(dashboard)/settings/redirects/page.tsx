import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { SettingsTabs } from "@/components/admin/settings-tabs";
import { SubmitButton, FieldHelp } from "@/components/admin/form-kit";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteRedirect, saveRedirect } from "@/actions/redirects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, NativeSelect } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function RedirectsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePermission("settings.manage");
  const [redirects, query] = await Promise.all([
    prisma.redirect.findMany({ orderBy: { createdAt: "desc" } }),
    searchParams,
  ]);

  return (
    <div>
      <PageHeader
        title="Redirects"
        description="Send retired URLs to their new home with a permanent or temporary redirect."
        breadcrumb={[{ label: "Settings", href: "/admin/settings" }, { label: "Redirects" }]}
      />
      <SettingsTabs active="/admin/settings/redirects" />
      <AdminFlash {...flashFromQuery(query)} />

      <Card className="mb-5">
        <CardHeader>
          <CardTitle>Add a redirect</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={saveRedirect} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="new-fromPath">From path</Label>
                <Input id="new-fromPath" name="fromPath" placeholder="/old-project-page" required maxLength={500} />
                <FieldHelp>A site path only, without the domain. Query strings are not matched.</FieldHelp>
              </div>
              <div>
                <Label htmlFor="new-toPath">Destination</Label>
                <Input id="new-toPath" name="toPath" placeholder="/projects/new-project" required maxLength={500} />
                <FieldHelp>An internal path or a full https:// address.</FieldHelp>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="new-statusCode">Status code</Label>
                <NativeSelect id="new-statusCode" name="statusCode" defaultValue="301">
                  <option value="301">301 — Moved permanently</option>
                  <option value="308">308 — Permanent, preserve method</option>
                  <option value="302">302 — Found (temporary)</option>
                  <option value="307">307 — Temporary, preserve method</option>
                </NativeSelect>
              </div>
              <div className="flex flex-wrap items-end gap-4">
                <label className="flex items-center gap-2 pb-2.5 text-sm text-foreground/80">
                  <input
                    type="checkbox"
                    name="isActive"
                    defaultChecked
                    className="size-4 accent-[#172B35]"
                  />
                  Active
                </label>
                <SubmitButton>Add redirect</SubmitButton>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configured redirects</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {redirects.length ? (
            <div className="divide-y divide-border/70">
              {redirects.map((item) => (
                <div
                  key={item.id}
                  className="grid gap-3 p-4 lg:grid-cols-[1.3fr_1.3fr_7rem_auto_auto_auto] lg:items-center"
                >
                  <form action={saveRedirect} className="contents">
                    <input type="hidden" name="id" value={item.id} />
                    <Input
                      name="fromPath"
                      defaultValue={item.fromPath}
                      aria-label="Source path"
                      maxLength={500}
                      required
                    />
                    <div className="flex items-center gap-2">
                      <ArrowRight className="hidden size-4 shrink-0 text-muted-foreground lg:block" aria-hidden="true" />
                      <Input
                        name="toPath"
                        defaultValue={item.toPath}
                        aria-label="Destination"
                        maxLength={500}
                        required
                      />
                    </div>
                    <NativeSelect name="statusCode" defaultValue={String(item.statusCode)} aria-label="Status code">
                      <option value="301">301</option>
                      <option value="308">308</option>
                      <option value="302">302</option>
                      <option value="307">307</option>
                    </NativeSelect>
                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                      <input
                        type="checkbox"
                        name="isActive"
                        defaultChecked={item.isActive}
                        className="size-4 accent-[#172B35]"
                      />
                      Active
                    </label>
                    <SubmitButton variant="outline" size="sm">
                      Save
                    </SubmitButton>
                  </form>
                  <DeleteButton
                    id={item.id}
                    action={deleteRedirect}
                    title={`Delete redirect from ${item.fromPath}?`}
                    description="Requests for this path will stop being redirected and will show the standard not-found page."
                    label="Delete redirect"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="p-6 text-sm text-muted-foreground">
              No redirects yet. Add one above when a page URL changes.
            </p>
          )}
        </CardContent>
      </Card>

      <p className="mt-4 text-xs text-muted-foreground">
        Redirects are cached in the proxy for up to 15 seconds, so changes can take a moment to apply.
      </p>
    </div>
  );
}
