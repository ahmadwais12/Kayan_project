"use client";

import { useActionState, useEffect, useRef } from "react";
import { ArrowRight, Check } from "lucide-react";
import { subscribeNewsletter } from "@/actions/public";
import { initialPublicFormState } from "@/lib/public-forms";
import { cn } from "@/lib/utils";
import { getDictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/config";

export function NewsletterForm({
  variant = "light",
  locale = "en",
}: {
  variant?: "light" | "dark";
  locale?: Locale;
}) {
  const t = getDictionary(locale);
  const [state, formAction, pending] = useActionState(subscribeNewsletter, initialPublicFormState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state.status]);

  if (state.status === "success") {
    return (
      <p className={cn("flex items-start gap-2 text-sm", variant === "dark" ? "text-white/70" : "text-muted-foreground")}>
        <Check className="mt-0.5 size-4 shrink-0 text-accent" />
        {state.message}
      </p>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-2">
      <div className="hidden" aria-hidden="true">
        <label htmlFor="newsletter-company">Company</label>
        <input id="newsletter-company" name="company" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="flex">
        <label htmlFor="newsletter-email" className="sr-only">
          {t.emailAddress}
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          maxLength={190}
          placeholder={t.emailPlaceholder}
          className={cn(
            "h-11 min-w-0 flex-1 border px-3 text-sm outline-none transition-colors",
            variant === "dark"
              ? "border-white/20 bg-transparent text-white placeholder:text-white/40 focus:border-accent"
              : "border-input bg-card text-foreground placeholder:text-muted-foreground/70 focus:border-accent",
          )}
        />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 shrink-0 items-center gap-2 bg-accent px-4 text-[0.7rem] font-semibold tracking-[0.1em] text-primary uppercase transition-colors hover:bg-accent/85 disabled:opacity-60"
        >
          {pending ? t.subscribing : t.subscribe}
          {!pending && <ArrowRight className="size-3.5 rtl:rotate-180" />}
        </button>
      </div>
      {state.status === "error" && (
        <p className={cn("text-xs", variant === "dark" ? "text-accent" : "text-destructive")}>{state.message}</p>
      )}
      <p className={cn("text-[0.68rem] leading-relaxed", variant === "dark" ? "text-white/40" : "text-muted-foreground")}>
        {t.subscribeNote}
      </p>
    </form>
  );
}
