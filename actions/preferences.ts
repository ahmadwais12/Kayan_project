"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  isLocale,
  LOCALE_COOKIE,
  THEME_COOKIE,
  type Locale,
  type Theme,
} from "@/lib/i18n/config";

const MAX_AGE = 60 * 60 * 24 * 365;

export async function setLocale(locale: Locale) {
  if (!isLocale(locale)) return;
  const store = await cookies();
  store.set(LOCALE_COOKIE, locale, { path: "/", maxAge: MAX_AGE, sameSite: "lax" });
  revalidatePath("/", "layout");
}

export async function setTheme(theme: Theme) {
  if (theme !== "light" && theme !== "dark") return;
  const store = await cookies();
  store.set(THEME_COOKIE, theme, { path: "/", maxAge: MAX_AGE, sameSite: "lax" });
  revalidatePath("/", "layout");
}
