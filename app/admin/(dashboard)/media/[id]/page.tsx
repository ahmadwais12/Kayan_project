import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { SubmitButton } from "@/components/admin/form-kit";
import { updateMediaItem } from "@/actions/media";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, NativeSelect, Textarea } from "@/components/ui/input";
import { formatBytes, formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function MediaDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePermission("media.manage");
  const { id } = await params;
  const query = await searchParams;

  const [item, folders] = await Promise.all([
    prisma.media.findUnique({ where: { id }, include: { folder: true, uploadedBy: { select: { name: true } } } }),
    prisma.mediaFolder.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!item) notFound();

  return (
    <div>
      <PageHeader
        title={item.fileName}
        description={`Uploaded ${formatDateTime(item.createdAt)}${item.uploadedBy ? ` by ${item.uploadedBy.name}` : ""}`}
        breadcrumb={[{ label: "Media Library", href: "/admin/media" }, { label: item.fileName }]}
        actions={
          <Button asChild variant="outline">
            <Link href="/admin/media">
              <ArrowLeft className="size-4" /> Back to library
            </Link>
          </Button>
        }
      />

      <AdminFlash {...flashFromQuery(query)} />

      <div className="grid items-start gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Card className="overflow-hidden">
          <div className="bg-secondary">
            <Image
              src={item.url}
              alt={item.alt || item.fileName}
              width={item.width || 1600}
              height={item.height || 1000}
              sizes="(min-width: 1280px) 55vw, 100vw"
              className="h-auto max-h-[70vh] w-full object-contain"
            />
          </div>
          <CardContent className="grid grid-cols-2 gap-3 p-5 text-sm sm:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">Dimensions</p>
              <p className="font-medium text-primary">{item.width && item.height ? `${item.width} × ${item.height}` : "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">File size</p>
              <p className="font-medium text-primary">{formatBytes(item.size)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Type</p>
              <p className="font-medium text-primary">{item.mimeType}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Folder</p>
              <p className="font-medium text-primary">{item.folder?.name || "Unfiled"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={updateMediaItem} className="space-y-4">
              <input type="hidden" name="id" value={item.id} />
              <div>
                <Label htmlFor="alt">Alt text</Label>
                <Input id="alt" name="alt" defaultValue={item.alt || ""} maxLength={300} />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Describe the image for screen readers and search engines.
                </p>
              </div>
              <div>
                <Label htmlFor="caption">Caption</Label>
                <Textarea id="caption" name="caption" defaultValue={item.caption || ""} rows={3} maxLength={500} />
              </div>
              <div>
                <Label htmlFor="folderId">Folder</Label>
                <NativeSelect id="folderId" name="folderId" defaultValue={item.folderId || ""}>
                  <option value="">Unfiled</option>
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>{folder.name}</option>
                  ))}
                </NativeSelect>
              </div>
              <SubmitButton>Save details</SubmitButton>
            </form>

            <div className="mt-6 space-y-2 border-t border-border/70 pt-4 text-xs text-muted-foreground">
              <p className="break-all">URL: {item.url}</p>
              {item.thumbnailUrl && <p className="break-all">Thumbnail: {item.thumbnailUrl}</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
