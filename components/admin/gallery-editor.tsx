"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Plus, Trash2, Upload } from "lucide-react";
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

export type GalleryRow = { url: string; alt?: string; caption?: string };
type LibraryItem = { id: string; url: string; alt?: string | null };

export function GalleryEditor({
  name,
  initial = [],
  library = [],
}: {
  name: string;
  initial?: GalleryRow[];
  library?: LibraryItem[];
}) {
  const [rows, setRows] = useState<GalleryRow[]>(initial);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [libraryOpen, setLibraryOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const payload = useMemo(() => JSON.stringify(rows), [rows]);

  async function uploadFiles(files: FileList) {
    setError("");
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const body = new FormData();
        body.append("file", file);
        const response = await fetch("/api/admin/upload", { method: "POST", body });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Upload failed");
        setRows((current) => [
          ...current,
          { url: data.url, alt: file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ") },
        ]);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Upload failed");
    } finally {
      setUploading(false);
    }
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
      <div className="grid gap-3 sm:grid-cols-2">
        {rows.map((row, index) => (
          <div key={`${row.url}-${index}`} className="overflow-hidden rounded-md border border-border bg-card">
            <div className="relative aspect-[4/3] bg-secondary">
              <Image
                src={row.url}
                alt={row.alt || `Gallery image ${index + 1}`}
                fill
                unoptimized={row.url.startsWith("/api/")}
                className="object-cover"
                sizes="320px"
              />
              <div className="absolute right-1.5 top-1.5 flex gap-1">
                <button type="button" onClick={() => move(index, -1)} className="rounded bg-primary/80 p-1 text-white" aria-label="Move up">
                  <ArrowUp className="size-3" />
                </button>
                <button type="button" onClick={() => move(index, 1)} className="rounded bg-primary/80 p-1 text-white" aria-label="Move down">
                  <ArrowDown className="size-3" />
                </button>
                <button
                  type="button"
                  onClick={() => setRows((current) => current.filter((_, i) => i !== index))}
                  className="rounded bg-destructive/90 p-1 text-white"
                  aria-label="Remove image"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            </div>
            <div className="space-y-1.5 p-2">
              <Input
                value={row.alt || ""}
                onChange={(event) =>
                  setRows((current) => current.map((item, i) => (i === index ? { ...item, alt: event.target.value } : item)))
                }
                placeholder="Alt text (accessibility)"
                className="h-8 text-xs"
              />
              <Input
                value={row.caption || ""}
                onChange={(event) =>
                  setRows((current) => current.map((item, i) => (i === index ? { ...item, caption: event.target.value } : item)))
                }
                placeholder="Caption (optional)"
                className="h-8 text-xs"
              />
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <div className="col-span-full grid place-items-center rounded-md border border-dashed border-border py-10 text-center">
            <ImagePlus className="size-7 text-muted-foreground/60" />
            <p className="mt-2 text-xs text-muted-foreground">No gallery images yet.</p>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <input
          ref={fileRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="hidden"
          onChange={(event) => {
            if (event.target.files?.length) uploadFiles(event.target.files);
            event.target.value = "";
          }}
        />
        <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
          Upload images
        </Button>
        {library.length > 0 && (
          <Dialog open={libraryOpen} onOpenChange={setLibraryOpen}>
            <DialogTrigger asChild>
              <Button type="button" variant="secondary" size="sm">
                Add from library
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Media library</DialogTitle>
                <DialogDescription>Select an image to add to this gallery.</DialogDescription>
              </DialogHeader>
              <div className="grid max-h-[55vh] grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3">
                {library.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setRows((current) => [...current, { url: item.url, alt: item.alt || "" }]);
                      setLibraryOpen(false);
                    }}
                    className="relative aspect-[4/3] overflow-hidden rounded border border-border"
                  >
                    <Image src={item.url} alt={item.alt || "Library image"} fill unoptimized={item.url.startsWith("/api/")} className="object-cover" sizes="240px" />
                  </button>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        )}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setRows((current) => [...current, { url: "", alt: "", caption: "" }])}
        >
          <Plus className="size-3.5" /> Add URL row
        </Button>
      </div>
      {rows.some((row) => !row.url) && (
        <div className="mt-2 space-y-2">
          {rows.map((row, index) =>
            row.url ? null : (
              <Input
                key={`empty-${index}`}
                placeholder="Paste an image URL or upload above"
                className="h-8 text-xs"
                onChange={(event) =>
                  setRows((current) => current.map((item, i) => (i === index ? { ...item, url: event.target.value } : item)))
                }
              />
            ),
          )}
        </div>
      )}
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
    </div>
  );
}
