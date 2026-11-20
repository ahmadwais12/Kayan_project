"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Loader2, Trash2, Upload, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AvatarInput({
  name,
  defaultValue = "",
  label = "Profile photo",
  help,
}: {
  name: string;
  defaultValue?: string;
  label?: string;
  help?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setError("");
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Upload failed");
      setValue(data.url);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="mb-1.5 block text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-foreground/80">
        {label}
      </label>
      <input type="hidden" name={name} value={value} />

      <div className="flex flex-wrap items-center gap-4 rounded-md border border-input bg-card p-3">
        <span className="relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-full border border-border/70 bg-secondary text-primary">
          {value ? (
            <Image
              src={value}
              alt="Profile photo preview"
              fill
              unoptimized={value.startsWith("/api/")}
              className="object-cover"
              sizes="80px"
            />
          ) : (
            <UserRound className="size-8 text-muted-foreground" />
          )}
        </span>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) upload(file);
                event.target.value = "";
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
              {uploading ? "Uploading…" : "Upload photo"}
            </Button>
            {value && (
              <Button type="button" variant="ghost" size="sm" onClick={() => setValue("")}>
                <Trash2 className="size-4" /> Remove
              </Button>
            )}
          </div>
          <Input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Optional image URL"
            aria-label={`${label} URL`}
            className="h-9 text-xs"
            maxLength={500}
          />
        </div>
      </div>

      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      {help && <p className="mt-2 text-xs text-muted-foreground">{help}</p>}
    </div>
  );
}
