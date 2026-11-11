import Link from "next/link";
import { Menu } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { SettingsTabs } from "@/components/admin/settings-tabs";
import { DeleteButton } from "@/components/admin/delete-button";
import { SubmitButton } from "@/components/admin/form-kit";
import { saveNavigationItem, deleteNavigationItem } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, NativeSelect } from "@/components/ui/input";

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

  const editing = query.edit ? items.find((item) => item.id === query.edit) : undefined;
  const parents = items.filter((item) => item.location === "header" && !item.parentId);

  return (
    <div>
      <PageHeader
        title="Navigation menu"
        description="Control the header and footer links. Changes appear on the public site immediately."
        breadcrumb={[{ label: "Settings", href: "/admin/settings" }, { label: "Navigation" }]}
      />
      <SettingsTabs active="/admin/settings/navigation" />
      <AdminFlash {...flashFromQuery(query)} />

      <div className="grid items-start gap-5 xl:grid-cols-[1fr_1.4fr]">
        <Card>
          <CardHeader><CardTitle>{editing ? "Edit menu item" : "Add menu item"}</CardTitle></CardHeader>
          <CardContent>
            <form action={saveNavigationItem} className="space-y-4">
              <input type="hidden" name="id" value={editing?.id || ""} />
              <div>
                <Label htmlFor="label">Label</Label>
                <Input id="label" name="label" defaultValue={editing?.label || ""} required maxLength={80} />
              </div>
              <div>
                <Label htmlFor="url">URL</Label>
                <Input id="url" name="url" defaultValue={editing?.url || ""} required maxLength={300} placeholder="/projects" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="location">Location</Label>
                  <NativeSelect id="location" name="location" defaultValue={editing?.location || "header"}>
                    <option value="header">Header</option>
                    <option value="footer">Footer</option>
                  </NativeSelect>
                </div>
                <div>
                  <Label htmlFor="parentId">Parent (header only)</Label>
                  <NativeSelect id="parentId" name="parentId" defaultValue={editing?.parentId || ""}>
                    <option value="">No parent</option>
                    {parents.filter((parent) => parent.id !== editing?.id).map((parent) => (
                      <option key={parent.id} value={parent.id}>{parent.label}</option>
                    ))}
                  </NativeSelect>
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
              <label className="flex items-center justify-between gap-3 rounded-md border border-border/70 px-3 py-2.5">
                <span className="text-sm">Open in a new tab</span>
                <input type="checkbox" name="openInNewTab" defaultChecked={editing?.openInNewTab ?? false} className="size-4 accent-[#172B35]" />
              </label>
              <div className="flex items-center gap-2 pt-1">
                <SubmitButton>{editing ? "Save changes" : "Add item"}</SubmitButton>
                {editing && <Button asChild variant="outline"><Link href="/admin/settings/navigation">Cancel</Link></Button>}
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-5">
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
                        <div key={item.id} className="flex items-center gap-3 py-2.5">
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
                          <Button asChild variant="ghost" size="sm">
                            <Link href={`/admin/settings/navigation?edit=${item.id}`}>Edit</Link>
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
