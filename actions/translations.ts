"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/auth/guards";
import { logAudit } from "@/lib/audit";
import { field, redirectWith } from "@/lib/form-helpers";
import { TRANSLATABLE } from "@/lib/i18n/content";
import { isLocale, type Locale } from "@/lib/i18n/config";

const PAGE = "/admin/translations";

export async function saveTranslations(formData: FormData) {
  const gate = await authorize("content.manage");
  if (gate.error || !gate.session) {
    redirect(redirectWith(PAGE, "error", gate.error || "Unauthorized"));
  }

  const entity = field(formData, "entity");
  const locale = field(formData, "locale") as Locale;
  const config = TRANSLATABLE[entity];
  if (!config || !isLocale(locale) || locale === "en") {
    redirect(redirectWith(PAGE, "error", "Choose a target language first"));
  }

  const validFields = new Set(config.fields.map((item) => item.key));
  let saved = 0;
  let cleared = 0;

  for (const [name, raw] of formData.entries()) {
    if (!name.startsWith("v:") || typeof raw !== "string") continue;
    const rest = name.slice(2);
    const separator = rest.lastIndexOf(":");
    if (separator < 1) continue;
    const entityId = rest.slice(0, separator);
    const fieldName = rest.slice(separator + 1);
    if (!entityId || !validFields.has(fieldName)) continue;

    const value = raw.trim().slice(0, 20000);
    const where = {
      locale_entity_entityId_field: { locale, entity, entityId, field: fieldName },
    };

    if (!value) {
      await prisma.translation.deleteMany({ where: { locale, entity, entityId, field: fieldName } });
      cleared += 1;
      continue;
    }

    await prisma.translation.upsert({
      where,
      update: { value },
      create: { locale, entity, entityId, field: fieldName, value },
    });
    saved += 1;
  }

  await logAudit({
    userId: gate.session.user.id,
    action: "translation.save",
    entity: "Translation",
    entityId: entity,
    meta: { entity, locale, saved, cleared },
  });

  revalidatePath("/", "layout");
  redirect(`${PAGE}?entity=${entity}&locale=${locale}&saved=1`);
}
