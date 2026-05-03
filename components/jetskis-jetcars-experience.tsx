"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { AddToCartButton } from "@/components/add-to-cart-button";
import { PriceRow } from "@/components/fishing-charters-section";
import { SectionReveal } from "@/components/section-reveal";
import { formatUsd } from "@/lib/bookings";
import {
  JETCAR_HOURLY_FROM_USD_PER_UNIT,
  JET_SKI_JETCAR_SECTION,
  JETSKIS_OFFERINGS,
  JET_SKI_JETCAR_LOOK_IMAGES,
  JETSKI_HOURLY_FROM_USD_PER_UNIT,
} from "@/lib/jetskis-jetcars-data";
import { cn } from "@/lib/utils";

const jetUnitFieldClass =
  "mt-2 w-full max-w-[8rem] border border-gold/20 bg-[#0b0b0b] px-3 py-2 text-sm tabular-nums text-cream outline-none focus-visible:border-gold/45";

function JetSkiJetcarUnitConfigurator({
  variant,
  compact = false,
}: {
  variant: "jetski" | "jetcar";
  compact?: boolean;
}) {
  const [units, setUnits] = useState(1);
  const safeUnits = Math.min(20, Math.max(1, Math.floor(units) || 1));
  const perUnitUsd =
    variant === "jetski" ? JETSKI_HOURLY_FROM_USD_PER_UNIT : JETCAR_HOURLY_FROM_USD_PER_UNIT;
  const combinedFromUsd = safeUnits * perUnitUsd;

  const cartItem = useMemo(() => {
    if (variant === "jetski") {
      return {
        category: "jetski" as const,
        id: `jetski-hourly-n${safeUnits}`,
        title: "Jet ski session",
        subtitle: `Miami Beach · Fort Lauderdale · ${safeUnits} jet ski${safeUnits === 1 ? "" : "s"}`,
        priceHint: `From ${formatUsd(combinedFromUsd)}+ / hr combined`,
        href: "/services/jetskis-jetcars?tab=pwc#jet-skis-pricing",
      };
    }
    return {
      category: "jetcar" as const,
      id: `jetcar-hourly-n${safeUnits}`,
      title: "Jetcar session",
      subtitle: `Miami Beach · Fort Lauderdale · ${safeUnits} jetcar${safeUnits === 1 ? "" : "s"}`,
      priceHint: `From ${formatUsd(combinedFromUsd)}+ / hr combined`,
      href: "/services/jetskis-jetcars?tab=pwc#jetcars-pricing",
    };
  }, [variant, safeUnits, combinedFromUsd]);

  const isJetSki = variant === "jetski";
  const inputId = isJetSki ? "jetski-unit-count" : "jetcar-unit-count";
  const label = isJetSki ? "Number of jet skis" : "Number of jetcars";
  const shortLabel = isJetSki ? "Jet skis" : "Jetcars";
  const breakdown = `${safeUnits} × ${formatUsd(perUnitUsd)}+ / hr = ${formatUsd(combinedFromUsd)}+ / hr combined`;

  return (
    <div className={cn(compact ? "space-y-3" : "space-y-4")}>
      <div>
        <label
          htmlFor={inputId}
          className="text-[0.6rem] font-medium uppercase tracking-[0.24em] text-gold/65"
        >
          {compact ? shortLabel : label}
        </label>
        <input
          id={inputId}
          type="number"
          inputMode="numeric"
          min={1}
          max={20}
          value={units}
          onChange={(e) => {
            const n = Number.parseInt(e.target.value, 10);
            setUnits(Number.isFinite(n) ? Math.min(20, Math.max(1, n)) : 1);
          }}
          className={cn(jetUnitFieldClass, compact && "max-w-full sm:max-w-[6rem]")}
        />
        {compact ? (
          <p className="mt-1.5 text-[0.65rem] leading-snug text-cream/42">
            {formatUsd(perUnitUsd)}+ / unit / hr (from).
          </p>
        ) : (
          <p className="mt-2 text-xs leading-relaxed text-cream/48">
            {formatUsd(perUnitUsd)}+ per unit per hour (from). Final quote depends on marina,
            duration, and seasonality.
          </p>
        )}
      </div>

      <div
        className={cn(
          "border border-gold/20 bg-[#0b0b0b]/80",
          compact ? "px-3 py-2" : "px-4 py-3",
        )}
      >
        <p className="text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-gold/70">
          {compact ? "Est. hourly (from)" : "Estimated combined hourly (from)"}
        </p>
        <p
          className={cn(
            "mt-0.5 font-serif tracking-tight text-gold-secondary",
            compact ? "text-lg" : "text-2xl",
          )}
        >
          {formatUsd(combinedFromUsd)}+
        </p>
        <p
          className={cn(
            "leading-relaxed text-cream/52",
            compact ? "mt-1 text-[0.65rem]" : "mt-2 text-xs",
          )}
        >
          {breakdown}
        </p>
      </div>

      <AddToCartButton
        item={cartItem}
        label={isJetSki ? "Add Jet ski session" : "Add Jetcar session"}
        className="w-full"
      />
    </div>
  );
}

