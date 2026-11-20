import { Card } from "@/components/ui/card";
import { TableSkeleton } from "@/components/admin/table-skeleton";

export function ListPageSkeleton({
  columns = 5,
  rows = 6,
}: {
  columns?: number;
  rows?: number;
}) {
  return (
    <div aria-busy="true" aria-live="polite">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <div className="h-2.5 w-24 animate-pulse rounded bg-secondary" />
          <div className="h-8 w-56 animate-pulse rounded bg-secondary" />
          <div className="h-3 w-80 max-w-full animate-pulse rounded bg-secondary/60" />
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="h-11 w-24 animate-pulse rounded-md bg-secondary" />
          <div className="h-11 w-32 animate-pulse rounded-md bg-secondary" />
        </div>
      </div>

      <Card className="overflow-hidden">
        <TableSkeleton columns={columns} rows={rows} />
        <div className="flex flex-col gap-3 border-t border-border/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="h-8 w-40 animate-pulse rounded-md bg-secondary" />
          <div className="h-8 w-36 animate-pulse rounded-md bg-secondary/60" />
        </div>
      </Card>

      <span className="sr-only">Loading table…</span>
    </div>
  );
}
