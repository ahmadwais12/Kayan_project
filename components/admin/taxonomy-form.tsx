import Link from "next/link";
import { saveTaxonomy } from "@/actions/taxonomy";
import { SubmitButton } from "@/components/admin/form-kit";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { LocalizedField } from "@/components/admin/localized-field";
import type { FormTranslations } from "@/lib/i18n/form-translations";
import type { TaxonomyEntity } from "@/lib/taxonomy";

type TaxonomyRecord = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  sortOrder?: number;
  isActive?: boolean;
};

export function TaxonomyForm({
  entity,
  item,
  noun,
  simple = false,
  translations,
}: {
  entity: TaxonomyEntity;
  item?: TaxonomyRecord;
  noun: string;
  simple?: boolean;
  translations?: FormTranslations;
}) {
  const listPath = {
    projectCategory: "/admin/projects/categories",
    serviceCategory: "/admin/services/categories",
    blogCategory: "/admin/blog/categories",
    blogTag: "/admin/blog/tags",
    projectTag: "/admin/projects/categories",
    department: "/admin/team/departments",
    galleryCategory: "/admin/gallery/categories",
    faqCategory: "/admin/faqs/categories",
  }[entity];
  const route = `/admin/taxonomy/${entity}/${item ? `${item.id}/edit` : "new"}`;

  return (
    <Card>
      <CardHeader><CardTitle>{item ? `Edit ${noun}` : `Add ${noun}`}</CardTitle></CardHeader>
      <CardContent>
        <form action={saveTaxonomy} className="max-w-2xl space-y-5">
          <input type="hidden" name="entity" value={entity} />
          <input type="hidden" name="id" value={item?.id || ""} />
          <input type="hidden" name="returnTo" value={route} />
          <LocalizedField id="name" name="name" label="Name" defaultValue={item?.name || ""} translations={translations} required maxLength={120} />
          <div><Label htmlFor="slug">Slug</Label><Input id="slug" name="slug" defaultValue={item?.slug || ""} placeholder="Generated from the name when empty" maxLength={160} /></div>
          {!simple && <>
            <LocalizedField id="description" name="description" label="Description" defaultValue={item?.description || ""} translations={translations} multiline rows={4} maxLength={2000} />
            <div className="max-w-xs"><Label htmlFor="sortOrder">Display order</Label><Input id="sortOrder" name="sortOrder" type="number" min={0} defaultValue={item?.sortOrder ?? 0} /></div>
            <label className="flex items-center justify-between gap-3 rounded-md border border-border/70 px-3 py-2.5"><span className="text-sm">Active</span><input type="checkbox" name="isActive" defaultChecked={item?.isActive ?? true} className="size-4 accent-accent" /></label>
          </>}
          <div className="flex items-center gap-2"><SubmitButton>{item ? "Save changes" : `Add ${noun}`}</SubmitButton><Button asChild variant="outline"><Link href={listPath}>Cancel</Link></Button></div>
        </form>
      </CardContent>
    </Card>
  );
}
