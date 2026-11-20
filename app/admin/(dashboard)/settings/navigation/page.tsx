import Link from "next/link";
import { Menu, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { SettingsTabs } from "@/components/admin/settings-tabs";
import { DeleteButton } from "@/components/admin/delete-button";
import { ViewButton } from "@/components/admin/view-button";
import { deleteNavigationItem } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function NavigationSettingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePermission("settings.manage");
  const query = await searchParams;

  const items = await prisma.navigationItem.findMany({
    orderBy: [{ location: "asc" }, { sortOrder: "asc" }, { label: "asc" }],
    include: { parent: { select: { label: true } } },
  });

  return (
    <div>
      <PageHeader
        title="Navigation menu"
        description="Control the header and footer links. Changes appear on the public site immediately."
        breadcrumb={[{ label: "Settings", href: "/admin/settings" }, { label: "Navigation" }]}
        actions={<Button asChild><Link href="/admin/settings/navigation/new"><Plus className="size-4" /> Add menu item</Link></Button>}
      />
      <SettingsTabs active="/admin/settings/navigation" />
      <AdminFlash {...flashFromQuery(query)} />

      <div className="space-y-5">
        <div className="grid items-start gap-5 lg:grid-cols-2">
          {(["header", "footer"] as const).map((location) => {
            const group = items.filter((item) => item.location === location);
            return (
              <Card key={location}>
                <CardHeader>
                  <CardTitle className="capitalize">{location} menu</CardTitle>
                </CardHeader>
                <CardContent>
                  {group.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-8 text-center text-sm text-muted-foreground">
                      <Menu className="size-5" />
                      No {location} links yet.
                    </div>
                  ) : (
                    <div className="divide-y divide-border/70">
                      {group.map((item) => (
                        <div key={item.id} className="flex min-w-0 items-center gap-2.5 py-3 sm:gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-medium text-primary">{item.label}</span>
                              {!item.isActive && <Badge variant="secondary">Hidden</Badge>}
                              {item.openInNewTab && <Badge variant="info">New tab</Badge>}
                            </div>
                            <p className="truncate text-xs text-muted-foreground">
                              {item.parent ? `↳ ${item.parent.label} · ` : ""}{item.url} · order {item.sortOrder}
                            </p>
                          </div>
                          <ViewButton href={`/admin/records/nav/${item.id}`} name={item.label} />
                          <Button asChild variant="ghost" size="sm" className="shrink-0">
                            <Link href={`/admin/settings/navigation/${item.id}/edit`}>Edit</Link>
                          </Button>
                          <DeleteButton
                            id={item.id}
                            action={deleteNavigationItem}
                            title={`Delete “${item.label}”?`}
                            description="Child items will also be removed."
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
