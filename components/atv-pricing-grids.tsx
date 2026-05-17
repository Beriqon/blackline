"use client";

import Image from "next/image";
import { Check } from "lucide-react";

import {
  atvPriceTileClass,
  useAtvBooking,
} from "@/components/atv-booking-dialog";
import { useTranslations } from "@/components/locale-provider";
import { formatUsd } from "@/lib/bookings";
import {
  getAtvPricingFeatures,
  getLocalizedAtvTours,
  getLocalizedUtvProducts,
  tAtvParams,
} from "@/lib/i18n/atv-page";
import type { Translator } from "@/lib/i18n/translate";
import { cn } from "@/lib/utils";

const btnPrimaryBlock =
  "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-sm border border-gold/40 bg-gold px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#0b0b0b] transition-all duration-300 ease-out hover:border-gold-secondary hover:bg-gold-secondary hover:shadow-[0_0_0_1px_rgba(224,195,138,0.35),0_12px_40px_rgba(198,164,108,0.18)] active:translate-y-0";

export function AtvTourPricingGrid() {
  const { openOffer } = useAtvBooking();
  const t = useTranslations();
  const tours = getLocalizedAtvTours(t);
  const features = getAtvPricingFeatures(t);
  const tourSuffix = t("atvPage.pricingGrid.tourSuffix");

  return (
    <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
      {tours.map((tour) => (
        <article
          key={tour.id}
          className={cn(
            "group flex flex-col overflow-hidden rounded-2xl border bg-[#090909] shadow-[0_32px_80px_-44px_rgba(0,0,0,0.9)] transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1",
            tour.badge
              ? "border-gold/40 ring-1 ring-gold/25 shadow-[0_0_0_1px_rgba(198,164,108,0.12),0_28px_90px_-32px_rgba(198,164,108,0.12)]"
              : "border-gold/12 hover:border-gold/25",
          )}
        >
          <div className="relative aspect-[16/11] overflow-hidden">
            <Image
              src={tour.image}
              alt=""
              fill
              sizes="(min-width: 1024px) 30vw, 90vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-[#0b0b0b] via-[#0b0b0b]/25 to-transparent"
              aria-hidden
            />
            {tour.badge ? (
              <p className="absolute left-4 top-4 rounded-sm border border-gold/45 bg-gold px-3 py-1.5 text-[0.58rem] font-bold uppercase tracking-[0.2em] text-[#0b0b0b]">
                {tour.badge}
              </p>
            ) : null}
          </div>

          <div className="flex flex-1 flex-col p-6 sm:p-7">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-cream/45">
              {tour.duration} {tourSuffix}
            </p>
            <button
              type="button"
              onClick={() => openOffer({ kind: "atv", tour })}
              className="mt-3 flex flex-wrap items-end gap-x-2 gap-y-1 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold/45"
            >
              <span className="font-sans text-4xl font-bold tabular-nums tracking-tight text-gold-secondary sm:text-[2.6rem]">
                {formatUsd(tour.price)}
              </span>
              <span className="pb-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-cream/40">
                {tour.unit}
              </span>
            </button>
            {tour.note ? (
              <p className="mt-2 text-[0.75rem] font-medium uppercase tracking-[0.12em] text-cream/50">
                {tour.note}
              </p>
            ) : null}

            <ul className="mt-6 flex-1 space-y-2.5 border-t border-gold/10 pt-5" role="list">
              {features.map((line) => (
                <li
                  key={line}
                  className="flex gap-2.5 text-left text-[0.875rem] text-cream/72"
                >
                  <Check
                    className="mt-0.5 size-4 shrink-0 text-gold"
                    strokeWidth={2.25}
                    aria-hidden
                  />
                  {line}
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => openOffer({ kind: "atv", tour })}
              className={cn(btnPrimaryBlock, "mt-7")}
            >
              {t("atvPage.pricingGrid.bookThisTour")}
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

export function AtvUtvPricingCards() {
  const { openOffer } = useAtvBooking();
  const t = useTranslations();
  const utvProducts = getLocalizedUtvProducts(t);

  return (
    <div className="mt-10 grid gap-7 lg:grid-cols-2 lg:gap-8">
      {utvProducts.map((utv) => (
        <UtvPricingCard key={utv.id} utv={utv} openOffer={openOffer} t={t} />
      ))}
    </div>
  );
}

function UtvPricingCard({
  utv,
  openOffer,
  t,
}: {
  utv: ReturnType<typeof getLocalizedUtvProducts>[number];
  openOffer: ReturnType<typeof useAtvBooking>["openOffer"];
  t: Translator;
}) {
  const features = getAtvPricingFeatures(t);
  const perUtv = t("atvPage.pricingGrid.perUtv");
  const seatsLine = tAtvParams(
    t,
    "atvPage.pricingGrid.seatsRiders",
    { seats: utv.seats },
    `Seats ${utv.seats} riders`,
  );

  return (
    <article
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border bg-[#090909] shadow-[0_28px_72px_-40px_rgba(0,0,0,0.88)] transition-[border-color,transform] duration-300 hover:-translate-y-0.5",
        utv.badge
          ? "border-gold/35 ring-1 ring-gold/20"
          : "border-gold/12 hover:border-gold/22",
      )}
    >
      <div className="relative aspect-[16/10]">
        <Image
          src={utv.image}
          alt=""
          fill
          sizes="(min-width: 1024px) 45vw, 100vw"
          className="object-cover"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#0b0b0b]/80 to-transparent"
          aria-hidden
        />
        {utv.badge ? (
          <p className="absolute left-4 top-4 rounded-sm border border-gold/45 bg-gold px-3 py-1.5 text-[0.58rem] font-bold uppercase tracking-[0.2em] text-[#0b0b0b]">
            {utv.badge}
          </p>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-6 sm:p-8">
        <h3 className="font-sans text-xl font-bold uppercase tracking-[0.12em] text-cream sm:text-2xl">
          {utv.title}
        </h3>
        <p className="mt-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-gold/75">
          {utv.tagline}
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          {utv.options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => openOffer({ kind: "utv", utv, option: opt })}
              className={atvPriceTileClass}
            >
              <p className="text-[0.58rem] font-bold uppercase tracking-[0.22em] text-cream/40">
                {opt.duration}
              </p>
              <p className="mt-1.5 font-sans text-2xl font-bold tabular-nums text-gold-secondary">
                {formatUsd(opt.price)}
              </p>
              <p className="mt-0.5 text-[0.65rem] text-cream/40">{perUtv}</p>
            </button>
          ))}
        </div>
        <ul className="mt-6 space-y-2 border-t border-gold/10 pt-5" role="list">
          {[seatsLine, ...features].map((line) => (
            <li
              key={line}
              className="flex gap-2.5 text-[0.875rem] text-cream/70"
            >
              <Check
                className="mt-0.5 size-4 shrink-0 text-gold"
                strokeWidth={2.25}
                aria-hidden
              />
              {line}
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() =>
            openOffer({
              kind: "utv",
              utv,
              option: utv.options[0]!,
            })
          }
          className={cn(btnPrimaryBlock, "mt-7")}
        >
          {t("atvPage.pricingGrid.bookThisUtv")}
        </button>
      </div>
    </article>
  );
}
