import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { SiteLogo } from "@/components/site-logo";
import { NewsletterForm } from "@/components/public/newsletter-form";
import { SocialIcon } from "@/components/public/social-icon";
import { getDictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/config";

type FooterLink = { id: string; label: string; url: string; openInNewTab: boolean };
type SocialLink = { id: string; platform: string; url: string; label: string | null };

export function SiteFooter({
  settings,
  navigation,
  socials,
  services,
  newsletterHeading,
  newsletterNote,
  locale,
}: {
  locale: Locale;
  settings: {
    siteName: string;
    logoUrl: string;
    footerAbout: string;
    copyright: string;
    email: string;
    phone: string;
    whatsapp: string;
    address: string;
    workingHours: string;
  };
  navigation: FooterLink[];
  socials: SocialLink[];
  services: { id: string; title: string; slug: string }[];
  newsletterHeading?: string;
  newsletterNote?: string;
}) {
  const year = new Date().getFullYear();
  const t = getDictionary(locale);

  return (
    <footer className="mt-auto bg-primary text-white">
      <div className="container-x grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_1fr_1.3fr] lg:py-16">
        <div>
          <SiteLogo name={settings.siteName} logoUrl={settings.logoUrl} light />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/55">{settings.footerAbout}</p>
          {socials.length > 0 && (
            <div className="mt-6 flex items-center gap-2">
              {socials.map((social) => (
                <a
                  key={social.id}
                  href={social.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label || social.platform}
                  title={social.platform}
                  className="grid size-9 place-items-center border border-white/15 text-white/60 transition-colors hover:border-accent hover:text-accent"
                >
                  <SocialIcon platform={social.platform} />
                </a>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-[0.65rem] font-semibold tracking-[0.2em] text-accent uppercase">{t.explore}</h3>
          <ul className="mt-4 space-y-2.5">
            {navigation.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.url}
                  target={item.openInNewTab || item.url.startsWith("http") ? "_blank" : undefined}
                  rel={item.openInNewTab ? "noreferrer" : undefined}
                  className="text-sm text-white/55 transition-colors hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-[0.65rem] font-semibold tracking-[0.2em] text-accent uppercase">{t.services}</h3>
          <ul className="mt-4 space-y-2.5">
            {services.length ? (
              services.map((service) => (
                <li key={service.id}>
                  <Link
                    href={`/services/${service.slug}`}
                    className="text-sm text-white/55 transition-colors hover:text-white"
                  >
                    {service.title}
                  </Link>
                </li>
              ))
            ) : (
              <li className="text-sm text-white/40">{t.servicePagesEmpty}</li>
            )}
          </ul>
        </div>

        <div>
          <h3 className="text-[0.65rem] font-semibold tracking-[0.2em] text-accent uppercase">{t.studio}</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-white/55">
            {settings.address && (
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-3.5 shrink-0 text-white/35" />
                <span className="whitespace-pre-line">{settings.address}</span>
              </li>
            )}
            {settings.email && (
              <li>
                <a href={`mailto:${settings.email}`} className="flex items-center gap-2.5 hover:text-white">
                  <Mail className="size-3.5 shrink-0 text-white/35" /> {settings.email}
                </a>
              </li>
            )}
            {settings.phone && (
              <li>
                <a href={`tel:${settings.phone.replace(/\s+/g, "")}`} className="flex items-center gap-2.5 hover:text-white">
                  <Phone className="size-3.5 shrink-0 text-white/35" /> {settings.phone}
                </a>
              </li>
            )}
          </ul>
          <div className="mt-6">
            <h3 className="text-[0.65rem] font-semibold tracking-[0.2em] text-accent uppercase">
              {newsletterHeading || t.studioNotes}
            </h3>
            {newsletterNote && <p className="mt-2 text-xs text-white/45">{newsletterNote}</p>}
            <div className="mt-3">
              <NewsletterForm variant="dark" locale={locale} />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-x flex flex-col gap-2 py-5 text-[0.68rem] text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {settings.copyright || `${settings.siteName}. All rights reserved.`}
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-white/70">{t.privacy}</Link>
            <Link href="/terms" className="hover:text-white/70">{t.terms}</Link>
            <Link href="/faq" className="hover:text-white/70">{t.faq}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