const linkAccent =
  "text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-gold/85 transition-colors hover:text-gold-secondary";

type JetskisJetcarsExperienceProps = {
  /**
   * `full` — default: includes the “Three ways” card row.
   * `ratesOnly` — look, feel, and pricing only (used on the tabbed water page).
   */
  variant?: "full" | "ratesOnly";
};

const JETSKI_FAQ_ITEMS = [
  {
    q: "What is the minimum age to drive the jet ski?",
    a: "18 years old.",
  },
  {
    q: "What is the minimum age to sign the waivers and rent agreement?",
    a: "18 years old.",
  },
  {
    q: "Is there any maximum weight limit per jet ski?",
    a: "Yes. To keep customers safe, the maximum total weight is 350 pounds per jet ski.",
  },
  {
    q: "Can a small kid ride as a passenger with an adult?",
    a: "Yes. Children above 6 years old can ride as passengers with an adult.",
  },
  {
    q: "What happens if the weather is bad?",
    a: "If the ride cannot happen due to weather conditions, you can reschedule or receive a full refund.",
  },
  {
    q: "Is a wetsuit or water shoes required?",
    a: "No. Beach clothes are fine, and barefoot is okay.",
  },
  {
    q: "Do we provide life jackets?",
    a: "Yes. Life jackets are available in all sizes.",
  },
  {
    q: "What should I bring with me for the Jet Ski rental?",
    a: "Bring a valid photo ID and any required documentation, swimwear and a change of clothes, sunscreen, a towel, and any snacks or refreshments you want during your adventure.",
  },
] as const;

export function JetskisJetcarsExperience({
  variant = "full",
}: JetskisJetcarsExperienceProps) {
  return (
    <>
      {variant === "full" ? (
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
      ) : null}

      <SectionReveal
        id="jetskis-jetcars-look-and-feel"
        className="scroll-mt-[5.5rem] border-b border-gold/10 bg-charcoal py-16 sm:scroll-mt-24 sm:py-20 lg:py-24"
        aria-labelledby="rates-visual-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-10 lg:items-start">
            <div className="lg:col-span-7 lg:self-start">
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

            <div className="lg:col-span-5 lg:sticky lg:top-28 lg:self-start">
              <div className="border border-gold/15 bg-[#0a0a0a]/90 p-5 sm:p-6">
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
                <p className="mt-5 text-xs leading-relaxed text-cream/42">
                  {JET_SKI_JETCAR_SECTION.footnote}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 border border-gold/15 bg-[#0a0a0a]/90 p-5 sm:p-6 lg:mt-10">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-gold/75">
              Add to your selection
            </p>
            <p className="mt-2 max-w-3xl text-xs leading-relaxed text-cream/48">
              Choose how many jet skis or jetcars you want; the combined hourly estimate updates from
              our starting rates. Marina, session length, and dates are confirmed when you book.
            </p>
            <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-0">
              <JetSkiJetcarUnitConfigurator variant="jetski" compact />
              <div className="sm:border-l sm:border-gold/10 sm:pl-8">
                <JetSkiJetcarUnitConfigurator variant="jetcar" compact />
              </div>
            </div>
          </div>

          <div className="mt-12 border-t border-gold/10 pt-10 lg:mt-14">
            <h3 className="font-serif text-xl tracking-tight text-cream sm:text-[1.5rem]">
              Jet Ski FAQ
            </h3>
            <div className="mt-5 space-y-3 text-[0.9375rem] leading-relaxed text-cream/62">
              {JETSKI_FAQ_ITEMS.map((item) => (
                <details
                  key={item.q}
                  className="group border border-gold/15 bg-[#101010] px-4 py-3"
                >
                  <summary className="relative cursor-pointer list-none pr-7 text-[0.95rem] font-medium text-cream/88 marker:content-none">
                    {item.q}
                    <span className="absolute right-4 text-gold/80 transition-transform duration-200 group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-[0.92rem] leading-relaxed text-cream/62">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </SectionReveal>
    </>
  );
}
