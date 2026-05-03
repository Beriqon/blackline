"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AddToCartButton } from "@/components/add-to-cart-button";
import { FishingChartersSection } from "@/components/fishing-charters-section";
import { JetskisJetcarsExperience } from "@/components/jetskis-jetcars-experience";
import { SectionReveal } from "@/components/section-reveal";
import { WATER_OVERVIEW_CARDS } from "@/lib/water-activities-data";
import {
  parseWaterActivityTab,
  WATER_ACTIVITY_TABS,
  type WaterActivityTab,
} from "@/lib/water-activities-tabs";
import { cn } from "@/lib/utils";

const tabBtnBase =
  "shrink-0 rounded-sm border px-3.5 py-2 text-center text-[0.65rem] font-semibold uppercase tracking-[0.12em] transition-[background-color,border-color,color] duration-200 sm:px-4 sm:py-2.5 sm:text-[0.68rem] sm:tracking-[0.14em]";

const parasailFieldClass =
  "mt-1.5 w-full max-w-[8rem] border border-gold/20 bg-[#0b0b0b] px-3 py-2 text-sm tabular-nums text-cream outline-none focus-visible:border-gold/45";

const PARASAIL_USD = {
  passenger: 120,
  observer: 85,
  privateTrip: 1000,
} as const;

/** Kayak & SUP — 60 min session, per-person rate on activity pages. */
const KAYAK_SUP_PER_PERSON_USD = 40;

