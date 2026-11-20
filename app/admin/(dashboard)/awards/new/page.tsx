import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { AwardForm } from "@/components/admin/award-form";

export const dynamic = "force-dynamic";

export default async function NewAwardPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requirePermission("content.manage");
  const [media, query] = await Promise.all([
    prisma.media.findMany({ orderBy: { createdAt: "desc" }, take: 100, select: { id: true, url: true, alt: true } }),
    searchParams,
  ]);
  return <div><PageHeader title="Add award" description="Add a trophy, honor, or certificate of appreciation the company has received." breadcrumb={[{ label: "Awards & recognition", href: "/admin/awards" }, { label: "New award" }]} /><AdminFlash {...flashFromQuery(query)} /><AwardForm media={media} /></div>;
}
