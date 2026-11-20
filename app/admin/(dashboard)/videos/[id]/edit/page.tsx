import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { VideoForm } from "@/components/admin/video-form";

export const dynamic = "force-dynamic";

export default async function EditVideoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePermission("content.manage");
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const [item, media] = await Promise.all([
    prisma.showcaseVideo.findUnique({ where: { id } }),
    prisma.media.findMany({ orderBy: { createdAt: "desc" }, take: 100, select: { id: true, url: true, alt: true } }),
  ]);
  if (!item) notFound();
  return <div><PageHeader title="Edit video" description={item.title} breadcrumb={[{ label: "Project videos", href: "/admin/videos" }, { label: item.title }]} /><AdminFlash {...flashFromQuery(query)} /><VideoForm item={item} media={media} /></div>;
}
