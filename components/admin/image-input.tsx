"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type LibraryItem = { id: string; url: string; alt?: string | null };

export function ImageInput({
  name,
  defaultValue = "",
  library = [],
  label = "Image",
  help,
}: {
  name: string;
  defaultValue?: string;
  library?: LibraryItem[];
  label?: string;
  help?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [libraryOpen, setLibraryOpen] = useState(false);
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

      <div className="rounded-md border border-input bg-card p-3">
        {value ? (
          <div className="relative mb-3 aspect-[16/9] overflow-hidden rounded bg-secondary">
            <Image
              src={value}
              alt="Selected image preview"
              fill
              unoptimized={value.startsWith("/api/")}
              className="object-cover"
              sizes="400px"
            />
            <button
              type="button"
              onClick={() => setValue("")}
              className="absolute right-2 top-2 rounded-full bg-primary/80 p-1.5 text-white hover:bg-primary"
              aria-label="Remove image"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ) : (
          <div className="mb-3 grid aspect-[16/9] place-items-center rounded bg-secondary/50 text-muted-foreground">
            <ImagePlus className="size-7" />
          </div>
        )}

        <div className="flex gap-2">
          <Input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="/images/example.jpg or upload"
            className="h-9 text-xs"
          />
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
            className="shrink-0"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
            Upload
          </Button>
          {library.length > 0 && (
            <Dialog open={libraryOpen} onOpenChange={setLibraryOpen}>
              <DialogTrigger asChild>
                <Button type="button" variant="secondary" size="sm" className="shrink-0">
                  Library
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Media library</DialogTitle>
                  <DialogDescription>
                    Choose an existing image or upload a new one.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid max-h-[55vh] grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3">
                  {library.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setValue(item.url);
                        setLibraryOpen(false);
                      }}
                      className="group relative aspect-[4/3] overflow-hidden rounded border border-border bg-secondary"
                    >
                      <Image
                        src={item.url}
                        alt={item.alt || "Library image"}
                        fill
                        unoptimized={item.url.startsWith("/api/")}
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="240px"
                      />
                    </button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
        {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
        {help && <p className="mt-2 text-xs text-muted-foreground">{help}</p>}
      </div>
    </div>
  );
}
