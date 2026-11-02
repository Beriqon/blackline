"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ActivityPicker } from "@/app/services/jetskis-jetcars/activity-picker";
import styles from "@/app/services/jetskis-jetcars/water.module.css";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { FishingChartersSection } from "@/components/fishing-charters-section";
import { JetskisJetcarsExperience } from "@/components/jetskis-jetcars-experience";
import { useLocale } from "@/components/locale-provider";
import { SectionReveal } from "@/components/section-reveal";
import type { Locale } from "@/lib/i18n/config";
import type { Translator } from "@/lib/i18n/translate";
import {
  getWaterBulletList,
  getWaterFaqItems,
  localizeWaterText,
  tWater,
  tWaterParams,
} from "@/lib/i18n/water-activities-page";
import { parseWaterActivityTab, type WaterActivityTab } from "@/lib/water-activities-tabs";
import { cn } from "@/lib/utils";


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

const PARASAILING_FAQ_SOURCE = [
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

const PARASAILING_ACTIVITY_DETAIL_EN = [
  "Fly double (2 guests) or triple (3 guests) per parachute.",
  "Optional water dips at the end are available at no extra cost.",
  "Trips are typically offered every 90 minutes.",
  "You may spot marine life such as dolphins, rays, jellyfish, and sea turtles during your boat ride.",
] as const;

const PARASAILING_INCLUDED_EN = [
  "Safety briefing",
  "Life jacket",
  "Parasail flight",
  "Boat ride",
  "Bottled water",
  "Memorable photo moments",
] as const;

const PARASAILING_REQUIREMENTS_EN = [
  "Minimum age is 6 years old.",
  "Children under 12 must be accompanied by an adult.",
  "At least 2 passengers are required per flight.",
  "Maximum combined flight weight is 500 lbs.",
  "Weight limits may change due to wind and water conditions.",
  "Guests under 18 need a parent or guardian signature.",
  "Guests who are pregnant, have neck/back injuries, or are under the influence cannot be boarded.",
] as const;

const PARASAILING_CANCELLATION_EN = [
  "24-hour notice: full refund.",
  "Same-day cancellations: 50% refund if canceled at least 1 hour before check-in.",
  "No refunds for cancellations within 1 hour of check-in.",
  "Weather-related cancellations are 100% refundable when management determines conditions are unsafe.",
  "Refund processing may take about 5-7 business days.",
] as const;

const BANANA_FAQ_SOURCE = [
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

const BANANA_WHY_CHOOSE_EN = [
  "Safe and supervised with a full briefing before launch.",
  "Well-maintained equipment, secure handles, and life jackets.",
  "Scenic Miami Beach coastline views during the ride.",
  "Accessible for beginners, families, and mixed-age groups.",
] as const;

const BANANA_WHAT_EXPECT_EN = [
  "Check in at the beach meeting point and receive safety instructions.",
  "Put on your life jacket and board with your group.",
  "Hold on while your captain tows the boat through turns, speed changes, and wave action.",
  "Return to shore after about 15-20 minutes with plenty of laughs.",
] as const;

const SUP_WHY_CHOOSE_EN = [
  "Expert guidance with safety-first instructions before launching.",
  "Breathtaking coastal scenery and calm water moments that are perfect for photos.",
  "A peaceful activity that helps you disconnect from the daily rush.",
] as const;

const SUP_FAQ_SOURCE = [
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

const KAYAK_WHY_CHOOSE_EN = [
  "Prime Miami Beach access to scenic waterways and hidden routes.",
  "Quality kayaks with regular maintenance and comfort-focused setup.",
  "Knowledgeable team support with practical local guidance.",
  "Flexible options: short sessions, half-day, full-day, and group bookings.",
  "Scenic routes that are ideal for photos, relaxation, and nature.",
] as const;

const KAYAK_FAQ_SOURCE = [
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

const PARASAILING_MEETING_ADDRESS = "300 Alton Rd, Dock A, Miami Beach, FL 33139";

function ParasailingConfigurator({ t }: { t: Translator }) {
  const cfg = "onTheWater.parasailing.configurator";
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
        title: tWater(t, `${cfg}.cartPrivateTitle`, "Parasailing — private trip"),
        subtitle: tWater(t, `${cfg}.cartPrivateSubtitle`, "Miami Beach · up to 10 flying guests · gratuity not included"),
        priceHint: formatUsdWhole(PARASAIL_USD.privateTrip),
        href,
      };
    }
    const flyingDetails =
      safePassengers === 1
        ? tWaterParams(t, `${cfg}.flyingPassengersOne`, "1 flying passenger", {})
        : tWaterParams(t, `${cfg}.flyingPassengersMany`, "{n} flying passengers", {
            n: String(safePassengers),
          });
    const observerDetails =
      observerCount === 1
        ? tWaterParams(t, `${cfg}.observersOne`, "1 observer", {})
        : tWaterParams(t, `${cfg}.observersMany`, "{n} observers", {
            n: String(observerCount),
          });
    const details =
      observerCount > 0 ? `${flyingDetails} · ${observerDetails}` : flyingDetails;

    const id = `parasailing-shared-p${safePassengers}-o${observerCount}`;
    return {
      category: "parasailing" as const,
      id,
      title: tWater(t, `${cfg}.cartSharedTitle`, "Parasailing — shared trip"),
      subtitle: tWaterParams(
        t,
        `${cfg}.cartSharedSubtitlePattern`,
        "Miami Beach · 300 Alton Rd, Dock A · {details}",
        { details },
      ),
      priceHint: formatUsdWhole(totalUsd),
      href,
    };
  }, [t, tripMode, safePassengers, observerCount, totalUsd]);

  const breakdownLines = useMemo(() => {
    if (tripMode === "private") {
      return [
        tWaterParams(t, `${cfg}.breakdownPrivate`, "Private charter (up to 10 flyers): {amount}", {
          amount: formatUsdWhole(PARASAIL_USD.privateTrip),
        }),
      ];
    }
    const lines: string[] = [
      tWaterParams(
        t,
        `${cfg}.breakdownFlying`,
        "{n} × {rate} (flying) = {subtotal}",
        {
          n: String(safePassengers),
          rate: formatUsdWhole(PARASAIL_USD.passenger),
          subtotal: formatUsdWhole(safePassengers * PARASAIL_USD.passenger),
        },
      ),
    ];
    if (observerCount > 0) {
      lines.push(
        tWaterParams(
          t,
          `${cfg}.breakdownObservers`,
          "{n} × {rate} (observers) = {subtotal}",
          {
            n: String(observerCount),
            rate: formatUsdWhole(PARASAIL_USD.observer),
            subtotal: formatUsdWhole(observerCount * PARASAIL_USD.observer),
          },
        ),
      );
    }
    return lines;
  }, [t, tripMode, safePassengers, observerCount]);

  return (
    <div className="mt-6 space-y-6 border-t border-gold/10 pt-6">
      <fieldset>
        <legend className="text-[0.6rem] font-medium uppercase tracking-[0.24em] text-gold/65">
          {tWater(t, "onTheWater.shared.tripType", "Trip type")}
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
              <span className="font-medium text-cream/90">
                {tWater(t, `${cfg}.sharedTripLabel`, "Shared trip")}
              </span>{" "}
              —{" "}
              {tWaterParams(
                t,
                `${cfg}.sharedTripDescription`,
                "{passengerRate} per flying passenger (6+), optional observers {observerRate} each.",
                {
                  passengerRate: formatUsdWhole(PARASAIL_USD.passenger),
                  observerRate: formatUsdWhole(PARASAIL_USD.observer),
                },
              )}
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
              <span className="font-medium text-cream/90">
                {tWater(t, `${cfg}.privateTripLabel`, "Private trip")}
              </span>{" "}
              —{" "}
              {(() => {
                const m = "@BLP@";
                const s = tWaterParams(
                  t,
                  `${cfg}.privateTripDescription`,
                  "Up to 10 flying guests, {privatePrice} (gratuity not included).",
                  {
                    privatePrice: `${m}${formatUsdWhole(PARASAIL_USD.privateTrip)}${m}`,
                  },
                );
                const p = s.split(m);
                if (p.length === 3) {
                  return (
                    <>
                      {p[0]}
                      <span className="text-gold-secondary">{p[1]}</span>
                      {p[2]}
                    </>
                  );
                }
                return s;
              })()}
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
              {tWater(t, `${cfg}.flyingPassengersLabel`, "Flying passengers (ages 6+)")}
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
                <span className="font-medium text-cream/88">
                  {tWater(t, `${cfg}.addObserversLead`, "Add observers")}
                </span>{" "}
                {tWaterParams(
                  t,
                  `${cfg}.addObserversRest`,
                  "(boat only, non-flying) — {observerRate} per person when seats are available.",
                  { observerRate: formatUsdWhole(PARASAIL_USD.observer) },
                )}
              </span>
            </label>
            {addObservers ? (
              <div className="mt-4 pl-7">
                <label
                  htmlFor="parasail-observers"
                  className="text-[0.6rem] font-medium uppercase tracking-[0.24em] text-gold/65"
                >
                  {tWater(t, `${cfg}.observersLabel`, "Number of observers")}
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
          {tWater(t, "onTheWater.shared.estimatedTotal", "Estimated total")}
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

function KayakSupRentalConfigurator({
  variant,
  t,
}: {
  variant: "kayak" | "sup";
  t: Translator;
}) {
  const [people, setPeople] = useState(1);
  const safePeople = Math.min(20, Math.max(1, Math.floor(people) || 1));
  const totalUsd = safePeople * KAYAK_SUP_PER_PERSON_USD;
  const prefix =
    variant === "kayak"
      ? "onTheWater.kayak.configurator"
      : "onTheWater.sup.configurator";

  const peopleLabel =
    safePeople === 1
      ? tWaterParams(t, `${prefix}.peopleOne`, "1 person", {})
      : tWaterParams(t, `${prefix}.peopleMany`, "{n} people", { n: String(safePeople) });

  const cartItem = useMemo(() => {
    if (variant === "kayak") {
      return {
        category: "kayak" as const,
        id: `miami-beach-kayak-60-n${safePeople}`,
        title: tWater(t, `${prefix}.cartTitle`, "Kayak rental"),
        subtitle: tWaterParams(
          t,
          `${prefix}.cartSubtitlePattern`,
          "Miami Beach · {peopleLabel} · 60 min session",
          { peopleLabel },
        ),
        priceHint: formatUsdWhole(totalUsd),
        href: "/services/jetskis-jetcars?tab=kayak",
      };
    }
    return {
      category: "paddleboard" as const,
      id: `miami-beach-sup-60-n${safePeople}`,
      title: tWater(t, `${prefix}.cartTitle`, "Paddle board (SUP) rental"),
      subtitle: tWaterParams(
        t,
        `${prefix}.cartSubtitlePattern`,
        "Miami Beach · {peopleLabel} · 60 min session",
        { peopleLabel },
      ),
      priceHint: formatUsdWhole(totalUsd),
      href: "/services/jetskis-jetcars?tab=sup",
    };
  }, [t, variant, prefix, safePeople, peopleLabel, totalUsd]);

  const breakdownLine = tWaterParams(
    t,
    `${prefix}.breakdownPattern`,
    "{n} × {rate} = {total}",
    {
      n: String(safePeople),
      rate: formatUsdWhole(KAYAK_SUP_PER_PERSON_USD),
      total: formatUsdWhole(totalUsd),
    },
  );
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
          {tWater(t, "onTheWater.shared.numberOfPeople", "Number of people")}
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
          {formatUsdWhole(KAYAK_SUP_PER_PERSON_USD)}{" "}
          {tWater(
            t,
            "onTheWater.shared.perPersonSessionNote",
            "per person · 60 minutes each.",
          )}
        </p>
      </div>

      <div className="border border-gold/20 bg-[#0b0b0b]/80 px-4 py-3">
        <p className="text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-gold/70">
          {tWater(t, "onTheWater.shared.estimatedTotal", "Estimated total")}
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

function ParasailingSection({
  t,
  locale,
}: {
  t: Translator;
  locale: Locale;
}) {
  const faqItems = useMemo(
    () => getWaterFaqItems(t, "parasailing", PARASAILING_FAQ_SOURCE),
    [t],
  );

  const activityBullets = useMemo(
    () =>
      getWaterBulletList(
        t,
        "onTheWater.parasailing.activityDetailsItems",
        PARASAILING_ACTIVITY_DETAIL_EN,
      ),
    [t],
  );
  const includedBullets = useMemo(
    () =>
      getWaterBulletList(t, "onTheWater.parasailing.includedItems", PARASAILING_INCLUDED_EN),
    [t],
  );
  const requirementsBullets = useMemo(
    () =>
      getWaterBulletList(
        t,
        "onTheWater.parasailing.requirementsItems",
        PARASAILING_REQUIREMENTS_EN,
      ),
    [t],
  );
  const cancellationBullets = useMemo(
    () =>
      getWaterBulletList(
        t,
        "onTheWater.parasailing.cancellationItems",
        PARASAILING_CANCELLATION_EN,
      ),
    [t],
  );

  return (
    <SectionReveal className="border-b border-gold/10 bg-charcoal py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10">
        <p className="text-[0.65rem] font-medium uppercase tracking-[0.5em] text-gold/90">
          {tWater(t, "onTheWater.shared.eyebrowOnTheWater", "On the water")}
        </p>
        <div className="mt-4 h-px w-14 bg-gold/30" aria-hidden />
        <h2 className="mt-5 font-serif text-2xl tracking-tight text-cream sm:text-3xl md:text-[2.1rem]">
          {tWater(t, "onTheWater.parasailing.headline", "Parasailing Miami Beach")}
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-cream/55 sm:text-[0.9375rem]">
          {tWater(
            t,
            "onTheWater.parasailing.body",
            "Experience a deluxe parasail flight up to 350 feet above the sea with breathtaking Miami Beach views. You can fly double or triple, and each flight includes about 8-10 minutes of air time.",
          )}
        </p>
        <p className="mt-4 text-[0.95rem] font-medium text-cream/75">
          {tWater(t, "onTheWater.parasailing.meetingPointLabel", "Meeting point:")}{" "}
          <span className="text-cream/85">
            {localizeWaterText(
              tWater(t, "onTheWater.parasailing.meetingPoint", PARASAILING_MEETING_ADDRESS),
              locale,
            )}
          </span>
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <div className="grid gap-3 border-y border-gold/10 py-8 text-[0.9375rem] text-cream/68 sm:grid-cols-2">
              <p>
                <strong className="text-cream/82">
                  {tWater(t, "onTheWater.parasailing.rates.passengers", "Passengers (ages 6+):")}
                </strong>{" "}
                <span className="text-gold-secondary">$120</span>
              </p>
              <p>
                <strong className="text-cream/82">
                  {tWater(t, "onTheWater.parasailing.rates.observers", "Observers (non-flyers):")}
                </strong>{" "}
                <span className="text-gold-secondary">$85</span>
              </p>
              <p>
                <strong className="text-cream/82">
                  {tWater(t, "onTheWater.parasailing.rates.privateTrip", "Private trip (up to 10):")}
                </strong>{" "}
                <span className="text-gold-secondary">$1,000</span>{" "}
                {tWater(
                  t,
                  "onTheWater.parasailing.rates.privateTripNote",
                  "(gratuity not included)",
                )}
              </p>
              <p>
                <strong className="text-cream/82">
                  {tWater(t, "onTheWater.parasailing.rates.duration", "Duration:")}
                </strong>{" "}
                {tWater(
                  t,
                  "onTheWater.parasailing.rates.durationValue",
                  "8-10 minutes air time per flight",
                )}
              </p>
            </div>

            <ParasailingConfigurator t={t} />

            <div className="mt-8 text-[0.9375rem] leading-relaxed text-cream/62">
              <h3 className="font-serif text-lg text-cream/90">
                {tWater(t, "onTheWater.parasailing.activityDetailsTitle", "Activity details")}
              </h3>
              <ul className="mt-3 space-y-2">
                {activityBullets.map((text) => (
                  <li key={text}>{text}</li>
                ))}
              </ul>
            </div>

            <div className="mt-8 text-[0.9375rem] leading-relaxed text-cream/62">
              <h3 className="font-serif text-lg text-cream/90">
                {tWater(t, "onTheWater.parasailing.includedTitle", "What's included")}
              </h3>
              <ul className="mt-3 space-y-2">
                {includedBullets.map((text) => (
                  <li key={text}>{text}</li>
                ))}
              </ul>
            </div>

            <div className="mt-8 text-[0.9375rem] leading-relaxed text-cream/62">
              <h3 className="font-serif text-lg text-cream/90">
                {tWater(t, "onTheWater.parasailing.requirementsTitle", "Requirements & restrictions")}
              </h3>
              <ul className="mt-3 space-y-2">
                {requirementsBullets.map((text) => (
                  <li key={text}>{text}</li>
                ))}
              </ul>
            </div>

            <div className="mt-8 text-[0.9375rem] leading-relaxed text-cream/62">
              <h3 className="font-serif text-lg text-cream/90">
                {tWater(t, "onTheWater.parasailing.cancellationTitle", "Cancellation policy")}
              </h3>
              <ul className="mt-3 space-y-2">
                {cancellationBullets.map((text) => (
                  <li key={text}>{text}</li>
                ))}
              </ul>
            </div>

            <div className="mt-8 text-[0.9375rem] leading-relaxed text-cream/62">
              <h3 className="font-serif text-lg text-cream/90">
                {tWater(t, "onTheWater.parasailing.extrasTitle", "Extras")}
              </h3>
              <p className="mt-2">
                {tWater(
                  t,
                  "onTheWater.parasailing.extrasBody",
                  "HD Photo package: $45 per group. Photos are delivered after the trip.",
                )}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div className="relative aspect-[4/5] overflow-hidden border border-gold/15">
              <Image
                src="/onthewater/parasailling/parasailling1.webp"
                alt={tWater(
                  t,
                  "onTheWater.parasailing.heroImageAlt",
                  "Parasailing over Miami Beach water",
                )}
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>

        <div className="mt-10">
          <h3 className="font-serif text-lg text-cream/90">
            {tWater(t, "onTheWater.shared.faqHeading", "FAQ")}
          </h3>
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
                <p className="mt-3 text-[0.92rem] leading-relaxed text-cream/62">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </SectionReveal>
  );
}

function BananaBoatSection({ t }: { t: Translator }) {
  const faqItems = useMemo(
    () => getWaterFaqItems(t, "banana", BANANA_FAQ_SOURCE),
    [t],
  );
  const whyChoose = useMemo(
    () =>
      getWaterBulletList(t, "onTheWater.banana.whyChooseItems", BANANA_WHY_CHOOSE_EN),
    [t],
  );
  const whatToExpect = useMemo(
    () =>
      getWaterBulletList(
        t,
        "onTheWater.banana.whatToExpectItems",
        BANANA_WHAT_EXPECT_EN,
      ),
    [t],
  );

  return (
    <SectionReveal className="border-b border-gold/10 bg-charcoal py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10">
        <p className="text-[0.65rem] font-medium uppercase tracking-[0.5em] text-gold/90">
          {tWater(t, "onTheWater.shared.eyebrowOnTheWater", "On the water")}
        </p>
        <div className="mt-4 h-px w-14 bg-gold/30" aria-hidden />
        <h2 className="mt-5 font-serif text-2xl tracking-tight text-cream sm:text-3xl md:text-[2.1rem]">
          {tWater(t, "onTheWater.banana.headline", "Banana Boat Ride Miami Beach")}
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-cream/55 sm:text-[0.9375rem]">
          {tWater(
            t,
            "onTheWater.banana.body",
            "Ready to add excitement to your Miami Beach day? Banana boat rides are perfect for parties, families, and friend groups that want pure adrenaline on the water in a short, action-packed session.",
          )}
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_1fr]">
          <div className="grid gap-3 border-y border-gold/10 py-8 text-[0.9375rem] text-cream/68 sm:grid-cols-2">
            <p>
              <strong className="text-cream/82">
                {tWater(t, "onTheWater.banana.quickFacts.duration", "Duration:")}
              </strong>{" "}
              {tWater(
                t,
                "onTheWater.banana.quickFacts.durationValue",
                "15-20 minutes of fast, splash-heavy fun.",
              )}
            </p>
            <p>
              <strong className="text-cream/82">
                {tWater(t, "onTheWater.banana.quickFacts.age", "Age:")}
              </strong>{" "}
              {tWater(
                t,
                "onTheWater.banana.quickFacts.ageValue",
                "Suitable from 6+ years old.",
              )}
            </p>
            <p>
              <strong className="text-cream/82">
                {tWater(t, "onTheWater.banana.quickFacts.group", "Group size:")}
              </strong>{" "}
              {tWater(
                t,
                "onTheWater.banana.quickFacts.groupValue",
                "Minimum 2 and maximum 6 riders per ride.",
              )}
            </p>
            <p>
              <strong className="text-cream/82">
                {tWater(t, "onTheWater.banana.quickFacts.vibe", "Vibe:")}
              </strong>{" "}
              {tWater(
                t,
                "onTheWater.banana.quickFacts.vibeValue",
                "Social, energetic, and ideal for unforgettable group moments.",
              )}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative col-span-2 aspect-[16/8] overflow-hidden border border-gold/15">
              <Image
                src="/onthewater/bananaboats/bananaboat1.avif"
                alt={tWater(
                  t,
                  "onTheWater.banana.imageAlts.wide",
                  "Banana boat ride in Miami Beach",
                )}
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
            <div className="relative aspect-[4/3] overflow-hidden border border-gold/15">
              <Image
                src="/onthewater/bananaboats/bananaboat.2.avif"
                alt={tWater(
                  t,
                  "onTheWater.banana.imageAlts.grid1",
                  "Group enjoying a banana boat session",
                )}
                fill
                sizes="(max-width: 1024px) 50vw, 20vw"
                className="object-cover"
              />
            </div>
            <div className="relative aspect-[4/3] overflow-hidden border border-gold/15">
              <Image
                src="/onthewater/bananaboats/bananaboat3.avif"
                alt={tWater(
                  t,
                  "onTheWater.banana.imageAlts.grid2",
                  "Banana boat activity on open water",
                )}
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
              {tWater(t, "onTheWater.banana.whyChooseTitle", "Why choose a banana boat ride?")}
            </h3>
            <ul className="mt-3 space-y-2">
              {whyChoose.map((text) => (
                <li key={text}>{text}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-lg text-cream/90">
              {tWater(t, "onTheWater.banana.whatToExpectTitle", "What to expect")}
            </h3>
            <ul className="mt-3 space-y-2">
              {whatToExpect.map((text) => (
                <li key={text}>{text}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-lg text-cream/90">
              {tWater(t, "onTheWater.shared.faqHeading", "FAQ")}
            </h3>
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
                  <p className="mt-3 text-[0.92rem] leading-relaxed text-cream/62">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SectionReveal>
  );
}

function PaddleBoardSection({ t }: { t: Translator }) {
  const faqItems = useMemo(() => getWaterFaqItems(t, "sup", SUP_FAQ_SOURCE), [t]);
  const whyChoose = useMemo(
    () =>
      getWaterBulletList(t, "onTheWater.sup.whyChooseItems", SUP_WHY_CHOOSE_EN),
    [t],
  );

  const rentalOptionFallback = useMemo(
    () =>
      [
        {
          strong: "Paddle board rentals:",
          rest: "By the hour or for a longer session, depending on your plans.",
        },
        {
          strong: "Guided tours:",
          rest: "Join a guided session to explore top Miami Beach paddle spots.",
        },
        {
          strong: "Group adventures:",
          rest: "Great for friends and family, with flexible group-friendly options.",
        },
      ] as const,
    [],
  );

  return (
    <SectionReveal className="border-b border-gold/10 bg-charcoal py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10">
        <p className="text-[0.65rem] font-medium uppercase tracking-[0.5em] text-gold/90">
          {tWater(t, "onTheWater.shared.eyebrowOnTheWater", "On the water")}
        </p>
        <div className="mt-4 h-px w-14 bg-gold/30" aria-hidden />
        <h2 className="mt-5 font-serif text-2xl tracking-tight text-cream sm:text-3xl md:text-[2.1rem]">
          {tWater(t, "onTheWater.sup.headline", "Paddle Board Miami Beach")}
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-cream/55 sm:text-[0.9375rem]">
          {tWater(
            t,
            "onTheWater.sup.body",
            "Start a calm and fascinating adventure on the waters of Miami Beach. Paddle boarding lets you glide over the surface, enjoy the sun, and reconnect with nature at your own pace.",
          )}
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_1fr]">
          <div className="space-y-8">
            <div className="grid gap-3 border-y border-gold/10 py-8 text-[0.9375rem] text-cream/68 sm:grid-cols-2">
              <p>
                <strong className="text-cream/82">
                  {tWater(t, "onTheWater.sup.specs.price", "Price:")}
                </strong>{" "}
                {tWater(t, "onTheWater.sup.specs.priceValue", "$40 per person")}
              </p>
              <p>
                <strong className="text-cream/82">
                  {tWater(t, "onTheWater.sup.specs.duration", "Duration:")}
                </strong>{" "}
                {tWater(t, "onTheWater.sup.specs.durationValue", "60 minutes")}
              </p>
              <p>
                <strong className="text-cream/82">
                  {tWater(t, "onTheWater.sup.specs.pace", "Pace:")}
                </strong>{" "}
                {tWater(
                  t,
                  "onTheWater.sup.specs.paceValue",
                  "Relaxed or active, depending on your route.",
                )}
              </p>
              <p>
                <strong className="text-cream/82">
                  {tWater(t, "onTheWater.sup.specs.skill", "Skill level:")}
                </strong>{" "}
                {tWater(t, "onTheWater.sup.specs.skillValue", "Beginner friendly.")}
              </p>
            </div>

            <KayakSupRentalConfigurator variant="sup" t={t} />

            <div className="text-[0.9375rem] leading-relaxed text-cream/62">
              <h3 className="font-serif text-lg text-cream/90">
                {tWater(t, "onTheWater.sup.whyChooseTitle", "Why choose paddle boarding?")}
              </h3>
              <ul className="mt-3 space-y-2">
                {whyChoose.map((text) => (
                  <li key={text}>{text}</li>
                ))}
              </ul>
            </div>

            <div className="text-[0.9375rem] leading-relaxed text-cream/62">
              <h3 className="font-serif text-lg text-cream/90">
                {tWater(t, "onTheWater.sup.rentalOptionsTitle", "Rental options")}
              </h3>
              <ul className="mt-3 space-y-2">
                {[0, 1, 2].map((i) => (
                  <li key={i}>
                    <strong className="text-cream/82">
                      {tWater(
                        t,
                        `onTheWater.sup.rentalOptionsItems.${i}.strong`,
                        rentalOptionFallback[i]?.strong ?? "",
                      )}
                    </strong>{" "}
                    {tWater(
                      t,
                      `onTheWater.sup.rentalOptionsItems.${i}.rest`,
                      rentalOptionFallback[i]?.rest ?? "",
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div className="relative aspect-[4/5] overflow-hidden border border-gold/15">
              <Image
                src="/onthewater/paddleboard/paddleboard.jpg"
                alt={tWater(
                  t,
                  "onTheWater.sup.heroImageAlt",
                  "Paddle board experience in Miami Beach",
                )}
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>

        <div className="mt-10">
          <h3 className="font-serif text-lg text-cream/90">
            {tWater(t, "onTheWater.shared.faqHeading", "FAQ")}
          </h3>
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
                <p className="mt-3 text-[0.92rem] leading-relaxed text-cream/62">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </SectionReveal>
  );
}

function KayakSection({ t }: { t: Translator }) {
  const faqItems = useMemo(() => getWaterFaqItems(t, "kayak", KAYAK_FAQ_SOURCE), [t]);
  const whyChoose = useMemo(
    () =>
      getWaterBulletList(t, "onTheWater.kayak.whyChooseItems", KAYAK_WHY_CHOOSE_EN),
    [t],
  );

  const howFallback = [
    {
      strong: "Reserve online:",
      rest: "choose the rental option that fits your plan.",
    },
    {
      strong: "Contact support:",
      rest: "ask any questions before finalizing your reservation.",
    },
    {
      strong: "Safety briefing:",
      rest: "on arrival, receive quick safety tips and required equipment.",
    },
  ] as const;

  return (
    <SectionReveal className="border-b border-gold/10 bg-charcoal py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10">
        <p className="text-[0.65rem] font-medium uppercase tracking-[0.5em] text-gold/90">
          {tWater(t, "onTheWater.shared.eyebrowOnTheWater", "On the water")}
        </p>
        <div className="mt-4 h-px w-14 bg-gold/30" aria-hidden />
        <h2 className="mt-5 font-serif text-2xl tracking-tight text-cream sm:text-3xl md:text-[2.1rem]">
          {tWater(
            t,
            "onTheWater.kayak.headline",
            "Your Premier Destination for Kayak Rentals in Miami Beach",
          )}
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-cream/55 sm:text-[0.9375rem]">
          {tWater(
            t,
            "onTheWater.kayak.body",
            "Immerse yourself in the natural beauty of Miami's waterways with kayak sessions built for both first-time paddlers and experienced riders. It is one of the best ways to explore the water at your own pace.",
          )}
        </p>
        <p className="mt-4 text-[0.95rem] font-medium text-cream/75">
          {tWater(
            t,
            "onTheWater.kayak.priceLine",
            "Price: $40 per person for 60 minutes.",
          )}
        </p>

        <KayakSupRentalConfigurator variant="kayak" t={t} />

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_1fr]">
          <div className="space-y-8">
            <div className="text-[0.9375rem] leading-relaxed text-cream/62">
              <h3 className="font-serif text-lg text-cream/90">
                {tWater(
                  t,
                  "onTheWater.kayak.whyChooseTitle",
                  "Why choose our kayak rentals?",
                )}
              </h3>
              <ul className="mt-3 space-y-2">
                {whyChoose.map((text) => (
                  <li key={text}>{text}</li>
                ))}
              </ul>
            </div>

            <div className="text-[0.9375rem] leading-relaxed text-cream/62">
              <h3 className="font-serif text-lg text-cream/90">
                {tWater(t, "onTheWater.kayak.howToRentTitle", "How to rent a kayak")}
              </h3>
              <ul className="mt-3 space-y-2">
                {[0, 1, 2].map((i) => (
                  <li key={i}>
                    <strong className="text-cream/82">
                      {tWater(
                        t,
                        `onTheWater.kayak.howToRentItems.${i}.strong`,
                        howFallback[i]!.strong,
                      )}
                    </strong>{" "}
                    {tWater(
                      t,
                      `onTheWater.kayak.howToRentItems.${i}.rest`,
                      howFallback[i]!.rest,
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="relative col-span-2 aspect-[16/8] overflow-hidden border border-gold/15">
              <Image
                src="/onthewater/kayak/kayak1.jpeg"
                alt={tWater(
                  t,
                  "onTheWater.kayak.imageAlts.hero",
                  "Kayak experience in Miami Beach waters",
                )}
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
            <div className="relative aspect-[4/3] overflow-hidden border border-gold/15">
              <Image
                src="/onthewater/kayak/kayak2.jpg"
                alt={tWater(
                  t,
                  "onTheWater.kayak.imageAlts.secondary1",
                  "Scenic kayak route near Miami Beach",
                )}
                fill
                sizes="(max-width: 1024px) 50vw, 20vw"
                className="object-cover"
              />
            </div>
            <div className="relative aspect-[4/3] overflow-hidden border border-gold/15">
              <Image
                src="/onthewater/kayak/kayak3.jpg"
                alt={tWater(
                  t,
                  "onTheWater.kayak.imageAlts.secondary2",
                  "Group kayak adventure in Miami",
                )}
                fill
                sizes="(max-width: 1024px) 50vw, 20vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>

        <div className="mt-10">
          <h3 className="font-serif text-lg text-cream/90">
            {tWater(t, "onTheWater.shared.faqHeading", "FAQ")}
          </h3>
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
                <p className="mt-3 text-[0.92rem] leading-relaxed text-cream/62">{item.a}</p>
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
  const { locale, t } = useLocale();

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
    (tabId: WaterActivityTab) => {
      const next =
        tabId === "overview"
          ? pathname
          : `${pathname}?tab=${encodeURIComponent(tabId)}`;
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
      <ActivityPicker active={tab} onSelect={setTab} t={t} locale={locale} />
      <div className={styles.activityDetail} key={tab}>

      {tab === "pwc" && <JetskisJetcarsExperience variant="ratesOnly" />}

      {tab === "kayak" && <KayakSection t={t} />}
      {tab === "sup" && <PaddleBoardSection t={t} />}
      {tab === "banana" && <BananaBoatSection t={t} />}

      {tab === "parasailing" && <ParasailingSection t={t} locale={locale} />}

      {tab === "fishing" && (
        <div>
        <div className={styles.fishingPhoto}><Image src="/sitephotos/fishing1.webp" alt={locale === "es" ? "Cañas de pesca a bordo de un barco" : "Fishing rods aboard a charter boat"} fill sizes="100vw" className={styles.cover}/></div>
        <SectionReveal
          id="fishing-charters"
          className="scroll-mt-[5.5rem] border-b border-gold/10 bg-[#0e0e0e] sm:scroll-mt-24"
          aria-labelledby="fishing-charters-heading"
        >
          <FishingChartersSection />
        </SectionReveal>
        </div>
      )}
      </div>
    </div>
  );
}
