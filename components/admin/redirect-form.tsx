import Link from "next/link";
import type { Redirect as RedirectRecord } from "@prisma/client";
import { saveRedirect } from "@/actions/redirects";
import { SubmitButton, FieldHelp } from "@/components/admin/form-kit";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, NativeSelect } from "@/components/ui/input";

export function RedirectForm({ item }: { item?: RedirectRecord }) {
  const formPath = item ? `/admin/settings/redirects/${item.id}/edit` : "/admin/settings/redirects/new";
  return (
    <Card>
      <CardHeader><CardTitle>{item ? "Edit redirect" : "Add redirect"}</CardTitle></CardHeader>
      <CardContent>
        <form action={saveRedirect} className="max-w-3xl space-y-5">
          <input type="hidden" name="id" value={item?.id || ""} />
          <input type="hidden" name="returnTo" value={formPath} />
          <div>
            <Label htmlFor="fromPath">From path</Label>
            <Input id="fromPath" name="fromPath" defaultValue={item?.fromPath || ""} placeholder="/old-project-page" required maxLength={500} />
            <FieldHelp>A site path only, without the domain. Query strings are not matched.</FieldHelp>
          </div>
          <div>
            <Label htmlFor="toPath">Destination</Label>
            <Input id="toPath" name="toPath" defaultValue={item?.toPath || ""} placeholder="/projects/new-project" required maxLength={500} />
            <FieldHelp>An internal path or a full https:// address.</FieldHelp>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label htmlFor="statusCode">Status code</Label><NativeSelect id="statusCode" name="statusCode" defaultValue={String(item?.statusCode ?? 301)}><option value="301">301 — Moved permanently</option><option value="308">308 — Permanent, preserve method</option><option value="302">302 — Found (temporary)</option><option value="307">307 — Temporary, preserve method</option></NativeSelect></div>
            <label className="flex items-center justify-between gap-3 rounded-md border border-border/70 px-3 py-2.5"><span className="text-sm">Active</span><input type="checkbox" name="isActive" defaultChecked={item?.isActive ?? true} className="size-4 accent-accent" /></label>
          </div>
          <div className="flex items-center gap-2"><SubmitButton>{item ? "Save changes" : "Add redirect"}</SubmitButton><Button asChild variant="outline"><Link href="/admin/settings/redirects">Cancel</Link></Button></div>
        </form>
      </CardContent>
    </Card>
  );
}
