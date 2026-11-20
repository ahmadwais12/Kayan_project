"use client";

import { useState, type ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const FORMATTABLE = /^\d+$/;
const STRIPPABLE = /^\d+(?:,\d{3})*(?:\.\d{1,2})?$/;

export function MoneyInput({
  id,
  name,
  defaultValue = "",
  placeholder,
  maxLength,
  className,
  plain = false,
}: {
  id?: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  maxLength?: number;
  className?: string;
  plain?: boolean;
}) {
  const [value, setValue] = useState(() => {
    const initial = defaultValue.trim();
    return STRIPPABLE.test(initial) ? new Intl.NumberFormat("en-US").format(Number(initial.replace(/,/g, ""))) : defaultValue;
  });
  const submitted = STRIPPABLE.test(value.trim()) ? value.replace(/,/g, "") : value;
  const handlers = {
    id,
    value,
    onChange: (event: ChangeEvent<HTMLInputElement>) => setValue(event.target.value),
    onBlur: () => {
      const trimmed = value.trim();
      if (FORMATTABLE.test(trimmed)) {
        setValue(new Intl.NumberFormat("en-US").format(Number(trimmed)));
      }
    },
    inputMode: "decimal" as const,
    dir: "ltr" as const,
    placeholder,
    maxLength,
  };

  return (
    <>
      {plain ? (
        <input {...handlers} className={cn("phone-ltr text-start", className)} />
      ) : (
        <Input {...handlers} className={cn("phone-ltr text-start", className)} />
      )}
      <input type="hidden" name={name} value={submitted} />
    </>
  );
}
