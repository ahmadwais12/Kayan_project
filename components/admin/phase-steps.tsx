import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type PhaseStep = {
  label: string;
  hint?: string;
};

export function PhaseSteps({
  steps,
  current,
  stepOffset = 0,
  className,
}: {
  steps: PhaseStep[];
  current: number;
  stepOffset?: number;
  className?: string;
}) {
  return (
    <ol
      className={cn(
        "flex w-full items-stretch overflow-x-auto rounded-xl border border-border/80 bg-card p-1.5",
        className,
      )}
      aria-label="Page workflow steps"
    >
      {steps.map((step, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li key={step.label} className="flex min-w-0 flex-1 items-center">
            <div
              className={cn(
                "flex min-w-36 flex-1 items-center gap-2.5 rounded-lg px-3 py-2 transition-colors",
                active && "bg-secondary",
              )}
              aria-current={active ? "step" : undefined}
            >
              <span
                className={cn(
                  "grid size-7 shrink-0 place-items-center rounded-full border text-[0.7rem] font-semibold",
                  done
                    ? "border-primary bg-primary text-white"
                    : active
                      ? "border-accent bg-accent/15 text-primary"
                      : "border-border text-muted-foreground",
                )}
              >
                {done ? <Check className="size-3.5" /> : index + stepOffset + 1}
              </span>
              <span className="min-w-0">
                <span
                  className={cn(
                    "block truncate text-xs font-medium",
                    done || active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>
                {step.hint && (
                  <span className="block truncate text-[0.62rem] text-muted-foreground">{step.hint}</span>
                )}
              </span>
            </div>
            {index < steps.length - 1 && (
              <span
                className={cn(
                  "mx-1 hidden h-px w-6 shrink-0 sm:block",
                  done ? "bg-accent" : "bg-border",
                )}
                aria-hidden="true"
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
