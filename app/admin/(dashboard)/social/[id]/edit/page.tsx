import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { SocialLinkForm } from "@/components/admin/social-link-form";

export const dynamic = "force-dynamic";

export default async function EditSocialLinkPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePermission("settings.manage");
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const [editing, totalLinks] = await Promise.all([
    prisma.socialLink.findUnique({ where: { id } }),
    prisma.socialLink.count(),
  ]);
  if (!editing) notFound();

  return (
    <div>
      <PageHeader
        title="Edit social link"
        description="Update the destination and visibility of this link."
        breadcrumb={[
          { label: "Social Links", href: "/admin/social" },
          { label: "Edit link" },
        ]}
      />
      <AdminFlash {...flashFromQuery(query)} />
      <SocialLinkForm editing={editing} totalLinks={totalLinks} nextOrder={editing.sortOrder} />
    </div>
  );
}
