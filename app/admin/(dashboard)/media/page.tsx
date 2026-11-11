import Link from "next/link";
import Image from "next/image";
import { Folder, Image as ImageIcon, Plus, Search, Upload } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { Pagination } from "@/components/admin/pagination";
import { DeleteButton } from "@/components/admin/delete-button";
import { SubmitButton } from "@/components/admin/form-kit";
import { deleteMediaItem, createMediaFolder, deleteMediaFolder } from "@/actions/media";
import { Button } from "@/components/ui/button";
import { Input, Label, NativeSelect } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBytes, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 24;

export default async function MediaPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePermission("media.manage");
  const query = await searchParams;
  const page = Math.max(1, Number(query.page) || 1);
  const q = (query.q || "").trim();
  const folder = query.folder === "none" ? "none" : query.folder || "";

  const where: Prisma.MediaWhereInput = {
    ...(q ? { OR: [{ fileName: { contains: q } }, { alt: { contains: q } }] } : {}),
    ...(folder === "none" ? { folderId: null } : folder ? { folderId: folder } : {}),
  };

  const [items, total, folders, unfiledCount] = await Promise.all([
    prisma.media.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { folder: { select: { name: true } } },
    }),
    prisma.media.count({ where }),
    prisma.mediaFolder.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { media: true } } },
    }),
    prisma.media.count({ where: { folderId: null } }),
  ]);

  return (
    <div>
      <PageHeader
        title="Media library"
        description="Images uploaded for projects, services, the gallery and articles. Files are stored on disk and served through the application."
        breadcrumb={[{ label: "Media Library" }]}
        actions={
          <Button asChild>
            <Link href="/admin/media/upload">
              <Upload className="size-4" /> Upload media
            </Link>
          </Button>
        }
      />

      <AdminFlash {...flashFromQuery(query)} />

      <div className="grid items-start gap-5 xl:grid-cols-[1fr_2.6fr]">
        <Card>
          <CardHeader>
            <CardTitle>Folders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form action={createMediaFolder} className="space-y-3">
              <div>
                <Label htmlFor="folderName">New folder</Label>
                <Input id="folderName" name="name" placeholder="Project photography" required maxLength={120} />
              </div>
              <SubmitButton variant="outline" size="sm">Create folder</SubmitButton>
            </form>

            <div className="space-y-1 text-sm">
              <Link
                href="/admin/media"
                className="flex items-center justify-between rounded px-2 py-1.5 hover:bg-secondary"
              >
                <span>All media</span>
                <span className="text-xs text-muted-foreground">{folders.reduce((sum, item) => sum + item._count.media, 0) + unfiledCount}</span>
              </Link>
              <Link
                href="/admin/media?folder=none"
                className="flex items-center justify-between rounded px-2 py-1.5 hover:bg-secondary"
              >
                <span>Unfiled</span>
                <span className="text-xs text-muted-foreground">{unfiledCount}</span>
              </Link>
              {folders.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-2 rounded px-2 py-1.5 hover:bg-secondary">
                  <Link href={`/admin/media?folder=${item.id}`} className="flex min-w-0 flex-1 items-center gap-2">
                    <Folder className="size-4 shrink-0 text-muted-foreground" />
                    <span className="truncate">{item.name}</span>
                  </Link>
                  <span className="text-xs text-muted-foreground">{item._count.media}</span>
                  <DeleteButton
                    id={item.id}
                    action={deleteMediaFolder}
                    title={`Delete folder “${item.name}”?`}
                    description={
                      item._count.media > 0
                        ? "This folder still contains files and cannot be deleted until they are moved."
                        : "The folder will be removed. Files are not deleted."
                    }
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div>
          <Card className="overflow-hidden">
            <form method="get" className="grid gap-3 border-b border-border/70 p-4 sm:grid-cols-[1fr_auto_auto]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input name="q" defaultValue={q} placeholder="Search file name or alt text" className="pl-9" />
              </div>
              <NativeSelect name="folder" defaultValue={folder} className="sm:w-48">
                <option value="">All folders</option>
                <option value="none">Unfiled</option>
                {folders.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </NativeSelect>
              <Button type="submit" variant="secondary">Filter</Button>
            </form>

            {items.length === 0 ? (
              <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
                <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
                  <ImageIcon className="size-5" />
                </span>
                <p className="text-sm font-medium text-primary">No media in this view</p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Upload images to build the library used across the website.
                </p>
                <Button asChild size="sm">
                  <Link href="/admin/media/upload">
                    <Plus className="size-4" /> Upload images
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 p-4 md:grid-cols-3 2xl:grid-cols-4">
                {items.map((item) => (
                  <div key={item.id} className="group overflow-hidden rounded-lg border border-border/70 bg-card">
                    <div className="relative aspect-[4/3] bg-secondary">
                      <Image src={item.thumbnailUrl || item.url} alt={item.alt || item.fileName} fill sizes="(min-width: 1536px) 22vw, (min-width: 768px) 30vw, 45vw" className="object-cover" />
                    </div>
                    <div className="space-y-2 p-3">
                      <p className="truncate text-xs font-medium text-primary" title={item.fileName}>{item.fileName}</p>
                      <div className="flex flex-wrap items-center gap-1.5 text-[0.68rem] text-muted-foreground">
                        <span>{item.width && item.height ? `${item.width}×${item.height}` : "—"}</span>
                        <span>·</span>
                        <span>{formatBytes(item.size)}</span>
                      </div>
                      <p className="text-[0.68rem] text-muted-foreground">
                        {item.folder?.name || "Unfiled"} · {formatDate(item.createdAt)}
                      </p>
                      <div className="flex items-center justify-between pt-1">
                        <Button asChild variant="outline" size="sm" className="h-7 px-2 text-xs">
                          <Link href={`/admin/media/${item.id}`}>Details</Link>
                        </Button>
                        <DeleteButton
                          id={item.id}
                          action={deleteMediaItem}
                          title="Delete this image?"
                          description="The file will be removed from disk. Pages that reference it will show a missing image."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Pagination page={page} totalPages={Math.ceil(total / PAGE_SIZE)} basePath="/admin/media" params={{ q, folder }} />
          </Card>

          {total > 0 && (
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary">{total} files</Badge>
              <span>Images are automatically optimised to WebP on upload.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
