import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { TestimonialForm } from "@/components/admin/testimonial-form";

export const dynamic = "force-dynamic";

export default async function EditTestimonialPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  await requirePermission("content.manage");
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const [item, media] = await Promise.all([
    prisma.testimonial.findUnique({ where: { id } }),
    prisma.media.findMany({ orderBy: { createdAt: "desc" }, take: 100, select: { id: true, url: true, alt: true } }),
  ]);
  if (!item) notFound();
  return <div><PageHeader title="Edit testimonial" description="Update the client feedback and publication settings." breadcrumb={[{ label: "Testimonials", href: "/admin/testimonials" }, { label: "Edit testimonial" }]} /><AdminFlash {...flashFromQuery(query)} /><TestimonialForm item={item} media={media} /></div>;
}
