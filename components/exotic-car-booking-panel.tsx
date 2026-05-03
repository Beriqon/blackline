"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { AvailabilityDatePicker } from "@/components/availability-date-picker";
import { useCart } from "@/components/cart-context";
import {
  availableSlotsForDate,
  blockedDateSet,
  computeBookingQuote,
  describeSelection,
  getExoticCarBookingConfig,
  isDateBlocked,
  rangeContainsBlockedDate,
  type AvailabilityWindow,
  type ExoticCarBookingMode,
} from "@/lib/bookings";
import { CONTACT_TRIP_BUILDER_HREF } from "@/lib/contact-hrefs";
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

type Props = {
  car: ExoticCar;
  className?: string;
};

export function ExoticCarBookingPanel({ car, className }: Props) {
  const { addItem, items } = useCart();
  const config = getExoticCarBookingConfig(car);
  const [windows, setWindows] = useState<AvailabilityWindow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [mode, setMode] = useState<ExoticCarBookingMode>(config.rentalModes[0]!);
  const [startDate, setStartDate] = useState(todayPlus(1));
  const [endDate, setEndDate] = useState(todayPlus(1));
  const [startTime, setStartTime] = useState<string>(config.chauffeurSlots[0]!);
  const [durationHours, setDurationHours] = useState<number>(
    config.chauffeurDurationHours[1] ?? config.chauffeurDurationHours[0]!,
  );
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/bookings/availability?category=exotic-car&itemId=${car.id}`)
      .then(async (res) => {
        const data = (await res.json()) as {
          windows?: AvailabilityWindow[];
          error?: string;
        };
        if (!res.ok) throw new Error(data.error || "Could not load availability.");
        if (!cancelled) {
          setWindows(data.windows ?? []);
          setError(null);
        }
      })
      .catch((nextError) => {
        if (!cancelled) {
          setError(nextError instanceof Error ? nextError.message : "Could not load availability.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [car.id]);

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
          category: "exotic-car" as const,
          itemId: car.id,
          rentalMode: "self-drive" as const,
          startDate,
          endDate,
        }
      : {
          category: "exotic-car" as const,
          itemId: car.id,
          rentalMode: "chauffeur" as const,
          startDate,
          startTime: effectiveStartTime,
          durationHours,
        };
  }, [car.id, durationHours, effectiveStartTime, endDate, mode, startDate]);

  const alreadyInCart = useMemo(
    () => items.some((x) => x.category === "exotic-car" && x.id === car.id),
    [car.id, items],
  );

  const quote = useMemo(() => {
    try {
      return computeBookingQuote(selection);
    } catch {
      return null;
    }
  }, [selection]);

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

  return (
    <div className={cn("mt-10 border-t border-gold/10 pt-8", className)}>
      <p className="text-[0.62rem] font-semibold uppercase tracking-[0.32em] text-gold/80">
        Availability & booking
      </p>
      <p className="mt-3 text-[0.8rem] leading-relaxed text-cream/50">
        Pick a live booking window before adding this vehicle to checkout. Online
        payment is available only when the published rate is known.
      </p>

      {config.rentalModes.length > 1 ? (
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
              {option === "self-drive" ? "Self-drive" : "Chauffeur"}
            </button>
          ))}
        </div>
      ) : null}

      {mode === "self-drive" ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <AvailabilityDatePicker
              id={`${car.id}-start-date`}
              label="Start date"
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
              label="End date"
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
              label="Date"
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
              Start time
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
                    {formatTimeAmPm(slot)}
                  </option>
                ))
              ) : (
                <option value="">No slots left</option>
              )}
            </select>
          </div>
          <div>
            <label
              htmlFor={`${car.id}-chauffeur-duration`}
              className="text-[0.6rem] font-medium uppercase tracking-[0.24em] text-gold/65"
            >
              Duration
            </label>
            <select
              id={`${car.id}-chauffeur-duration`}
              value={durationHours}
              onChange={(e) => setDurationHours(Number.parseInt(e.target.value, 10))}
              className={fieldClass}
            >
              {config.chauffeurDurationHours.map((hours) => (
                <option key={hours} value={hours}>
                  {hours} hrs
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="mt-5 rounded-sm border border-gold/15 bg-[#080808] p-4">
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-gold/75">
          Booking summary
        </p>
        <p className="mt-2 text-sm text-cream/72">{describeSelection(selection)}</p>
        <p className="mt-2 font-serif text-xl text-gold-secondary">
          {quote?.payableOnline ? quote.priceLabel : quote?.reasonIfUnavailable ?? "Quote required"}
        </p>
        {quote?.payableOnline ? (
          <p className="mt-2 text-[0.75rem] leading-relaxed text-cream/48">
            Deposit due today: {quote.depositUsd > 0 ? `$${quote.depositUsd}` : "n/a"}
          </p>
        ) : null}
      </div>

      <div className="mt-5 rounded-sm border border-gold/15 bg-[#080808] p-4">
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-gold/75">
          Live availability
        </p>
        {loading ? (
          <p className="mt-2 text-sm text-cream/48">Loading current bookings...</p>
        ) : error ? (
          <p className="mt-2 text-sm text-red-300/90">{error}</p>
        ) : (
          <>
            <p className="mt-2 text-sm text-cream/58">
              {blockedDays.size > 0
                ? `Upcoming blocked days: ${Array.from(blockedDays).slice(0, 6).join(", ")}`
                : "No blocked windows in the next 3 weeks."}
            </p>
            {windows.length > 0 ? (
              <ul className="mt-3 space-y-2 text-[0.78rem] text-cream/52">
                {windows.slice(0, 4).map((window) => (
                  <li key={window.bookingId}>
                    {window.label}
                  </li>
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
              setLocalError(
                "That self-drive range includes one or more booked days.",
              );
              return;
            }
            if (mode === "chauffeur" && slotOptions.length === 0) {
              setLocalError("No chauffeur slots are open on that day.");
              return;
            }
            if (!quote) {
              setLocalError("Complete the booking details first.");
              return;
            }
            addItem({
              category: "exotic-car",
              id: car.id,
              title: car.name,
              subtitle: mode === "self-drive" ? "Self-drive" : "Chauffeur",
              priceHint: quote.priceLabel,
              href: "/services/exotic-cars",
              bookingSelection: selection,
              bookingQuote: quote,
            });
            setLocalError(null);
          }}
          className="inline-flex min-h-11 items-center justify-center border border-gold/40 bg-gold px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#0b0b0b] transition-all hover:bg-gold-secondary"
        >
          Add booking to checkout
        </button>
        {!quote?.payableOnline && !alreadyInCart ? (
          <Link
            href={CONTACT_TRIP_BUILDER_HREF}
            className="inline-flex min-h-11 items-center justify-center border border-gold/22 px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-cream/85 transition-colors hover:border-gold/40"
          >
            Request custom quote
          </Link>
        ) : null}
      </div>
    </div>
  );
}
