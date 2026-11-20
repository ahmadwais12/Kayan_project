"use client";

import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function SmoothSlider({
  children,
  autoplayMs = 7000,
  ariaLabel,
  slideClassName = "sm:flex-[0_0_50%] lg:flex-[0_0_33.3333%]",
}: {
  children: ReactNode;
  autoplayMs?: number;
  ariaLabel: string;
  slideClassName?: string;
}) {
  const slides = Children.toArray(children);
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const [emblaRef, embla] = useEmblaCarousel({ loop: slides.length > 1, align: "start", duration: 40 });
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
    if (!embla || reduce || paused || !visible || slides.length < 2) return;
    const timer = window.setTimeout(() => embla.scrollNext(), autoplayMs);
    return () => window.clearTimeout(timer);
  }, [embla, reduce, paused, visible, slides.length, autoplayMs, selected]);

  const showControls = slides.length > 1;

  return (
    <div
      ref={rootRef}
      className="relative"
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="-ml-5 flex">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={cn("min-w-0 flex-[0_0_100%] pl-5", slideClassName)}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${slides.length}`}
            >
              {slide}
            </div>
          ))}
        </div>
      </div>

      {showControls && (
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-1.5" aria-label="Choose slide">
            {snaps.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => embla?.scrollTo(index)}
                aria-label={`Go to slide ${index + 1}`}
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
              aria-label="Previous slide"
              className="grid size-9 place-items-center border border-border text-muted-foreground transition-colors hover:border-accent hover:text-accent"
            >
              <ChevronLeft className="size-4 rtl:rotate-180" />
            </button>
            <button
              type="button"
              onClick={() => embla?.scrollNext()}
              aria-label="Next slide"
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
              animation: `slider-progress ${autoplayMs}ms linear forwards`,
              animationPlayState: paused || !visible ? "paused" : "running",
            }}
          />
        </div>
      )}
    </div>
  );
}
