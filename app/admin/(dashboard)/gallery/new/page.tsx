import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { GalleryItemForm } from "@/components/admin/gallery-item-form";

export const dynamic = "force-dynamic";

export default async function NewGalleryItemPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requirePermission("gallery.manage");
  const [categories, library, query] = await Promise.all([
    prisma.galleryCategory.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
    prisma.media.findMany({ orderBy: { createdAt: "desc" }, take: 100, select: { id: true, url: true, alt: true } }),
    searchParams,
  ]);
  return <div><PageHeader title="Add gallery item" description="Add an image to the public gallery." breadcrumb={[{ label: "Gallery", href: "/admin/gallery" }, { label: "New item" }]} /><AdminFlash {...flashFromQuery(query)} /><GalleryItemForm editHref="/admin/gallery" categories={categories} library={library} values={{ title: "", caption: "", categoryId: "", url: "", type: "IMAGE", isPublished: true, sortOrder: 0 }} /></div>;
}
