"use client";

import Image from "next/image";
import { useId, useState } from "react";

import type { FeaturedVenue } from "@/lib/vip-nightlife-data";
import { cn } from "@/lib/utils";

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function VipVenueCard({ venue }: { venue: FeaturedVenue }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <article className="group flex flex-col overflow-hidden border border-gold/12 bg-[#0a0a0a] shadow-[inset_0_1px_0_0_rgba(198,164,108,0.05),0_20px_48px_-28px_rgba(0,0,0,0.75)] transition-[border-color,box-shadow] duration-300 hover:border-gold/28 hover:shadow-[0_24px_56px_-24px_rgba(0,0,0,0.85)]">
      <div className="relative aspect-[4/3] shrink-0 overflow-hidden">
        <Image
          src={venue.imageSrc}
          alt={venue.imageAlt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#0b0b0b]/95 via-[#0b0b0b]/35 to-transparent"
          aria-hidden
        />
        <div className="absolute inset-x-0 bottom-0 p-4 pt-12 sm:p-5 sm:pt-14">
          <h3 className="font-serif text-lg leading-tight tracking-tight text-cream sm:text-xl">
            {venue.name}
          </h3>
          {venue.subtitle ? (
            <p className="mt-1 text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-gold/85">
              {venue.subtitle}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col border-t border-gold/10 bg-[#060606]/98">
        <div className="px-4 pb-3 pt-4 sm:px-5 sm:pb-4 sm:pt-5">
          <p
            className={cn(
              "text-[0.8125rem] leading-relaxed text-cream/62",
              !open && "line-clamp-3",
            )}
          >
            {venue.about}
          </p>
        </div>

        <div className="mt-auto px-4 pb-4 sm:px-5 sm:pb-5">
          <button
            type="button"
            id={`${panelId}-toggle`}
            aria-expanded={open}
            aria-controls={
              venue.gallery.length > 0 ? `${panelId}-panel` : undefined
            }
            onClick={() => setOpen((v) => !v)}
            className="flex w-full items-center justify-between gap-3 border border-gold/18 bg-gold/[0.05] px-3.5 py-3 text-left transition hover:border-gold/35 hover:bg-gold/[0.08]"
          >
            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-gold/95">
              {open
                ? "Show less"
                : venue.gallery.length > 0
                  ? `More photos & info (${venue.gallery.length} more)`
                  : "Read full description"}
            </span>
            <ChevronIcon
              className={cn(
                "size-4 shrink-0 text-gold/70 transition-transform duration-300",
                open && "rotate-180",
              )}
            />
          </button>

          {open && venue.gallery.length > 0 ? (
            <div
              id={`${panelId}-panel`}
              role="region"
              aria-label={`${venue.name} photo gallery`}
              className="mt-4 border-t border-gold/[0.08] pt-4"
            >
              <p className="mb-3 text-[0.62rem] font-medium uppercase tracking-[0.2em] text-gold/55">
                Additional photos
              </p>
              <ul
                className="grid list-none grid-cols-2 gap-2 sm:gap-3"
                role="list"
              >
                {venue.gallery.map((img, i) => (
                  <li
                    key={`${venue.name}-gallery-${i}`}
                    className="relative aspect-[4/3] overflow-hidden border border-gold/10 bg-[#0a0a0a]"
                  >
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      sizes="(max-width: 640px) 45vw, 20vw"
                      className="object-cover transition duration-500 hover:scale-[1.03]"
                    />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
