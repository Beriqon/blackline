"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { AvailabilityDatePicker } from "@/components/availability-date-picker";
import { useCart } from "@/components/cart-context";
import { useLocale } from "@/components/locale-provider";
import {
  availableSlotsForDate,
  blockedDateSet,
  computeBookingQuote,
  getExoticCarBookingConfig,
  isDateBlocked,
  rangeContainsBlockedDate,
  type AvailabilityWindow,
  type ExoticCarBookingMode,
} from "@/lib/bookings";
import { CONTACT_TRIP_BUILDER_HREF } from "@/lib/contact-hrefs";
import {
  describeExoticSelectionLocalized,
  localizeBookingQuoteLabel,
  localizeBookingUnavailableReason,
} from "@/lib/i18n/exotic-cars-page";
import type { ExoticCar } from "@/lib/exotic-cars-data";
import { cn } from "@/lib/utils";

const fieldClass =
  "mt-1.5 w-full border border-gold/15 bg-[#0b0b0b] px-3 py-2 text-sm text-cream";
const pillClass =
  "border px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.14em] transition-colors";

function todayPlus(days: number) {
  const next = new Date();
  next.setDate(next.getDate() + days);
  return next.toISOString().slice(0, 10);
}

function formatTimeAmPm(time24: string) {
  const match = time24.match(/^(\d{2}):(\d{2})$/);
  if (!match) return time24;
  const hour24 = Number.parseInt(match[1]!, 10);
  const minute = match[2]!;
  const hour12 = hour24 % 12 || 12;
  const ampm = hour24 >= 12 ? "PM" : "AM";
  return `${hour12}:${minute} ${ampm}`;
}

function formatTimeAmPmEs(time24: string) {
  const match = time24.match(/^(\d{2}):(\d{2})$/);
  if (!match) return time24;
  const hour24 = Number.parseInt(match[1]!, 10);
  const minute = match[2]!;
  const hour12 = hour24 % 12 || 12;
  const ampm = hour24 >= 12 ? "p. m." : "a. m.";
  return `${hour12}:${minute} ${ampm}`;
}

type Props = {
  car: ExoticCar;
  chauffeurOnly?: boolean;
  className?: string;
};

