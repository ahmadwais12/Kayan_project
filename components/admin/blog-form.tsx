"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { saveBlogPost, type BlogState } from "@/actions/blog";
import { Button } from "@/components/ui/button";
import { Input, Label, NativeSelect, Textarea } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormFeedback, SubmitButton, FieldHelp } from "@/components/admin/form-kit";
import { SlugInput } from "@/components/admin/slug-input";
import { ImageInput } from "@/components/admin/image-input";
import { LocalizedField } from "@/components/admin/localized-field";
import type { FormTranslations } from "@/lib/i18n/form-translations";

type LibraryItem = { id: string; url: string; alt?: string | null };

export type BlogFormValues = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  authorId: string;
  categoryId: string;
  status: string;
  publishedAt: string;
  readingTime: number;
  isFeatured: boolean;
  seoTitle: string;
  seoDescription: string;
  ogImage: string;
  tags: string;
};

export function BlogForm({
  values,
  categories,
  authors,
  library,
  translations,
}: {
  values: BlogFormValues;
  categories: { id: string; name: string }[];
  authors: { id: string; name: string }[];
  library: LibraryItem[];
  translations?: FormTranslations;
}) {
  const [state, formAction] = useActionState<BlogState, FormData>(saveBlogPost, {});

  return (
    <form action={formAction} className="grid items-start gap-5 xl:grid-cols-[1.55fr_1fr]">
      <input type="hidden" name="id" value={values.id || ""} />

      <div className="space-y-5">
        <FormFeedback error={state.error} />

        <Card>
          <CardHeader>
            <CardTitle>Article</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <LocalizedField id="title" name="title" label="Title" defaultValue={values.title} translations={translations} required maxLength={180} />
            <SlugInput defaultValue={values.slug} titleId="title" />
            <LocalizedField id="excerpt" name="excerpt" label="Excerpt" defaultValue={values.excerpt} translations={translations} multiline rows={3} maxLength={500} required help="Shown in the blog listing and in search previews." />
            <LocalizedField id="content" name="content" label="Article content" defaultValue={values.content} translations={translations} multiline rows={18} maxLength={50000} help="Markdown is supported: headings, lists, links, bold, italics." />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Organisation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
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
              <div>
                <Label htmlFor="authorId">Author</Label>
                <NativeSelect id="authorId" name="authorId" defaultValue={values.authorId}>
                  <option value="">Studio editorial team</option>
                  {authors.map((author) => (
                    <option key={author.id} value={author.id}>
                      {author.name}
                    </option>
                  ))}
                </NativeSelect>
              </div>
            </div>
            <div>
              <Label htmlFor="tags">Tags</Label>
              <Input id="tags" name="tags" defaultValue={values.tags} placeholder="Design process, Materials, Courtyards" />
              <FieldHelp>Comma-separated. Tags appear below the article and on the blog index.</FieldHelp>
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
            <ImageInput name="ogImage" defaultValue={values.ogImage} library={library} label="Open Graph image" help="Defaults to the featured image when empty." />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-5 xl:sticky xl:top-20">
        <Card>
          <CardHeader>
            <CardTitle>Publishing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <NativeSelect id="status" name="status" defaultValue={values.status}>
                <option value="DRAFT">Draft</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="PUBLISHED">Published</option>
              </NativeSelect>
            </div>
            <div>
              <Label htmlFor="publishedAt">Publish date</Label>
              <Input id="publishedAt" name="publishedAt" type="datetime-local" defaultValue={values.publishedAt} />
              <FieldHelp>Required for scheduled articles. Published articles default to now when left empty.</FieldHelp>
            </div>
            <div>
              <Label htmlFor="readingTime">Reading time (minutes)</Label>
              <Input id="readingTime" name="readingTime" type="number" min={1} max={120} defaultValue={values.readingTime} />
            </div>
            <label className="flex items-center justify-between gap-3 rounded-md border border-border/70 px-3 py-2.5">
              <span className="text-sm">Feature on homepage</span>
              <input type="checkbox" name="isFeatured" defaultChecked={values.isFeatured} className="size-4 accent-accent" />
            </label>
            <div className="flex flex-col gap-2 pt-1">
              <SubmitButton className="w-full">Save article</SubmitButton>
              <Button asChild variant="outline" className="w-full">
                <Link href="/admin/blog">Cancel</Link>
              </Button>
              {values.id && (
                <Button asChild variant="ghost" className="w-full">
                  <Link href={`/blog/${values.slug}?preview=1`} target="_blank">
                    Preview article <ExternalLink className="size-3.5" />
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Featured image</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageInput name="featuredImage" defaultValue={values.featuredImage} library={library} label="Featured image" help="Used on the blog index and at the top of the article." />
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
