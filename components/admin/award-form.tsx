import Link from "next/link";
import type { Award } from "@prisma/client";
import { saveAward } from "@/actions/content";
import { ImageInput } from "@/components/admin/image-input";
import { LocalizedField } from "@/components/admin/localized-field";
import { SubmitButton } from "@/components/admin/form-kit";
import { loadFormTranslations } from "@/lib/i18n/form-translations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";

export async function AwardForm({ item, media }: { item?: Award; media: { id: string; url: string; alt: string | null }[] }) {
  const returnTo = item ? `/admin/awards/${item.id}/edit` : "/admin/awards/new";
  const translations = item
    ? await loadFormTranslations("award", item.id, ["title", "issuer", "description"])
    : undefined;
  return <Card><CardHeader><CardTitle>{item ? "Edit award" : "Add award"}</CardTitle></CardHeader><CardContent>
    <form action={saveAward} className="max-w-3xl space-y-5">
      <input type="hidden" name="id" value={item?.id || ""} /><input type="hidden" name="returnTo" value={returnTo} />
      <LocalizedField id="title" name="title" label="Award title" defaultValue={item?.title} translations={translations} required maxLength={200} />
      <div className="grid gap-4 sm:grid-cols-2">
        <LocalizedField id="issuer" name="issuer" label="Issued by" defaultValue={item?.issuer} translations={translations} maxLength={200} />
        <div><Label htmlFor="year">Year</Label><Input id="year" name="year" type="number" min={1900} max={2100} defaultValue={item?.year ?? ""} placeholder="Optional" /></div>
      </div>
      <LocalizedField id="description" name="description" label="Description" defaultValue={item?.description} translations={translations} multiline rows={4} maxLength={3000} />
      <ImageInput name="imageUrl" defaultValue={item?.imageUrl || ""} library={media} label="Award image (optional)" help="Upload the trophy or certificate image if you have one." />
      <div className="grid gap-4 sm:grid-cols-2">
        <div><Label htmlFor="sortOrder">Display order</Label><Input id="sortOrder" name="sortOrder" type="number" min={0} defaultValue={item?.sortOrder ?? 0} /></div>
        <label className="flex items-center justify-between gap-3 self-end rounded-md border border-border/70 px-3 py-2.5"><span className="text-sm">Published</span><input type="checkbox" name="isPublished" defaultChecked={item?.isPublished ?? true} className="size-4 accent-accent" /></label>
      </div>
      <div className="flex items-center gap-2"><SubmitButton>{item ? "Save changes" : "Add award"}</SubmitButton><Button asChild variant="outline"><Link href="/admin/awards">Cancel</Link></Button></div>
    </form>
  </CardContent></Card>;
}
