import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { TestimonialForm } from "@/components/admin/testimonial-form";

export const dynamic = "force-dynamic";

export default async function NewTestimonialPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requirePermission("content.manage");
  const [media, query] = await Promise.all([
    prisma.media.findMany({ orderBy: { createdAt: "desc" }, take: 100, select: { id: true, url: true, alt: true } }),
    searchParams,
  ]);
  return <div><PageHeader title="Add testimonial" description="Publish real client feedback with permission." breadcrumb={[{ label: "Testimonials", href: "/admin/testimonials" }, { label: "New testimonial" }]} /><AdminFlash {...flashFromQuery(query)} /><TestimonialForm media={media} /></div>;
}
