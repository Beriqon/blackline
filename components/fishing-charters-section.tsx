"use client";

import { useState } from "react";

import { AddToCartButton } from "@/components/add-to-cart-button";
import {
  FISHING_CHARTER_INCLUSIONS,
  FISHING_CRUISING_CHARTER,
  FISHING_INSHORE_CHARTER,
  FISHING_OFFSHORE_CHARTER,
} from "@/lib/jetskis-jetcars-data";
import { cn } from "@/lib/utils";

const FISHING_HREF = "/services/jetskis-jetcars?tab=fishing#fishing-charters";

const fishingSelectField =
  "mt-2 w-full border border-gold/20 bg-[#0b0b0b] px-3 py-2.5 text-sm text-cream outline-none transition-[border-color] focus-visible:border-gold/50";

type FishingTier = { readonly duration: string; readonly price: string };

function FishingTierAddBlock({
  itemIdPrefix,
  title,
  subtitle,
  tiers,
}: {
  itemIdPrefix: string;
  title: string;
  subtitle: string;
  tiers: readonly FishingTier[];
}) {
  const [idx, setIdx] = useState(0);
  const tier = tiers[idx]!;
  const selectId = `${itemIdPrefix}-duration`;

  return (
    <div className="mt-6 border-t border-gold/10 pt-6">
      <label
        htmlFor={selectId}
        className="text-[0.6rem] font-medium uppercase tracking-[0.24em] text-gold/65"
      >
        Select duration
      </label>
      <select
        id={selectId}
        value={idx}
        onChange={(e) => setIdx(Number.parseInt(e.target.value, 10))}
        className={fishingSelectField}
      >
        {tiers.map((t, i) => (
          <option key={t.duration} value={i}>
            {t.duration} — {t.price}
          </option>
        ))}
      </select>
      <AddToCartButton
        item={{
          category: "fishing",
          id: `${itemIdPrefix}-${idx}`,
          title,
          subtitle: `${subtitle} · ${tier.duration}`,
          priceHint: tier.price,
          href: FISHING_HREF,
        }}
        className="mt-4 w-full sm:w-auto"
      />
    </div>
  );
}

export function PriceRow({
  duration,
  price,
  className,
}: {
  duration: string;
  price: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-baseline justify-between gap-4 border-b border-gold/[0.08] py-2.5 text-sm last:border-b-0 sm:py-3",
        className,
      )}
    >
      <span className="text-cream/55">{duration}</span>
      <span className="font-medium tabular-nums tracking-tight text-gold-secondary">
        {price}
      </span>
    </div>
  );
}

