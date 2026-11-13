import Link from "next/link";
import { Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { buildMetadata, JsonLd } from "@/lib/seo";
import { getLocale } from "@/lib/i18n/server";
import { withTranslations } from "@/lib/i18n/content";
import { getDictionary } from "@/lib/i18n/dictionary";
import { PageHero } from "@/components/public/page-hero";
import { FaqList } from "@/components/public/faq-list";
import { CtaBand } from "@/components/public/cta-band";
import { EmptyState } from "@/components/public/empty-state";
import { Button } from "@/components/ui/button";
import { Input, NativeSelect } from "@/components/ui/input";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const section = await prisma.homepageSection.findUnique({ where: { key: "faq" } });
  const [localized] = section
    ? await withTranslations("homepage", [section], locale, ["title", "subtitle", "description"])
    : [];
  return buildMetadata({
    title: localized?.title || t.faqTitleLong,
    description: localized?.description || t.faqHeroDesc,
    path: "/faq",
  });
}

export default async function FaqPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const query = await searchParams;
  const locale = await getLocale();
  const t = getDictionary(locale);
  const q = (query.q || "").trim();
  const categoryFilter = (query.category || "").trim();

  const [categories, faqs, ctaRaw, introRaw] = await Promise.all([
    prisma.faqCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        _count: { select: { faqs: { where: { isActive: true } } } },
      },
    }),
    prisma.fAQ.findMany({
      where: {
        isActive: true,
        ...(categoryFilter ? { categoryId: categoryFilter } : {}),
        ...(q
          ? {
              OR: [
                { question: { contains: q } },
                { answer: { contains: q } },
              ],
            }
          : {}),
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      include: { category: true },
    }),
    prisma.homepageSection.findUnique({ where: { key: "cta" } }),
    prisma.homepageSection.findUnique({ where: { key: "faq" } }),
  ]);

  const [ctaRows, localizedCategories, localizedFaqs, introRows] = await Promise.all([
    ctaRaw
      ? withTranslations("homepage", [ctaRaw], locale, ["title", "subtitle", "description", "buttonLabel", "secondaryLabel"])
      : Promise.resolve([]),
    withTranslations("faqCategory", categories, locale, ["name"]),
    withTranslations("faq", faqs, locale, ["question", "answer"]),
    introRaw
      ? withTranslations("homepage", [introRaw], locale, ["title", "subtitle", "description"])
      : Promise.resolve([]),
  ]);
  const cta = ctaRows[0] || null;
  const intro = introRows[0] || null;
  const categoryNames = new Map(localizedCategories.map((category) => [category.id, category.name]));

  const visibleCategories = localizedCategories.filter((category) => category._count.faqs > 0);
  const uncategorised = localizedFaqs.filter((faq) => !faq.categoryId);

  const groups = visibleCategories
    .map((category) => ({
      id: category.id,
      name: category.name,
      items: localizedFaqs.filter((faq) => faq.categoryId === category.id),
    }))
    .filter((group) => group.items.length > 0);

  const filtered = Boolean(q || categoryFilter);

  return (
    <>
      {localizedFaqs.length > 0 && !filtered && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: localizedFaqs.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: { "@type": "Answer", text: faq.answer },
            })),
          }}
        />
      )}

      <PageHero
        eyebrow={intro?.subtitle || t.help}
        title={intro?.title || t.faqTitleLong}
        description={intro?.description || t.faqHeroDesc}
        breadcrumb={[{ label: intro?.title || t.faq }]}
        homeLabel={t.home}
        compact
      />

      <section className="container-x pt-12">
        <form method="get" className="flex flex-col gap-3 border border-border/70 bg-card p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="q"
              defaultValue={q}
              placeholder={t.searchQuestions}
              aria-label={t.searchQuestions}
              className="ps-9"
            />
          </div>
          <NativeSelect name="category" defaultValue={categoryFilter} aria-label={t.allCategories} className="sm:w-56">
            <option value="">{t.allCategories}</option>
            {visibleCategories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </NativeSelect>
          <Button type="submit">{t.search}</Button>
          {filtered && (
            <Button asChild variant="outline">
              <Link href="/faq">{t.clear}</Link>
            </Button>
          )}
        </form>
        {filtered && (
          <p className="mt-3 text-sm text-muted-foreground">
            {localizedFaqs.length} {localizedFaqs.length === 1 ? t.answerFound : t.answersFound}
            {q ? ` — “${q}”` : ""}
            {categoryFilter ? ` ${t.inCategory} ${categoryNames.get(categoryFilter) || t.thisCategory}` : ""}.
          </p>
        )}
      </section>

      <section className="container-x py-16 lg:py-20">
        {localizedFaqs.length > 0 ? (
          <div className="grid gap-12 lg:grid-cols-[0.35fr_1fr] lg:gap-16">
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <p className="text-[0.65rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">{t.onThisPage}</p>
              <ul className="mt-4 space-y-2 text-sm">
                {groups.map((group) => (
                  <li key={group.id}>
                    <a href={`#faq-${group.id}`} className="text-muted-foreground hover:text-primary">
                      {group.name}
                    </a>
                  </li>
                ))}
                {uncategorised.length > 0 && (
                  <li>
                    <a href="#faq-general" className="text-muted-foreground hover:text-primary">
                      {t.general}
                    </a>
                  </li>
                )}
              </ul>
              <div className="mt-8 border border-border/70 bg-card p-5">
                <p className="text-sm font-medium text-primary">{t.stillQuestion}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {t.stillQuestionDesc}
                </p>
                <Link
                  href="/contact"
                  className="mt-3 inline-flex w-full items-center justify-center border border-primary/25 px-4 py-2.5 text-[0.68rem] font-semibold tracking-[0.1em] text-primary uppercase hover:border-primary"
                >
                  {t.contactUs}
                </Link>
              </div>
            </aside>

            <div className="space-y-12">
              {groups.map((group) => (
                <div key={group.id} id={`faq-${group.id}`} className="scroll-mt-28">
                  <h2 className="mb-4 font-display text-2xl text-primary">{group.name}</h2>
                  <FaqList items={group.items.map((faq) => ({ id: faq.id, question: faq.question, answer: faq.answer }))} />
                </div>
              ))}
              {uncategorised.length > 0 && (
                <div id="faq-general" className="scroll-mt-28">
                  <h2 className="mb-4 font-display text-2xl text-primary">{t.general}</h2>
                  <FaqList items={uncategorised.map((faq) => ({ id: faq.id, question: faq.question, answer: faq.answer }))} />
                </div>
              )}
            </div>
          </div>
        ) : (
          <EmptyState
            title={filtered ? t.noMatchingQuestions : t.questionsEmptyTitle}
            description={filtered ? t.emptyFilterDesc : t.questionsEmptyDesc}
            action={
              filtered ? (
                <Button asChild variant="outline">
                  <Link href="/faq">{t.clearSearch}</Link>
                </Button>
              ) : undefined
            }
          />
        )}
      </section>

      <CtaBand
        eyebrow={cta?.subtitle}
        title={cta?.title}
        description={cta?.description}
        buttonLabel={cta?.buttonLabel}
        buttonUrl={cta?.buttonUrl}
        secondaryLabel={cta?.secondaryLabel}
        secondaryUrl={cta?.secondaryUrl}
        locale={locale}
      />
    </>
  );
}
