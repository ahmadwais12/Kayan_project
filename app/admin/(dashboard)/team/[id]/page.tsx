import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { TeamForm } from "@/components/admin/team-form";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function EditTeamMemberPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePermission("team.manage");
  const { id } = await params;
  const query = await searchParams;

  const [member, departments, media] = await Promise.all([
    prisma.teamMember.findFirst({ where: { id, deletedAt: null } }),
    prisma.department.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
    prisma.media.findMany({ orderBy: { createdAt: "desc" }, take: 100, select: { id: true, url: true, alt: true } }),
  ]);

  if (!member) notFound();

  return (
    <div>
      <PageHeader
        title={member.name}
        description={`${member.jobTitle} · last updated ${formatDateTime(member.updatedAt)}`}
        breadcrumb={[{ label: "Team", href: "/admin/team" }, { label: member.name }]}
        actions={
          <>
            {member.isPublished && (
              <Button asChild variant="outline">
                <Link href={`/team/${member.slug}`} target="_blank" rel="noreferrer">
                  View live <ExternalLink className="size-3.5" />
                </Link>
              </Button>
            )}
            <Button asChild variant="outline">
              <Link href="/admin/team">All team</Link>
            </Button>
          </>
        }
      />

      <AdminFlash {...flashFromQuery(query)} />

      <TeamForm
        departments={departments}
        library={media}
        values={{
          id: member.id,
          name: member.name,
          slug: member.slug,
          jobTitle: member.jobTitle,
          departmentId: member.departmentId || "",
          imageUrl: member.imageUrl || "",
          bio: member.bio || "",
          skills: member.skills || "",
          education: member.education || "",
          experience: member.experience || "",
          email: member.email || "",
          linkedinUrl: member.linkedinUrl || "",
          instagramUrl: member.instagramUrl || "",
          facebookUrl: member.facebookUrl || "",
          websiteUrl: member.websiteUrl || "",
          sortOrder: member.sortOrder,
          isPublished: member.isPublished,
        }}
      />
    </div>
  );
}
