import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { VideoForm } from "@/components/admin/video-form";

export const dynamic = "force-dynamic";

export default async function NewVideoPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requirePermission("content.manage");
  const [media, query] = await Promise.all([
    prisma.media.findMany({ orderBy: { createdAt: "desc" }, take: 100, select: { id: true, url: true, alt: true } }),
    searchParams,
  ]);
  return <div><PageHeader title="Add project video" description="Add a project film with a YouTube link or an uploaded video file." breadcrumb={[{ label: "Project videos", href: "/admin/videos" }, { label: "New video" }]} /><AdminFlash {...flashFromQuery(query)} /><VideoForm media={media} /></div>;
}
