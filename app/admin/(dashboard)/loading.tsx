export default function AdminLoading() {
  return (
    <div aria-busy="true" aria-live="polite">
      <div className="h-3 w-28 animate-pulse bg-secondary" />
      <div className="mt-3 h-8 w-64 animate-pulse bg-secondary" />
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-28 animate-pulse border border-border/70 bg-card" />
        ))}
      </div>
      <div className="mt-5 h-72 animate-pulse border border-border/70 bg-card" />
      <span className="sr-only">Loading dashboard…</span>
    </div>
  );
}
