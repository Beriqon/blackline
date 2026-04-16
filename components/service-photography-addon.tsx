"use client";

import Image from "next/image";
import Link from "next/link";
import { useReducedMotion } from "motion/react";
import type { CSSProperties } from "react";
import { useId } from "react";

import { SectionReveal } from "@/components/section-reveal";
import { cn } from "@/lib/utils";

const linkSubtle =
  "text-sm font-medium tracking-wide text-gold-secondary underline-offset-8 transition-all duration-300 ease-out hover:text-gold hover:underline hover:drop-shadow-[0_0_14px_rgba(198,164,108,0.35)]";

/** Default shoot placeholders — swap URLs when you have real assets (6 slots: 3 left, 3 right). */
const DEFAULT_SHOOT_THUMBS = [
  {
    src: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=88&w=600",
    alt: "Performance car on the road — sample shoot still",
  },
  {
    src: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=88&w=600",
    alt: "Luxury car front detail — sample shoot still",
  },
  {
    src: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=88&w=600",
    alt: "Sports car rear view — sample shoot still",
  },
  {
    src: "https://images.unsplash.com/photo-1764013290499-bc46136765b1?auto=format&fit=crop&q=88&w=600",
    alt: "Exotic car on city streets — sample shoot still",
  },
  {
    src: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=88&w=600",
    alt: "Sports car detail — sample shoot still",
  },
  {
    src: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=88&w=600",
    alt: "Car interior and steering wheel — sample shoot still",
  },
] as const;

export type ServicePhotographyAddonProps = {
  headline: string;
  description: string;
  /** Optional override for thumbnail strip (placeholders or real shoots). */
  images?: readonly { src: string; alt: string }[];
  className?: string;
  /**
   * `static` — fixed row of thumbnails, no scrolling animation (good for few images).
   * `marquee` — infinite horizontal scroll (default).
   */
  layout?: "marquee" | "static";
  /**
   * Marquee loop duration in seconds (default 50). Use a higher value when there are many images so the scroll speed stays comfortable. Ignored when layout is `static`.
   */
  marqueeDurationSec?: number;
};

const thumbClass =
  "relative aspect-[3/4] w-[5.5rem] shrink-0 overflow-hidden rounded-sm border border-gold/10 sm:w-[6.75rem] md:w-[7.25rem]";

const thumbClassStatic =
  "relative aspect-[3/4] min-h-0 min-w-0 w-full overflow-hidden rounded-sm border border-gold/10";

export function ServicePhotographyAddon({
  headline,
  description,
  images = DEFAULT_SHOOT_THUMBS,
  className,
  layout = "marquee",
  marqueeDurationSec,
}: ServicePhotographyAddonProps) {
  const headingId = useId();
  const reduceMotion = useReducedMotion();
  const showMarquee = layout === "marquee" && !reduceMotion;

  return (
    <SectionReveal
      className={cn(
        "border-b border-gold/10 bg-[#0c0c0c] py-9 sm:py-10",
        className,
      )}
      aria-labelledby={headingId}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
          <div className="min-w-0 max-w-xl shrink-0 lg:max-w-[min(28rem,100%)]">
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.42em] text-gold/75">
              Add-on
            </p>
            <h2
              id={headingId}
              className="mt-2 font-serif text-lg leading-snug tracking-tight text-cream sm:text-xl"
            >
              {headline}
            </h2>
            <p className="mt-2 text-[0.8125rem] leading-relaxed text-cream/50 sm:text-sm">
              {description}
            </p>
            <p className="mt-3">
              <Link href="/services/photographer" className={linkSubtle}>
                Photo &amp; video shoots
              </Link>
            </p>
          </div>

          <div className="min-w-0 w-full lg:flex-1 lg:pl-4">
            <p className="sr-only">
              {showMarquee
                ? "Sample shoot stills scroll horizontally"
                : "Sample shoot stills"}
            </p>
            <div className="overflow-hidden rounded-sm border border-gold/10 bg-[#0a0a0a]/50 px-2 py-2 sm:px-3">
              {showMarquee ? (
                <div
                  className={cn("flex w-max", "addon-photo-marquee")}
                  style={
                    marqueeDurationSec != null
                      ? ({
                          "--addon-marquee-duration": `${marqueeDurationSec}s`,
                        } as CSSProperties)
                      : undefined
                  }
                  aria-hidden
                >
                  {[0, 1].map((track) => (
                    <div
                      key={track}
                      className="flex shrink-0 gap-3 pr-3"
                      role="presentation"
                    >
                      {images.map((img, i) => (
                        <div
                          key={`${track}-${i}-${img.src}`}
                          className={thumbClass}
                        >
                          <Image
                            src={img.src}
                            alt=""
                            fill
                            sizes="116px"
                            className="object-cover brightness-[0.88] contrast-[1.05] saturate-[0.9]"
                          />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className={cn(
                    "grid w-full gap-2 sm:gap-3",
                    images.length === 1 && "grid-cols-1",
                    images.length === 2 && "grid-cols-2",
                    images.length >= 3 && "grid-cols-3",
                  )}
                  role="list"
                >
                  {images.map((img, i) => (
                    <div
                      key={`static-${img.src}-${i}`}
                      role="listitem"
                      className={thumbClassStatic}
                    >
                      <Image
                        src={img.src}
                        alt={img.alt}
                        fill
                        sizes="(min-width: 1024px) 200px, 33vw"
                        className="object-cover brightness-[0.88] contrast-[1.05] saturate-[0.9]"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </SectionReveal>
  );
}
