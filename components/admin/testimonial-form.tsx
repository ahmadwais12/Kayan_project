import Link from "next/link";
import type { Testimonial } from "@prisma/client";
import { saveTestimonial } from "@/actions/content";
import { ImageInput } from "@/components/admin/image-input";
import { LocalizedField } from "@/components/admin/localized-field";
import { SubmitButton } from "@/components/admin/form-kit";
import { loadFormTranslations } from "@/lib/i18n/form-translations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, NativeSelect } from "@/components/ui/input";

export async function TestimonialForm({ item, media }: { item?: Testimonial; media: { id: string; url: string; alt: string | null }[] }) {
  const returnTo = item ? `/admin/testimonials/${item.id}/edit` : "/admin/testimonials/new";
  const translations = item
    ? await loadFormTranslations("testimonial", item.id, ["content", "clientTitle", "clientCompany"])
    : undefined;
  return <Card><CardHeader><CardTitle>{item ? "Edit testimonial" : "Add testimonial"}</CardTitle></CardHeader><CardContent>
    <form action={saveTestimonial} className="max-w-3xl space-y-5">
      <input type="hidden" name="id" value={item?.id || ""} /><input type="hidden" name="returnTo" value={returnTo} />
      <div><Label htmlFor="clientName">Client name</Label><Input id="clientName" name="clientName" defaultValue={item?.clientName || ""} required maxLength={160} /></div>
      <LocalizedField id="clientTitle" name="clientTitle" label="Role / title" defaultValue={item?.clientTitle} translations={translations} maxLength={160} />
      <LocalizedField id="clientCompany" name="clientCompany" label="Company" defaultValue={item?.clientCompany} translations={translations} maxLength={160} />
      <LocalizedField id="content" name="content" label="Testimonial" defaultValue={item?.content} translations={translations} multiline rows={5} required maxLength={3000} />
      <div className="grid gap-4 sm:grid-cols-2"><div><Label htmlFor="rating">Rating</Label><NativeSelect id="rating" name="rating" defaultValue={String(item?.rating ?? 5)}>{[5,4,3,2,1].map((rating) => <option key={rating} value={rating}>{rating} star{rating === 1 ? "" : "s"}</option>)}</NativeSelect></div><div><Label htmlFor="sortOrder">Display order</Label><Input id="sortOrder" name="sortOrder" type="number" min={0} defaultValue={item?.sortOrder ?? 0} /></div></div>
      <ImageInput name="photoUrl" defaultValue={item?.photoUrl || ""} library={media} label="Client photo (optional)" help="Only upload a photo the client has agreed to share." />
      <label className="flex items-center justify-between gap-3 rounded-md border border-border/70 px-3 py-2.5"><span className="text-sm">Published</span><input type="checkbox" name="isPublished" defaultChecked={item?.isPublished ?? true} className="size-4 accent-accent" /></label>
      <div className="flex items-center gap-2"><SubmitButton>{item ? "Save changes" : "Add testimonial"}</SubmitButton><Button asChild variant="outline"><Link href="/admin/testimonials">Cancel</Link></Button></div>
    </form>
  </CardContent></Card>;
}
