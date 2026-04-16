"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import { ScrollRevealItem } from "@/components/scroll-reveal-item";
import { cn } from "@/lib/utils";

type HighlightPhoto = {
  src: string;
  alt: string;
};

const PHOTOS_PER_PAGE = 6;

export function ExperiencesPhotoHighlights({
  photos,
}: {
  photos: readonly HighlightPhoto[];
}) {
  const [activePage, setActivePage] = useState(0);

  const pages = useMemo(() => {
    const chunks: HighlightPhoto[][] = [];
    for (let i = 0; i < photos.length; i += PHOTOS_PER_PAGE) {
      chunks.push(photos.slice(i, i + PHOTOS_PER_PAGE));
    }
    return chunks;
  }, [photos]);

  return (
    <>
      <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
        {pages[activePage]?.map((photo, index) => (
          <ScrollRevealItem key={photo.src} index={index + 1}>
            <div className="group relative aspect-[4/5] overflow-hidden border border-gold/12">
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover brightness-[0.9] transition duration-700 ease-out group-hover:scale-[1.06] group-hover:brightness-100"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0b0b0b]/78 via-transparent to-transparent" />
            </div>
          </ScrollRevealItem>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-center gap-2 sm:mt-7">
        {pages.map((_, index) => (
          <button
            key={`page-${index + 1}`}
            type="button"
            onClick={() => setActivePage(index)}
            className={cn(
              "inline-flex size-9 items-center justify-center border text-[0.74rem] font-semibold transition-colors duration-200",
              activePage === index
                ? "border-gold/70 bg-gold/90 text-[#14110b]"
                : "border-gold/24 bg-transparent text-cream/85 hover:border-gold/45 hover:text-gold-secondary",
            )}
            aria-label={`Show photo page ${index + 1}`}
            aria-current={activePage === index ? "page" : undefined}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </>
  );
}
