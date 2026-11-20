"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { SmartImage } from "@/components/public/smart-image";
import { SmoothSlider } from "@/components/public/smooth-slider";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { youtubeEmbedUrl, youtubeThumbnailUrl } from "@/lib/video";

export type ShowcaseVideoItem = {
  id: string;
  title: string;
  description: string | null;
  youtubeId: string | null;
  videoUrl: string | null;
  thumbnailUrl: string | null;
};

export function VideoShowcase({ items }: { items: ShowcaseVideoItem[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = items.find((item) => item.id === activeId) || null;
  const posterFor = (item: ShowcaseVideoItem) =>
    item.thumbnailUrl || (item.youtubeId ? youtubeThumbnailUrl(item.youtubeId) : null);

  return (
    <>
      <SmoothSlider ariaLabel="Project videos" autoplayMs={7500} slideClassName="sm:flex-[0_0_50%]">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveId(item.id)}
            className="group flex h-full flex-col border border-border/70 bg-card text-left transition-colors hover:border-accent/60"
          >
            <span className="relative block aspect-video w-full overflow-hidden bg-secondary">
              <SmartImage src={posterFor(item)} alt={item.title} fill sizes="(max-width: 640px) 100vw, 50vw" className="transition-transform duration-500 group-hover:scale-[1.03]" />
              <span className="absolute inset-0 grid place-items-center bg-primary/25 transition-colors group-hover:bg-primary/40">
                <span className="grid size-14 place-items-center rounded-full bg-white/90 text-primary shadow-lg transition-transform duration-300 group-hover:scale-110">
                  <Play className="size-6 translate-x-0.5 fill-current" />
                </span>
              </span>
            </span>
            <span className="flex flex-1 flex-col gap-1.5 p-5">
              <span className="font-display text-lg leading-snug text-primary">{item.title}</span>
              {item.description && <span className="text-sm leading-relaxed text-muted-foreground">{item.description}</span>}
            </span>
          </button>
        ))}
      </SmoothSlider>

      <Dialog open={Boolean(active)} onOpenChange={(open) => !open && setActiveId(null)}>
        <DialogContent className="max-w-4xl p-0 [&>button]:z-10 [&>button]:bg-black/60 [&>button]:text-white">
          {active && (
            <>
              <DialogTitle className="sr-only">{active.title}</DialogTitle>
              <div className="aspect-video w-full overflow-hidden bg-black">
                {active.youtubeId ? (
                  <iframe
                    src={youtubeEmbedUrl(active.youtubeId)}
                    title={active.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="size-full"
                  />
                ) : active.videoUrl ? (
                  <video src={active.videoUrl} controls autoPlay playsInline className="size-full" />
                ) : null}
              </div>
              <div className="space-y-1.5 p-5 pt-4">
                <p className="font-display text-lg text-primary">{active.title}</p>
                {active.description && <p className="text-sm text-muted-foreground">{active.description}</p>}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
