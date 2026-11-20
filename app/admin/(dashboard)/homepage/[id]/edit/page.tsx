import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { HomepageSectionForm } from "@/components/admin/homepage-section-form";

export const dynamic = "force-dynamic";

export default async function EditHomepageSectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("content.manage");
  const { id } = await params;
  const section = await prisma.homepageSection.findUnique({ where: { id } });
  if (!section || !["hero", "cta", "about", "mission", "vision", "testimonials", "awards", "videos"].includes(section.key)) notFound();

  const media = await prisma.media.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: { id: true, url: true, alt: true },
  });

  return (
    <div>
      <PageHeader
        title={`Edit ${section.key === "cta" ? "call to action" : section.key === "about" ? "About introduction" : section.key === "testimonials" ? "Testimonials" : section.key === "awards" ? "Awards & recognition" : section.key === "videos" ? "Project videos" : section.key}`}
        description="Update the homepage section content and display settings."
        breadcrumb={[
          { label: "Home Page", href: "/admin/homepage" },
          { label: "Edit section" },
        ]}
      />
      <HomepageSectionForm section={section} media={media} />
    </div>
  );
}
