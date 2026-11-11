import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { ServiceForm } from "@/components/admin/service-form";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function EditServicePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePermission("services.manage");
  const { id } = await params;
  const query = await searchParams;

  const [service, categories, media] = await Promise.all([
    prisma.service.findFirst({
      where: { id, deletedAt: null },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        features: { orderBy: { sortOrder: "asc" } },
        faqs: { orderBy: { sortOrder: "asc" } },
      },
    }),
    prisma.serviceCategory.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
    prisma.media.findMany({ orderBy: { createdAt: "desc" }, take: 100, select: { id: true, url: true, alt: true } }),
  ]);

  if (!service) notFound();

  const flash = flashFromQuery(query);

  return (
    <div>
      <PageHeader
        title={service.title}
        description={`Last updated ${formatDateTime(service.updatedAt)}`}
        breadcrumb={[{ label: "Services", href: "/admin/services" }, { label: service.title }]}
        actions={
          <>
            {service.isPublished && (
              <Button asChild variant="outline">
                <Link href={`/services/${service.slug}`} target="_blank" rel="noreferrer">
                  View live <ExternalLink className="size-3.5" />
                </Link>
              </Button>
            )}
            <Button asChild variant="outline">
              <Link href="/admin/services">All services</Link>
            </Button>
          </>
        }
      />

      <AdminFlash {...flash} />

      <ServiceForm
        categories={categories}
        library={media}
        values={{
          id: service.id,
          title: service.title,
          slug: service.slug,
          categoryId: service.categoryId || "",
          icon: service.icon || "",
          shortDescription: service.shortDescription,
          description: service.description,
          mainImage: service.mainImage || "",
          isFeatured: service.isFeatured,
          isPublished: service.isPublished,
          sortOrder: service.sortOrder,
          seoTitle: service.seoTitle || "",
          seoDescription: service.seoDescription || "",
          ogImage: service.ogImage || "",
          images: service.images.map((image) => ({
            url: image.url,
            alt: image.alt || "",
            caption: "",
          })),
          features: service.features.map((feature) => ({
            title: feature.title,
            description: feature.description || "",
          })),
          faqs: service.faqs.map((faq) => ({ question: faq.question, answer: faq.answer })),
        }}
      />
    </div>
  );
}
