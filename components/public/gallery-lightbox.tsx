"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Minus, Plus, RotateCcw, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { SmartImage } from "@/components/public/smart-image";
import { cn } from "@/lib/utils";

export type LightboxImage = {
  url: string;
  thumbnailUrl?: string | null;
  alt: string;
  caption?: string | null;
};

export function GalleryLightbox({
  images,
  columns = 3,
  className,
}: {
  images: LightboxImage[];
  columns?: 2 | 3;
  className?: string;
}) {
  const [index, setIndex] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);

  const close = useCallback(() => {
    setIndex(null);
    setZoom(1);
  }, []);
  const next = useCallback(
    () => {
      setZoom(1);
      setIndex((current) => (current === null ? null : (current + 1) % images.length));
    },
    [images.length],
  );
  const prev = useCallback(
    () => {
      setZoom(1);
      setIndex((current) => (current === null ? null : (current - 1 + images.length) % images.length));
    },
    [images.length],
  );

  useEffect(() => {
    if (index === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") next();
      if (event.key === "ArrowLeft") prev();
      if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        setZoom((current) => Math.min(3, current + 0.5));
      }
      if (event.key === "-") {
        event.preventDefault();
        setZoom((current) => Math.max(1, current - 0.5));
      }
      if (event.key === "0") setZoom(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, next, prev]);

  if (!images.length) return null;
  const active = index === null ? null : images[index];

  return (
    <>
      <div
        className={cn(
          "grid gap-3",
          columns === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3",
          className,
        )}
      >
        {images.map((image, itemIndex) => (
          <button
            key={`${image.url}-${itemIndex}`}
            type="button"
            onClick={() => {
              setIndex(itemIndex);
              setZoom(1);
            }}
            className="group relative aspect-[4/3] overflow-hidden bg-secondary text-left"
            aria-label={`View image ${itemIndex + 1}${image.caption ? `: ${image.caption}` : ""}`}
          >
            <SmartImage
              src={image.thumbnailUrl || image.url}
              alt={image.alt}
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="transition-transform duration-700 group-hover:scale-[1.03]"
            />
            {image.caption && (
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-primary/80 to-transparent px-4 pb-3 pt-8 text-xs text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                {image.caption}
              </span>
            )}
          </button>
        ))}
      </div>

      <Dialog open={index !== null} onOpenChange={(open) => !open && close()}>
        <DialogContent
          hideClose
          className="max-w-6xl border-white/10 bg-primary p-0 text-white sm:p-0"
        >
          <DialogTitle className="sr-only">{active?.caption || active?.alt || "Gallery image"}</DialogTitle>
          {active && (
            <div>
              <div className="relative flex max-h-[78vh] min-h-[40vh] items-center justify-center overflow-auto bg-black/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={active.url}
                  alt={active.alt}
                  onClick={() => setZoom((current) => (current > 1 ? 1 : 2))}
                  style={{ transform: `scale(${zoom})` }}
                  className="max-h-[78vh] w-auto max-w-full cursor-zoom-in object-contain transition-transform duration-300"
                />
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={prev}
                      className="absolute left-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center bg-primary/70 text-white hover:bg-accent hover:text-primary"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="size-5" />
                    </button>
                    <button
                      type="button"
                      onClick={next}
                      className="absolute right-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center bg-primary/70 text-white hover:bg-accent hover:text-primary"
                      aria-label="Next image"
                    >
                      <ChevronRight className="size-5" />
                    </button>
                  </>
                )}
                <div className="absolute left-3 top-3 flex items-center gap-1 bg-primary/70 text-white">
                  <button
                    type="button"
                    onClick={() => setZoom((current) => Math.max(1, current - 0.5))}
                    disabled={zoom <= 1}
                    className="grid size-9 place-items-center hover:bg-accent hover:text-primary disabled:pointer-events-none disabled:opacity-40"
                    aria-label="Zoom out"
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="min-w-10 text-center text-[0.68rem] tabular-nums">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setZoom((current) => Math.min(3, current + 0.5))}
                    disabled={zoom >= 3}
                    className="grid size-9 place-items-center hover:bg-accent hover:text-primary disabled:pointer-events-none disabled:opacity-40"
                    aria-label="Zoom in"
                  >
                    <Plus className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoom(1)}
                    disabled={zoom === 1}
                    className="grid size-9 place-items-center hover:bg-accent hover:text-primary disabled:pointer-events-none disabled:opacity-40"
                    aria-label="Reset zoom"
                  >
                    <RotateCcw className="size-3.5" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={close}
                  className="absolute right-3 top-3 grid size-9 place-items-center bg-primary/70 text-white hover:bg-accent hover:text-primary"
                  aria-label="Close"
                >
                  <X className="size-4" />
                </button>
              </div>
              <div className="flex items-center justify-between gap-4 px-5 py-3 text-xs text-white/60">
                <p className="truncate">{active.caption || active.alt}</p>
                <p className="shrink-0">
                  {index! + 1} / {images.length} · Click image to zoom
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
