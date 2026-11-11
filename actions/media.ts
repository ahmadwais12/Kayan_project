"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/auth/guards";
import { field, redirectWith } from "@/lib/form-helpers";
import { slugify } from "@/lib/utils";
import { logAudit } from "@/lib/audit";
import { deletePublicMedia } from "@/lib/storage";

const MEDIA = "/admin/media";

export async function updateMediaItem(formData: FormData) {
  const gate = await authorize("media.manage");
  if (gate.error || !gate.session) redirect(redirectWith(MEDIA, "error", gate.error || "Unauthorized"));

  const id = field(formData, "id");
  const media = await prisma.media.findUnique({ where: { id } });
  if (!media) redirect(redirectWith(MEDIA, "error", "Media item not found"));

  const folderValue = field(formData, "folderId");
  const folderId =
    folderValue && (await prisma.mediaFolder.findUnique({ where: { id: folderValue }, select: { id: true } }))
      ? folderValue
      : null;

  await prisma.media.update({
    where: { id },
    data: {
      alt: field(formData, "alt") || null,
      caption: field(formData, "caption") || null,
      folderId,
    },
  });

  await logAudit({
    userId: gate.session.user.id,
    action: "media.update",
    entity: "Media",
    entityId: id,
    meta: { fileName: media.fileName },
  });

  revalidatePath(MEDIA);
  revalidatePath(`/admin/media/${id}`);
  redirect(`/admin/media/${id}?saved=1`);
}

export async function deleteMediaItem(formData: FormData) {
  const gate = await authorize("media.manage");
  if (gate.error || !gate.session) redirect(redirectWith(MEDIA, "error", gate.error || "Unauthorized"));

  const id = field(formData, "id");
  const media = await prisma.media.findUnique({ where: { id } });
  if (!media) redirect(redirectWith(MEDIA, "error", "Media item not found"));

  await prisma.media.delete({ where: { id } });
  await deletePublicMedia(media.url);
  if (media.thumbnailUrl) await deletePublicMedia(media.thumbnailUrl);

  await logAudit({
    userId: gate.session.user.id,
    action: "media.delete",
    entity: "Media",
    entityId: id,
    meta: { fileName: media.fileName },
  });

  revalidatePath(MEDIA);
  redirect(`${MEDIA}?deleted=1`);
}

export async function createMediaFolder(formData: FormData) {
  const gate = await authorize("media.manage");
  if (gate.error || !gate.session) redirect(redirectWith(MEDIA, "error", gate.error || "Unauthorized"));

  const name = field(formData, "name");
  const slug = slugify(field(formData, "slug") || name);
  if (!name || !slug) redirect(redirectWith(MEDIA, "error", "A folder name is required"));

  try {
    await prisma.mediaFolder.create({ data: { name, slug } });
  } catch {
    redirect(redirectWith(MEDIA, "error", "That folder already exists"));
  }

  revalidatePath(MEDIA);
  redirect(`${MEDIA}?saved=1`);
}

export async function deleteMediaFolder(formData: FormData) {
  const gate = await authorize("media.manage");
  if (gate.error || !gate.session) redirect(redirectWith(MEDIA, "error", gate.error || "Unauthorized"));

  const id = field(formData, "id");
  const folder = await prisma.mediaFolder.findUnique({ where: { id }, include: { _count: { select: { media: true } } } });
  if (!folder) redirect(redirectWith(MEDIA, "error", "Folder not found"));
  if (folder._count.media > 0) {
    redirect(redirectWith(MEDIA, "error", "Move the files out of this folder before deleting it"));
  }

  await prisma.mediaFolder.delete({ where: { id } });
  await logAudit({
    userId: gate.session.user.id,
    action: "mediaFolder.delete",
    entity: "MediaFolder",
    entityId: id,
    meta: { name: folder.name },
  });

  revalidatePath(MEDIA);
  redirect(`${MEDIA}?deleted=1`);
}
