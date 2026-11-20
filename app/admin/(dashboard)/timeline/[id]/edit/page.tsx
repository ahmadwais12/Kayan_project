import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { MilestoneForm } from "@/components/admin/milestone-form";

export const dynamic = "force-dynamic";

export default async function EditMilestonePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  await requirePermission("content.manage");
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const [item, media] = await Promise.all([
    prisma.companyMilestone.findUnique({ where: { id } }),
    prisma.media.findMany({ orderBy: { createdAt: "desc" }, take: 100, select: { id: true, url: true, alt: true } }),
  ]);
  if (!item) notFound();
  return <div><PageHeader title="Edit milestone" description="Update this company timeline entry." breadcrumb={[{ label: "Company Timeline", href: "/admin/timeline" }, { label: "Edit milestone" }]} /><AdminFlash {...flashFromQuery(query)} /><MilestoneForm item={item} media={media} /></div>;
}
