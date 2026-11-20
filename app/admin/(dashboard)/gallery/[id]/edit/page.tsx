import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { GalleryItemForm } from "@/components/admin/gallery-item-form";
import { loadFormTranslations } from "@/lib/i18n/form-translations";

export const dynamic = "force-dynamic";

export default async function EditGalleryItemPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePermission("gallery.manage");
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const [item, categories, library, translations] = await Promise.all([
    prisma.galleryMedia.findUnique({ where: { id } }),
    prisma.galleryCategory.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
    prisma.media.findMany({ orderBy: { createdAt: "desc" }, take: 100, select: { id: true, url: true, alt: true } }),
    loadFormTranslations("galleryMedia", id, ["title", "caption"]),
  ]);
  if (!item) notFound();
  return <div><PageHeader title="Edit gallery item" description="Update this image and its public display settings." breadcrumb={[{ label: "Gallery", href: "/admin/gallery" }, { label: "Edit item" }]} /><AdminFlash {...flashFromQuery(query)} /><GalleryItemForm editHref="/admin/gallery" categories={categories} library={library} translations={translations} values={{ id: item.id, title: item.title || "", caption: item.caption || "", categoryId: item.categoryId || "", url: item.url, type: item.type, isPublished: item.isPublished, sortOrder: item.sortOrder }} /></div>;
}
