import Link from "next/link";
import Image from "next/image";
import { Plus, Search, Users } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { TableFooter } from "@/components/admin/pagination";
import { DeleteButton } from "@/components/admin/delete-button";
import { ViewButton } from "@/components/admin/view-button";
import { FiltersPopover } from "@/components/admin/filters-popover";
import { FiltersForm } from "@/components/admin/filters-form";
import { PublishBadge } from "@/components/admin/status-badge";
import { deleteTeamMember } from "@/actions/team";
import { Button } from "@/components/ui/button";
import { Input, NativeSelect } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { parseRows } from "@/lib/pagination";

export const dynamic = "force-dynamic";

const DEFAULT_ROWS = 10;

export default async function TeamPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePermission("team.manage");
  const query = await searchParams;
  const page = Math.max(1, Number(query.page) || 1);
  const rows = parseRows(query.rows, DEFAULT_ROWS);
  const q = (query.q || "").trim();
  const department = query.department || "";
  const activeFilterCount = [q, department].filter(Boolean).length;

  const where: Prisma.TeamMemberWhereInput = {
    deletedAt: null,
    ...(q ? { OR: [{ name: { contains: q } }, { jobTitle: { contains: q } }] } : {}),
    ...(department ? { departmentId: department } : {}),
  };

  const [members, total, departments] = await Promise.all([
    prisma.teamMember.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      skip: (page - 1) * rows,
      take: rows,
      include: { department: { select: { name: true } } },
    }),
    prisma.teamMember.count({ where }),
    prisma.department.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div>
      <PageHeader
        title="Team"
        description="Publish the people behind the studio. Only add staff who have agreed to appear on the website."
        breadcrumb={[{ label: "Team" }]}
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/admin/team/departments">Departments</Link>
            </Button>
            <FiltersPopover activeCount={activeFilterCount}>
              <FiltersForm resetHref="/admin/team">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input name="q" defaultValue={q} placeholder="Search name or role" className="pl-9" />
                </div>
                <NativeSelect name="department" defaultValue={department} aria-label="Department">
                  <option value="">All departments</option>
                  {departments.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </NativeSelect>
              </FiltersForm>
            </FiltersPopover>
            <Button asChild>
              <Link href="/admin/team/new">
                <Plus className="size-4" /> New member
              </Link>
            </Button>
          </>
        }
      />

      <AdminFlash {...flashFromQuery(query)} />

      <Card className="overflow-hidden">
        {members.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
              <Users className="size-5" />
            </span>
            <p className="text-sm font-medium text-primary">No team members yet</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Add profiles for the people who would like to be featured on the site.
            </p>
            <Button asChild size="sm">
              <Link href="/admin/team/new">Add a team member</Link>
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="relative block size-11 overflow-hidden rounded-full bg-secondary">
                        {member.imageUrl ? (
                          <Image src={member.imageUrl} alt="" fill sizes="44px" className="object-cover" />
                        ) : (
                          <span className="flex size-full items-center justify-center text-muted-foreground">
                            <Users className="size-4" />
                          </span>
                        )}
                      </span>
                      <span className="min-w-0">
                        <Link href={`/admin/team/${member.id}`} className="block truncate font-medium text-primary hover:underline">
                          {member.name}
                        </Link>
                        <span className="block truncate text-xs text-muted-foreground">{member.jobTitle}</span>
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{member.department?.name || "—"}</TableCell>
                  <TableCell><PublishBadge published={member.isPublished} /></TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <ViewButton href={`/admin/records/team/${member.id}`} name={member.name} />
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/team/${member.id}`}>Edit</Link>
                      </Button>
                      <DeleteButton
                        id={member.id}
                        action={deleteTeamMember}
                        title={`Remove “${member.name}”?`}
                        description="The profile will be unpublished and removed from the website. The record is kept in the database."
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <TableFooter
          page={page}
          pageSize={rows}
          total={total}
          basePath="/admin/team"
          params={{ q, department }}
          noun={total === 1 ? "team member" : "team members"}
        />
      </Card>
    </div>
  );
}
