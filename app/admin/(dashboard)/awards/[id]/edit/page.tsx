import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { AwardForm } from "@/components/admin/award-form";

export const dynamic = "force-dynamic";

export default async function EditAwardPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  await requirePermission("content.manage");
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const [item, media] = await Promise.all([
    prisma.award.findUnique({ where: { id } }),
    prisma.media.findMany({ orderBy: { createdAt: "desc" }, take: 100, select: { id: true, url: true, alt: true } }),
  ]);
  if (!item) notFound();
  return <div><PageHeader title="Edit award" description="Update the recognition details and publication settings." breadcrumb={[{ label: "Awards & recognition", href: "/admin/awards" }, { label: "Edit award" }]} /><AdminFlash {...flashFromQuery(query)} /><AwardForm item={item} media={media} /></div>;
}
