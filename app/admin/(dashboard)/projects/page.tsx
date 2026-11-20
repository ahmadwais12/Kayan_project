import Link from "next/link";
import Image from "next/image";
import { Building2, Plus, Search } from "lucide-react";
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
import { StatusBadge, PublishBadge } from "@/components/admin/status-badge";
import { deleteProject } from "@/actions/projects";
import { Button } from "@/components/ui/button";
import { Input, NativeSelect } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { parseRows } from "@/lib/pagination";

export const dynamic = "force-dynamic";

const DEFAULT_ROWS = 10;
const STATUSES = ["PLANNING", "IN_PROGRESS", "COMPLETED", "ON_HOLD"];

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; category?: string; page?: string } & Record<string, string | undefined>>;
}) {
  await requirePermission("projects.manage");
  const query = await searchParams;
  const page = Math.max(1, Number(query.page) || 1);
  const rows = parseRows(query.rows, DEFAULT_ROWS);
  const q = (query.q || "").trim();
  const status = STATUSES.includes(query.status || "") ? query.status! : "";
  const category = query.category || "";
  const activeFilterCount = [q, status, category].filter(Boolean).length;

  const where: Prisma.ProjectWhereInput = {
    deletedAt: null,
    ...(q
      ? {
          OR: [
            { title: { contains: q } },
            { location: { contains: q } },
            { slug: { contains: q } },
          ],
        }
      : {}),
    ...(status ? { status: status as "PLANNING" | "IN_PROGRESS" | "COMPLETED" | "ON_HOLD" } : {}),
    ...(category ? { categoryId: category } : {}),
  };

  const [projects, total, categories] = await Promise.all([
    prisma.project.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
      skip: (page - 1) * rows,
      take: rows,
      include: { category: { select: { name: true } } },
    }),
    prisma.project.count({ where }),
    prisma.projectCategory.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
  ]);

  const flash = flashFromQuery(query);

  return (
    <div>
      <PageHeader
        title="Projects"
        description="Manage the portfolio shown on the public website. Draft projects stay hidden until published."
        breadcrumb={[{ label: "Projects" }]}
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/admin/projects/categories">Categories</Link>
            </Button>
            <FiltersPopover activeCount={activeFilterCount}>
              <FiltersForm resetHref="/admin/projects">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input name="q" defaultValue={q} placeholder="Search title, location or slug" className="pl-9" />
                </div>
                <NativeSelect name="status" defaultValue={status} aria-label="Status">
                  <option value="">All statuses</option>
                  {STATUSES.map((item) => (
                    <option key={item} value={item}>
                      {item.replace("_", " ").toLowerCase()}
                    </option>
                  ))}
                </NativeSelect>
                <NativeSelect name="category" defaultValue={category} aria-label="Category">
                  <option value="">All categories</option>
                  {categories.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </NativeSelect>
              </FiltersForm>
            </FiltersPopover>
            <Button asChild>
              <Link href="/admin/projects/new">
                <Plus className="size-4" /> New project
              </Link>
            </Button>
          </>
        }
      />

      <AdminFlash {...flash} />

      <Card className="overflow-hidden">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
              <Building2 className="size-5" />
            </span>
            <p className="text-sm font-medium text-primary">No projects match this view</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Add a project or clear the filters to see the full portfolio.
            </p>
            <Button asChild size="sm">
              <Link href="/admin/projects/new">Add a project</Link>
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="relative block size-12 overflow-hidden rounded-md bg-secondary">
                        {project.coverImage ? (
                          <Image src={project.coverImage} alt="" fill sizes="48px" className="object-cover" />
                        ) : (
                          <span className="flex size-full items-center justify-center text-muted-foreground">
                            <Building2 className="size-4" />
                          </span>
                        )}
                      </span>
                      <span className="min-w-0">
                        <Link href={`/admin/projects/${project.id}`} className="block truncate font-medium text-primary hover:underline">
                          {project.title}
                        </Link>
                        <span className="block truncate text-xs text-muted-foreground">
                          /{project.slug}
                          {project.location ? ` · ${project.location}` : ""}
                        </span>
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{project.category.name}</TableCell>
                  <TableCell><StatusBadge status={project.status} /></TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <PublishBadge published={project.isPublished} />
                      {project.isFeatured && <span className="text-[0.68rem] font-medium uppercase tracking-wide text-accent-foreground">Featured</span>}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    {formatDate(project.updatedAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <ViewButton href={`/admin/records/project/${project.id}`} name={project.title} />
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/projects/${project.id}`}>Edit</Link>
                      </Button>
                      <DeleteButton
                        id={project.id}
                        action={deleteProject}
                        title={`Delete “${project.title}”?`}
                        description="The project will be unpublished and removed from the public website. This is a soft delete, so the record stays in the database."
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
          basePath="/admin/projects"
          params={{ q, status, category }}
          noun={total === 1 ? "project" : "projects"}
        />
      </Card>
    </div>
  );
}
