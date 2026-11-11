"use client";

import { useActionState } from "react";
import Link from "next/link";
import { saveGalleryItem, type GalleryState } from "@/actions/gallery";
import { Button } from "@/components/ui/button";
import { Input, Label, NativeSelect, Textarea } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormFeedback, SubmitButton, FieldHelp } from "@/components/admin/form-kit";
import { ImageInput } from "@/components/admin/image-input";

type LibraryItem = { id: string; url: string; alt?: string | null };

export type GalleryFormValues = {
  id?: string;
  title: string;
  caption: string;
  categoryId: string;
  url: string;
  type: string;
  isPublished: boolean;
  sortOrder: number;
};

export function GalleryItemForm({
  values,
  categories,
  library,
  editHref,
}: {
  values: GalleryFormValues;
  categories: { id: string; name: string }[];
  library: LibraryItem[];
  editHref: string;
}) {
  const [state, formAction] = useActionState<GalleryState, FormData>(saveGalleryItem, {});

  return (
    <Card>
      <CardHeader>
        <CardTitle>{values.id ? "Edit gallery item" : "Add gallery item"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
          <input type="hidden" name="id" value={values.id || ""} />
          <div className="space-y-4">
            <FormFeedback error={state.error} />
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" defaultValue={values.title} maxLength={180} />
            </div>
            <div>
              <Label htmlFor="caption">Caption</Label>
              <Textarea id="caption" name="caption" defaultValue={values.caption} rows={3} maxLength={500} />
            </div>
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
                <Label htmlFor="type">Type</Label>
                <NativeSelect id="type" name="type" defaultValue={values.type}>
                  <option value="IMAGE">Image</option>
                  <option value="VIDEO">Video</option>
                </NativeSelect>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="sortOrder">Display order</Label>
                <Input id="sortOrder" name="sortOrder" type="number" min={0} defaultValue={values.sortOrder} />
              </div>
              <label className="mt-6 flex h-10 items-center justify-between gap-3 rounded-md border border-border/70 px-3">
                <span className="text-sm">Published</span>
                <input type="checkbox" name="isPublished" defaultChecked={values.isPublished} className="size-4 accent-[#172B35]" />
              </label>
            </div>
          </div>
          <div className="space-y-4">
            <ImageInput
              name="url"
              defaultValue={values.url}
              library={library}
              label="Image"
              help="Upload an image, choose one from the library, or paste a URL. Video items should still use a poster image here."
            />
            <div className="flex items-center gap-2">
              <SubmitButton>{values.id ? "Save item" : "Add item"}</SubmitButton>
              {values.id && (
                <Button asChild variant="outline">
                  <Link href={editHref}>Cancel</Link>
                </Button>
              )}
            </div>
            <FieldHelp>Gallery items appear in the public gallery grid. Keep images reasonably sized.</FieldHelp>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
