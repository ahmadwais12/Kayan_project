"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/input";

type Folder = { id: string; name: string };

export function MediaUploader({ folders }: { folders: Folder[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [folderId, setFolderId] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [errors, setErrors] = useState<string[]>([]);
  const [finished, setFinished] = useState(0);

  async function uploadFiles(files: FileList) {
    if (!files.length) return;
    setBusy(true);
    setFinished(0);
    setErrors([]);
    const list = Array.from(files);
    setProgress({ done: 0, total: list.length });
    let success = 0;

    for (const file of list) {
      try {
        const body = new FormData();
        body.append("file", file);
        if (folderId) body.append("folderId", folderId);
        const response = await fetch("/api/admin/upload", { method: "POST", body });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || `${file.name} could not be uploaded`);
        success += 1;
      } catch (error) {
        setErrors((current) => [...current, error instanceof Error ? error.message : "Upload failed"]);
      } finally {
        setProgress((current) => ({ ...current, done: current.done + 1 }));
      }
    }

    setBusy(false);
    setFinished(success);
    if (success > 0) router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-full sm:w-64">
          <NativeSelect value={folderId} onChange={(event) => setFolderId(event.target.value)} disabled={busy}>
            <option value="">No folder</option>
            {folders.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {folder.name}
              </option>
            ))}
          </NativeSelect>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          className="hidden"
          onChange={(event) => {
            const files = event.target.files;
            if (files) uploadFiles(files);
            event.target.value = "";
          }}
        />
        <Button type="button" onClick={() => inputRef.current?.click()} disabled={busy}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : <UploadCloud className="size-4" />}
          {busy ? `Uploading ${progress.done}/${progress.total}` : "Choose images"}
        </Button>
      </div>

      <div
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          if (!busy) uploadFiles(event.dataTransfer.files);
        }}
        className="grid place-items-center rounded-lg border-2 border-dashed border-border bg-secondary/30 px-6 py-14 text-center"
      >
        <UploadCloud className="mb-3 size-8 text-muted-foreground" />
        <p className="text-sm font-medium text-primary">Drag images here</p>
        <p className="mt-1 max-w-md text-xs leading-relaxed text-muted-foreground">
          JPG, PNG, WebP or AVIF up to 8 MB each. Images are converted to WebP and saved outside the database.
        </p>
      </div>

      {finished > 0 && (
        <p className="flex items-center gap-2 text-sm text-emerald-700">
          <CheckCircle2 className="size-4" /> {finished} image{finished === 1 ? "" : "s"} uploaded.
        </p>
      )}

      {errors.length > 0 && (
        <ul className="space-y-1 rounded-md border border-destructive/25 bg-destructive/8 px-4 py-3 text-sm text-destructive">
          {errors.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
