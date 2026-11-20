import { Search, ScrollText } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { TableFooter } from "@/components/admin/pagination";
import { FiltersPopover } from "@/components/admin/filters-popover";
import { FiltersForm } from "@/components/admin/filters-form";
import { Card } from "@/components/ui/card";
import { Input, NativeSelect } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTime } from "@/lib/utils";
import { parseRows } from "@/lib/pagination";

export const dynamic = "force-dynamic";

const DEFAULT_ROWS = 25;

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePermission("audit.view");
  const query = await searchParams;
  const page = Math.max(1, Number(query.page) || 1);
  const rows = parseRows(query.rows, DEFAULT_ROWS);
  const q = (query.q || "").trim();
  const action = (query.action || "").trim();
  const entity = (query.entity || "").trim();
  const actor = (query.actor || "").trim();
  const activeFilterCount = [q, action, entity, actor].filter(Boolean).length;

  const where: Prisma.AuditLogWhereInput = {
    ...(q
      ? {
          OR: [
            { action: { contains: q } },
            { entity: { contains: q } },
            { entityId: { contains: q } },
          ],
        }
      : {}),
    ...(action ? { action: { startsWith: action } } : {}),
    ...(entity ? { entity } : {}),
    ...(actor ? { userId: actor } : {}),
  };

  const [logs, total, actors, entities, actions] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * rows,
      take: rows,
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    prisma.auditLog.count({ where }),
    prisma.adminUser.findMany({
      where: { auditLogs: { some: {} } },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
    prisma.auditLog.groupBy({ by: ["entity"], _count: { _all: true }, orderBy: { entity: "asc" } }),
    prisma.auditLog.groupBy({ by: ["action"], _count: { _all: true }, orderBy: { action: "asc" } }),
  ]);

  return (
    <div>
      <PageHeader
        title="Audit log"
        description="A chronological record of administrative actions: sign-ins, content changes, settings updates, and deletions."
        breadcrumb={[{ label: "Recent Activity" }]}
        actions={
          <FiltersPopover activeCount={activeFilterCount}>
            <FiltersForm resetHref="/admin/audit">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input name="q" defaultValue={q} placeholder="Search action, entity or record id" className="pl-9" />
              </div>
              <NativeSelect name="actor" defaultValue={actor} aria-label="Administrator">
                <option value="">All administrators</option>
                {actors.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </NativeSelect>
              <NativeSelect name="entity" defaultValue={entity} aria-label="Entity">
                <option value="">All entities</option>
                {entities.map((item) => (
                  <option key={item.entity} value={item.entity}>{item.entity}</option>
                ))}
              </NativeSelect>
              <NativeSelect name="action" defaultValue={action} aria-label="Action">
                <option value="">All actions</option>
                {actions.map((item) => (
                  <option key={item.action} value={item.action}>{item.action}</option>
                ))}
              </NativeSelect>
            </FiltersForm>
          </FiltersPopover>
        }
      />

      <div className="mb-4 grid gap-2 sm:grid-cols-3">
        {[
          { label: "Entries", value: total },
          { label: "Entities", value: entities.length },
          { label: "Action types", value: actions.length },
        ].map((item) => (
          <div key={item.label} className="rounded-md border border-border/70 bg-card px-4 py-3">
            <p className="text-lg font-semibold text-primary">{item.value}</p>
            <p className="mt-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              {item.label}
            </p>
          </div>
        ))}
      </div>

      <Card className="overflow-hidden">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
              <ScrollText className="size-5" />
            </span>
            <p className="text-sm font-medium text-primary">No audit entries in this view</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Administrative actions are recorded automatically as changes are made.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Administrator</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>IP address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    {formatDateTime(log.createdAt)}
                  </TableCell>
                  <TableCell>
                    {log.user ? (
                      <>
                        <span className="block font-medium text-primary">{log.user.name}</span>
                        <span className="block text-xs text-muted-foreground">{log.user.email}</span>
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground">System</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex rounded bg-secondary px-2 py-0.5 font-mono text-[0.7rem] text-primary">
                      {log.action}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="block text-sm">{log.entity}</span>
                    {log.entityId && (
                      <span className="block font-mono text-[0.68rem] text-muted-foreground">
                        {log.entityId.slice(0, 8)}…
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{log.ip || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <TableFooter
          page={page}
          pageSize={rows}
          total={total}
          basePath="/admin/audit"
          params={{ q, action, entity, actor }}
          noun={total === 1 ? "entry" : "entries"}
        />
      </Card>
    </div>
  );
}
