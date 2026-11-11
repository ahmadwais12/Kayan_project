"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/auth/guards";
import { gallerySchema } from "@/lib/validations";
import { checked, field, numberField, redirectWith } from "@/lib/form-helpers";
import { logAudit } from "@/lib/audit";

export type GalleryState = { error?: string };

const PATH = "/admin/gallery";

export async function saveGalleryItem(
  _prev: GalleryState,
  formData: FormData,
): Promise<GalleryState> {
  const gate = await authorize("gallery.manage");
  if (gate.error || !gate.session) return { error: gate.error || "Unauthorized" };

  const id = field(formData, "id");
  const raw = {
    title: field(formData, "title"),
    caption: field(formData, "caption"),
    categoryId: field(formData, "categoryId"),
    url: field(formData, "url"),
    type: field(formData, "type", "IMAGE"),
    isPublished: checked(formData, "isPublished"),
    sortOrder: numberField(formData, "sortOrder"),
  };

  const parsed = gallerySchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Please check the gallery fields." };
  }

  const data = {
    title: parsed.data.title || null,
    caption: parsed.data.caption || null,
    categoryId: parsed.data.categoryId || null,
    url: parsed.data.url,
    type: parsed.data.type,
    isPublished: parsed.data.isPublished,
    sortOrder: parsed.data.sortOrder,
  };

  let saved;
  try {
    saved = id
      ? await prisma.galleryMedia.update({ where: { id }, data })
      : await prisma.galleryMedia.create({ data });
  } catch (error) {
    console.error(error);
    return { error: "The gallery item could not be saved. Please try again." };
  }

  await logAudit({
    userId: gate.session.user.id,
    action: id ? "gallery.update" : "gallery.create",
    entity: "GalleryMedia",
    entityId: saved.id,
    meta: { title: saved.title, type: saved.type },
  });

  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath(PATH);
  redirect(`${PATH}?saved=1`);
}

export async function deleteGalleryItem(formData: FormData) {
  const gate = await authorize("gallery.manage");
  if (gate.error || !gate.session) redirect(redirectWith(PATH, "error", gate.error || "Unauthorized"));

  const id = field(formData, "id");
  const item = await prisma.galleryMedia.findUnique({ where: { id } });
  if (!item) redirect(redirectWith(PATH, "error", "Gallery item not found"));

  await prisma.galleryMedia.delete({ where: { id } });

  await logAudit({
    userId: gate.session.user.id,
    action: "gallery.delete",
    entity: "GalleryMedia",
    entityId: id,
    meta: { title: item.title },
  });

  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath(PATH);
  redirect(`${PATH}?deleted=1`);
}
