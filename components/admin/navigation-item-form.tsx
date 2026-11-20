import Link from "next/link";
import type { NavigationItem } from "@prisma/client";
import { saveNavigationItem } from "@/actions/settings";
import { SubmitButton } from "@/components/admin/form-kit";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, NativeSelect } from "@/components/ui/input";

export function NavigationItemForm({ item, parents }: {
  item?: NavigationItem;
  parents: Pick<NavigationItem, "id" | "label">[];
}) {
  const formPath = item ? `/admin/settings/navigation/${item.id}/edit` : "/admin/settings/navigation/new";
  return (
    <Card>
      <CardHeader><CardTitle>{item ? "Edit menu item" : "Add menu item"}</CardTitle></CardHeader>
      <CardContent>
        <form action={saveNavigationItem} className="grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <input type="hidden" name="id" value={item?.id || ""} />
          <input type="hidden" name="returnTo" value={formPath} />
          <div className="lg:col-span-3"><Label htmlFor="label">Label</Label><Input id="label" name="label" defaultValue={item?.label || ""} required maxLength={80} /></div>
          <div className="lg:col-span-3"><Label htmlFor="url">URL</Label><Input id="url" name="url" defaultValue={item?.url || ""} required maxLength={300} placeholder="/projects" /></div>
          <div className="lg:col-span-2"><Label htmlFor="location">Location</Label><NativeSelect id="location" name="location" defaultValue={item?.location || "header"}><option value="header">Header</option><option value="footer">Footer</option></NativeSelect></div>
          <div className="lg:col-span-2"><Label htmlFor="parentId">Parent (header only)</Label><NativeSelect id="parentId" name="parentId" defaultValue={item?.parentId || ""}><option value="">No parent</option>{parents.filter((parent) => parent.id !== item?.id).map((parent) => <option key={parent.id} value={parent.id}>{parent.label}</option>)}</NativeSelect></div>
          <div className="lg:col-span-2"><Label htmlFor="sortOrder">Display order</Label><Input id="sortOrder" name="sortOrder" type="number" min={0} defaultValue={item?.sortOrder ?? 0} /></div>
          <label className="flex items-center justify-between gap-3 rounded-md border border-border/70 px-3 py-2.5 sm:col-span-2 lg:col-span-3"><span className="text-sm">Visible</span><input type="checkbox" name="isActive" defaultChecked={item?.isActive ?? true} className="size-4 accent-accent" /></label>
          <label className="flex items-center justify-between gap-3 rounded-md border border-border/70 px-3 py-2.5 sm:col-span-2 lg:col-span-3"><span className="text-sm">Open in a new tab</span><input type="checkbox" name="openInNewTab" defaultChecked={item?.openInNewTab ?? false} className="size-4 accent-accent" /></label>
          <div className="flex items-center gap-2 pt-1 sm:col-span-2 lg:col-span-6"><SubmitButton>{item ? "Save changes" : "Add item"}</SubmitButton><Button asChild variant="outline"><Link href="/admin/settings/navigation">Cancel</Link></Button></div>
        </form>
      </CardContent>
    </Card>
  );
}
