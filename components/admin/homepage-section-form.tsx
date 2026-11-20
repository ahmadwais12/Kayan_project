import type { HomepageSection } from "@prisma/client";
import { saveHomepageSection } from "@/actions/content";
import { SubmitButton } from "@/components/admin/form-kit";
import { ImageInput } from "@/components/admin/image-input";
import { LocalizedField } from "@/components/admin/localized-field";
import { loadFormTranslations } from "@/lib/i18n/form-translations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const SECTION_LABELS: Record<string, string> = {
  hero: "Hero",
  cta: "Call to action",
  about: "About introduction",
  mission: "Mission",
  vision: "Vision",
  testimonials: "Testimonials",
  awards: "Awards & recognition",
  videos: "Project videos",
};

const TRANSLATED_FIELDS = ["title", "subtitle", "description", "buttonLabel", "secondaryLabel"];

export async function HomepageSectionForm({
  section,
  media,
  returnTo,
}: {
  section: HomepageSection;
  media: { id: string; url: string; alt: string | null }[];
  returnTo?: string;
}) {
  const idPrefix = `homepage-${section.key}`;
  const translations = await loadFormTranslations("homepage", section.id, TRANSLATED_FIELDS);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
        <CardTitle>{SECTION_LABELS[section.key] || section.key}</CardTitle>
        <Badge variant={section.isEnabled ? "success" : "secondary"}>{section.isEnabled ? "Enabled" : "Disabled"}</Badge>
      </CardHeader>
      <CardContent>
        <form action={saveHomepageSection} className="space-y-4">
          <input type="hidden" name="id" value={section.id} />
          {returnTo && <input type="hidden" name="returnTo" value={returnTo} />}
          <div className="space-y-4">
            <LocalizedField id={`${idPrefix}-title`} name="title" label="Title" defaultValue={section.title} translations={translations} maxLength={200} />
            <LocalizedField id={`${idPrefix}-subtitle`} name="subtitle" label="Subtitle / eyebrow" defaultValue={section.subtitle} translations={translations} maxLength={200} />
            <LocalizedField id={`${idPrefix}-description`} name="description" label="Description" defaultValue={section.description} translations={translations} multiline rows={4} maxLength={3000} />
          </div>
          {(["hero", "cta"] as string[]).includes(section.key) ? <div className="grid gap-4 sm:grid-cols-2">
            <LocalizedField className="sm:col-span-2" id={`${idPrefix}-buttonLabel`} name="buttonLabel" label="Primary button label" defaultValue={section.buttonLabel} translations={translations} maxLength={80} />
            <div><Label htmlFor={`${idPrefix}-buttonUrl`}>Primary button URL</Label><Input id={`${idPrefix}-buttonUrl`} name="buttonUrl" defaultValue={section.buttonUrl || ""} maxLength={300} placeholder="/contact" /></div>
            {section.key === "hero" ? <>
              <LocalizedField className="sm:col-span-2" id={`${idPrefix}-secondaryLabel`} name="secondaryLabel" label="Secondary button label" defaultValue={section.secondaryLabel} translations={translations} maxLength={80} />
              <div><Label htmlFor={`${idPrefix}-secondaryUrl`}>Secondary button URL</Label><Input id={`${idPrefix}-secondaryUrl`} name="secondaryUrl" defaultValue={section.secondaryUrl || ""} maxLength={300} placeholder="/projects" /></div>
            </> : <><input type="hidden" name="secondaryLabel" value={section.secondaryLabel || ""} /><input type="hidden" name="secondaryUrl" value={section.secondaryUrl || ""} /></>}
          </div> : <>
            <input type="hidden" name="buttonLabel" value={section.buttonLabel || ""} /><input type="hidden" name="buttonUrl" value={section.buttonUrl || ""} />
            <input type="hidden" name="secondaryLabel" value={section.secondaryLabel || ""} /><input type="hidden" name="secondaryUrl" value={section.secondaryUrl || ""} />
          </>}
          <div className="grid gap-4 sm:grid-cols-2">
            {section.key === "testimonials" || section.key === "awards" || section.key === "videos" ? (
              <input type="hidden" name="imageUrl" value={section.imageUrl || ""} />
            ) : (
              <ImageInput name="imageUrl" defaultValue={section.imageUrl || ""} library={media} label={section.key === "about" ? "Story image" : "Section image"} help={section.key === "about" ? "Used in the studio story introduction." : "Used for the homepage hero or call to action."} />
            )}
            <div className="space-y-4">
              <div><Label htmlFor={`${idPrefix}-sortOrder`}>Display order</Label><Input id={`${idPrefix}-sortOrder`} name="sortOrder" type="number" min={0} defaultValue={section.sortOrder} /></div>
              <label className="flex items-center justify-between gap-3 rounded-md border border-border/70 px-3 py-2.5"><span className="text-sm">Enabled</span><input type="checkbox" name="isEnabled" defaultChecked={section.isEnabled} className="size-4 accent-accent" /></label>
            </div>
          </div>
          <SubmitButton>Save homepage section</SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
