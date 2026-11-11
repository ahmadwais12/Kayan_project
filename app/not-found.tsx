import Link from "next/link";
import { Compass } from "lucide-react";
import { getLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n/dictionary";

export default async function NotFound() {
  const t = getDictionary(await getLocale());

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-6 py-20 text-center">
      <span className="grid size-14 place-items-center rounded-full border border-accent/40 text-accent">
        <Compass className="size-6" aria-hidden="true" />
      </span>
      <p className="mt-6 text-[0.65rem] font-semibold tracking-[0.24em] text-muted-foreground uppercase">
        {t.notFoundEyebrow}
      </p>
      <h1 className="mt-2 max-w-xl font-display text-4xl text-primary sm:text-5xl">
        {t.notFoundTitle}
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
        {t.notFoundDesc}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center bg-primary px-5 py-3 text-[0.7rem] font-semibold tracking-[0.12em] text-white uppercase hover:bg-primary/90"
        >
          {t.backToHome}
        </Link>
        <Link
          href="/projects"
          className="inline-flex items-center border border-primary/25 px-5 py-3 text-[0.7rem] font-semibold tracking-[0.12em] text-primary uppercase hover:border-primary"
        >
          {t.viewProjects}
        </Link>
      </div>
    </div>
  );
}
