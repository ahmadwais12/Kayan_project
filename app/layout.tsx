import type { Metadata } from "next";
import { Manrope, Playfair_Display } from "next/font/google";
import { Toaster } from "sonner";
import { getSettings, getSeoSettings } from "@/lib/settings";
import { getLocale, getTheme } from "@/lib/i18n/server";
import { LOCALE_META } from "@/lib/i18n/config";
import { AnalyticsTracker } from "@/components/public/analytics-tracker";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoSettings();
  const base = seo.canonicalBase || process.env.APP_URL || "http://localhost:3333";
  return {
    metadataBase: new URL(base),
    title: {
      default: seo.siteTitle,
      template: "%s | Kayan Land",
    },
    description: seo.defaultDescription,
    openGraph: {
      title: seo.siteTitle,
      description: seo.defaultDescription,
      siteName: "Kayan Land",
      images: seo.ogImage ? [{ url: seo.ogImage }] : undefined,
      type: "website",
    },
    ...(seo.googleVerification
      ? { verification: { google: seo.googleVerification } }
      : {}),
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [settings, locale, theme] = await Promise.all([getSettings(), getLocale(), getTheme()]);
  const meta = LOCALE_META[locale];

  return (
    <html
      lang={meta.htmlLang}
      dir={meta.dir}
      suppressHydrationWarning
      className={`${manrope.variable} ${playfair.variable} h-full${theme === "dark" ? " dark" : ""}`}
      style={
        {
          "--primary": settings.primaryColor,
          "--brand-primary": settings.primaryColor,
          "--ink": settings.primaryColor,
          "--brand-secondary": settings.secondaryColor,
          "--brand-accent": settings.accentColor,
          "--accent": settings.accentColor,
          "--brand-background": settings.backgroundColor,
          "--background": settings.backgroundColor,
          "--brand-muted": settings.mutedColor,
          "--muted": settings.mutedColor,
          "--brand-white": settings.whiteColor,
          "--card": settings.whiteColor,
        } as React.CSSProperties
      }
    >
      <body className="flex min-h-full flex-col">
        {children}
        <Toaster position="top-right" richColors closeButton />
        <AnalyticsTracker />
      </body>
    </html>
  );
}
