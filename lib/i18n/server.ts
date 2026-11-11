import { cookies } from "next/headers";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, THEME_COOKIE, type Locale, type Theme } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionary";

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export async function getTheme(): Promise<Theme> {
  const store = await cookies();
  return store.get(THEME_COOKIE)?.value === "dark" ? "dark" : "light";
}

export async function getTranslations() {
  const locale = await getLocale();
  return { locale, t: getDictionary(locale) };
}