export function ExoticCarBookingPanel({ car, className, chauffeurOnly = false }: Props) {
  const { locale, t } = useLocale();
  const { addItem, items } = useCart();
  const config = getExoticCarBookingConfig(car);
  const [windows, setWindows] = useState<AvailabilityWindow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [mode, setMode] = useState<ExoticCarBookingMode>(chauffeurOnly ? "chauffeur" : config.rentalModes[0]!);
  const [startDate, setStartDate] = useState(todayPlus(1));
  const [endDate, setEndDate] = useState(todayPlus(1));
  const [startTime, setStartTime] = useState<string>(config.chauffeurSlots[0]!);
  const [durationHours, setDurationHours] = useState<number>(
    config.chauffeurDurationHours[1] ?? config.chauffeurDurationHours[0]!,
  );
  const [localError, setLocalError] = useState<string | null>(null);

  const formatTime = locale === "es" ? formatTimeAmPmEs : formatTimeAmPm;

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/bookings/availability?category=exotic-car&itemId=${car.id}`)
      .then(async (res) => {
        const data = (await res.json()) as {
          windows?: AvailabilityWindow[];
          error?: string;
        };
        if (!res.ok) {
          throw new Error(data.error || t("exoticCarsPage.booking.loadAvailabilityError"));
        }
        if (!cancelled) {
          setWindows(data.windows ?? []);
          setError(null);
        }
      })
      .catch((nextError) => {
        if (!cancelled) {
          setError(
            nextError instanceof Error
              ? nextError.message
              : t("exoticCarsPage.booking.loadAvailabilityError"),
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [car.id, t]);

  const slotOptions = useMemo(
    () => availableSlotsForDate(startDate, config.chauffeurSlots, durationHours, windows),
    [config.chauffeurSlots, durationHours, startDate, windows],
  );
  const effectiveStartTime =
    mode === "chauffeur" && slotOptions.includes(startTime)
      ? startTime
      : (slotOptions[0] ?? "");

  const selection = useMemo(() => {
    return mode === "self-drive"
      ? {
          category: "exotic-car" as const,service:chauffeurOnly||car.section==="hourly"?"chauffeur-services" as const:"exotic-cars" as const,timeZone:Intl.DateTimeFormat().resolvedOptions().timeZone,
          itemId: car.id,
          rentalMode: "self-drive" as const,
          startDate,
          endDate,
        }
      : {
          category: "exotic-car" as const,timeZone:Intl.DateTimeFormat().resolvedOptions().timeZone,
          itemId: car.id,
          rentalMode: "chauffeur" as const,
          startDate,
          startTime: effectiveStartTime,
          durationHours,
        };
  }, [car.id,car.section,chauffeurOnly,durationHours,effectiveStartTime,endDate,mode,startDate]);

  const alreadyInCart = useMemo(
    () => items.some((x) => x.category === "exotic-car" && x.id === car.id),
    [car.id, items],
  );

  const quote = useMemo(() => {
    try {
      return computeBookingQuote(selection,car);
    } catch {
      return null;
    }
  }, [selection,car]);

  const blockedDays = useMemo(
    () => blockedDateSet(windows, todayPlus(0), 21),
    [windows],
  );

  const isSelfDriveDateBlocked = useMemo(
    () => (date: string) => isDateBlocked(date, windows),
    [windows],
  );

  const isChauffeurDateBlocked = useMemo(
    () =>
      (date: string) =>
        availableSlotsForDate(date, config.chauffeurSlots, durationHours, windows)
          .length === 0,
    [config.chauffeurSlots, durationHours, windows],
  );

  const selectionLabel = describeExoticSelectionLocalized(selection, locale, t);

  const displayPriceLabel = quote?.priceLabel
    ? localizeBookingQuoteLabel(quote.priceLabel, locale)
    : null;
  const displayUnavailableReason = localizeBookingUnavailableReason(
    quote?.reasonIfUnavailable,
    locale,
    t,
  );

  return (
    <div className={cn("mt-10 border-t border-gold/10 pt-8", className)}>
      <p className="text-[0.62rem] font-semibold uppercase tracking-[0.32em] text-gold/80">
        {t("exoticCarsPage.booking.availabilityTitle")}
      </p>
      <p className="mt-3 text-[0.8rem] leading-relaxed text-cream/50">
        {t("exoticCarsPage.booking.availabilityBody")}
      </p>

      {config.rentalModes.length > 1 && !chauffeurOnly ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {config.rentalModes.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setMode(option)}
              className={cn(
                pillClass,
                mode === option
                  ? "border-gold/45 bg-gold/12 text-cream"
                  : "border-gold/15 text-cream/55 hover:border-gold/30",
              )}
            >
              {option === "self-drive"
                ? t("exoticCarsPage.booking.selfDrive")
                : t("exoticCarsPage.booking.chauffeur")}
            </button>
          ))}
        </div>
      ) : null}

      {mode === "self-drive" ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <AvailabilityDatePicker
              id={`${car.id}-start-date`}
              label={t("exoticCarsPage.booking.startDate")}
              value={startDate}
              minDate={todayPlus(0)}
              isBlocked={isSelfDriveDateBlocked}
              onChange={(next) => {
                setStartDate(next);
                if (endDate < next) setEndDate(next);
                setLocalError(null);
              }}
            />
          </div>
          <div>
            <AvailabilityDatePicker
              id={`${car.id}-end-date`}
              label={t("exoticCarsPage.booking.endDate")}
              value={endDate}
              minDate={startDate}
              isBlocked={isSelfDriveDateBlocked}
              onChange={(next) => {
                setEndDate(next);
                setLocalError(null);
              }}
            />
          </div>
        </div>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div>
            <AvailabilityDatePicker
              id={`${car.id}-chauffeur-date`}
              label={t("exoticCarsPage.booking.date")}
              value={startDate}
              minDate={todayPlus(0)}
              isBlocked={isChauffeurDateBlocked}
              onChange={(next) => {
                setStartDate(next);
                setLocalError(null);
              }}
            />
          </div>
          <div>
            <label
              htmlFor={`${car.id}-chauffeur-time`}
              className="text-[0.6rem] font-medium uppercase tracking-[0.24em] text-gold/65"
            >
              {t("exoticCarsPage.booking.startTime")}
            </label>
            <select
              id={`${car.id}-chauffeur-time`}
              value={effectiveStartTime}
              onChange={(e) => setStartTime(e.target.value)}
              className={fieldClass}
            >
              {slotOptions.length > 0 ? (
                slotOptions.map((slot) => (
                  <option key={slot} value={slot}>
                    {formatTime(slot)}
                  </option>
                ))
              ) : (
                <option value="">{t("exoticCarsPage.booking.noSlotsLeft")}</option>
              )}
            </select>
          </div>
          <div>
            <label
              htmlFor={`${car.id}-chauffeur-duration`}
              className="text-[0.6rem] font-medium uppercase tracking-[0.24em] text-gold/65"
            >
              {t("exoticCarsPage.booking.duration")}
            </label>
            <select
              id={`${car.id}-chauffeur-duration`}
              value={durationHours}
              onChange={(e) => setDurationHours(Number.parseInt(e.target.value, 10))}
              className={fieldClass}
            >
              {config.chauffeurDurationHours.map((hours) => (
                <option key={hours} value={hours}>
                  {t("exoticCarsPage.booking.hoursShort", { hours })}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="mt-5 rounded-sm border border-gold/15 bg-[#080808] p-4">
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-gold/75">
          {t("exoticCarsPage.booking.summaryTitle")}
        </p>
        <p className="mt-2 text-sm text-cream/72">{selectionLabel}</p>
        <p className="mt-2 font-serif text-xl text-gold-secondary">
          {quote?.payableOnline
            ? displayPriceLabel
            : (displayUnavailableReason ?? t("exoticCarsPage.booking.quoteRequired"))}
        </p>
        {quote?.payableOnline ? (
          <p className="mt-2 text-[0.75rem] leading-relaxed text-cream/48">
            {t("exoticCarsPage.booking.depositDue", {
              amount:
                quote.depositUsd > 0
                  ? `$${quote.depositUsd}`
                  : t("exoticCarsPage.booking.depositNa"),
            })}
          </p>
        ) : null}
      </div>

      <div className="mt-5 rounded-sm border border-gold/15 bg-[#080808] p-4">
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-gold/75">
          {t("exoticCarsPage.booking.liveAvailability")}
        </p>
        {loading ? (
          <p className="mt-2 text-sm text-cream/48">
            {t("exoticCarsPage.booking.loadingBookings")}
          </p>
        ) : error ? (
          <p className="mt-2 text-sm text-red-300/90">{error}</p>
        ) : (
          <>
            <p className="mt-2 text-sm text-cream/58">
              {blockedDays.size > 0
                ? t("exoticCarsPage.booking.blockedDays", {
                    days: Array.from(blockedDays).slice(0, 6).join(", "),
                  })
                : t("exoticCarsPage.booking.noBlockedWindows")}
            </p>
            {windows.length > 0 ? (
              <ul className="mt-3 space-y-2 text-[0.78rem] text-cream/52">
                {windows.slice(0, 4).map((window) => (
                  <li key={window.bookingId}>{window.label}</li>
                ))}
              </ul>
            ) : null}
          </>
        )}
      </div>

      {localError ? (
        <p className="mt-4 text-[0.78rem] text-red-300/90">{localError}</p>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={() => {
            if (
              mode === "self-drive" &&
              rangeContainsBlockedDate(startDate, endDate, windows)
            ) {
              setLocalError(t("exoticCarsPage.booking.rangeBlockedError"));
              return;
            }
            if (mode === "chauffeur" && slotOptions.length === 0) {
              setLocalError(t("exoticCarsPage.booking.noChauffeurSlotsError"));
              return;
            }
            if (!quote) {
              setLocalError(t("exoticCarsPage.booking.completeDetailsError"));
              return;
            }
            addItem({
              category: "exotic-car",
              id: car.id,
              title: car.name,
              subtitle:
                mode === "self-drive"
                  ? t("exoticCarsPage.booking.selfDrive")
                  : t("exoticCarsPage.booking.chauffeur"),
              priceHint: displayPriceLabel ?? quote.priceLabel,
              href: "/services/exotic-cars",
              bookingSelection: selection,
              bookingQuote: quote,
            });
            setLocalError(null);
          }}
          className="inline-flex min-h-11 items-center justify-center border border-gold/40 bg-gold px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#0b0b0b] transition-all hover:bg-gold-secondary"
        >
          {t("exoticCarsPage.booking.addToCheckout")}
        </button>
        {!quote?.payableOnline && !alreadyInCart ? (
          <Link
            href={CONTACT_TRIP_BUILDER_HREF}
            className="inline-flex min-h-11 items-center justify-center border border-gold/22 px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-cream/85 transition-colors hover:border-gold/40"
          >
            {t("exoticCarsPage.booking.requestQuote")}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
