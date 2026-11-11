"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Pencil, Eye } from "lucide-react";
import { Textarea } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function MarkdownInput({
  name,
  defaultValue = "",
  rows = 12,
  placeholder,
  label = "Content",
  help = "Markdown is supported: headings, lists, links, bold, italics.",
}: {
  name: string;
  defaultValue?: string;
  rows?: number;
  placeholder?: string;
  label?: string;
  help?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [mode, setMode] = useState<"write" | "preview">("write");

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-foreground/80">
          {label}
        </label>
        <div className="flex items-center gap-1 rounded border border-border p-0.5">
          <button
            type="button"
            onClick={() => setMode("write")}
            className={cn(
              "inline-flex items-center gap-1 rounded px-2 py-1 text-[0.68rem] font-medium",
              mode === "write" ? "bg-secondary text-primary" : "text-muted-foreground",
            )}
          >
            <Pencil className="size-3" /> Write
          </button>
          <button
            type="button"
            onClick={() => setMode("preview")}
            className={cn(
              "inline-flex items-center gap-1 rounded px-2 py-1 text-[0.68rem] font-medium",
              mode === "preview" ? "bg-secondary text-primary" : "text-muted-foreground",
            )}
          >
            <Eye className="size-3" /> Preview
          </button>
        </div>
      </div>

      <input type="hidden" name={name} value={value} />
      {mode === "write" ? (
        <Textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          rows={rows}
          placeholder={placeholder}
          className="font-mono text-[0.8rem] leading-relaxed"
        />
      ) : (
        <div className="prose-editorial min-h-40 rounded-md border border-input bg-card px-5 py-4">
          {value.trim() ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
          ) : (
            <p className="text-sm text-muted-foreground">Nothing to preview yet.</p>
          )}
        </div>
      )}
      {help && <p className="mt-1.5 text-xs text-muted-foreground">{help}</p>}
    </div>
  );
}
