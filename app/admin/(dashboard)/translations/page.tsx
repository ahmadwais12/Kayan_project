import Link from "next/link";
import { Languages } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { SubmitButton } from "@/components/admin/form-kit";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { saveTranslations } from "@/actions/translations";
import { loadTranslationSources, TRANSLATABLE } from "@/lib/i18n/content";
import { LOCALE_META, type Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const ENTITY_KEYS = Object.keys(TRANSLATABLE);

export default async function TranslationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePermission("content.manage");
  const query = await searchParams;

  const entity = query.entity && TRANSLATABLE[query.entity] ? query.entity : "setting";
  const locale: Locale = query.locale === "ps" ? "ps" : "fa";
  const config = TRANSLATABLE[entity];

  const [sources, rows] = await Promise.all([
    loadTranslationSources(entity),
    prisma.translation.findMany({ where: { entity, locale } }),
  ]);

  const existing = new Map(rows.map((row) => [`${row.entityId}:${row.field}`, row.value]));
  const filled = sources.filter((source) =>
    Object.keys(source.values).some((key) => existing.get(`${source.id}:${key}`)),
  ).length;

  return (
    <div>
      <PageHeader
        title="Translations"
        description="Store Dari and Pashto copy for the core website content. Anything left empty falls back to the English value."
        breadcrumb={[{ label: "Translations" }]}
      />

      <AdminFlash {...flashFromQuery(query)} />

      <div className="mb-5 flex flex-wrap gap-1.5">
        {ENTITY_KEYS.map((key) => (
          <Button
            key={key}
            asChild
            size="sm"
            variant={key === entity ? "default" : "outline"}
          >
            <Link href={`/admin/translations?entity=${key}&locale=${locale}`}>
              {TRANSLATABLE[key].label}
            </Link>
          </Button>
        ))}
      </div>

      <Card className="mb-5">
        <CardContent className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-secondary text-primary">
              <Languages className="size-4.5" />
            </span>
            <div>
              <p className="text-sm font-medium text-primary">{config.label}</p>
              <p className="text-xs text-muted-foreground">{config.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {(["fa", "ps"] as const).map((item) => (
              <Link
                key={item}
                href={`/admin/translations?entity=${entity}&locale=${item}`}
                dir={LOCALE_META[item].dir}
                className={cn(
                  "rounded-md border px-3 py-2 text-sm transition-colors",
                  item === locale
                    ? "border-primary bg-primary text-white"
                    : "border-border text-muted-foreground hover:border-primary/40 hover:text-primary",
                )}
              >
                {LOCALE_META[item].native}
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <p className="mb-4 text-xs text-muted-foreground">
        {filled} of {sources.length} entries translated into {LOCALE_META[locale].label}. English stays the source of truth.
      </p>

      {sources.length === 0 ? (
        <Card className="px-6 py-14 text-center text-sm text-muted-foreground">
          Nothing to translate here yet. Add content in the matching module first.
        </Card>
      ) : (
        <form action={saveTranslations} className="space-y-4">
          <input type="hidden" name="entity" value={entity} />
          <input type="hidden" name="locale" value={locale} />

          {sources.map((source) => (
            <Card key={source.id}>
              <CardHeader className="space-y-1">
                <CardTitle className="text-base" dir="auto">
                  {source.label || source.id}
                </CardTitle>
                {source.hint && (
                  <p className="text-xs text-muted-foreground" dir="ltr">
                    {source.hint}
                  </p>
                )}
              </CardHeader>
              <CardContent className="grid gap-4 lg:grid-cols-2">
                {config.fields.map((field) => {
                  const english = source.values[field.key] || "";
                  const key = `${source.id}:${field.key}`;
                  const value = existing.get(key) || "";
                  const inputId = `t-${entity}-${source.id}-${field.key}`;
                  return (
                    <div key={field.key} className={cn(field.multiline && "lg:col-span-1")}>
                      <div className="mb-1.5 flex items-baseline justify-between gap-3">
                        <Label htmlFor={inputId}>{field.label}</Label>
                        <span className="truncate text-[0.68rem] text-muted-foreground" dir="ltr" title={english}>
                          EN: {english || "—"}
                        </span>
                      </div>
                      {field.multiline ? (
                        <Textarea
                          id={inputId}
                          name={`v:${source.id}:${field.key}`}
                          defaultValue={value}
                          placeholder={english}
                          rows={3}
                          dir={LOCALE_META[locale].dir}
                          maxLength={20000}
                        />
                      ) : (
                        <Input
                          id={inputId}
                          name={`v:${source.id}:${field.key}`}
                          defaultValue={value}
                          placeholder={english}
                          dir={LOCALE_META[locale].dir}
                          maxLength={500}
                        />
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}

          <div className="sticky bottom-4 z-10 flex items-center justify-between gap-4 rounded-xl border border-border bg-card/95 px-4 py-3 shadow-lg backdrop-blur">
            <p className="text-xs text-muted-foreground">
              Saving stores {LOCALE_META[locale].label} only. Empty fields fall back to English.
            </p>
            <SubmitButton>Save translations</SubmitButton>
          </div>
        </form>
      )}
    </div>
  );
}
