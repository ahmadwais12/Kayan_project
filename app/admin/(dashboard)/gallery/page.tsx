import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { DeleteButton } from "@/components/admin/delete-button";
import { ViewButton } from "@/components/admin/view-button";
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

  const items = await prisma.galleryMedia.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: { category: { select: { name: true } } },
  });

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
              <Link href="/admin/gallery/new">
                <Plus className="size-4" /> New item
              </Link>
            </Button>
          </>
        }
      />

      <AdminFlash {...flashFromQuery(query)} />

      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl text-primary">Gallery items</h2>
        <p className="text-xs text-muted-foreground">{items.length} item{items.length === 1 ? "" : "s"}</p>
      </div>

      {items.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted-foreground">
          Nothing in the gallery yet. Use New item to add the first image.
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
                  <div className="flex items-center gap-2">
                    <ViewButton href={`/admin/records/gallery/${item.id}`} name={item.title || "Untitled"} />
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/gallery/${item.id}/edit`}>Edit</Link>
                    </Button>
                  </div>
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
