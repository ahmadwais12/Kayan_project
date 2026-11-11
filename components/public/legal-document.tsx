import Link from "next/link";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getLocale } from "@/lib/i18n/server";
import { withTranslations } from "@/lib/i18n/content";
import { getDictionary } from "@/lib/i18n/dictionary";
import { PageHero } from "@/components/public/page-hero";
import { Markdown } from "@/components/public/markdown";
import { EmptyState } from "@/components/public/empty-state";

export async function LegalDocument({
  sectionKey,
  fallbackTitle,
  currentPath,
}: {
  sectionKey: "privacy" | "terms";
  fallbackTitle: string;
  currentPath: "/privacy" | "/terms";
}) {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const sectionRaw = await prisma.homepageSection.findUnique({ where: { key: sectionKey } });
  const sectionRows = sectionRaw
    ? await withTranslations("homepage", [sectionRaw], locale, ["title", "subtitle", "description"])
    : [];
  const section = sectionRows[0] || null;

  const defaultTitle = sectionKey === "privacy" ? t.privacyTitle : t.termsTitle;
  const title = section?.title || fallbackTitle || defaultTitle;
  const other =
    currentPath === "/privacy"
      ? { label: t.termsTitle, href: "/terms" }
      : { label: t.privacyTitle, href: "/privacy" };

  return (
    <>
      <PageHero
        eyebrow={t.legal}
        title={title}
        description={section?.subtitle || undefined}
        breadcrumb={[{ label: title }]}
        homeLabel={t.home}
        compact
      />

      <section className="container-x py-16 lg:py-20">
        {section?.description ? (
          <div className="grid gap-12 lg:grid-cols-[1fr_0.32fr] lg:gap-16">
            <article className="max-w-3xl">
              <Markdown content={section.description} />
            </article>

            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="border border-border/70 bg-card p-6">
                <span className="grid size-10 place-items-center rounded-full bg-secondary text-primary">
                  <ShieldCheck className="size-4" />
                </span>
                <p className="mt-4 text-sm font-medium text-primary">{t.questionsAboutPage}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {t.legalContactDesc}
                </p>
                <Link
                  href="/contact"
                  className="mt-4 inline-flex items-center gap-1.5 text-[0.68rem] font-semibold tracking-[0.1em] text-primary uppercase hover:text-accent"
                >
                  {t.contactUs} <ArrowUpRight className="size-3.5 rtl:rotate-90" />
                </Link>
              </div>

              <Link
                href={other.href}
                className="mt-4 flex items-center justify-between border border-border/70 px-6 py-5 text-sm text-primary transition-colors hover:border-primary/40"
              >
                {other.label}
                <ArrowUpRight className="size-4 rtl:rotate-90" />
              </Link>
            </aside>
          </div>
        ) : (
          <EmptyState
            title={`${title} ${t.beingPrepared}`}
            description={t.legalEmptyDesc}
            action={
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-accent"
              >
                {t.contactStudio} <ArrowUpRight className="size-4 rtl:rotate-90" />
              </Link>
            }
          />
        )}
      </section>
    </>
  );
}
