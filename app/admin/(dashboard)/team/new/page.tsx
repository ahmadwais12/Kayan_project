import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { TeamForm } from "@/components/admin/team-form";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function NewTeamMemberPage() {
  await requirePermission("team.manage");

  const [departments, media] = await Promise.all([
    prisma.department.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
    prisma.media.findMany({ orderBy: { createdAt: "desc" }, take: 100, select: { id: true, url: true, alt: true } }),
  ]);

  return (
    <div>
      <PageHeader
        title="New team member"
        description="Create a profile for a team member. Drafts stay hidden from the public site."
        breadcrumb={[{ label: "Team", href: "/admin/team" }, { label: "New" }]}
        actions={
          <Button asChild variant="outline">
            <Link href="/admin/team">Back to team</Link>
          </Button>
        }
      />
      <TeamForm
        departments={departments}
        library={media}
        values={{
          name: "",
          slug: "",
          jobTitle: "",
          departmentId: "",
          imageUrl: "",
          bio: "",
          skills: "",
          education: "",
          experience: "",
          email: "",
          linkedinUrl: "",
          instagramUrl: "",
          facebookUrl: "",
          websiteUrl: "",
          sortOrder: 0,
          isPublished: true,
        }}
      />
    </div>
  );
}
