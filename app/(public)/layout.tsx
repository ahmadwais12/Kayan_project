import type { Metadata } from "next";
import { getSettings, getSeoSettings } from "@/lib/settings";
import { getNavigationTree, getFooterExtras } from "@/lib/public-nav";
import { getLocale, getTheme } from "@/lib/i18n/server";
import { getLocalizedSettings } from "@/lib/i18n/content";
import { getDictionary } from "@/lib/i18n/dictionary";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import { SplashScreen } from "@/components/public/splash-screen";
import { ScrollReset } from "@/components/public/scroll-reset";
import { BackToTop } from "@/components/public/back-to-top";
import { JsonLd } from "@/lib/seo";
import { toE164 } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    ...(settings.faviconUrl
      ? { icons: { icon: settings.faviconUrl, apple: settings.faviconUrl } }
      : {}),
  };
}

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [locale, theme] = await Promise.all([getLocale(), getTheme()]);
  const [settings, seo, headerNav, footerNav, extras] = await Promise.all([
    getLocalizedSettings(),
    getSeoSettings(),
    getNavigationTree("header", locale),
    getNavigationTree("footer", locale),
    getFooterExtras(locale),
  ]);
  const t = getDictionary(locale);

  const base = seo.canonicalBase || process.env.APP_URL || "http://localhost:3333";
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.siteLegalName || settings.siteName,
    url: base,
    description: settings.siteDescription,
    ...(settings.logoUrl ? { logo: settings.logoUrl.startsWith("http") ? settings.logoUrl : `${base}${settings.logoUrl}` } : {}),
    ...(settings.email ? { email: settings.email } : {}),
    ...(settings.phone ? { telephone: toE164(settings.phone) } : {}),
    ...(extras.socials.length ? { sameAs: extras.socials.map((social) => social.url) } : {}),
    ...(settings.address
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: settings.address,
          },
        }
      : {}),
  };

  return (
    <div className="flex min-h-svh flex-col">
      <SplashScreen siteName={settings.siteName} logoUrl={settings.logoUrl} />
      <ScrollReset />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        {t.skipToContent}
      </a>      <JsonLd data={organization} />
      <SiteHeader
        siteName={settings.siteName}
        logoUrl={settings.logoUrl}
        items={headerNav}
        email={settings.email}
        phone={settings.phone}
        locale={locale}
        theme={theme}
      />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter
        locale={locale}
        settings={{
          siteName: settings.siteName,
          logoUrl: settings.logoUrl,
          footerAbout: settings.footerAbout,
          copyright: settings.copyright,
          email: settings.email,
          phone: settings.phone,
          whatsapp: settings.whatsapp,
          address: settings.address,
          workingHours: settings.workingHours,
        }}
        navigation={footerNav}
        socials={extras.socials}
        services={extras.services}
        newsletterHeading={extras.newsletterHeading}
        newsletterNote={extras.newsletterNote}
      />
      <BackToTop />
    </div>
  );
}
