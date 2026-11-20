import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { getSettings, type CompanySettings } from "@/lib/settings";
import { getLocale } from "@/lib/i18n/server";
import type { Locale } from "@/lib/i18n/config";

export type TranslationMap = Map<string, string>;

export async function getTranslationMap(
  entity: string,
  locale: Locale,
  ids?: string[],
): Promise<TranslationMap> {
  if (locale === "en") return new Map();
  const rows = await prisma.translation.findMany({
    where: {
      entity,
      locale,
      ...(ids && ids.length ? { entityId: { in: ids } } : {}),
    },
    select: { entityId: true, field: true, value: true },
  });
  const map: TranslationMap = new Map();
  for (const row of rows) map.set(`${row.entityId}:${row.field}`, row.value);
  return map;
}

export function tr(map: TranslationMap, id: string, field: string, fallback: string | null | undefined) {
  return map.get(`${id}:${field}`) || fallback || "";
}

export async function withTranslations<T extends { id: string }>(
  entity: string,
  rows: T[],
  locale: Locale,
  fields: string[],
): Promise<T[]> {
  if (locale === "en" || rows.length === 0) return rows;
  const map = await getTranslationMap(entity, locale, rows.map((row) => row.id));
  if (map.size === 0) return rows;
  return rows.map((row) => {
    const next: Record<string, unknown> = { ...row };
    for (const field of fields) {
      const value = map.get(`${row.id}:${field}`);
      if (value) next[field] = value;
    }
    return next as T;
  });
}

type Categorised = { category: { id: string; name: string } | null };

export async function localizeCategoryNames<T extends Categorised>(
  entity: "serviceCategory" | "projectCategory" | "blogCategory",
  rows: T[],
  locale: Locale,
): Promise<T[]> {
  if (locale === "en") return rows;
  const categories = new Map<string, { id: string; name: string }>();
  for (const row of rows) {
    if (row.category) categories.set(row.category.id, row.category);
  }
  if (categories.size === 0) return rows;
  const localized = await withTranslations(entity, [...categories.values()], locale, ["name"]);
  const names = new Map(localized.map((category) => [category.id, category.name]));
  return rows.map((row) =>
    row.category
      ? { ...row, category: { ...row.category, name: names.get(row.category.id) || row.category.name } }
      : row,
  );
}

export const getLocalizedSettings = cache(async (): Promise<CompanySettings> => {
  const [base, locale] = await Promise.all([getSettings(), getLocale()]);
  if (locale === "en") return base;
  const rows = await prisma.translation.findMany({
    where: { entity: "setting", locale },
    select: { entityId: true, value: true },
  });
  if (!rows.length) return base;
  const values: Record<string, string> = { ...base };
  for (const row of rows) {
    if (row.entityId in values && row.value) values[row.entityId] = row.value;
  }
  return values as CompanySettings;
});
