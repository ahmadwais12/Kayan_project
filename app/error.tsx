"use client";

import Link from "next/link";
import { RotateCcw, TriangleAlert } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-6 py-20 text-center">
      <span className="grid size-14 place-items-center rounded-full border border-destructive/30 text-destructive">
        <TriangleAlert className="size-6" aria-hidden="true" />
      </span>
      <h1 className="mt-6 font-display text-3xl text-primary sm:text-4xl">Something went wrong.</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        The page could not be loaded. Try again, and if the problem continues contact the studio.
      </p>
      {error.digest && (
        <p className="mt-2 text-[0.68rem] text-muted-foreground">Reference: {error.digest}</p>
      )}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 bg-primary px-5 py-3 text-[0.7rem] font-semibold tracking-[0.12em] text-white uppercase hover:bg-primary/90"
        >
          <RotateCcw className="size-3.5" aria-hidden="true" /> Try again
        </button>
        <Link
          href="/"
          className="inline-flex items-center border border-primary/25 px-5 py-3 text-[0.7rem] font-semibold tracking-[0.12em] text-primary uppercase hover:border-primary"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
