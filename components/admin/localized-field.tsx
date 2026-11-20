import type { FormTranslations } from "@/lib/i18n/form-translations";
import { Input, Label, Textarea } from "@/components/ui/input";

const LANGUAGES = [
  { code: "en", label: "English", dir: "ltr" },
  { code: "fa", label: "دری", dir: "rtl" },
  { code: "ps", label: "پښتو", dir: "rtl" },
] as const;

export function LocalizedField({
  id,
  label,
  name,
  defaultValue,
  translations,
  multiline,
  required,
  maxLength = 500,
  rows = 4,
  placeholder,
  help,
  className,
  translationKey,
}: {
  id: string;
  label: string;
  name: string;
  defaultValue?: string | null;
  translations?: FormTranslations;
  translationKey?: string;
  multiline?: boolean;
  required?: boolean;
  maxLength?: number;
  rows?: number;
  placeholder?: string;
  help?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label htmlFor={`${id}-en`}>{label}</Label>
      <div className="mt-1.5 grid gap-3 sm:grid-cols-3">
        {LANGUAGES.map((language) => {
          const value =
            language.code === "en"
              ? defaultValue || ""
              : translations?.[language.code]?.[translationKey ?? name] || "";
          const fieldName = language.code === "en" ? name : `${name}__${language.code}`;
          return (
            <div key={language.code} className="min-w-0">
              <span className="mb-1 block text-[0.62rem] font-semibold uppercase tracking-wide text-muted-foreground">
                {language.label}
              </span>
              {multiline ? (
                <Textarea
                  id={`${id}-${language.code}`}
                  name={fieldName}
                  defaultValue={value}
                  rows={rows}
                  dir={language.dir}
                  maxLength={maxLength}
                  required={language.code === "en" ? required : undefined}
                  placeholder={language.code === "en" ? placeholder : undefined}
                />
              ) : (
                <Input
                  id={`${id}-${language.code}`}
                  name={fieldName}
                  defaultValue={value}
                  dir={language.dir}
                  maxLength={maxLength}
                  required={language.code === "en" ? required : undefined}
                  placeholder={language.code === "en" ? placeholder : undefined}
                />
              )}
            </div>
          );
        })}
      </div>
      {help && <p className="mt-1.5 text-xs text-muted-foreground">{help}</p>}
    </div>
  );
}
