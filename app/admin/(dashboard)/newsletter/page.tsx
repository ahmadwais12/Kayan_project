import { Mail, Search } from "lucide-react";
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
import { setNewsletterState, deleteNewsletterSubscriber } from "@/actions/inquiries";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, NativeSelect } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTime } from "@/lib/utils";
import { parseRows } from "@/lib/pagination";
import { ExportMenu } from "@/components/admin/export-menu";

export const dynamic = "force-dynamic";

const DEFAULT_ROWS = 25;

export default async function NewsletterPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePermission("inquiries.manage");
  const query = await searchParams;
  const page = Math.max(1, Number(query.page) || 1);
  const rows = parseRows(query.rows, DEFAULT_ROWS);
  const q = (query.q || "").trim();
  const state = query.state === "active" ? "active" : query.state === "inactive" ? "inactive" : "";
  const activeFilterCount = [q, state].filter(Boolean).length;

  const where: Prisma.NewsletterSubscriberWhereInput = {
    ...(q ? { OR: [{ email: { contains: q } }, { name: { contains: q } }] } : {}),
    ...(state === "active" ? { isActive: true } : state === "inactive" ? { isActive: false } : {}),
  };
  const exportQuery = new URLSearchParams();
  if (q) exportQuery.set("q", q);
  if (state) exportQuery.set("state", state);

  const [items, total, activeCount] = await Promise.all([
    prisma.newsletterSubscriber.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * rows,
      take: rows,
    }),
    prisma.newsletterSubscriber.count({ where }),
    prisma.newsletterSubscriber.count({ where: { isActive: true } }),
  ]);

  return (
    <div>
      <PageHeader
        title="Newsletter"
        description="Subscribers who opted in through the website footer. Use this list for occasional studio notes."
        breadcrumb={[{ label: "Newsletter" }]}
        actions={
          <>
            <div className="flex items-stretch">
              <FiltersPopover activeCount={activeFilterCount} triggerClassName="rounded-e-none border-e-0">
                <FiltersForm resetHref="/admin/newsletter">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input name="q" defaultValue={q} placeholder="Search email or name" className="pl-9" />
                  </div>
                  <NativeSelect name="state" defaultValue={state} aria-label="Subscriber state">
                    <option value="">All subscribers</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </NativeSelect>
                </FiltersForm>
              </FiltersPopover>
              <ExportMenu
                href={`/api/admin/newsletter/export${exportQuery.size ? `?${exportQuery.toString()}` : ""}`}
                className="rounded-s-none px-3"
              />
            </div>
          </>
        }
      />

      <AdminFlash {...flashFromQuery(query)} />

      <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="success">{activeCount} active</Badge>
        <span>Subscribers can unsubscribe by replying to any email you send.</span>
      </div>

      <Card className="overflow-hidden">
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
              <Mail className="size-5" />
            </span>
            <p className="text-sm font-medium text-primary">No subscribers in this view</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Sign-ups from the footer newsletter form will appear here.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-primary">{item.email}</TableCell>
                  <TableCell className="text-muted-foreground">{item.name || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{item.source || "footer"}</TableCell>
                  <TableCell>
                    <Badge variant={item.isActive ? "success" : "secondary"}>
                      {item.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{formatDateTime(item.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <ViewButton href={`/admin/records/subscriber/${item.id}`} name={item.email} />
                      <form action={setNewsletterState}>
                        <input type="hidden" name="id" value={item.id} />
                        <input type="hidden" name="active" value={item.isActive ? "0" : "1"} />
                        <Button type="submit" variant="ghost" size="sm">
                          {item.isActive ? "Deactivate" : "Activate"}
                        </Button>
                      </form>
                      <DeleteButton
                        id={item.id}
                        action={deleteNewsletterSubscriber}
                        title="Delete this subscriber?"
                        description="The subscriber record will be permanently removed."
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
          basePath="/admin/newsletter"
          params={{ q, state }}
          noun={total === 1 ? "subscriber" : "subscribers"}
        />
      </Card>
    </div>
  );
}
