export const LOCALES = ["en", "fa", "ps"] as const;

export type Locale = (typeof LOCALES)[number];

export const LOCALE_COOKIE = "kayan_locale";
export const THEME_COOKIE = "kayan_theme";

export type Theme = "light" | "dark";

export const LOCALE_META: Record<
  Locale,
  { label: string; native: string; short: string; dir: "ltr" | "rtl"; htmlLang: string }
> = {
  en: { label: "English", native: "English", short: "EN", dir: "ltr", htmlLang: "en" },
  fa: { label: "Dari", native: "دری", short: "دری", dir: "rtl", htmlLang: "fa-AF" },
  ps: { label: "Pashto", native: "پښتو", short: "پښتو", dir: "rtl", htmlLang: "ps" },
};

export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: string | null | undefined): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

export function isRtl(locale: Locale) {
  return LOCALE_META[locale].dir === "rtl";
}

export function localeDir(locale: Locale) {
  return LOCALE_META[locale].dir;
}
