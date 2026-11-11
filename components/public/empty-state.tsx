import { SearchX } from "lucide-react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center border border-dashed border-border/80 bg-card/50 px-6 py-20 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-secondary text-primary">
        <SearchX className="size-5" />
      </span>
      <h2 className="mt-4 font-display text-xl text-primary">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
