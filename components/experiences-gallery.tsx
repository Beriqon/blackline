"use client";

import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import {
  Car,
  CarFront,
  Home,
  Palmtree,
  Plane,
  Ship,
  Sparkles,
  Waves,
  Wine,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { ScrollRevealItem } from "@/components/scroll-reveal-item";
import type {
  ExperiencesGalleryCategory,
  GalleryIconId,
  GalleryPhotoItem,
} from "@/lib/experiences-gallery-data";
import { cn } from "@/lib/utils";

const ICONS: Record<GalleryIconId, LucideIcon> = {
  ship: Ship,
  sparkles: Sparkles,
  car: Car,
  home: Home,
  plane: Plane,
  waves: Waves,
  carFront: CarFront,
  palmtree: Palmtree,
  wine: Wine,
};

function GalleryPhotoTile({
  photo,
  index,
}: {
  photo: GalleryPhotoItem;
  index: number;
}) {
  return (
    <ScrollRevealItem index={index}>
      <figure
        className={cn(
          "group relative aspect-[4/5] overflow-hidden border border-gold/12 bg-[#0b0b0b] shadow-[inset_0_1px_0_0_rgba(198,164,108,0.05)] transition-[border-color,box-shadow] duration-500 ease-out",
          "hover:border-gold/22 hover:shadow-[0_0_0_1px_rgba(198,164,108,0.06)]",
        )}
      >
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover brightness-[0.88] contrast-[1.06] saturate-[0.92] transition duration-[650ms] ease-out group-hover:scale-[1.05] group-hover:brightness-[1.02]"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0b0b0b]/92 via-[#0b0b0b]/25 to-transparent"
          aria-hidden
        />
        <figcaption className="absolute inset-x-0 bottom-0 px-3 pb-3 pt-8 sm:px-3.5 sm:pb-3.5">
          <span className="block font-serif text-[0.8rem] leading-tight tracking-tight text-cream/95 sm:text-[0.85rem]">
            {photo.caption}
          </span>
        </figcaption>
      </figure>
    </ScrollRevealItem>
  );
}

function CategorySection({ cat }: { cat: ExperiencesGalleryCategory }) {
  const Icon = ICONS[cat.icon];
  const headingId = `gallery-cat-${cat.id}`;
  const reduceMotion = useReducedMotion();
  const headerHidden = reduceMotion
    ? { opacity: 1, y: 0 }
    : { opacity: 0, y: 22 };

  return (
    <motion.section
      className="border-b border-gold/10 pb-12 last:border-b-0 last:pb-0 sm:pb-14"
      aria-labelledby={headingId}
      initial={headerHidden}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08, margin: "0px 0px -6% 0px" }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-start sm:gap-5">
        <motion.span
          className="flex size-11 shrink-0 items-center justify-center rounded-sm border border-gold/15 bg-[#0b0b0b]/90 text-gold/55 sm:size-12"
          aria-hidden
          initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <Icon className="size-5 sm:size-[1.35rem]" strokeWidth={1.35} />
        </motion.span>
        <div className="min-w-0">
          <h2
            id={headingId}
            className="font-serif text-xl leading-snug tracking-tight text-cream sm:text-[1.35rem]"
          >
            {cat.category}
          </h2>
          <p className="mt-1.5 max-w-2xl text-[0.8125rem] leading-relaxed text-cream/48 sm:text-sm">
            {cat.blurb}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
        {cat.photos.map((photo, index) => (
          <GalleryPhotoTile key={photo.id} photo={photo} index={index} />
        ))}
      </div>
    </motion.section>
  );
}

export function ExperiencesGallery({
  categories,
}: {
  categories: readonly ExperiencesGalleryCategory[];
}) {
  return (
    <div className="mx-auto max-w-5xl space-y-12 px-4 sm:space-y-14 sm:px-6 lg:px-8">
      {categories.map((cat) => (
        <CategorySection key={cat.id} cat={cat} />
      ))}
    </div>
  );
}
