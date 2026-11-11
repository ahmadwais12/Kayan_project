import { getLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n/dictionary";

export default async function PublicLoading() {
  const t = getDictionary(await getLocale());

  return (
    <div className="container-x py-20" aria-busy="true" aria-live="polite">
      <div className="h-3 w-24 animate-pulse bg-secondary" />
      <div className="mt-6 h-12 w-2/3 max-w-xl animate-pulse bg-secondary" />
      <div className="mt-4 h-4 w-1/2 max-w-lg animate-pulse bg-secondary" />
      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="aspect-[4/3] animate-pulse bg-secondary" />
        ))}
      </div>
      <span className="sr-only">{t.loadingPage}</span>
    </div>
  );
}
