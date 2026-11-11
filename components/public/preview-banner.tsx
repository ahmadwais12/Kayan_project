import Link from "next/link";
import { Eye, Pencil } from "lucide-react";

export function PreviewBanner({ editHref, label }: { editHref: string; label: string }) {
  return (
    <div className="border-b border-amber-300 bg-amber-50">
      <div className="container-x flex flex-wrap items-center justify-between gap-3 py-2.5 text-xs text-amber-900">
        <p className="flex items-center gap-1.5 font-medium">
          <Eye className="size-3.5" aria-hidden="true" />
          Draft preview — “{label}” is not visible to the public.
        </p>
        <Link
          href={editHref}
          className="inline-flex items-center gap-1.5 border border-amber-300 bg-white px-2.5 py-1 text-[0.65rem] font-semibold tracking-[0.08em] uppercase hover:border-amber-500"
        >
          <Pencil className="size-3" aria-hidden="true" /> Edit content
        </Link>
      </div>
    </div>
  );
}
