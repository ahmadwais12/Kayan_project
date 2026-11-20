import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { RowsPerPage } from "@/components/admin/rows-per-page";
import { cn } from "@/lib/utils";

export function TableFooter({
  page,
  pageSize,
  total,
  basePath,
  params = {},
  noun = "records",
}: {
  page: number;
  pageSize: number;
  total: number;
  basePath: string;
  params?: Record<string, string | undefined>;
  noun?: string;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const from = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = Math.min(total, currentPage * pageSize);

  function href(target: number) {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value) search.set(key, value);
    }
    search.set("rows", String(pageSize));
    if (target > 1) search.set("page", String(target));
    return `${basePath}?${search.toString()}`;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).filter(
    (item) => item === 1 || item === totalPages || Math.abs(item - currentPage) <= 1,
  );

  return (
    <div className="flex flex-col gap-3 border-t border-border/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <RowsPerPage value={pageSize} />
        <p className="text-xs text-muted-foreground">
          {total === 0
            ? `No ${noun}`
            : `Showing ${from}–${to} of ${total} ${noun}`}
        </p>
      </div>

      <nav aria-label="Pagination" className="flex items-center gap-1">
        <Link
          href={href(Math.max(1, currentPage - 1))}
          aria-disabled={currentPage === 1}
          aria-label="Previous page"
          className={cn(
            "inline-flex size-8 items-center justify-center rounded border border-border text-muted-foreground",
            currentPage === 1 && "pointer-events-none opacity-40",
          )}
        >
          <ChevronLeft className="size-4" />
        </Link>
        {pages.map((item, index) => {
          const previous = pages[index - 1];
          return (
            <span key={item} className="flex items-center gap-1">
              {previous && item - previous > 1 && (
                <span className="px-1 text-xs text-muted-foreground">…</span>
              )}
              <Link
                href={href(item)}
                aria-current={item === currentPage ? "page" : undefined}
                className={cn(
                  "inline-flex size-8 items-center justify-center rounded border text-xs font-medium",
                  item === currentPage
                    ? "border-primary bg-primary text-white"
                    : "border-border text-muted-foreground hover:border-primary/30 hover:text-primary",
                )}
              >
                {item}
              </Link>
            </span>
          );
        })}
        <Link
          href={href(Math.min(totalPages, currentPage + 1))}
          aria-disabled={currentPage === totalPages}
          aria-label="Next page"
          className={cn(
            "inline-flex size-8 items-center justify-center rounded border border-border text-muted-foreground",
            currentPage === totalPages && "pointer-events-none opacity-40",
          )}
        >
          <ChevronRight className="size-4" />
        </Link>
      </nav>
    </div>
  );
}
