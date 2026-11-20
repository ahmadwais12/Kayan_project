import type { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function FiltersForm({
  resetHref,
  children,
}: {
  resetHref: string;
  children: ReactNode;
}) {
  return (
    <form method="get" className="space-y-3">
      {children}
      <div className="flex items-center justify-end gap-2 pt-1">
        <Button asChild variant="ghost" size="sm">
          <Link href={resetHref}>Clear</Link>
        </Button>
        <Button type="submit" size="sm">
          Apply filters
        </Button>
      </div>
    </form>
  );
}
