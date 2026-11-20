"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { saveProject, type ProjectState } from "@/actions/projects";
import { Button } from "@/components/ui/button";
import { Input, Label, NativeSelect, Textarea } from "@/components/ui/input";
import { MoneyInput } from "@/components/ui/money-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormFeedback, SubmitButton, FieldHelp } from "@/components/admin/form-kit";
import { SlugInput } from "@/components/admin/slug-input";
import { ImageInput } from "@/components/admin/image-input";
import { LocalizedField } from "@/components/admin/localized-field";
import type { FormTranslations } from "@/lib/i18n/form-translations";
import { Repeater } from "@/components/admin/repeater";
import { GalleryEditor, type GalleryRow } from "@/components/admin/gallery-editor";

type LibraryItem = { id: string; url: string; alt?: string | null };

export type ProjectFormValues = {
  id?: string;
  title: string;
  slug: string;
  categoryId: string;
  clientName: string;
  location: string;
  year: string;
  status: string;
  duration: string;
  budget: string;
  description: string;
  challenges: string;
  solutions: string;
  architecturalDetails: string;
  constructionDetails: string;
  coverImage: string;
  beforeImage: string;
  afterImage: string;
  showBeforeAfter: boolean;
  isFeatured: boolean;
  isPublished: boolean;
  sortOrder: number;
  seoTitle: string;
  seoDescription: string;
  ogImage: string;
  tags: string;
  images: GalleryRow[];
  specifications: { label: string; value: string }[];
  features: { title: string; description: string }[];
};

const STATUSES = [
  ["PLANNING", "Planning"],
  ["IN_PROGRESS", "In progress"],
  ["COMPLETED", "Completed"],
  ["ON_HOLD", "On hold"],
];

export function ProjectForm({
  values,
  categories,
  library,
  translations,
}: {
  values: ProjectFormValues;
  categories: { id: string; name: string }[];
  library: LibraryItem[];
  translations?: FormTranslations;
}) {
  const [state, formAction] = useActionState<ProjectState, FormData>(saveProject, {});

  return (
    <form action={formAction} className="grid items-start gap-5 xl:grid-cols-[1.55fr_1fr]">
      <input type="hidden" name="id" value={values.id || ""} />

      <div className="space-y-5">
        <FormFeedback error={state.error} />

        <Card>
          <CardHeader>
            <CardTitle>Project essentials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <LocalizedField id="title" name="title" label="Project title" defaultValue={values.title} translations={translations} required maxLength={180} />
            <div className="grid gap-4 sm:grid-cols-2">
              <SlugInput defaultValue={values.slug} titleId="title" />
              <div>
                <Label htmlFor="categoryId">Primary category</Label>
                <NativeSelect id="categoryId" name="categoryId" defaultValue={values.categoryId} required>
                  <option value="">Choose a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </NativeSelect>
              </div>
            </div>
            <LocalizedField id="location" name="location" label="Location" defaultValue={values.location} translations={translations} required placeholder="City, country" maxLength={180} />
            <div className="sm:max-w-[12rem]">
              <Label htmlFor="year">Completion year</Label>
              <Input id="year" name="year" defaultValue={values.year} placeholder="2026" />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="status">Status</Label>
                <NativeSelect id="status" name="status" defaultValue={values.status}>
                  {STATUSES.map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </NativeSelect>
              </div>
              <div>
                <Label htmlFor="duration">Duration</Label>
                <Input id="duration" name="duration" defaultValue={values.duration} placeholder="14 months" />
              </div>
              <div>
                <Label htmlFor="budget">Budget (private)</Label>
                <MoneyInput id="budget" name="budget" defaultValue={values.budget} placeholder="Not shown publicly" />
              </div>
            </div>
            <div>
              <Label htmlFor="clientName">Client name (optional, private by default)</Label>
              <Input id="clientName" name="clientName" defaultValue={values.clientName} />
              <FieldHelp>Client names are not printed on the public project page.</FieldHelp>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project story</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <LocalizedField id="description" name="description" label="Description" defaultValue={values.description} translations={translations} multiline rows={10} maxLength={20000} help="Markdown is supported." />
            <LocalizedField id="challenges" name="challenges" label="Challenges" defaultValue={values.challenges} translations={translations} multiline rows={5} maxLength={20000} help="Optional. Shown as a project narrative block. Markdown is supported." />
            <LocalizedField id="solutions" name="solutions" label="Design solutions" defaultValue={values.solutions} translations={translations} multiline rows={5} maxLength={20000} help="Markdown is supported." />
            <LocalizedField id="architecturalDetails" name="architecturalDetails" label="Architectural details" defaultValue={values.architecturalDetails} translations={translations} multiline rows={5} maxLength={20000} help="Markdown is supported." />
            <LocalizedField id="constructionDetails" name="constructionDetails" label="Construction details" defaultValue={values.constructionDetails} translations={translations} multiline rows={5} maxLength={20000} help="Markdown is supported." />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gallery</CardTitle>
          </CardHeader>
          <CardContent>
            <GalleryEditor name="images" initial={values.images} library={library} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Specifications & features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>Project specifications</Label>
              <Repeater
                name="specifications"
                initial={values.specifications}
                fields={[
                  { key: "label", label: "Label", placeholder: "Site area" },
                  { key: "value", label: "Value", placeholder: "1,200 m²" },
                ]}
                addLabel="Add specification"
              />
            </div>
            <div>
              <Label>Key features</Label>
              <Repeater
                name="features"
                initial={values.features}
                fields={[
                  { key: "title", label: "Feature", placeholder: "Shaded courtyard" },
                  { key: "description", label: "Description", placeholder: "Optional", textarea: true },
                ]}
                addLabel="Add feature"
              />
            </div>
            <div>
              <Label htmlFor="tags">Tags</Label>
              <Input id="tags" name="tags" defaultValue={values.tags} placeholder="Residential, Courtyard, Concrete" />
              <FieldHelp>Comma-separated. Tags help organise related projects.</FieldHelp>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Search engine metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="seoTitle">SEO title</Label>
              <Input id="seoTitle" name="seoTitle" defaultValue={values.seoTitle} maxLength={180} />
            </div>
            <div>
              <Label htmlFor="seoDescription">Meta description</Label>
              <Textarea id="seoDescription" name="seoDescription" defaultValue={values.seoDescription} rows={3} maxLength={400} />
            </div>
            <ImageInput name="ogImage" defaultValue={values.ogImage} library={library} label="Open Graph image" help="Defaults to the cover image when empty." />
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
              <SubmitButton className="w-full">Save project</SubmitButton>
              <Button asChild variant="outline" className="w-full">
                <Link href="/admin/projects">Cancel</Link>
              </Button>
              {values.id && (
                <Button asChild variant="ghost" className="w-full">
                  <Link href={`/projects/${values.slug}?preview=1`} target="_blank">
                    Preview page <ExternalLink className="size-3.5" />
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cover image</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageInput name="coverImage" defaultValue={values.coverImage} library={library} label="Cover image" help="Used on project cards and as the default Open Graph image." />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Before / after comparison</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center justify-between gap-3 rounded-md border border-border/70 px-3 py-2.5">
              <span className="text-sm">Show comparison slider</span>
              <input type="checkbox" name="showBeforeAfter" defaultChecked={values.showBeforeAfter} className="size-4 accent-accent" />
            </label>
            <ImageInput name="beforeImage" defaultValue={values.beforeImage} library={library} label="Before image" />
            <ImageInput name="afterImage" defaultValue={values.afterImage} library={library} label="After image" />
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
