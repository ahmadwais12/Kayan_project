import { Plus } from "lucide-react";

export function FaqList({
  items,
  light = false,
}: {
  items: { id: string; question: string; answer: string }[];
  light?: boolean;
}) {
  if (!items.length) return null;
  return (
    <div className={light ? "divide-y divide-white/12 border-y border-white/12" : "divide-y divide-border/70 border-y border-border/70"}>
      {items.map((item) => (
        <details key={item.id} className="group">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5">
            <span className={`text-[1.02rem] font-medium ${light ? "text-white" : "text-primary"}`}>
              {item.question}
            </span>
            <span
              className={`mt-0.5 grid size-7 shrink-0 place-items-center border transition-transform duration-300 group-open:rotate-45 ${
                light
                  ? "border-white/25 text-white/70 group-open:border-accent group-open:text-accent"
                  : "border-border text-muted-foreground group-open:border-accent group-open:text-accent"
              }`}
            >
              <Plus className="size-3.5" />
            </span>
          </summary>
          <div
            className={`whitespace-pre-line pb-5 pr-12 text-sm leading-relaxed ${
              light ? "text-white/55" : "text-muted-foreground"
            }`}
          >
            {item.answer}
          </div>
        </details>
      ))}
    </div>
  );
}
