import Link from "next/link";
import type { CompanyMilestone } from "@prisma/client";
import { saveMilestone } from "@/actions/content";
import { ImageInput } from "@/components/admin/image-input";
import { LocalizedField } from "@/components/admin/localized-field";
import { SubmitButton } from "@/components/admin/form-kit";
import { loadFormTranslations } from "@/lib/i18n/form-translations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";

export async function MilestoneForm({ item, media }: { item?: CompanyMilestone; media: { id: string; url: string; alt: string | null }[] }) {
  const returnTo = item ? `/admin/timeline/${item.id}/edit` : "/admin/timeline/new";
  const translations = item ? await loadFormTranslations("milestone", item.id, ["title", "description"]) : undefined;
  return <Card><CardHeader><CardTitle>{item ? "Edit milestone" : "Add milestone"}</CardTitle></CardHeader><CardContent>
    <form action={saveMilestone} className="max-w-3xl space-y-5">
      <input type="hidden" name="id" value={item?.id || ""} /><input type="hidden" name="returnTo" value={returnTo} />
      <div className="max-w-[8rem]"><Label htmlFor="year">Year</Label><Input id="year" name="year" defaultValue={item?.year || ""} required maxLength={20} /></div>
      <LocalizedField id="title" name="title" label="Title" defaultValue={item?.title} translations={translations} required maxLength={180} />
      <LocalizedField id="description" name="description" label="Description" defaultValue={item?.description} translations={translations} multiline rows={4} maxLength={4000} />
      <div className="max-w-xs"><Label htmlFor="sortOrder">Display order</Label><Input id="sortOrder" name="sortOrder" type="number" min={0} defaultValue={item?.sortOrder ?? 0} /></div>
      <ImageInput name="imageUrl" defaultValue={item?.imageUrl || ""} library={media} label="Image (optional)" />
      <label className="flex items-center justify-between gap-3 rounded-md border border-border/70 px-3 py-2.5"><span className="text-sm">Published</span><input type="checkbox" name="isPublished" defaultChecked={item?.isPublished ?? true} className="size-4 accent-accent" /></label>
      <div className="flex items-center gap-2"><SubmitButton>{item ? "Save changes" : "Add milestone"}</SubmitButton><Button asChild variant="outline"><Link href="/admin/timeline">Cancel</Link></Button></div>
    </form>
  </CardContent></Card>;
}
