import Link from "next/link";
import { Download, Inbox, Search } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { Pagination } from "@/components/admin/pagination";
import { InquiryStatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Input, NativeSelect } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn, formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 15;
const STATUSES = ["NEW", "CONTACTED", "IN_PROGRESS", "QUOTATION_SENT", "APPROVED", "REJECTED", "COMPLETED"];

export default async function InquiriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePermission("inquiries.manage");
  const query = await searchParams;
  const page = Math.max(1, Number(query.page) || 1);
  const q = (query.q || "").trim();
  const status = STATUSES.includes(query.status || "") ? query.status! : "";
  const from = /^\d{4}-\d{2}-\d{2}$/.test(query.from || "") ? query.from! : "";
  const to = /^\d{4}-\d{2}-\d{2}$/.test(query.to || "") ? query.to! : "";

  const where: Prisma.ContactInquiryWhereInput = {
    ...(q
      ? {
          OR: [
            { name: { contains: q } },
            { email: { contains: q } },
            { subject: { contains: q } },
          ],
        }
      : {}),
    ...(status
      ? { status: status as "NEW" | "CONTACTED" | "IN_PROGRESS" | "QUOTATION_SENT" | "APPROVED" | "REJECTED" | "COMPLETED" }
      : {}),
    ...(from || to
      ? {
          createdAt: {
            ...(from ? { gte: new Date(`${from}T00:00:00.000Z`) } : {}),
            ...(to ? { lte: new Date(`${to}T23:59:59.999Z`) } : {}),
          },
        }
      : {}),
  };

  const [items, total, counts] = await Promise.all([
    prisma.contactInquiry.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { _count: { select: { notes: true, attachments: true } } },
    }),
    prisma.contactInquiry.count({ where }),
    prisma.contactInquiry.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const countMap = new Map<string, number>(counts.map((row) => [row.status, row._count._all]));
  const allCount = counts.reduce((sum, row) => sum + row._count._all, 0);
  const exportQuery = new URLSearchParams({ type: "contact" });
  if (status) exportQuery.set("status", status);
  if (q) exportQuery.set("q", q);
  if (from) exportQuery.set("from", from);
  if (to) exportQuery.set("to", to);

  return (
    <div>
      <PageHeader
        title="Contact inquiries"
        description="Messages submitted through the public contact form. Notes and statuses are visible only to administrators."
        breadcrumb={[{ label: "Contact Inquiries" }]}
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/admin/inquiries/quotes">Quote requests</Link>
            </Button>
            <Button asChild variant="outline">
              <a href={`/api/admin/inquiries/export?${exportQuery.toString()}`}>
                <Download className="size-4" /> Export CSV
              </a>
            </Button>
          </>
        }
      />

      <AdminFlash {...flashFromQuery(query)} />

      <div className="mb-4 flex flex-wrap gap-2">
        <Link
          href="/admin/inquiries"
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs font-medium",
            !status ? "border-primary bg-primary text-white" : "border-border bg-card text-muted-foreground hover:text-primary",
          )}
        >
          All <span className="ml-1 opacity-70">{allCount}</span>
        </Link>
        {STATUSES.map((item) => (
          <Link
            key={item}
            href={`/admin/inquiries?status=${item}`}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium",
              status === item ? "border-primary bg-primary text-white" : "border-border bg-card text-muted-foreground hover:text-primary",
            )}
          >
            {item.replace("_", " ").toLowerCase()} <span className="ml-1 opacity-70">{countMap.get(item) || 0}</span>
          </Link>
        ))}
      </div>

      <Card className="overflow-hidden">
        <form method="get" className="grid gap-3 border-b border-border/70 p-4 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto_auto_auto]">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input name="q" defaultValue={q} placeholder="Search name, email or subject" className="pl-9" />
          </div>
          <NativeSelect name="status" defaultValue={status} className="lg:w-40" aria-label="Status">
            <option value="">All statuses</option>
            {STATUSES.map((item) => (
              <option key={item} value={item}>{item.replace("_", " ").toLowerCase()}</option>
            ))}
          </NativeSelect>
          <Input name="from" type="date" defaultValue={from} aria-label="Received from" />
          <Input name="to" type="date" defaultValue={to} aria-label="Received to" />
          <Button type="submit" variant="secondary">Filter</Button>
        </form>

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
              <Inbox className="size-5" />
            </span>
            <p className="text-sm font-medium text-primary">No inquiries in this view</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              New messages from the contact form will appear here.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>From</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Received</TableHead>
                <TableHead className="text-right">Open</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <span className="block font-medium text-primary">{item.name}</span>
                    <span className="block text-xs text-muted-foreground">{item.email}</span>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <span className="block truncate">{item.subject}</span>
                    <span className="text-xs text-muted-foreground">
                      {item._count.notes} note{item._count.notes === 1 ? "" : "s"}
                      {item._count.attachments > 0 ? ` · ${item._count.attachments} file${item._count.attachments === 1 ? "" : "s"}` : ""}
                    </span>
                  </TableCell>
                  <TableCell><InquiryStatusBadge status={item.status} /></TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{formatDateTime(item.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/inquiries/${item.id}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <Pagination page={page} totalPages={Math.ceil(total / PAGE_SIZE)} basePath="/admin/inquiries" params={{ q, status }} />
      </Card>
      <p className="mt-3 text-xs text-muted-foreground">{total} inquir{total === 1 ? "y" : "ies"} in this view.</p>
    </div>
  );
}
