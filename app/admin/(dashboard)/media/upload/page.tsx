import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { MediaUploader } from "@/components/admin/media-uploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function UploadMediaPage() {
  await requirePermission("media.manage");
  const folders = await prisma.mediaFolder.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });

  return (
    <div>
      <PageHeader
        title="Upload media"
        description="Add images to the library. Each upload is converted to WebP, given a thumbnail and recorded in the media table."
        breadcrumb={[{ label: "Media Library", href: "/admin/media" }, { label: "Upload" }]}
        actions={
          <Button asChild variant="outline">
            <Link href="/admin/media">Back to library</Link>
          </Button>
        }
      />
      <Card>
        <CardContent className="p-6">
          <MediaUploader folders={folders} />
        </CardContent>
      </Card>
    </div>
  );
}
