import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  totalPages,
  basePath,
  params = {},
}: {
  page: number;
  totalPages: number;
  basePath: string;
  params?: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  function href(target: number) {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value) search.set(key, value);
    }
    if (target > 1) search.set("page", String(target));
    const query = search.toString();
    return query ? `${basePath}?${query}` : basePath;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).filter(
    (item) =>
      item === 1 ||
      item === totalPages ||
      Math.abs(item - page) <= 1,
  );

  return (
    <nav className="flex items-center justify-between gap-3 border-t border-border/70 px-4 py-3">
      <p className="text-xs text-muted-foreground">
        Page {page} of {totalPages}
      </p>
      <div className="flex items-center gap-1">
        <Link
          href={href(Math.max(1, page - 1))}
          aria-disabled={page === 1}
          className={cn(
            "inline-flex size-8 items-center justify-center rounded border border-border text-muted-foreground",
            page === 1 && "pointer-events-none opacity-40",
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
                className={cn(
                  "inline-flex size-8 items-center justify-center rounded border text-xs font-medium",
                  item === page
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
          href={href(Math.min(totalPages, page + 1))}
          aria-disabled={page === totalPages}
          className={cn(
            "inline-flex size-8 items-center justify-center rounded border border-border text-muted-foreground",
            page === totalPages && "pointer-events-none opacity-40",
          )}
        >
          <ChevronRight className="size-4" />
        </Link>
      </div>
    </nav>
  );
}
