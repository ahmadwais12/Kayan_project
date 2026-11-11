import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { GalleryItemForm } from "@/components/admin/gallery-item-form";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteGalleryItem } from "@/actions/gallery";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePermission("gallery.manage");
  const query = await searchParams;

  const [items, categories, media] = await Promise.all([
    prisma.galleryMedia.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: { category: { select: { name: true } } },
    }),
    prisma.galleryCategory.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
    prisma.media.findMany({ orderBy: { createdAt: "desc" }, take: 100, select: { id: true, url: true, alt: true } }),
  ]);

  const editing = query.edit ? items.find((item) => item.id === query.edit) : undefined;

  return (
    <div>
      <PageHeader
        title="Gallery"
        description="Curate the public image gallery. Draft items stay hidden until published."
        breadcrumb={[{ label: "Gallery" }]}
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/admin/gallery/categories">Categories</Link>
            </Button>
            <Button asChild>
              <Link href="/admin/gallery">
                <Plus className="size-4" /> New item
              </Link>
            </Button>
          </>
        }
      />

      <AdminFlash {...flashFromQuery(query)} />

      <div className="mb-8">
        <GalleryItemForm
          key={editing?.id || "new"}
          editHref="/admin/gallery"
          categories={categories}
          library={media}
          values={{
            id: editing?.id,
            title: editing?.title || "",
            caption: editing?.caption || "",
            categoryId: editing?.categoryId || "",
            url: editing?.url || "",
            type: editing?.type || "IMAGE",
            isPublished: editing?.isPublished ?? true,
            sortOrder: editing?.sortOrder ?? 0,
          }}
        />
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl text-primary">Gallery items</h2>
        <p className="text-xs text-muted-foreground">{items.length} item{items.length === 1 ? "" : "s"}</p>
      </div>

      {items.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted-foreground">
          Nothing in the gallery yet. Add your first item above.
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="relative aspect-[4/3] bg-secondary">
                <Image src={item.url} alt={item.title || ""} fill sizes="(min-width: 1536px) 22vw, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw" className="object-cover" />
                <div className="absolute left-2 top-2 flex gap-1.5">
                  <Badge variant={item.isPublished ? "success" : "secondary"}>
                    {item.isPublished ? "Published" : "Draft"}
                  </Badge>
                  {item.type === "VIDEO" && <Badge variant="info">Video</Badge>}
                </div>
              </div>
              <div className="space-y-3 p-4">
                <div>
                  <p className="truncate text-sm font-medium text-primary">{item.title || "Untitled"}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.category?.name || "Uncategorised"} · order {item.sortOrder}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/gallery?edit=${item.id}`}>Edit</Link>
                  </Button>
                  <DeleteButton
                    id={item.id}
                    action={deleteGalleryItem}
                    title="Delete this gallery item?"
                    description="The item will be removed from the public gallery immediately."
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
