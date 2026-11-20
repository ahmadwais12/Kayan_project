import { requirePermission } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { SocialLinkForm } from "@/components/admin/social-link-form";

export const dynamic = "force-dynamic";

export default async function NewSocialLinkPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePermission("settings.manage");
  const [totalLinks, query] = await Promise.all([
    prisma.socialLink.count(),
    searchParams,
  ]);

  return (
    <div>
      <PageHeader
        title="Create social link"
        description="Add a social profile or contact link to the website."
        breadcrumb={[
          { label: "Social Links", href: "/admin/social" },
          { label: "New link" },
        ]}
      />
      <AdminFlash {...flashFromQuery(query)} />
      <SocialLinkForm totalLinks={totalLinks} nextOrder={(totalLinks + 1) * 10} />
    </div>
  );
}
