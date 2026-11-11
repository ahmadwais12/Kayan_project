"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Check, Paperclip, Send, TriangleAlert } from "lucide-react";
import { submitContact } from "@/actions/public";
import { initialPublicFormState } from "@/lib/public-forms";
import { getDictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/config";

const inputClass =
  "h-11 w-full border border-input bg-card px-3.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-accent";
const labelClass = "mb-1.5 block text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-foreground/70";

export function ContactForm({ locale = "en" }: { locale?: Locale }) {
  const t = getDictionary(locale);
  const [state, formAction, pending] = useActionState(submitContact, initialPublicFormState);

  if (state.status === "success") {
    return (
      <div className="flex h-full flex-col items-start justify-center border border-accent/30 bg-card p-8">
        <span className="grid size-12 place-items-center rounded-full bg-accent/15 text-accent">
          <Check className="size-6" />
        </span>
        <h2 className="mt-5 font-display text-2xl text-primary">{t.messageReceived}</h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">{state.message}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/projects"
            className="inline-flex items-center bg-primary px-5 py-3 text-[0.7rem] font-semibold tracking-[0.12em] text-white uppercase hover:bg-primary/90"
          >
            {t.exploreProjects}
          </Link>
          <Link
            href="/"
            className="inline-flex items-center border border-primary/25 px-5 py-3 text-[0.7rem] font-semibold tracking-[0.12em] text-primary uppercase hover:border-primary"
          >
            {t.backHome}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="hidden" aria-hidden="true">
        <label htmlFor="contact-company">Company</label>
        <input id="contact-company" name="company" tabIndex={-1} autoComplete="off" />
      </div>

      {state.status === "error" && (
        <div className="flex items-start gap-2.5 border border-destructive/25 bg-destructive/8 px-4 py-3 text-sm text-destructive">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          <span>{state.message}</span>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className={labelClass}>{t.fullName} *</label>
          <input id="contact-name" name="name" required maxLength={120} autoComplete="name" className={inputClass} />
        </div>
        <div>
          <label htmlFor="contact-email" className={labelClass}>{t.emailAddress} *</label>
          <input id="contact-email" name="email" type="email" required maxLength={190} autoComplete="email" className={inputClass} />
        </div>
        <div>
          <label htmlFor="contact-phone" className={labelClass}>{t.phoneField}</label>
          <input id="contact-phone" name="phone" maxLength={40} autoComplete="tel" className={inputClass} />
        </div>
        <div>
          <label htmlFor="contact-subject" className={labelClass}>{t.subject} *</label>
          <input id="contact-subject" name="subject" required maxLength={180} className={inputClass} />
        </div>
      </div>

      <div>
        <label htmlFor="contact-message" className={labelClass}>{t.message} *</label>
        <textarea
          id="contact-message"
          name="message"
          required
          minLength={10}
          maxLength={5000}
          rows={6}
          placeholder={t.messagePlaceholder}
          className="w-full resize-y border border-input bg-card px-3.5 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-accent"
        />
      </div>

      <div>
        <label htmlFor="contact-attachments" className={labelClass}>
          <span className="flex items-center gap-1.5"><Paperclip className="size-3" /> {t.attachments}</span>
        </label>
        <input
          id="contact-attachments"
          name="attachments"
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
          className="block w-full text-xs text-muted-foreground file:me-3 file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-xs file:font-medium file:text-primary"
        />
        <p className="mt-1.5 text-[0.68rem] text-muted-foreground">
          {t.attachmentNote}
        </p>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 bg-primary px-6 py-3.5 text-[0.72rem] font-semibold tracking-[0.14em] text-white uppercase transition-colors hover:bg-accent hover:text-primary disabled:opacity-60"
      >
        {pending ? t.sending : t.sendMessage} {!pending && <Send className="size-3.5 rtl:rotate-180" />}
      </button>
      <p className="text-[0.68rem] leading-relaxed text-muted-foreground">
        {t.formPrivacy}
      </p>
    </form>
  );
}
