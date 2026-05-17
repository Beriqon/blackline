"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";

export type ClientMomentSlide = {
  src: string;
  alt: string;
};

type ClientMomentsCarouselProps = {
  images: readonly ClientMomentSlide[];
  /** Step mode: pause between slides. Continuous: smooth endless scroll. */
  autoScroll?: "step" | "continuous";
  intervalMs?: number;
  /** Pixels per second when `autoScroll` is `continuous`. */
  scrollSpeed?: number;
  /** Accessible name for the carousel region (e.g. "Past shoots gallery"). */
  ariaLabel?: string;
};

const GAP_PX = 12; /* gap-3 */

function getStep(scroller: HTMLDivElement): number {
  const first = scroller.querySelector<HTMLElement>("[data-carousel-card]");
  if (!first) return 200;
  return first.offsetWidth + GAP_PX;
}

export function ClientMomentsCarousel({
  images,
  autoScroll = "step",
  intervalMs = 4000,
  scrollSpeed = 36,
  ariaLabel = "Client moments gallery",
}: ClientMomentsCarouselProps) {
  const n = images.length;
  const loopSlides = useMemo(
    () => (autoScroll === "continuous" && n > 1 ? [...images, ...images] : images),
    [autoScroll, images, n],
  );
  const scrollerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    setReduceMotion(
      typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  }, []);

  const syncActiveFromScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const step = getStep(el);
    if (step <= 0) return;

    if (autoScroll === "continuous" && n > 1) {
      const loopWidth = el.scrollWidth / 2;
      const offset =
        loopWidth > 0 ? ((el.scrollLeft % loopWidth) + loopWidth) % loopWidth : 0;
      const i = Math.round(offset / step) % n;
      activeRef.current = i;
      setActive(i);
      return;
    }

    const i = Math.round(el.scrollLeft / step);
    const next = Math.min(Math.max(0, i), n - 1);
    activeRef.current = next;
    setActive(next);
  }, [autoScroll, n]);

  useLayoutEffect(() => {
    syncActiveFromScroll();
  }, [syncActiveFromScroll, n, loopSlides.length]);

  const scrollByStep = useCallback(
    (dir: 1 | -1) => {
      const el = scrollerRef.current;
      if (!el) return;
      const step = getStep(el);
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 0) return;
      const behavior = reduceMotion ? ("auto" as const) : ("smooth" as const);

      if (autoScroll === "continuous" && n > 1) {
        const loopWidth = el.scrollWidth / 2;
        if (dir === 1 && el.scrollLeft + step >= loopWidth - 2) {
          el.scrollLeft -= loopWidth;
        } else if (dir === -1 && el.scrollLeft <= 2) {
          el.scrollLeft += loopWidth;
        }
      }

      if (dir === 1) {
        if (el.scrollLeft + step >= maxScroll - 2) {
          el.scrollTo({ left: 0, behavior });
        } else {
          el.scrollBy({ left: step, behavior });
        }
      } else {
        if (el.scrollLeft <= 2) {
          el.scrollTo({ left: maxScroll, behavior });
        } else {
          el.scrollBy({ left: -step, behavior });
        }
      }
    },
    [autoScroll, n, reduceMotion],
  );

  useEffect(() => {
    if (paused || reduceMotion || n < 2 || autoScroll !== "step") return;
    const id = window.setInterval(() => scrollByStep(1), intervalMs);
    return () => window.clearInterval(id);
  }, [paused, reduceMotion, n, intervalMs, scrollByStep, autoScroll]);

  useEffect(() => {
    if (paused || reduceMotion || n < 2 || autoScroll !== "continuous") return;

    const el = scrollerRef.current;
    if (!el) return;

    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      el.scrollLeft += scrollSpeed * dt;

      const loopWidth = el.scrollWidth / 2;
      if (loopWidth > 0 && el.scrollLeft >= loopWidth) {
        el.scrollLeft -= loopWidth;
      }

      const step = getStep(el);
      if (step > 0 && loopWidth > 0) {
        const offset = ((el.scrollLeft % loopWidth) + loopWidth) % loopWidth;
        const i = Math.round(offset / step) % n;
        if (i !== activeRef.current) {
          activeRef.current = i;
          setActive(i);
        }
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused, reduceMotion, n, autoScroll, scrollSpeed, loopSlides.length]);

  const goToIndex = useCallback(
    (i: number) => {
      const el = scrollerRef.current;
      if (!el) return;
      const step = getStep(el);
      const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
      const left = Math.min(i * step, maxScroll);
      el.scrollTo({
        left,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    },
    [reduceMotion],
  );

  if (n === 0) return null;

  return (
    <div
      className="relative mx-auto w-full max-w-7xl"
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <button
        type="button"
        onClick={() => scrollByStep(-1)}
        className="absolute left-0 top-1/2 z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-sm border border-gold/20 bg-[#0b0b0b]/90 text-cream/85 shadow-lg backdrop-blur-sm transition-colors hover:border-gold/40 hover:text-gold-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold/50 sm:flex sm:-left-1 md:-left-2"
        aria-label="Previous images"
      >
        <ChevronLeft className="size-5" aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => scrollByStep(1)}
        className="absolute right-0 top-1/2 z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-sm border border-gold/20 bg-[#0b0b0b]/90 text-cream/85 shadow-lg backdrop-blur-sm transition-colors hover:border-gold/40 hover:text-gold-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold/50 sm:flex sm:-right-1 md:-right-2"
        aria-label="Next images"
      >
        <ChevronRight className="size-5" aria-hidden />
      </button>

      <div
        ref={scrollerRef}
        onScroll={syncActiveFromScroll}
        className={cn(
          "flex gap-3 overflow-x-auto overflow-y-hidden pb-2 pl-11 pr-11 sm:gap-3 sm:pl-12 sm:pr-12",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          autoScroll === "continuous" ? "snap-none" : "snap-x snap-mandatory",
        )}
      >
        {loopSlides.map((img, i) => (
          <div
            key={`${img.src}-${i}`}
            data-carousel-card
            className={cn(
              "group relative aspect-[4/5] w-[38vw] max-w-[220px] shrink-0 overflow-hidden border border-gold/10 bg-[#0b0b0b] transition-[border-color,box-shadow] duration-500 ease-out hover:border-gold/22 hover:shadow-[0_0_0_1px_rgba(198,164,108,0.06)] sm:w-[min(28vw,220px)] md:aspect-[3/4] md:h-auto md:w-[220px] md:max-w-[220px]",
              autoScroll === "continuous" ? "" : "snap-start",
            )}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="(max-width: 768px) 38vw, (max-width: 1024px) 28vw, 220px"
              className="object-cover brightness-[0.9] contrast-[1.06] saturate-[0.9] transition duration-[750ms] ease-out group-hover:scale-[1.06]"
              priority={i === 0}
            />
          </div>
        ))}
      </div>

      <div
        className="mt-5 flex max-w-full flex-wrap items-center justify-center gap-2 overflow-x-auto px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="Slide indicators"
      >
        {images.map((img, i) => (
          <button
            key={`dot-${img.src}-${i}`}
            type="button"
            aria-label={`Go to image ${i + 1} of ${n}`}
            aria-current={i === active}
            className={cn(
              "h-1.5 rounded-full transition-[width,background-color] duration-300 ease-out",
              i === active
                ? "w-8 bg-gold/85"
                : "w-1.5 bg-gold/22 hover:bg-gold/45",
            )}
            onClick={() => goToIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}