export function FishingChartersSection({ className }: { className?: string }) {
  return (
    <div className={cn("py-16 sm:py-20 lg:py-24", className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="max-w-2xl">
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.5em] text-gold/90">
            Fishing trips
          </p>
          <div className="mt-4 h-px w-14 bg-gold/30" aria-hidden />
          <h2
            id="fishing-charters-heading"
            className="mt-5 font-serif text-2xl tracking-tight text-cream sm:text-3xl md:text-[2.1rem]"
          >
            Charter options &amp; rates
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-cream/58 sm:text-[0.9375rem]">
            Cruising, inshore, and offshore — pick the day that fits your group.
            We coordinate departure, timing, and crew with the rest of your
            Miami stay.
          </p>
        </div>

        <div className="mt-12 space-y-10 lg:space-y-12">
          {/* Cruising */}
          <div className="border border-gold/12 bg-[#0a0a0a]/90 p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h3 className="font-serif text-xl tracking-tight text-cream sm:text-2xl">
                  {FISHING_CRUISING_CHARTER.title}
                </h3>
                <p className="mt-1 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-gold/80">
                  Departure areas
                </p>
                <p className="mt-3 max-w-xl text-[0.9375rem] leading-relaxed text-cream/62">
                  {FISHING_CRUISING_CHARTER.locations.join(" · ")}
                </p>
              </div>
              <div className="shrink-0 border-t border-gold/15 pt-4 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-cream/45">
                  From
                </p>
                <p className="mt-1 font-serif text-3xl tracking-tight text-gold-secondary sm:text-[2rem]">
                  {FISHING_CRUISING_CHARTER.rate}
                </p>
                <p className="mt-2 text-[0.65rem] uppercase tracking-[0.18em] text-cream/45">
                  From {FISHING_CRUISING_CHARTER.tiers[0]!.price}{" "}
                  <span className="text-cream/35">({FISHING_CRUISING_CHARTER.tiers[0]!.duration})</span>
                </p>
              </div>
            </div>
            <div className="mt-8 border-t border-gold/10 pt-2">
              {FISHING_CRUISING_CHARTER.tiers.map((row) => (
                <PriceRow
                  key={row.duration}
                  duration={row.duration}
                  price={row.price}
                />
              ))}
            </div>
            <FishingTierAddBlock
              itemIdPrefix="fishing-cruising"
              title={FISHING_CRUISING_CHARTER.title}
              subtitle={FISHING_CRUISING_CHARTER.locations.join(" · ")}
              tiers={FISHING_CRUISING_CHARTER.tiers}
            />
          </div>

          {/* Inshore + Offshore */}
          <div className="grid gap-px overflow-hidden border border-gold/12 bg-gold/12 lg:grid-cols-2">
            <div className="flex h-full min-h-0 flex-col bg-[#0a0a0a]/95 p-6 sm:p-8 lg:p-10">
              <div className="shrink-0">
                <h3 className="font-serif text-xl tracking-tight text-cream sm:text-[1.35rem]">
                  {FISHING_INSHORE_CHARTER.title}
                </h3>
                <p className="mt-2 text-xs font-medium uppercase tracking-[0.2em] text-gold/75">
                  {FISHING_INSHORE_CHARTER.vessel}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-cream/55">
                  <span className="text-cream/40">Target species: </span>
                  {FISHING_INSHORE_CHARTER.targets}
                </p>
              </div>
              <div className="mt-auto shrink-0 border-t border-gold/10 pt-2">
                {FISHING_INSHORE_CHARTER.tiers.map((row) => (
                  <PriceRow
                    key={row.duration}
                    duration={row.duration}
                    price={row.price}
                  />
                ))}
              </div>
              <FishingTierAddBlock
                itemIdPrefix="fishing-inshore"
                title={FISHING_INSHORE_CHARTER.title}
                subtitle={FISHING_INSHORE_CHARTER.vessel}
                tiers={FISHING_INSHORE_CHARTER.tiers}
              />
            </div>

            <div className="flex h-full min-h-0 flex-col bg-[#0a0a0a]/95 p-6 sm:p-8 lg:p-10">
              <div className="shrink-0">
                <h3 className="font-serif text-xl tracking-tight text-cream sm:text-[1.35rem]">
                  {FISHING_OFFSHORE_CHARTER.title}
                </h3>
                <p className="mt-2 text-xs font-medium uppercase tracking-[0.2em] text-gold/75">
                  {FISHING_OFFSHORE_CHARTER.vessels.join(" · ")}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-cream/55">
                  <span className="text-cream/40">Target species: </span>
                  {FISHING_OFFSHORE_CHARTER.targets}
                </p>
              </div>
              <div className="mt-auto shrink-0 border-t border-gold/10 pt-2">
                {FISHING_OFFSHORE_CHARTER.tiers.map((row) => (
                  <PriceRow
                    key={row.duration}
                    duration={row.duration}
                    price={row.price}
                  />
                ))}
              </div>
              <FishingTierAddBlock
                itemIdPrefix="fishing-offshore"
                title={FISHING_OFFSHORE_CHARTER.title}
                subtitle={FISHING_OFFSHORE_CHARTER.vessels.join(" · ")}
                tiers={FISHING_OFFSHORE_CHARTER.tiers}
              />
            </div>
          </div>

          {/* What's included */}
          <div className="relative overflow-hidden border border-gold/15 bg-gradient-to-br from-[#101010] via-[#0c0c0c] to-[#080808] px-6 py-8 sm:px-10 sm:py-10">
            <div
              className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gold/[0.04] blur-3xl"
              aria-hidden
            />
            <h3 className="font-serif text-lg tracking-tight text-cream sm:text-xl">
              What&apos;s included
            </h3>
            <ul className="mt-6 space-y-4">
              {FISHING_CHARTER_INCLUSIONS.map((line) => (
                <li
                  key={line}
                  className="flex gap-4 text-sm leading-relaxed text-cream/62 sm:text-[0.9375rem]"
                >
                  <span
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold/70"
                    aria-hidden
                  />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
