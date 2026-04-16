"use client";

import Image from "next/image";
import Link from "next/link";

import { AddToCartButton } from "@/components/add-to-cart-button";
import { PriceRow } from "@/components/fishing-charters-section";
import { SectionReveal } from "@/components/section-reveal";
import {
  JET_SKI_JETCAR_SECTION,
  JETSKIS_OFFERINGS,
  JET_SKI_JETCAR_LOOK_IMAGES,
} from "@/lib/jetskis-jetcars-data";
import { cn } from "@/lib/utils";

const linkAccent =
  "text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-gold/85 transition-colors hover:text-gold-secondary";

export function JetskisJetcarsExperience() {
  return (
    <>
      <SectionReveal
        id="jetskis-jetcars-offerings"
        className="scroll-mt-[5.5rem] border-b border-gold/10 bg-[#0d0d0d] py-16 sm:scroll-mt-24 sm:py-20 lg:py-24"
        aria-labelledby="experience-showcase-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:max-w-xl lg:text-left">
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.5em] text-gold/90">
              On the water
            </p>
            <div className="mx-auto mt-4 h-px w-14 bg-gold/30 lg:mx-0" aria-hidden />
            <h2
              id="experience-showcase-heading"
              className="mt-5 font-serif text-2xl tracking-tight text-cream sm:text-3xl md:text-[2.1rem]"
            >
              Three ways to spend the day
            </h2>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-6">
            {JETSKIS_OFFERINGS.map((item, index) => (
              <Link
                key={item.title}
                href={item.sectionHref}
                scroll
                className={cn(
                  "group relative flex flex-col overflow-hidden border border-gold/[0.12] bg-[#0a0a0a] text-left outline-none transition-[box-shadow] focus-visible:ring-2 focus-visible:ring-gold/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0d0d]",
                  index === 2 && "sm:col-span-2 lg:col-span-1",
                )}
              >
                <div className="relative aspect-[4/5] w-full overflow-hidden sm:aspect-[3/4]">
                  <Image
                    src={item.image}
                    alt={item.imageAlt}
                    fill
                    sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
                    className="object-cover transition-[transform,filter] duration-700 ease-out group-hover:scale-[1.04] group-hover:brightness-105"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-[#0b0b0b] via-[#0b0b0b]/35 to-transparent"
                    aria-hidden
                  />
                  <span className="absolute left-4 top-4 inline-flex border border-gold/25 bg-[#0b0b0b]/55 px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-gold/90 backdrop-blur-sm">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                    <h3 className="font-serif text-xl tracking-tight text-cream sm:text-2xl">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-[0.875rem] leading-relaxed text-cream/65 sm:text-[0.9375rem]">
                      {item.description}
                    </p>
                    <span
                      className={cn(
                        linkAccent,
                        "mt-5 inline-flex items-center gap-1 group-hover:text-gold-secondary",
                      )}
                    >
                      {item.ctaLabel}
                      <span aria-hidden> →</span>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </SectionReveal>

      <SectionReveal
        id="jetskis-jetcars-look-and-feel"
        className="scroll-mt-[5.5rem] border-b border-gold/10 bg-charcoal py-16 sm:scroll-mt-24 sm:py-20 lg:py-24"
        aria-labelledby="rates-visual-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-10 lg:items-start">
            <div className="lg:col-span-7">
              <p
                id="rates-visual-heading"
                className="text-[0.65rem] font-medium uppercase tracking-[0.5em] text-gold/90"
              >
                Look &amp; feel
              </p>
              <div className="mt-4 h-px w-14 bg-gold/30" aria-hidden />
              <h2 className="mt-5 font-serif text-2xl tracking-tight text-cream sm:text-[1.85rem]">
                {JET_SKI_JETCAR_SECTION.headline}
              </h2>
              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                {JET_SKI_JETCAR_LOOK_IMAGES.map((img, i) => (
                  <div
                    key={img.src}
                    className="relative aspect-[4/3] overflow-hidden border border-gold/[0.1] sm:aspect-[4/5]"
                  >
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      sizes="(max-width:640px) 100vw, 42vw"
                      className="object-cover"
                      priority={i === 0}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 lg:sticky lg:top-28">
              <div className="border border-gold/15 bg-[#0a0a0a]/90 p-6 sm:p-8">
                <div className="space-y-3">
                  {JET_SKI_JETCAR_SECTION.intro.map((paragraph, i) => (
                    <p
                      key={`jet-intro-${i}`}
                      className="text-[0.9375rem] leading-relaxed text-cream/58"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>

                <div className="mt-8 flex flex-wrap gap-2">
                  {JET_SKI_JETCAR_SECTION.locations.map((loc) => (
                    <span
                      key={loc}
                      className="border border-gold/20 bg-gold/[0.06] px-3 py-1.5 text-[0.7rem] font-medium uppercase tracking-[0.12em] text-cream/75"
                    >
                      {loc}
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-[0.65rem] uppercase tracking-[0.2em] text-gold/55">
                  {JET_SKI_JETCAR_SECTION.locationsLabel}
                </p>

                <p className="mt-8 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-gold/75">
                  Starting rates
                </p>
                <div className="mt-3 border-t border-gold/10">
                  {JET_SKI_JETCAR_SECTION.rates.map((row) => {
                    const anchorId = row.label.includes("Jetcar")
                      ? "jetcars-pricing"
                      : row.label.includes("Jet ski")
                        ? "jet-skis-pricing"
                        : undefined;
                    return (
                      <div
                        key={row.label}
                        id={anchorId}
                        className={
                          anchorId
                            ? "scroll-mt-[5.5rem] sm:scroll-mt-24"
                            : undefined
                        }
                      >
                        <PriceRow duration={row.label} price={row.price} />
                      </div>
                    );
                  })}
                </div>
                <p className="mt-6 text-xs leading-relaxed text-cream/42">
                  {JET_SKI_JETCAR_SECTION.footnote}
                </p>
                <div className="mt-8 flex flex-col gap-3 border-t border-gold/10 pt-6">
                  <AddToCartButton
                    item={{
                      category: "jetski",
                      id: "jetski-hourly",
                      title: "Jet ski session",
                      subtitle: "Miami Beach · Fort Lauderdale",
                      priceHint: "$150+ / hr (from)",
                      href: "/services/jetskis-jetcars#jet-skis-pricing",
                    }}
                    label="Add Jet ski session"
                    className="w-full"
                  />
                  <AddToCartButton
                    item={{
                      category: "jetcar",
                      id: "jetcar-hourly",
                      title: "Jetcar session",
                      subtitle: "Miami Beach · Fort Lauderdale",
                      priceHint: "$250+ / hr (from)",
                      href: "/services/jetskis-jetcars#jetcars-pricing",
                    }}
                    label="Add Jetcar session"
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionReveal>
    </>
  );
}
