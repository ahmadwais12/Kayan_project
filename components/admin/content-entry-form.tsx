import Link from "next/link";
import { saveCompanyStat, saveCoreValue, saveProcessStep, saveWhyItem } from "@/actions/content";
import { SubmitButton } from "@/components/admin/form-kit";
import { ImageInput } from "@/components/admin/image-input";
import { LocalizedField } from "@/components/admin/localized-field";
import { loadFormTranslations } from "@/lib/i18n/form-translations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";

export type ContentEntryKind = "stats" | "values" | "process" | "why";
export type ContentEntry = {
  id: string;
  label?: string;
  value?: string;
  suffix?: string | null;
  title?: string;
  description?: string;
  icon?: string | null;
  imageUrl?: string | null;
  sortOrder: number;
  isActive: boolean;
};

const LABELS: Record<ContentEntryKind, string> = {
  stats: "statistic",
  values: "core value",
  process: "process step",
  why: "reason",
};

const ENTRY_ENTITY: Record<ContentEntryKind, string> = {
  stats: "statistic",
  values: "coreValue",
  process: "processStep",
  why: "whyChoose",
};

export async function ContentEntryForm({
  kind,
  item,
  media,
}: {
  kind: ContentEntryKind;
  item?: ContentEntry;
  media: { id: string; url: string; alt: string | null }[];
}) {
  const action = { stats: saveCompanyStat, values: saveCoreValue, process: saveProcessStep, why: saveWhyItem }[kind];
  const listPath = "/admin/content";
  const title = LABELS[kind];
  const translations = item
    ? await loadFormTranslations(ENTRY_ENTITY[kind], item.id, kind === "stats" ? ["label"] : ["title", "description"])
    : undefined;

  return (
    <Card>
      <CardHeader><CardTitle>{item ? `Edit ${title}` : `Add ${title}`}</CardTitle></CardHeader>
      <CardContent>
        <form action={action} className="max-w-3xl space-y-5">
          <input type="hidden" name="id" value={item?.id || ""} />
          {kind === "stats" ? <>
            <div className="grid gap-4 sm:grid-cols-2"><LocalizedField className="sm:col-span-2" id="label" name="label" label="Label" defaultValue={item?.label} translations={translations} required maxLength={120} /><div><Label htmlFor="value">Value</Label><Input id="value" name="value" defaultValue={item?.value || ""} required maxLength={40} /></div></div>
            <div className="grid gap-4 sm:grid-cols-2"><div><Label htmlFor="suffix">Suffix</Label><Input id="suffix" name="suffix" defaultValue={item?.suffix || ""} placeholder="+, m², yrs" maxLength={20} /></div><div><Label htmlFor="icon">Icon name</Label><Input id="icon" name="icon" defaultValue={item?.icon || ""} placeholder="Building2" maxLength={80} /></div></div>
          </> : <>
            <LocalizedField id="title" name="title" label="Title" defaultValue={item?.title} translations={translations} required maxLength={160} />
            <LocalizedField id="description" name="description" label="Description" defaultValue={item?.description} translations={translations} multiline rows={4} required maxLength={3000} />
            {kind !== "process" && <div className="max-w-sm"><Label htmlFor="icon">Icon name</Label><Input id="icon" name="icon" defaultValue={item?.icon || ""} maxLength={80} /></div>}
            {kind === "process" && <ImageInput name="imageUrl" defaultValue={item?.imageUrl || ""} library={media} label="Image (optional)" />}
          </>}
          <div className="max-w-xs"><Label htmlFor="sortOrder">Display order</Label><Input id="sortOrder" name="sortOrder" type="number" min={0} defaultValue={item?.sortOrder ?? 0} /></div>
          <label className="flex items-center justify-between gap-3 rounded-md border border-border/70 px-3 py-2.5"><span className="text-sm">Active</span><input type="checkbox" name="isActive" defaultChecked={item?.isActive ?? true} className="size-4 accent-accent" /></label>
          <div className="flex items-center gap-2"><SubmitButton>{item ? "Save changes" : `Add ${title}`}</SubmitButton><Button asChild variant="outline"><Link href={listPath}>Cancel</Link></Button></div>
        </form>
      </CardContent>
    </Card>
  );
}
