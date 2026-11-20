export function TableSkeleton({
  rows = 6,
  columns = 5,
}: {
  rows?: number;
  columns?: number;
}) {
  const middleColumns = Math.max(columns - 2, 1);

  return (
    <div aria-hidden="true" className="animate-pulse">
      <div className="flex items-center gap-4 border-b border-border/70 px-4 py-3">
        <div className="h-2.5 w-1/4 rounded bg-secondary" />
        {Array.from({ length: middleColumns }).map((_, index) => (
          <div key={index} className="h-2.5 flex-1 rounded bg-secondary/70" />
        ))}
        <div className="h-2.5 w-16 rounded bg-secondary/70" />
      </div>

      {Array.from({ length: rows }).map((_, row) => (
        <div
          key={row}
          className="flex items-center gap-4 border-b border-border/60 px-4 py-3.5 last:border-0"
        >
          <div className="flex w-1/4 items-center gap-3">
            <div className="size-10 shrink-0 rounded-md bg-secondary" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-2.5 w-4/5 rounded bg-secondary" />
              <div className="h-2 w-1/2 rounded bg-secondary/60" />
            </div>
          </div>
          {Array.from({ length: middleColumns }).map((_, column) => (
            <div key={column} className="h-2.5 flex-1 rounded bg-secondary/60" />
          ))}
          <div className="h-6 w-16 rounded bg-secondary/60" />
        </div>
      ))}
    </div>
  );
}
