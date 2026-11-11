"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export type RepeaterField = {
  key: string;
  label: string;
  placeholder?: string;
  textarea?: boolean;
};

export function Repeater({
  name,
  fields,
  initial = [],
  addLabel = "Add row",
  emptyLabel = "No items yet.",
}: {
  name: string;
  fields: RepeaterField[];
  initial?: Record<string, string>[];
  addLabel?: string;
  emptyLabel?: string;
}) {
  const [rows, setRows] = useState<Record<string, string>[]>(
    initial.length ? initial : [],
  );

  const payload = useMemo(
    () => JSON.stringify(rows.filter((row) => Object.values(row).some((value) => value.trim()))),
    [rows],
  );

  function update(index: number, key: string, value: string) {
    setRows((current) =>
      current.map((row, rowIndex) => (rowIndex === index ? { ...row, [key]: value } : row)),
    );
  }

  function move(index: number, direction: -1 | 1) {
    setRows((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return (
    <div>
      <input type="hidden" name={name} value={payload} />
      <div className="space-y-3">
        {rows.length === 0 && (
          <p className="rounded-md border border-dashed border-border px-4 py-6 text-center text-xs text-muted-foreground">
            {emptyLabel}
          </p>
        )}
        {rows.map((row, index) => (
          <div key={index} className="rounded-md border border-border/80 bg-secondary/20 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Item {index + 1}
              </span>
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  className="rounded p-1 text-muted-foreground hover:bg-card hover:text-primary"
                  aria-label="Move up"
                >
                  <ArrowUp className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  className="rounded p-1 text-muted-foreground hover:bg-card hover:text-primary"
                  aria-label="Move down"
                >
                  <ArrowDown className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setRows((current) => current.filter((_, i) => i !== index))}
                  className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  aria-label="Remove row"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {fields.map((field) => (
                <div key={field.key} className={field.textarea ? "sm:col-span-2" : ""}>
                  <label className="mb-1 block text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">
                    {field.label}
                  </label>
                  {field.textarea ? (
                    <Textarea
                      value={row[field.key] || ""}
                      onChange={(event) => update(index, field.key, event.target.value)}
                      placeholder={field.placeholder}
                      rows={2}
                      className="min-h-16 text-sm"
                    />
                  ) : (
                    <Input
                      value={row[field.key] || ""}
                      onChange={(event) => update(index, field.key, event.target.value)}
                      placeholder={field.placeholder}
                      className="h-9 text-sm"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-3"
        onClick={() =>
          setRows((current) => [
            ...current,
            Object.fromEntries(fields.map((field) => [field.key, ""])),
          ])
        }
      >
        <Plus className="size-3.5" /> {addLabel}
      </Button>
    </div>
  );
}
