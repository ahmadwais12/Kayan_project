"use client";

import { useRef, useState } from "react";
import { Loader2, Upload, Video, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function VideoInput({
  name,
  defaultValue = "",
  label = "Video file",
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
      const response = await fetch("/api/admin/upload/video", { method: "POST", body });
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

      <div className="rounded-md border border-input bg-card p-3">
        {value ? (
          <div className="relative mb-3 overflow-hidden rounded bg-black">
            <video src={value} controls playsInline className="aspect-video w-full" />
            <button
              type="button"
              onClick={() => setValue("")}
              className="absolute right-2 top-2 rounded-full bg-primary/80 p-1.5 text-white hover:bg-primary"
              aria-label="Remove video"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ) : (
          <div className="mb-3 grid aspect-video place-items-center rounded bg-secondary/50 text-muted-foreground">
            <Video className="size-7" />
          </div>
        )}

        <div className="flex gap-2">
          <Input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Upload an MP4 or WebM file, or paste a video URL"
            className="h-9 text-xs"
          />
          <input
            ref={inputRef}
            type="file"
            accept="video/mp4,video/webm"
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
            className="shrink-0"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
            Upload
          </Button>
        </div>
        {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
        {help && <p className="mt-2 text-xs text-muted-foreground">{help}</p>}
      </div>
    </div>
  );
}
