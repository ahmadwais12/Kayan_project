import Link from "next/link";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { buildMetadata } from "@/lib/seo";
import { getLocale } from "@/lib/i18n/server";
import { getLocalizedSettings, withTranslations } from "@/lib/i18n/content";
import { getDictionary } from "@/lib/i18n/dictionary";
import { PageHero } from "@/components/public/page-hero";
import { SocialIcon } from "@/components/public/social-icon";
import { ContactForm } from "./contact-form";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const section = await prisma.homepageSection.findUnique({ where: { key: "contact" } });
  const [localized] = section
    ? await withTranslations("homepage", [section], locale, ["title", "subtitle", "description"])
    : [];
  return buildMetadata({
    title: localized?.title || t.contactStudio,
    description: localized?.description || t.contactHeroDesc,
    path: "/contact",
  });
}

export default async function ContactPage() {
  const locale = await getLocale();
  const t = getDictionary(locale);

  const [settings, socials, introRaw] = await Promise.all([
    getLocalizedSettings(),
    prisma.socialLink.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.homepageSection.findUnique({ where: { key: "contact" } }),
  ]);

  const introRows = introRaw
    ? await withTranslations("homepage", [introRaw], locale, ["title", "subtitle", "description"])
    : [];
  const intro = introRows[0] || null;

  const details = [
    settings.address && { icon: MapPin, label: t.studioLabel, value: settings.address, href: undefined },
    settings.email && { icon: Mail, label: t.emailLabel, value: settings.email, href: `mailto:${settings.email}` },
    settings.phone && {
      icon: Phone,
      label: t.phoneLabel,
      value: settings.phone,
      href: `tel:${settings.phone.replace(/\s+/g, "")}`,
    },
    settings.whatsapp && {
      icon: MessageCircle,
      label: t.whatsappLabel,
      value: settings.whatsapp,
      href: `https://wa.me/${settings.whatsapp.replace(/[^\d]/g, "")}`,
    },
    settings.workingHours && { icon: Clock, label: t.hoursLabel, value: settings.workingHours, href: undefined },
  ].filter(Boolean) as { icon: typeof Mail; label: string; value: string; href: string | undefined }[];

  const mapUrl =
    settings.mapEmbedUrl && /^https?:\/\//i.test(settings.mapEmbedUrl) ? settings.mapEmbedUrl : null;

  return (
    <>
      <PageHero
        eyebrow={intro?.subtitle || t.getInTouch}
        title={intro?.title || t.contactStudio}
        description={intro?.description || t.contactHeroDesc}
        breadcrumb={[{ label: intro?.title || t.contactLabel }]}
        homeLabel={t.home}
        compact
      />

      <section className="container-x py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.25fr] lg:gap-16">
          <div>
            <p className="eyebrow">{t.theStudio}</p>
            <h2 className="mt-3 text-[clamp(1.7rem,3vw,2.3rem)] leading-tight text-primary">
              {settings.siteLegalName || settings.siteName}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{settings.siteDescription}</p>

            {details.length > 0 ? (
              <ul className="mt-8 space-y-5">
                {details.map((item) => (
                  <li key={item.label} className="flex items-start gap-4">
                    <span className="grid size-10 shrink-0 place-items-center border border-border bg-card text-accent">
                      <item.icon className="size-4" />
                    </span>
                    <div>
                      <p className="text-[0.6rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                        {item.label}
                      </p>
                      {item.href ? (
                        <a
                          href={item.href}
                          target={item.href.startsWith("http") ? "_blank" : undefined}
                          rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                          className="mt-0.5 block whitespace-pre-line text-sm text-primary hover:text-accent"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="mt-0.5 whitespace-pre-line text-sm text-primary">{item.value}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-8 border border-dashed border-border/80 bg-card/60 p-4 text-sm text-muted-foreground">
                {t.contactEmpty}
              </p>
            )}

            {socials.length > 0 && (
              <div className="mt-8 flex items-center gap-2">
                {socials.map((social) => (
                  <a
                    key={social.id}
                    href={social.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={social.label || social.platform}
                    className="grid size-10 place-items-center border border-border bg-card text-muted-foreground hover:border-accent hover:text-accent"
                  >
                    <SocialIcon platform={social.platform} />
                  </a>
                ))}
              </div>
            )}

            <div className="mt-8 border-t border-border/70 pt-6">
              <p className="text-sm text-muted-foreground">
                {t.haveBrief}{" "}
                <Link href="/quote" className="font-medium text-accent hover:underline">
                  {t.requestQuote}
                </Link>
                .
              </p>
            </div>
          </div>

          <div className="border border-border/80 bg-card p-6 sm:p-8">
            <h2 className="font-display text-2xl text-primary">{t.messageTitle}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t.messageNote}
            </p>
            <div className="mt-6">
              <ContactForm locale={locale} />
            </div>
          </div>
        </div>

        {mapUrl && (
          <div className="mt-14 overflow-hidden border border-border/80">
            <iframe
              src={mapUrl}
              title={t.mapTitle}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-[380px] w-full"
            />
          </div>
        )}
      </section>
    </>
  );
}
