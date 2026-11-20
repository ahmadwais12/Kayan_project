import Link from "next/link";
import Image from "next/image";
import { Plus, Search, Trophy } from "lucide-react";
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
import { deleteAward } from "@/actions/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { parseRows } from "@/lib/pagination";

export const dynamic = "force-dynamic";

const DEFAULT_ROWS = 10;

export default async function AwardsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePermission("content.manage");
  const query = await searchParams;
  const page = Math.max(1, Number(query.page) || 1);
  const rows = parseRows(query.rows, DEFAULT_ROWS);
  const q = (query.q || "").trim();

  const where: Prisma.AwardWhereInput = {
    ...(q ? { OR: [{ title: { contains: q } }, { issuer: { contains: q } }] } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.award.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      skip: (page - 1) * rows,
      take: rows,
    }),
    prisma.award.count({ where }),
  ]);

  return (
    <div>
      <PageHeader
        title="Awards & recognition"
        description="Publish the trophies, honors, and certificates of appreciation the company has received. The section stays hidden on the homepage until at least one award is published."
        breadcrumb={[{ label: "Awards & recognition" }]}
        actions={
          <>
            <FiltersPopover activeCount={q ? 1 : 0}>
              <FiltersForm resetHref="/admin/awards">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input name="q" defaultValue={q} placeholder="Search title or issuer" className="pl-9" />
                </div>
              </FiltersForm>
            </FiltersPopover>
            <Button asChild>
              <Link href="/admin/awards/new">
                <Plus className="size-4" /> New award
              </Link>
            </Button>
          </>
        }
      />

      <AdminFlash {...flashFromQuery(query)} />

      <Card className="overflow-hidden">
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
              <Trophy className="size-5" />
            </span>
            <p className="text-sm font-medium text-primary">No awards yet</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Add the honors, trophies, and certificates of appreciation the company has received.
            </p>
            <Button asChild size="sm">
              <Link href="/admin/awards/new">Add an award</Link>
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Award</TableHead>
                <TableHead>Issued by</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="relative block size-11 shrink-0 overflow-hidden rounded-md bg-secondary">
                        {item.imageUrl ? (
                          <Image src={item.imageUrl} alt="" fill sizes="44px" className="object-cover" />
                        ) : (
                          <span className="flex size-full items-center justify-center text-muted-foreground">
                            <Trophy className="size-4" />
                          </span>
                        )}
                      </span>
                      <span className="block min-w-0 truncate font-medium text-primary">{item.title}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{item.issuer || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{item.year || "—"}</TableCell>
                  <TableCell><PublishBadge published={item.isPublished} /></TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <ViewButton href={`/admin/records/award/${item.id}`} name={item.title} />
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/awards/${item.id}/edit`}>Edit</Link>
                      </Button>
                      <DeleteButton
                        id={item.id}
                        action={deleteAward}
                        title={`Delete “${item.title}”?`}
                        description="This permanently removes the award from the website."
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
          basePath="/admin/awards"
          params={{ q }}
          noun={total === 1 ? "award" : "awards"}
        />
      </Card>
    </div>
  );
}
