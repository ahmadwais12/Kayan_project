"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { SmartImage } from "@/components/public/smart-image";
import { cn } from "@/lib/utils";

export type TestimonialItem = {
  id: string;
  content: string;
  clientName: string;
  clientTitle: string | null;
  clientCompany: string | null;
  photoUrl: string | null;
  rating: number;
};

export function TestimonialCarousel({
  items,
  large = false,
  autoplayMs = 6000,
}: {
  items: TestimonialItem[];
  large?: boolean;
  autoplayMs?: number;
}) {
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const [emblaRef, embla] = useEmblaCarousel({ loop: true, align: "start", duration: 42 });
  const [selected, setSelected] = useState(0);
  const [snaps, setSnaps] = useState<number[]>([]);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);

  const sync = useCallback(() => {
    if (!embla) return;
    setSelected(embla.selectedScrollSnap());
    setSnaps(embla.scrollSnapList());
  }, [embla]);

  useEffect(() => {
    if (!embla) return;
    const frame = requestAnimationFrame(sync);
    embla.on("select", sync).on("reInit", sync);
    return () => {
      cancelAnimationFrame(frame);
      embla.off("select", sync).off("reInit", sync);
    };
  }, [embla, sync]);

  useEffect(() => {
    const element = rootRef.current;
    if (!element || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "200px 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!embla || reduce || paused || !visible || items.length < 2) return;
    const timer = window.setTimeout(() => embla.scrollNext(), autoplayMs);
    return () => window.clearTimeout(timer);
  }, [embla, reduce, paused, visible, items.length, autoplayMs, selected]);

  const showControls = items.length > 1;

  return (
    <div
      ref={rootRef}
      className="relative"
      aria-roledescription="carousel"
      aria-label="Client testimonials"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="-ml-5 flex">
          {items.map((item) => (
            <div
              key={item.id}
              className={cn(
                "min-w-0 flex-[0_0_100%] pl-5",
                !large && "sm:flex-[0_0_50%]",
              )}
              role="group"
              aria-roledescription="slide"
            >
              <figure
                className={cn(
                  "flex h-full flex-col border border-border/70 bg-background",
                  large ? "p-7 sm:p-10" : "p-6",
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-0.5 text-accent">
                    {Array.from({ length: Math.min(5, Math.max(1, item.rating)) }).map((_, starIndex) => (
                      <Star key={starIndex} className={cn("fill-accent", large ? "size-4" : "size-3.5")} />
                    ))}
                  </div>
                  {large && <Quote aria-hidden="true" className="size-8 shrink-0 text-accent/35" />}
                </div>
                <blockquote
                  className={cn(
                    "mt-5 flex-1 leading-relaxed text-foreground/80",
                    large ? "text-base sm:text-lg" : "text-sm",
                  )}
                >
                  “{item.content}”
                </blockquote>
                <figcaption className="mt-7 flex items-center gap-3 border-t border-border/70 pt-5">
                  {item.photoUrl && (
                    <span
                      className={cn(
                        "relative shrink-0 overflow-hidden rounded-full bg-secondary",
                        large ? "size-12" : "size-10",
                      )}
                    >
                      <SmartImage src={item.photoUrl} alt={item.clientName} sizes="48px" />
                    </span>
                  )}
                  <span>
                    <span className={cn("block font-medium text-primary", large ? "text-base" : "text-sm")}>
                      {item.clientName}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {[item.clientTitle, item.clientCompany].filter(Boolean).join(", ")}
                    </span>
                  </span>
                </figcaption>
              </figure>
            </div>
          ))}
        </div>
      </div>

      {showControls && (
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-1.5" aria-label="Choose testimonial">
            {snaps.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => embla?.scrollTo(index)}
                aria-label={`Go to testimonial ${index + 1}`}
                aria-current={selected === index}
                className={cn(
                  "h-1 transition-all duration-300",
                  selected === index ? "w-7 bg-accent" : "w-3 bg-border hover:bg-muted-foreground/50",
                )}
              />
            ))}
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => embla?.scrollPrev()}
              aria-label="Previous testimonial"
              className="grid size-9 place-items-center border border-border text-muted-foreground transition-colors hover:border-accent hover:text-accent"
            >
              <ChevronLeft className="size-4 rtl:rotate-180" />
            </button>
            <button
              type="button"
              onClick={() => embla?.scrollNext()}
              aria-label="Next testimonial"
              className="grid size-9 place-items-center border border-border text-muted-foreground transition-colors hover:border-accent hover:text-accent"
            >
              <ChevronRight className="size-4 rtl:rotate-180" />
            </button>
          </div>
        </div>
      )}

      {showControls && !reduce && (
        <div className="mt-4 h-px w-full overflow-hidden bg-border/60" aria-hidden="true">
          <div
            key={`${selected}-${paused}-${visible}`}
            className="h-full origin-left bg-accent rtl:origin-right"
            style={{
              animation: `testimonial-progress ${autoplayMs}ms linear forwards`,
              animationPlayState: paused || !visible ? "paused" : "running",
            }}
          />
        </div>
      )}
    </div>
  );
}
