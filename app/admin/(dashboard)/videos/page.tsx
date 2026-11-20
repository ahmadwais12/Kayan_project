import Link from "next/link";
import { Plus, Search, Video } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { TableFooter } from "@/components/admin/pagination";
import { DeleteButton } from "@/components/admin/delete-button";
import { ViewButton } from "@/components/admin/view-button";
import { FiltersPopover } from "@/components/admin/filters-popover";
import { FiltersForm } from "@/components/admin/filters-form";
import { PublishBadge } from "@/components/admin/status-badge";
import { SmartImage } from "@/components/public/smart-image";
import { deleteShowcaseVideo } from "@/actions/content";
import { youtubeId, youtubeThumbnailUrl } from "@/lib/video";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { parseRows } from "@/lib/pagination";

export const dynamic = "force-dynamic";

const DEFAULT_ROWS = 10;

export default async function VideosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePermission("content.manage");
  const query = await searchParams;
  const page = Math.max(1, Number(query.page) || 1);
  const rows = parseRows(query.rows, DEFAULT_ROWS);
  const q = (query.q || "").trim();

  const where: Prisma.ShowcaseVideoWhereInput = {
    ...(q ? { title: { contains: q } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.showcaseVideo.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      skip: (page - 1) * rows,
      take: rows,
    }),
    prisma.showcaseVideo.count({ where }),
  ]);

  return (
    <div>
      <PageHeader
        title="Project videos"
        description="Publish project films and walkthroughs on the homepage. Each entry can use a YouTube link or an uploaded video file."
        breadcrumb={[{ label: "Project videos" }]}
        actions={
          <>
            <FiltersPopover activeCount={q ? 1 : 0}>
              <FiltersForm resetHref="/admin/videos">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input name="q" defaultValue={q} placeholder="Search video title" className="pl-9" />
                </div>
              </FiltersForm>
            </FiltersPopover>
            <Button asChild>
              <Link href="/admin/videos/new">
                <Plus className="size-4" /> New video
              </Link>
            </Button>
          </>
        }
      />

      <AdminFlash {...flashFromQuery(query)} />

      <Card className="overflow-hidden">
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
              <Video className="size-5" />
            </span>
            <p className="text-sm font-medium text-primary">No videos yet</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Add a project film with a YouTube link or an uploaded MP4/WebM file.
            </p>
            <Button asChild size="sm">
              <Link href="/admin/videos/new">Add a video</Link>
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Video</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const id = youtubeId(item.youtubeUrl);
                const poster = item.thumbnailUrl || (id ? youtubeThumbnailUrl(id) : null);
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="relative block aspect-video w-20 shrink-0 overflow-hidden rounded-md bg-secondary">
                          {poster ? (
                            <SmartImage src={poster} alt="" fill sizes="80px" className="object-cover" />
                          ) : (
                            <span className="flex size-full items-center justify-center text-muted-foreground">
                              <Video className="size-4" />
                            </span>
                          )}
                        </span>
                        <span className="block min-w-0">
                          <span className="block truncate font-medium text-primary">{item.title}</span>
                          {item.description && (
                            <span className="mt-0.5 block truncate text-xs text-muted-foreground">{item.description}</span>
                          )}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{id ? "YouTube" : "Uploaded file"}</Badge>
                    </TableCell>
                    <TableCell><PublishBadge published={item.isPublished} /></TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <ViewButton href={`/admin/records/video/${item.id}`} name={item.title} />
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/admin/videos/${item.id}/edit`}>Edit</Link>
                        </Button>
                        <DeleteButton
                          id={item.id}
                          action={deleteShowcaseVideo}
                          title={`Delete “${item.title}”?`}
                          description="This permanently removes the video from the website."
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}

        <TableFooter
          page={page}
          pageSize={rows}
          total={total}
          basePath="/admin/videos"
          params={{ q }}
          noun={total === 1 ? "video" : "videos"}
        />
      </Card>
    </div>
  );
}
