import Link from "next/link";
import { Check, Clock, Mail, Phone } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { buildMetadata } from "@/lib/seo";
import { getLocale } from "@/lib/i18n/server";
import { getLocalizedSettings, withTranslations } from "@/lib/i18n/content";
import { getDictionary } from "@/lib/i18n/dictionary";
import { PageHero } from "@/components/public/page-hero";
import { QuoteForm } from "./quote-form";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  return buildMetadata({
    title: t.requestQuote,
    description: t.quoteHeroDesc,
    path: "/quote",
  });
}

export default async function QuotePage() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const expected = [t.expectedStep1, t.expectedStep2, t.expectedStep3];
  const inclusions = [t.include1, t.include2, t.include3, t.include4];

  const [settings, servicesRaw] = await Promise.all([
    getLocalizedSettings(),
    prisma.service.findMany({
      where: { isPublished: true, deletedAt: null },
      orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }],
      select: { id: true, title: true },
    }),
  ]);

  const services = await withTranslations("service", servicesRaw, locale, ["title"]);

  const projectTypes = [...new Set(services.map((service) => service.title))].slice(0, 10);

  return (
    <>
      <PageHero
        eyebrow={t.startProject}
        title={t.requestQuote}
        description={t.quoteHeroDesc}
        breadcrumb={[{ label: t.requestQuote }]}
        homeLabel={t.home}
        compact
      />

      <section className="container-x py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
          <div className="border border-border/80 bg-card p-6 sm:p-8">
            <h2 className="font-display text-2xl text-primary">{t.projectBrief}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t.briefNote}
            </p>
            <div className="mt-6">
              <QuoteForm projectTypes={projectTypes} locale={locale} />
            </div>
          </div>

          <aside className="space-y-5">
            <div className="border border-border/80 bg-card p-6">
              <h2 className="font-display text-xl text-primary">{t.whatHappensNext}</h2>
              <ol className="mt-4 space-y-4">
                {expected.map((item, index) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-accent/15 text-[0.65rem] font-semibold text-accent">
                      {index + 1}
                    </span>
                    <span className="text-sm leading-relaxed text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="border border-border/80 bg-primary p-6 text-white">
              <h2 className="font-display text-xl text-white">{t.preferToTalk}</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/55">
                {t.preferTalkDesc}
              </p>
              <ul className="mt-5 space-y-3 text-sm">
                {settings.email && (
                  <li>
                    <a href={`mailto:${settings.email}`} className="flex items-center gap-2.5 text-white/70 hover:text-white">
                      <Mail className="size-4 text-accent" /> {settings.email}
                    </a>
                  </li>
                )}
                {settings.phone && (
                  <li>
                    <a href={`tel:${settings.phone.replace(/\s+/g, "")}`} className="flex items-center gap-2.5 text-white/70 hover:text-white">
                      <Phone className="size-4 text-accent" /> {settings.phone}
                    </a>
                  </li>
                )}
                {settings.workingHours && (
                  <li className="flex items-start gap-2.5 text-white/55">
                    <Clock className="mt-0.5 size-4 shrink-0 text-accent" />
                    <span className="whitespace-pre-line">{settings.workingHours}</span>
                  </li>
                )}
              </ul>
              <Link
                href="/contact"
                className="mt-5 inline-flex w-full items-center justify-center border border-white/25 px-5 py-3 text-[0.7rem] font-semibold tracking-[0.12em] text-white uppercase hover:border-white hover:bg-white/5"
              >
                {t.contactStudio}
              </Link>
            </div>

            <div className="border border-border/80 bg-card p-6">
              <h2 className="flex items-center gap-2 font-display text-lg text-primary">
                <Check className="size-4 text-accent" /> {t.usefulToInclude}
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {inclusions.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1.5 size-1 shrink-0 rounded-full bg-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
