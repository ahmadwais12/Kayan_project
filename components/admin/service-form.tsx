"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { saveService, type ServiceState } from "@/actions/services";
import { Button } from "@/components/ui/button";
import { Input, Label, NativeSelect } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormFeedback, SubmitButton, FieldHelp } from "@/components/admin/form-kit";
import { SlugInput } from "@/components/admin/slug-input";
import { ImageInput } from "@/components/admin/image-input";
import { LocalizedField } from "@/components/admin/localized-field";
import type { FormTranslations } from "@/lib/i18n/form-translations";
import { Repeater } from "@/components/admin/repeater";
import { GalleryEditor, type GalleryRow } from "@/components/admin/gallery-editor";

type LibraryItem = { id: string; url: string; alt?: string | null };

export type ServiceFormValues = {
  id?: string;
  title: string;
  slug: string;
  categoryId: string;
  icon: string;
  shortDescription: string;
  description: string;
  mainImage: string;
  isFeatured: boolean;
  isPublished: boolean;
  sortOrder: number;
  seoTitle: string;
  seoDescription: string;
  ogImage: string;
  images: GalleryRow[];
  features: { title: string; description: string }[];
  faqs: { question: string; answer: string }[];
};

export function ServiceForm({
  values,
  categories,
  library,
  translations,
}: {
  values: ServiceFormValues;
  categories: { id: string; name: string }[];
  library: LibraryItem[];
  translations?: FormTranslations;
}) {
  const [state, formAction] = useActionState<ServiceState, FormData>(saveService, {});

  return (
    <form action={formAction} className="grid items-start gap-5 xl:grid-cols-[1.55fr_1fr]">
      <input type="hidden" name="id" value={values.id || ""} />

      <div className="space-y-5">
        <FormFeedback error={state.error} />

        <Card>
          <CardHeader>
            <CardTitle>Service essentials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <LocalizedField id="title" name="title" label="Service name" defaultValue={values.title} translations={translations} required maxLength={180} />
            <div className="grid gap-4 sm:grid-cols-2">
              <SlugInput defaultValue={values.slug} titleId="title" />
              <div>
                <Label htmlFor="categoryId">Category</Label>
                <NativeSelect id="categoryId" name="categoryId" defaultValue={values.categoryId}>
                  <option value="">Uncategorised</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </NativeSelect>
              </div>
            </div>
            <LocalizedField
              id="shortDescription"
              name="shortDescription"
              label="Short description"
              defaultValue={values.shortDescription}
              translations={translations}
              multiline
              rows={3}
              maxLength={500}
              required
              help="Shown on service cards and in listings. Keep it under 200 characters for best results."
            />
            <div>
              <Label htmlFor="icon">Icon name</Label>
              <Input id="icon" name="icon" defaultValue={values.icon} placeholder="e.g. Building2, PenTool, Ruler" />
              <FieldHelp>Optional Lucide icon name used on the services overview. Leave blank for the default mark.</FieldHelp>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Service detail</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <LocalizedField id="description" name="description" label="Full description" defaultValue={values.description} translations={translations} multiline rows={12} maxLength={20000} help="Markdown is supported." />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Supporting imagery</CardTitle>
          </CardHeader>
          <CardContent>
            <GalleryEditor name="images" initial={values.images} library={library} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What is included</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>Service features</Label>
              <Repeater
                name="features"
                initial={values.features}
                fields={[
                  { key: "title", label: "Feature", placeholder: "Concept design" },
                  { key: "description", label: "Description", placeholder: "Optional", textarea: true },
                ]}
                addLabel="Add feature"
              />
            </div>
            <div>
              <Label>Service FAQs</Label>
              <Repeater
                name="faqs"
                initial={values.faqs}
                fields={[
                  { key: "question", label: "Question", placeholder: "How long does a concept design take?" },
                  { key: "answer", label: "Answer", textarea: true },
                ]}
                addLabel="Add FAQ"
              />
              <FieldHelp>These appear with the service detail page. For FAQs shared across the site, use the FAQ module.</FieldHelp>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Search engine metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <LocalizedField id="seoTitle" name="seoTitle" label="SEO title" defaultValue={values.seoTitle} translations={translations} maxLength={180} />
            <LocalizedField id="seoDescription" name="seoDescription" label="Meta description" defaultValue={values.seoDescription} translations={translations} multiline rows={3} maxLength={400} />
            <ImageInput name="ogImage" defaultValue={values.ogImage} library={library} label="Open Graph image" help="Defaults to the main image when empty." />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-5 xl:sticky xl:top-20">
        <Card>
          <CardHeader>
            <CardTitle>Publishing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center justify-between gap-3 rounded-md border border-border/70 px-3 py-2.5">
              <span className="text-sm">Published on website</span>
              <input type="checkbox" name="isPublished" defaultChecked={values.isPublished} className="size-4 accent-accent" />
            </label>
            <label className="flex items-center justify-between gap-3 rounded-md border border-border/70 px-3 py-2.5">
              <span className="text-sm">Feature on homepage</span>
              <input type="checkbox" name="isFeatured" defaultChecked={values.isFeatured} className="size-4 accent-accent" />
            </label>
            <div>
              <Label htmlFor="sortOrder">Display order</Label>
              <Input id="sortOrder" name="sortOrder" type="number" min={0} defaultValue={values.sortOrder} />
            </div>
            <div className="flex flex-col gap-2 pt-1">
              <SubmitButton className="w-full">Save service</SubmitButton>
              <Button asChild variant="outline" className="w-full">
                <Link href="/admin/services">Cancel</Link>
              </Button>
              {values.id && (
                <Button asChild variant="ghost" className="w-full">
                  <Link href={`/services/${values.slug}?preview=1`} target="_blank">
                    Preview page <ExternalLink className="size-3.5" />
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Main image</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageInput name="mainImage" defaultValue={values.mainImage} library={library} label="Main image" help="Used on the services overview and as the default Open Graph image." />
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
