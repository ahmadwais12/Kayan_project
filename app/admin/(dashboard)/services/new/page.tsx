import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { ServiceForm } from "@/components/admin/service-form";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function NewServicePage() {
  await requirePermission("services.manage");

  const [categories, media] = await Promise.all([
    prisma.serviceCategory.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
    prisma.media.findMany({ orderBy: { createdAt: "desc" }, take: 100, select: { id: true, url: true, alt: true } }),
  ]);

  return (
    <div>
      <PageHeader
        title="New service"
        description="Add a service offering. Save as a draft until the wording and imagery are ready."
        breadcrumb={[{ label: "Services", href: "/admin/services" }, { label: "New" }]}
        actions={
          <Button asChild variant="outline">
            <Link href="/admin/services">Back to services</Link>
          </Button>
        }
      />
      <ServiceForm
        categories={categories}
        library={media}
        values={{
          title: "",
          slug: "",
          categoryId: "",
          icon: "",
          shortDescription: "",
          description: "",
          mainImage: "",
          isFeatured: false,
          isPublished: true,
          sortOrder: 0,
          seoTitle: "",
          seoDescription: "",
          ogImage: "",
          images: [],
          features: [],
          faqs: [],
        }}
      />
    </div>
  );
}
