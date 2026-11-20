import { prisma } from "@/lib/prisma";

export type FormTranslations = Partial<Record<"fa" | "ps", Record<string, string>>>;

const LOCALES = ["fa", "ps"] as const;

export async function loadFormTranslations(
  entity: string,
  entityId: string,
  fields: string[],
): Promise<FormTranslations> {
  const rows = await prisma.translation.findMany({
    where: { entity, entityId, locale: { in: [...LOCALES] }, field: { in: fields } },
    select: { locale: true, field: true, value: true },
  });
  const result: FormTranslations = { fa: {}, ps: {} };
  for (const row of rows) {
    if (row.locale === "fa" || row.locale === "ps") {
      result[row.locale]![row.field] = row.value;
    }
  }
  return result;
}

export async function loadKeyedTranslations(
  entity: string,
  keys: string[],
  field = "value",
): Promise<FormTranslations> {
  if (keys.length === 0) return { fa: {}, ps: {} };
  const rows = await prisma.translation.findMany({
    where: { entity, locale: { in: [...LOCALES] }, field, entityId: { in: keys } },
    select: { locale: true, entityId: true, value: true },
  });
  const result: FormTranslations = { fa: {}, ps: {} };
  for (const row of rows) {
    if (row.locale === "fa" || row.locale === "ps") {
      result[row.locale]![row.entityId] = row.value;
    }
  }
  return result;
}

export async function saveKeyedTranslations(
  formData: FormData,
  entity: string,
  keys: string[],
  { prefix = "", field = "value" }: { prefix?: string; field?: string } = {},
) {
  for (const locale of LOCALES) {
    for (const key of keys) {
      const inputName = `${prefix}${key}__${locale}`;
      if (!formData.has(inputName)) continue;
      const raw = formData.get(inputName);
      if (typeof raw !== "string") continue;
      const value = raw.trim().slice(0, 20000);

      if (!value) {
        await prisma.translation.deleteMany({ where: { locale, entity, entityId: key, field } });
        continue;
      }

      await prisma.translation.upsert({
        where: { locale_entity_entityId_field: { locale, entity, entityId: key, field } },
        update: { value },
        create: { locale, entity, entityId: key, field, value },
      });
    }
  }
}

export async function saveFormTranslations(
  entity: string,
  entityId: string,
  formData: FormData,
  fields: string[],
) {
  for (const locale of LOCALES) {
    for (const field of fields) {
      const inputName = `${field}__${locale}`;
      if (!formData.has(inputName)) continue;
      const raw = formData.get(inputName);
      if (typeof raw !== "string") continue;
      const value = raw.trim().slice(0, 20000);

      if (!value) {
        await prisma.translation.deleteMany({ where: { locale, entity, entityId, field } });
        continue;
      }

      await prisma.translation.upsert({
        where: { locale_entity_entityId_field: { locale, entity, entityId, field } },
        update: { value },
        create: { locale, entity, entityId, field, value },
      });
    }
  }
}
