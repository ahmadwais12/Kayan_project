"use client";

import { useState } from "react";
import { Wand2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { slugify } from "@/lib/utils";

export function SlugInput({
  defaultValue = "",
  titleId,
}: {
  defaultValue?: string;
  titleId: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [touched, setTouched] = useState(Boolean(defaultValue));

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label
          htmlFor="slug"
          className="text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-foreground/80"
        >
          URL slug
        </label>
        <button
          type="button"
          onClick={() => {
            const title = document.getElementById(titleId) as HTMLInputElement | null;
            if (title) setValue(slugify(title.value));
            setTouched(true);
          }}
          className="inline-flex items-center gap-1 text-[0.7rem] font-medium text-accent hover:underline"
        >
          <Wand2 className="size-3" /> From title
        </button>
      </div>
      <Input
        id="slug"
        name="slug"
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          setTouched(true);
        }}
        onBlur={() => {
          if (!touched) return;
          setValue(slugify(value));
        }}
        placeholder="project-url-slug"
        required
        pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
      />
      <p className="mt-1.5 text-xs text-muted-foreground">
        Lowercase letters, numbers, and hyphens. Must be unique.
      </p>
    </div>
  );
}