function formatUsdWhole(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function ParasailingConfigurator() {
  const [tripMode, setTripMode] = useState<"shared" | "private">("shared");
  const [passengers, setPassengers] = useState(2);
  const [addObservers, setAddObservers] = useState(false);
  const [observers, setObservers] = useState(1);

  const safePassengers = Math.min(20, Math.max(1, Math.floor(passengers) || 1));
  const safeObservers = Math.min(20, Math.max(0, Math.floor(observers) || 0));
  const observerCount = tripMode === "shared" && addObservers ? safeObservers : 0;

  const totalUsd = useMemo(() => {
    if (tripMode === "private") return PARASAIL_USD.privateTrip;
    return safePassengers * PARASAIL_USD.passenger + observerCount * PARASAIL_USD.observer;
  }, [tripMode, safePassengers, observerCount]);

  const cartItem = useMemo(() => {
    const href = "/services/jetskis-jetcars?tab=parasailing";
    if (tripMode === "private") {
      return {
        category: "parasailing" as const,
        id: "parasailing-private-trip",
        title: "Parasailing — private trip",
        subtitle: "Miami Beach · up to 10 flying guests · gratuity not included",
        priceHint: formatUsdWhole(PARASAIL_USD.privateTrip),
        href,
      };
    }
    const parts: string[] = [
      `${safePassengers} flying passenger${safePassengers === 1 ? "" : "s"}`,
    ];
    if (observerCount > 0) {
      parts.push(
        `${observerCount} observer${observerCount === 1 ? "" : "s"}`,
      );
    }
    const id = `parasailing-shared-p${safePassengers}-o${observerCount}`;
    return {
      category: "parasailing" as const,
      id,
      title: "Parasailing — shared trip",
      subtitle: `Miami Beach · 300 Alton Rd, Dock A · ${parts.join(" · ")}`,
      priceHint: formatUsdWhole(totalUsd),
      href,
    };
  }, [tripMode, safePassengers, observerCount, totalUsd]);

  const breakdownLines = useMemo(() => {
    if (tripMode === "private") {
      return [`Private charter (up to 10 flyers): ${formatUsdWhole(PARASAIL_USD.privateTrip)}`];
    }
    const lines: string[] = [
      `${safePassengers} × ${formatUsdWhole(PARASAIL_USD.passenger)} (flying) = ${formatUsdWhole(safePassengers * PARASAIL_USD.passenger)}`,
    ];
    if (observerCount > 0) {
      lines.push(
        `${observerCount} × ${formatUsdWhole(PARASAIL_USD.observer)} (observers) = ${formatUsdWhole(observerCount * PARASAIL_USD.observer)}`,
      );
    }
    return lines;
  }, [tripMode, safePassengers, observerCount]);

  return (
    <div className="mt-6 space-y-6 border-t border-gold/10 pt-6">
      <fieldset>
        <legend className="text-[0.6rem] font-medium uppercase tracking-[0.24em] text-gold/65">
          Trip type
        </legend>
        <div className="mt-3 space-y-2">
          <label
            className={cn(
              "flex cursor-pointer gap-3 border p-3 transition-colors",
              tripMode === "shared"
                ? "border-gold/40 bg-gold/[0.08]"
                : "border-gold/15 bg-[#101010] hover:border-gold/28",
            )}
          >
            <input
              type="radio"
              name="parasail-trip"
              className="mt-1 border-gold/40 text-gold focus:ring-gold/30"
              checked={tripMode === "shared"}
              onChange={() => setTripMode("shared")}
            />
            <span className="text-[0.9375rem] leading-snug text-cream/78">
              <span className="font-medium text-cream/90">Shared trip</span> —{" "}
              {formatUsdWhole(PARASAIL_USD.passenger)} per flying passenger (6+), optional observers{" "}
              {formatUsdWhole(PARASAIL_USD.observer)} each.
            </span>
          </label>
          <label
            className={cn(
              "flex cursor-pointer gap-3 border p-3 transition-colors",
              tripMode === "private"
                ? "border-gold/40 bg-gold/[0.08]"
                : "border-gold/15 bg-[#101010] hover:border-gold/28",
            )}
          >
            <input
              type="radio"
              name="parasail-trip"
              className="mt-1 border-gold/40 text-gold focus:ring-gold/30"
              checked={tripMode === "private"}
              onChange={() => setTripMode("private")}
            />
            <span className="text-[0.9375rem] leading-snug text-cream/78">
              <span className="font-medium text-cream/90">Private trip</span> — up to 10 flying
              guests,{" "}
              <span className="text-gold-secondary">{formatUsdWhole(PARASAIL_USD.privateTrip)}</span>{" "}
              (gratuity not included).
            </span>
          </label>
        </div>
      </fieldset>

      {tripMode === "shared" ? (
        <div className="space-y-5">
          <div>
            <label
              htmlFor="parasail-passengers"
              className="text-[0.6rem] font-medium uppercase tracking-[0.24em] text-gold/65"
            >
              Flying passengers (ages 6+)
            </label>
            <input
              id="parasail-passengers"
              type="number"
              inputMode="numeric"
              min={1}
              max={20}
              value={passengers}
              onChange={(e) => {
                const n = Number.parseInt(e.target.value, 10);
                setPassengers(Number.isFinite(n) ? Math.min(20, Math.max(1, n)) : 1);
              }}
              className={parasailFieldClass}
            />
          </div>

          <div className="border border-gold/15 bg-[#101010] p-4">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                className="mt-1 size-4 shrink-0 rounded border-gold/35 bg-[#0b0b0b] text-gold focus:ring-gold/35"
                checked={addObservers}
                onChange={(e) => {
                  setAddObservers(e.target.checked);
                  if (e.target.checked && observers < 1) setObservers(1);
                }}
              />
              <span className="text-[0.9375rem] leading-relaxed text-cream/75">
                <span className="font-medium text-cream/88">Add observers</span> (boat only,
                non-flying) — {formatUsdWhole(PARASAIL_USD.observer)} per person when seats are
                available.
              </span>
            </label>
            {addObservers ? (
              <div className="mt-4 pl-7">
                <label
                  htmlFor="parasail-observers"
                  className="text-[0.6rem] font-medium uppercase tracking-[0.24em] text-gold/65"
                >
                  Number of observers
                </label>
                <input
                  id="parasail-observers"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={20}
                  value={observers}
                  onChange={(e) => {
                    const n = Number.parseInt(e.target.value, 10);
                    setObservers(Number.isFinite(n) ? Math.min(20, Math.max(1, n)) : 1);
                  }}
                  className={parasailFieldClass}
                />
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="border border-gold/20 bg-[#0b0b0b]/80 px-4 py-3">
        <p className="text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-gold/70">
          Estimated total
        </p>
        <p className="mt-1 font-serif text-2xl tracking-tight text-gold-secondary">
          {formatUsdWhole(totalUsd)}
        </p>
        <ul className="mt-2 space-y-1 text-xs leading-relaxed text-cream/52">
          {breakdownLines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>

      <AddToCartButton item={cartItem} className="w-full sm:w-auto" />
    </div>
  );
}

function KayakSupRentalConfigurator({ variant }: { variant: "kayak" | "sup" }) {
  const [people, setPeople] = useState(1);
  const safePeople = Math.min(20, Math.max(1, Math.floor(people) || 1));
  const totalUsd = safePeople * KAYAK_SUP_PER_PERSON_USD;

  const cartItem = useMemo(() => {
    const peopleLabel = `${safePeople} ${safePeople === 1 ? "person" : "people"}`;
    if (variant === "kayak") {
      return {
        category: "kayak" as const,
        id: `miami-beach-kayak-60-n${safePeople}`,
        title: "Kayak rental",
        subtitle: `Miami Beach · ${peopleLabel} · 60 min session`,
        priceHint: formatUsdWhole(totalUsd),
        href: "/services/jetskis-jetcars?tab=kayak",
      };
    }
    return {
      category: "paddleboard" as const,
      id: `miami-beach-sup-60-n${safePeople}`,
      title: "Paddle board (SUP) rental",
      subtitle: `Miami Beach · ${peopleLabel} · 60 min session`,
      priceHint: formatUsdWhole(totalUsd),
      href: "/services/jetskis-jetcars?tab=sup",
    };
  }, [variant, safePeople, totalUsd]);

  const breakdownLine = `${safePeople} × ${formatUsdWhole(KAYAK_SUP_PER_PERSON_USD)} = ${formatUsdWhole(totalUsd)}`;
  const inputId = variant === "kayak" ? "kayak-people-count" : "sup-people-count";

  return (
    <div
      className={cn(
        "mt-6 space-y-5 border-t border-gold/10 pt-6",
        variant === "kayak" && "max-w-xl",
      )}
    >
      <div>
        <label
          htmlFor={inputId}
          className="text-[0.6rem] font-medium uppercase tracking-[0.24em] text-gold/65"
        >
          Number of people
        </label>
        <input
          id={inputId}
          type="number"
          inputMode="numeric"
          min={1}
          max={20}
          value={people}
          onChange={(e) => {
            const n = Number.parseInt(e.target.value, 10);
            setPeople(Number.isFinite(n) ? Math.min(20, Math.max(1, n)) : 1);
          }}
          className={parasailFieldClass}
        />
        <p className="mt-2 text-xs leading-relaxed text-cream/48">
          {formatUsdWhole(KAYAK_SUP_PER_PERSON_USD)} per person · 60 minutes each.
        </p>
      </div>

      <div className="border border-gold/20 bg-[#0b0b0b]/80 px-4 py-3">
        <p className="text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-gold/70">
          Estimated total
        </p>
        <p className="mt-1 font-serif text-2xl tracking-tight text-gold-secondary">
          {formatUsdWhole(totalUsd)}
        </p>
        <p className="mt-2 text-xs leading-relaxed text-cream/52">{breakdownLine}</p>
      </div>

      <AddToCartButton item={cartItem} className="w-full sm:w-auto" />
    </div>
  );
}

function WaterActivitiesTabBar({
  active,
  onSelect,
}: {
  active: WaterActivityTab;
  onSelect: (t: WaterActivityTab) => void;
}) {
  return (
    <div className="sticky top-16 z-40 border-b border-gold/10 bg-[#0b0b0b]/96 backdrop-blur-md sm:top-[4.25rem]">
      <div className="mx-auto max-w-7xl px-3 py-3 sm:px-5 lg:px-10">
        <p
          className="mb-2.5 text-center text-[0.55rem] font-medium uppercase tracking-[0.4em] text-cream/38 sm:mb-3"
          id="water-activity-filter-label"
        >
          Category
        </p>
        <nav
          className="flex max-w-full flex-wrap justify-center gap-1.5 overflow-x-auto overflow-y-hidden pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] sm:overflow-visible [&::-webkit-scrollbar]:hidden"
          aria-labelledby="water-activity-filter-label"
        >
          {WATER_ACTIVITY_TABS.map((t) => {
            const isActive = active === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onSelect(t.id)}
                className={cn(
                  tabBtnBase,
                  isActive
                    ? "border-gold/45 bg-gold/[0.12] text-cream"
                    : "border-gold/15 bg-[#101010] text-cream/65 hover:border-gold/28 hover:text-cream/88",
                )}
                aria-pressed={isActive}
              >
                {t.label}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

function OverviewGrid({ onSelect }: { onSelect: (t: WaterActivityTab) => void }) {
  return (
    <SectionReveal
      className="border-b border-gold/10 bg-[#0d0d0d] py-16 sm:py-20 lg:py-24"
      aria-labelledby="water-overview-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:max-w-xl lg:text-left">
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.5em] text-gold/90">
            On the water
          </p>
          <div className="mx-auto mt-4 h-px w-14 bg-gold/30 lg:mx-0" aria-hidden />
          <h2
            id="water-overview-heading"
            className="mt-5 font-serif text-2xl tracking-tight text-cream sm:text-3xl md:text-[2.1rem]"
          >
            Choose how you want to get out there
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-cream/55 sm:text-[0.9375rem]">
            Pick a category to see details and pricing — or use the bar above
            to switch anytime. Every activity section below is organized with
            clear details, pricing, and booking info so you can plan your day
            on the water in one place.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:mt-16 lg:grid-cols-2 lg:gap-6">
          {WATER_OVERVIEW_CARDS.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.tab)}
              className="group relative flex w-full flex-col overflow-hidden border border-gold/[0.12] bg-[#0a0a0a] text-left outline-none transition-[box-shadow] focus-visible:ring-2 focus-visible:ring-gold/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0d0d] sm:min-h-0"
            >
              <div className="relative aspect-[16/9] w-full overflow-hidden sm:aspect-[2/1]">
                <Image
                  src={item.image}
                  alt={item.imageAlt}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
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
                  {item.priceLabel ? (
                    <p className="mt-3 border border-gold/20 bg-[#0b0b0b]/65 px-3 py-2 text-[0.8125rem] font-medium leading-snug text-gold-secondary backdrop-blur-sm sm:text-[0.84375rem]">
                      {item.priceLabel}
                    </p>
                  ) : null}
                  <span className="mt-4 inline-flex text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-gold/85 transition-colors group-hover:text-gold-secondary">
                    View details <span aria-hidden> →</span>
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </SectionReveal>
  );
}

function ParasailingSection() {
  const faqItems = [
    {
      q: "How much does parasailing cost?",
      a: "Passengers (ages 6+) are $120. Observers (non-flyers) are $85. Private parasailing trips (up to 10 passengers, gratuity not included) are $1,000.",
    },
    {
      q: "How long is each flight?",
      a: "Air time is typically 8-10 minutes per flight.",
    },
    {
      q: "Can we fly double or triple?",
      a: "Yes. You can usually fly double (2 people) or triple (3 people), depending on conditions and combined weight.",
    },
    {
      q: "Are water dips included?",
      a: "Yes. Optional water dips at the end of the flight are available and included.",
    },
    {
      q: "What is included in the activity?",
      a: "Your experience includes a safety briefing, life jacket, parasail flight, boat ride, bottled water, and photo-worthy views.",
    },
    {
      q: "What are the age and weight requirements?",
      a: "Minimum age to fly is 6. Children under 12 must be accompanied by an adult. Maximum combined flight weight is 500 lbs, and weight limits may change based on wind and water conditions.",
    },
    {
      q: "Can single riders book?",
      a: "A minimum of 2 passengers is required per parasail flight. Single bookings can be canceled if pairing is not possible.",
    },
    {
      q: "Can spectators join the boat?",
      a: "Yes, spectators can join when seats are available for an additional fee. Availability is limited and cannot be reserved in advance.",
    },
    {
      q: "What are the cancellation terms?",
      a: "24-hour notice gives a full refund. Same-day cancellations can receive 50% refund if canceled at least 1 hour before check-in. No refund is available within 1 hour of check-in. Weather-related cancellations are fully refundable.",
    },
    {
      q: "Are photos available?",
      a: "Yes. HD photo packages are available for $45 per group and are delivered after the trip.",
    },
  ] as const;

  return (
    <SectionReveal className="border-b border-gold/10 bg-charcoal py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10">
        <p className="text-[0.65rem] font-medium uppercase tracking-[0.5em] text-gold/90">
          On the water
        </p>
        <div className="mt-4 h-px w-14 bg-gold/30" aria-hidden />
        <h2 className="mt-5 font-serif text-2xl tracking-tight text-cream sm:text-3xl md:text-[2.1rem]">
          Parasailing Miami Beach
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-cream/55 sm:text-[0.9375rem]">
          Experience a deluxe parasail flight up to 350 feet above the sea with
          breathtaking Miami Beach views. You can fly double or triple, and each
          flight includes about 8-10 minutes of air time.
        </p>
        <p className="mt-4 text-[0.95rem] font-medium text-cream/75">
          Meeting point:{" "}
          <span className="text-cream/85">300 Alton Rd, Dock A, Miami Beach, FL 33139</span>
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <div className="grid gap-3 border-y border-gold/10 py-8 text-[0.9375rem] text-cream/68 sm:grid-cols-2">
              <p>
                <strong className="text-cream/82">Passengers (ages 6+):</strong>{" "}
                <span className="text-gold-secondary">$120</span>
              </p>
              <p>
                <strong className="text-cream/82">Observers (non-flyers):</strong>{" "}
                <span className="text-gold-secondary">$85</span>
              </p>
              <p>
                <strong className="text-cream/82">Private trip (up to 10):</strong>{" "}
                <span className="text-gold-secondary">$1,000</span> (gratuity not included)
              </p>
              <p>
                <strong className="text-cream/82">Duration:</strong> 8-10 minutes
                air time per flight
              </p>
            </div>

            <ParasailingConfigurator />

            <div className="mt-8 text-[0.9375rem] leading-relaxed text-cream/62">
              <h3 className="font-serif text-lg text-cream/90">Activity details</h3>
              <ul className="mt-3 space-y-2">
                <li>Fly double (2 guests) or triple (3 guests) per parachute.</li>
                <li>Optional water dips at the end are available at no extra cost.</li>
                <li>Trips are typically offered every 90 minutes.</li>
                <li>
                  You may spot marine life such as dolphins, rays, jellyfish, and
                  sea turtles during your boat ride.
                </li>
              </ul>
            </div>

            <div className="mt-8 text-[0.9375rem] leading-relaxed text-cream/62">
              <h3 className="font-serif text-lg text-cream/90">What&apos;s included</h3>
              <ul className="mt-3 space-y-2">
                <li>Safety briefing</li>
                <li>Life jacket</li>
                <li>Parasail flight</li>
                <li>Boat ride</li>
                <li>Bottled water</li>
                <li>Memorable photo moments</li>
              </ul>
            </div>

            <div className="mt-8 text-[0.9375rem] leading-relaxed text-cream/62">
              <h3 className="font-serif text-lg text-cream/90">Requirements & restrictions</h3>
              <ul className="mt-3 space-y-2">
                <li>Minimum age is 6 years old.</li>
                <li>Children under 12 must be accompanied by an adult.</li>
                <li>At least 2 passengers are required per flight.</li>
                <li>Maximum combined flight weight is 500 lbs.</li>
                <li>Weight limits may change due to wind and water conditions.</li>
                <li>
                  Guests under 18 need a parent or guardian signature.
                </li>
                <li>
                  Guests who are pregnant, have neck/back injuries, or are under
                  the influence cannot be boarded.
                </li>
              </ul>
            </div>

            <div className="mt-8 text-[0.9375rem] leading-relaxed text-cream/62">
              <h3 className="font-serif text-lg text-cream/90">Cancellation policy</h3>
              <ul className="mt-3 space-y-2">
                <li>24-hour notice: full refund.</li>
                <li>
                  Same-day cancellations: 50% refund if canceled at least 1 hour
                  before check-in.
                </li>
                <li>No refunds for cancellations within 1 hour of check-in.</li>
                <li>
                  Weather-related cancellations are 100% refundable when
                  management determines conditions are unsafe.
                </li>
                <li>Refund processing may take about 5-7 business days.</li>
              </ul>
            </div>

            <div className="mt-8 text-[0.9375rem] leading-relaxed text-cream/62">
              <h3 className="font-serif text-lg text-cream/90">Extras</h3>
              <p className="mt-2">
                <strong className="text-cream/82">HD Photo package:</strong>{" "}
                <span className="text-gold-secondary">$45</span> per group. Photos
                are delivered after the trip.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div className="relative aspect-[4/5] overflow-hidden border border-gold/15">
              <Image
                src="/onthewater/parasailling/parasailling1.webp"
                alt="Parasailing over Miami Beach water"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>

        <div className="mt-10">
          <h3 className="font-serif text-lg text-cream/90">FAQ</h3>
          <div className="mt-4 space-y-3 text-[0.9375rem] leading-relaxed text-cream/62">
            {faqItems.map((item) => (
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
  );
}

function BananaBoatSection() {
  const faqItems = [
    {
      q: "What is a banana boat ride?",
      a: "A banana boat is an inflatable, long, yellow, banana-shaped watercraft that is towed behind a powerboat. It can carry multiple riders and delivers an exciting ride over the waves.",
    },
    {
      q: "How many riders can join one ride?",
      a: "Banana boat rides typically fit up to 6 riders per run, with a minimum of 2 participants.",
    },
    {
      q: "Do I need special skills or prior experience?",
      a: "No special skills are required. Banana boat rides are beginner-friendly and suitable for most ages and skill levels with a proper safety briefing.",
    },
    {
      q: "Are banana boat rides safe?",
      a: "Yes. Rides are supervised by trained professionals, riders wear life jackets, and safety instructions are provided before departure.",
    },
    {
      q: "What should I wear?",
      a: "Wear swimwear or comfortable water-friendly clothing. Bring sunscreen, a hat, and sunglasses for sun protection.",
    },
    {
      q: "How long is the ride?",
      a: "A standard ride usually lasts around 15-20 minutes, giving you an action-packed experience without overdoing it.",
    },
    {
      q: "Can we book a private banana boat session?",
      a: "Yes, private rides for families, friends, or group celebrations can be arranged based on availability.",
    },
    {
      q: "What is the age requirement?",
      a: "Banana boat rides are generally suitable for ages 6 and up. Parental consent may be required for minors.",
    },
    {
      q: "Can I bring personal belongings or a camera?",
      a: "It is recommended to secure your belongings because there is always a chance of getting wet. Some operators may allow cameras in designated safe spots.",
    },
    {
      q: "What is the cancellation policy?",
      a: "Cancellation terms vary, but many operators require 24 to 48 hours notice. Final terms are confirmed during booking.",
    },
    {
      q: "What does the experience feel like?",
      a: "You skim over the water at exciting speeds, get splashed by warm South Florida water, and enjoy a mix of adrenaline and scenic cruising moments.",
    },
    {
      q: "How does a banana boat ride work?",
      a: "Riders straddle the inflatable tube, wear life jackets, and hold side handles while a motorboat tows them across the water. The captain can adjust speed and turns to match comfort and safety levels.",
    },
    {
      q: "Are banana boat rides safe for kids?",
      a: "Yes, when proper precautions are followed: correctly fitted life jackets, supervised operation, suitable speed, and parent oversight for younger children.",
    },
  ] as const;

  return (
    <SectionReveal className="border-b border-gold/10 bg-charcoal py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10">
        <p className="text-[0.65rem] font-medium uppercase tracking-[0.5em] text-gold/90">
          On the water
        </p>
        <div className="mt-4 h-px w-14 bg-gold/30" aria-hidden />
        <h2 className="mt-5 font-serif text-2xl tracking-tight text-cream sm:text-3xl md:text-[2.1rem]">
          Banana Boat Ride Miami Beach
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-cream/55 sm:text-[0.9375rem]">
          Ready to add excitement to your Miami Beach day? Banana boat rides are
          perfect for parties, families, and friend groups that want pure
          adrenaline on the water in a short, action-packed session.
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_1fr]">
          <div className="grid gap-3 border-y border-gold/10 py-8 text-[0.9375rem] text-cream/68 sm:grid-cols-2">
            <p>
              <strong className="text-cream/82">Duration:</strong> 15-20 minutes
              of fast, splash-heavy fun.
            </p>
            <p>
              <strong className="text-cream/82">Age:</strong> Suitable from 6+
              years old.
            </p>
            <p>
              <strong className="text-cream/82">Group size:</strong> Minimum 2 and
              maximum 6 riders per ride.
            </p>
            <p>
              <strong className="text-cream/82">Vibe:</strong> Social, energetic,
              and ideal for unforgettable group moments.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative col-span-2 aspect-[16/8] overflow-hidden border border-gold/15">
              <Image
                src="/onthewater/bananaboats/bananaboat1.avif"
                alt="Banana boat ride in Miami Beach"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
            <div className="relative aspect-[4/3] overflow-hidden border border-gold/15">
              <Image
                src="/onthewater/bananaboats/bananaboat.2.avif"
                alt="Group enjoying a banana boat session"
                fill
                sizes="(max-width: 1024px) 50vw, 20vw"
                className="object-cover"
              />
            </div>
            <div className="relative aspect-[4/3] overflow-hidden border border-gold/15">
              <Image
                src="/onthewater/bananaboats/bananaboat3.avif"
                alt="Banana boat activity on open water"
                fill
                sizes="(max-width: 1024px) 50vw, 20vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>

        <div className="mt-10 space-y-8 text-[0.9375rem] leading-relaxed text-cream/62">
          <div>
            <h3 className="font-serif text-lg text-cream/90">
              Why choose a banana boat ride?
            </h3>
            <ul className="mt-3 space-y-2">
              <li>Safe and supervised with a full briefing before launch.</li>
              <li>Well-maintained equipment, secure handles, and life jackets.</li>
              <li>Scenic Miami Beach coastline views during the ride.</li>
              <li>Accessible for beginners, families, and mixed-age groups.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-lg text-cream/90">
              What to expect
            </h3>
            <ul className="mt-3 space-y-2">
              <li>Check in at the beach meeting point and receive safety instructions.</li>
              <li>Put on your life jacket and board with your group.</li>
              <li>
                Hold on while your captain tows the boat through turns, speed
                changes, and wave action.
              </li>
              <li>
                Return to shore after about 15-20 minutes with plenty of laughs.
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-lg text-cream/90">FAQ</h3>
            <div className="mt-4 space-y-3">
              {faqItems.map((item) => (
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
      </div>
    </SectionReveal>
  );
}

function PaddleBoardSection() {
  const faqItems = [
    {
      q: "What is paddle boarding?",
      a: "Paddle boarding is a water sport where you stand on a large board and use a paddle to propel yourself through the water.",
    },
    {
      q: "Do I need prior experience to go paddle boarding?",
      a: "No, paddle boarding is suitable for all skill levels, including beginners. Basic instructions and safety guidance are provided before you start.",
    },
    {
      q: "What equipment is included with the paddle board rental?",
      a: "Rentals include a paddle board, paddle, life jacket, and safety leash.",
    },
    {
      q: "How long can I rent a paddle board for?",
      a: "You can choose hourly or daily rental durations, depending on your plans.",
    },
    {
      q: "Can I paddle board alone or with a group?",
      a: "Both are possible. You can go solo or join friends and family for a shared water experience.",
    },
    {
      q: "Are there age restrictions for paddle boarding?",
      a: "Paddle boarding is suitable for most ages. Minors typically require parental or guardian consent.",
    },
    {
      q: "Where can I paddle board?",
      a: "You can paddle board in the calm, scenic waters near Miami Beach.",
    },
    {
      q: "Is paddle boarding safe?",
      a: "Yes. It is a low-impact activity when done with proper safety gear and briefing.",
    },
    {
      q: "What should I wear for paddle boarding?",
      a: "Wear swimwear or athletic clothing, and bring sunscreen, sunglasses, and a hat for sun protection.",
    },
  ] as const;

  return (
    <SectionReveal className="border-b border-gold/10 bg-charcoal py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10">
        <p className="text-[0.65rem] font-medium uppercase tracking-[0.5em] text-gold/90">
          On the water
        </p>
        <div className="mt-4 h-px w-14 bg-gold/30" aria-hidden />
        <h2 className="mt-5 font-serif text-2xl tracking-tight text-cream sm:text-3xl md:text-[2.1rem]">
          Paddle Board Miami Beach
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-cream/55 sm:text-[0.9375rem]">
          Start a calm and fascinating adventure on the waters of Miami Beach.
          Paddle boarding lets you glide over the surface, enjoy the sun, and
          reconnect with nature at your own pace.
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_1fr]">
          <div className="space-y-8">
            <div className="grid gap-3 border-y border-gold/10 py-8 text-[0.9375rem] text-cream/68 sm:grid-cols-2">
              <p>
                <strong className="text-cream/82">Price:</strong> $40 per person
              </p>
              <p>
                <strong className="text-cream/82">Duration:</strong> 60 minutes
              </p>
              <p>
                <strong className="text-cream/82">Pace:</strong> Relaxed or active,
                depending on your route.
              </p>
              <p>
                <strong className="text-cream/82">Skill level:</strong> Beginner
                friendly.
              </p>
            </div>

            <KayakSupRentalConfigurator variant="sup" />

            <div className="text-[0.9375rem] leading-relaxed text-cream/62">
              <h3 className="font-serif text-lg text-cream/90">
                Why choose paddle boarding?
              </h3>
              <ul className="mt-3 space-y-2">
                <li>
                  Expert guidance with safety-first instructions before launching.
                </li>
                <li>
                  Breathtaking coastal scenery and calm water moments that are
                  perfect for photos.
                </li>
                <li>
                  A peaceful activity that helps you disconnect from the daily rush.
                </li>
              </ul>
            </div>

            <div className="text-[0.9375rem] leading-relaxed text-cream/62">
              <h3 className="font-serif text-lg text-cream/90">
                Rental options
              </h3>
              <ul className="mt-3 space-y-2">
                <li>
                  <strong className="text-cream/82">Paddle board rentals:</strong>{" "}
                  By the hour or for a longer session, depending on your plans.
                </li>
                <li>
                  <strong className="text-cream/82">Guided tours:</strong> Join a
                  guided session to explore top Miami Beach paddle spots.
                </li>
                <li>
                  <strong className="text-cream/82">Group adventures:</strong>{" "}
                  Great for friends and family, with flexible group-friendly options.
                </li>
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div className="relative aspect-[4/5] overflow-hidden border border-gold/15">
              <Image
                src="/onthewater/paddleboard/paddleboard.jpg"
                alt="Paddle board experience in Miami Beach"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>

        <div className="mt-10">
          <h3 className="font-serif text-lg text-cream/90">FAQ</h3>
          <div className="mt-4 space-y-3 text-[0.9375rem] leading-relaxed text-cream/62">
            {faqItems.map((item) => (
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
  );
}

function KayakSection() {
  const faqItems = [
    {
      q: "What types of kayaks do you offer for rent?",
      a: "Both single and tandem kayaks are available for solo paddles, couples, or shared rides.",
    },
    {
      q: "What is included in the kayak rental?",
      a: "Rentals include life vests, paddles, and a safety briefing for a secure and enjoyable experience.",
    },
    {
      q: "Can I take the kayak anywhere I want?",
      a: "Kayaks are used in designated areas. You will get route guidance and safety instructions before launch.",
    },
    {
      q: "Is there an age limit for renting a kayak?",
      a: "Kayak rentals are generally for guests aged 18 and above. Minors should be accompanied by an adult.",
    },
    {
      q: "How long can I rent a kayak for?",
      a: "Rental durations are flexible and available by the hour based on your plans.",
    },
    {
      q: "Can I rent kayaks for a group or special event?",
      a: "Yes, group bookings and special event arrangements are available on request.",
    },
    {
      q: "Are pets allowed in kayaks?",
      a: "Pets are typically not allowed in kayaks for safety and hygiene reasons.",
    },
    {
      q: "Can I fish from the rental kayaks?",
      a: "Fishing from rental kayaks is allowed, but you must follow local fishing regulations and guidelines.",
    },
  ] as const;

  return (
    <SectionReveal className="border-b border-gold/10 bg-charcoal py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10">
        <p className="text-[0.65rem] font-medium uppercase tracking-[0.5em] text-gold/90">
          On the water
        </p>
        <div className="mt-4 h-px w-14 bg-gold/30" aria-hidden />
        <h2 className="mt-5 font-serif text-2xl tracking-tight text-cream sm:text-3xl md:text-[2.1rem]">
          Your Premier Destination for Kayak Rentals in Miami Beach
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-cream/55 sm:text-[0.9375rem]">
          Immerse yourself in the natural beauty of Miami&apos;s waterways with
          kayak sessions built for both first-time paddlers and experienced
          riders. It is one of the best ways to explore the water at your own
          pace.
        </p>
        <p className="mt-4 text-[0.95rem] font-medium text-cream/75">
          Price: <span className="text-gold-secondary">$40 per person</span>{" "}
          for <span className="text-cream/85">60 minutes</span>.
        </p>

        <KayakSupRentalConfigurator variant="kayak" />

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_1fr]">
          <div className="space-y-8">
            <div className="text-[0.9375rem] leading-relaxed text-cream/62">
              <h3 className="font-serif text-lg text-cream/90">
                Why choose our kayak rentals?
              </h3>
              <ul className="mt-3 space-y-2">
                <li>
                  Prime Miami Beach access to scenic waterways and hidden routes.
                </li>
                <li>
                  Quality kayaks with regular maintenance and comfort-focused setup.
                </li>
                <li>
                  Knowledgeable team support with practical local guidance.
                </li>
                <li>
                  Flexible options: short sessions, half-day, full-day, and group
                  bookings.
                </li>
                <li>
                  Scenic routes that are ideal for photos, relaxation, and nature.
                </li>
              </ul>
            </div>

            <div className="text-[0.9375rem] leading-relaxed text-cream/62">
              <h3 className="font-serif text-lg text-cream/90">
                How to rent a kayak
              </h3>
              <ul className="mt-3 space-y-2">
                <li>
                  <strong className="text-cream/82">Reserve online:</strong>{" "}
                  choose the rental option that fits your plan.
                </li>
                <li>
                  <strong className="text-cream/82">Contact support:</strong>{" "}
                  ask any questions before finalizing your reservation.
                </li>
                <li>
                  <strong className="text-cream/82">Safety briefing:</strong> on
                  arrival, receive quick safety tips and required equipment.
                </li>
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="relative col-span-2 aspect-[16/8] overflow-hidden border border-gold/15">
              <Image
                src="/onthewater/kayak/kayak1.jpeg"
                alt="Kayak experience in Miami Beach waters"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
            <div className="relative aspect-[4/3] overflow-hidden border border-gold/15">
              <Image
                src="/onthewater/kayak/kayak2.jpg"
                alt="Scenic kayak route near Miami Beach"
                fill
                sizes="(max-width: 1024px) 50vw, 20vw"
                className="object-cover"
              />
            </div>
            <div className="relative aspect-[4/3] overflow-hidden border border-gold/15">
              <Image
                src="/onthewater/kayak/kayak3.jpg"
                alt="Group kayak adventure in Miami"
                fill
                sizes="(max-width: 1024px) 50vw, 20vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>

        <div className="mt-10">
          <h3 className="font-serif text-lg text-cream/90">FAQ</h3>
          <div className="mt-4 space-y-3 text-[0.9375rem] leading-relaxed text-cream/62">
            {faqItems.map((item) => (
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
  );
}

export function WaterActivitiesPageClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const legacyHashDone = useRef(false);
  const tab = parseWaterActivityTab(searchParams.get("tab"));

  useEffect(() => {
    if (legacyHashDone.current) return;
    if (searchParams.get("tab")) {
      legacyHashDone.current = true;
      return;
    }
    legacyHashDone.current = true;
    const h = window.location.hash;
    if (h === "#fishing-charters") {
      router.replace(`${pathname}?tab=fishing#fishing-charters`, { scroll: false });
      return;
    }
    if (
      h === "#jetskis-jetcars-look-and-feel" ||
      h === "#jet-skis-pricing" ||
      h === "#jetcars-pricing" ||
      h === "#jetskis-jetcars-offerings"
    ) {
      router.replace(`${pathname}?tab=pwc${h}`, { scroll: false });
    }
  }, [pathname, router, searchParams]);

  const setTab = useCallback(
    (t: WaterActivityTab) => {
      const next =
        t === "overview" ? pathname : `${pathname}?tab=${encodeURIComponent(t)}`;
      router.replace(next, { scroll: false });
    },
    [pathname, router],
  );

  useEffect(() => {
    if (tab !== "pwc") return;
    const id = window.location.hash.replace(/^#/, "");
    if (!id) return;
    const t = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);
    return () => window.clearTimeout(t);
  }, [tab]);

  return (
    <div>
      <WaterActivitiesTabBar active={tab} onSelect={setTab} />
      {tab === "overview" && <OverviewGrid onSelect={setTab} />}

      {tab === "pwc" && <JetskisJetcarsExperience variant="ratesOnly" />}

      {tab === "kayak" && <KayakSection />}
      {tab === "sup" && <PaddleBoardSection />}
      {tab === "banana" && <BananaBoatSection />}

      {tab === "parasailing" && <ParasailingSection />}

      {tab === "fishing" && (
        <SectionReveal
          id="fishing-charters"
          className="scroll-mt-[5.5rem] border-b border-gold/10 bg-[#0e0e0e] sm:scroll-mt-24"
          aria-labelledby="fishing-charters-heading"
        >
          <FishingChartersSection />
        </SectionReveal>
      )}
    </div>
  );
}
