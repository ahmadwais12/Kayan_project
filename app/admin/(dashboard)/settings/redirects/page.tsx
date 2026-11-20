import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { SettingsTabs } from "@/components/admin/settings-tabs";
import { DeleteButton } from "@/components/admin/delete-button";
import { ViewButton } from "@/components/admin/view-button";
import { deleteRedirect } from "@/actions/redirects";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function RedirectsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
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
        actions={<Button asChild><Link href="/admin/settings/redirects/new"><Plus className="size-4" /> Add redirect</Link></Button>}
      />
      <SettingsTabs active="/admin/settings/redirects" />
      <AdminFlash {...flashFromQuery(query)} />

      <Card>
        <CardHeader><CardTitle>Configured redirects</CardTitle></CardHeader>
        <CardContent className="p-0">
          {redirects.length ? (
            <div className="divide-y divide-border/70">
              {redirects.map((item) => (
                <div key={item.id} className="flex flex-wrap items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="break-all font-mono text-sm font-medium text-primary">{item.fromPath} <span className="px-1 text-muted-foreground">→</span> {item.toPath}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{item.statusCode}</span>
                      <Badge variant={item.isActive ? "success" : "secondary"}>{item.isActive ? "Active" : "Paused"}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <ViewButton href={`/admin/records/redirect/${item.id}`} name={item.fromPath} />
                    <Button asChild size="sm" variant="outline"><Link href={`/admin/settings/redirects/${item.id}/edit`}>Edit</Link></Button>
                    <DeleteButton
                      id={item.id}
                      action={deleteRedirect}
                      title={`Delete redirect from ${item.fromPath}?`}
                      description="Requests for this path will stop being redirected and will show the standard not-found page."
                      label="Delete redirect"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="p-6 text-sm text-muted-foreground">No redirects yet. Add one above when a page URL changes.</p>
          )}
        </CardContent>
      </Card>

      <p className="mt-4 text-xs text-muted-foreground">Redirects are cached in the proxy for up to 15 seconds, so changes can take a moment to apply.</p>
    </div>
  );
}
