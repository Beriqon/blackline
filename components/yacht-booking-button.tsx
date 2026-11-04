"use client";

import { useEffect, useMemo, useState } from "react";

import { AvailabilityDatePicker } from "@/components/availability-date-picker";
import { useCart } from "@/components/cart-context";
import { useLocale } from "@/components/locale-provider";
import {
  availableSlotsForDate,
  computeBookingQuote,
  getYachtBookingConfig,
  type AvailabilityWindow,
} from "@/lib/bookings";
import {
  describeYachtSelectionLocalized,
  localizeYacht,
  localizeYachtBookingQuoteLabel,
  localizeYachtBookingUnavailableReason,
  localizeYachtBreakdownLabel,
} from "@/lib/i18n/yachts-page";
import { durationOptionsFromYacht } from "@/lib/yacht-fleet-pricing";
import { getYachtBySlug, type Yacht } from "@/lib/yachts-data";
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

function formatTimeAmPm(time24: string, locale: "en" | "es") {
  const match = time24.match(/^(\d{2}):(\d{2})$/);
  if (!match) return time24;
  const hour24 = Number.parseInt(match[1]!, 10);
  const minute = match[2]!;
  const hour12 = hour24 % 12 || 12;
  if (locale === "es") {
    const ampm = hour24 >= 12 ? "p. m." : "a. m.";
    return `${hour12}:${minute} ${ampm}`;
  }
  const ampm = hour24 >= 12 ? "PM" : "AM";
  return `${hour12}:${minute} ${ampm}`;
}

type Props = {
  yacht?: Yacht;
  yachtId?: string;
  className?: string;
  defaultDurationLabel?: string;
  defaultGratuityPct?: number;
  layout?: "full" | "inline";
};

export function YachtBookingButton({
  yacht,
  yachtId,
  className,
  defaultDurationLabel,
  defaultGratuityPct,
  layout = "full",
}: Props) {
  const { locale, t } = useLocale();
  const resolvedYacht = yacht ?? (yachtId ? getYachtBySlug(yachtId) : undefined);
  const localizedYacht = useMemo(
    () => (resolvedYacht ? localizeYacht(resolvedYacht, locale) : undefined),
    [resolvedYacht, locale],
  );
  const { addItem } = useCart();
  const config = resolvedYacht
    ? getYachtBookingConfig(resolvedYacht)
    : {
        durationOptions: [],
        startTimes: ["10:00"] as const,
        defaultGratuityPct: 18,
      };
  const rawDurationOptions = useMemo(
    () => (resolvedYacht ? durationOptionsFromYacht(resolvedYacht) : []),
    [resolvedYacht],
  );
  const displayDurationOptions = useMemo(
    () =>
      localizedYacht ? durationOptionsFromYacht(localizedYacht) : rawDurationOptions,
    [localizedYacht, rawDurationOptions],
  );
  const [windows, setWindows] = useState<AvailabilityWindow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [charterDate, setCharterDate] = useState(todayPlus(2));
  const [startTime, setStartTime] = useState<string>(config.startTimes[0]!);
  const [durationLabel, setDurationLabel] = useState(
    defaultDurationLabel ?? config.durationOptions[0]?.label ?? "4 hours",
  );
  const [gratuityPct, setGratuityPct] = useState(defaultGratuityPct ?? 18);
  const [localError, setLocalError] = useState<string | null>(null);

  const [priorDefaults,setPriorDefaults]=useState({duration:defaultDurationLabel,gratuity:defaultGratuityPct});
  if(priorDefaults.duration!==defaultDurationLabel||priorDefaults.gratuity!==defaultGratuityPct){
    setPriorDefaults({duration:defaultDurationLabel,gratuity:defaultGratuityPct});
    if(defaultDurationLabel&&priorDefaults.duration!==defaultDurationLabel)setDurationLabel(defaultDurationLabel);
    if(typeof defaultGratuityPct==="number"&&priorDefaults.gratuity!==defaultGratuityPct)setGratuityPct(defaultGratuityPct);
  }

  useEffect(() => {
    let cancelled = false;
    if (!resolvedYacht) return;
    fetch(`/api/bookings/availability?category=yacht&itemId=${resolvedYacht.id}`)
      .then(async (res) => {
        const data = (await res.json()) as {
          windows?: AvailabilityWindow[];
          error?: string;
        };
        if (!res.ok) {
          throw new Error(data.error || t("yachtsPage.booking.loadAvailabilityError"));
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
              : t("yachtsPage.booking.loadAvailabilityError"),
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [resolvedYacht, t]);

  const durationHours = useMemo(() => {
    const parsed = Number.parseInt(durationLabel, 10);
    return Number.isFinite(parsed) ? parsed : 4;
  }, [durationLabel]);

  const slotOptions = useMemo(
    () => availableSlotsForDate(charterDate, config.startTimes, durationHours, windows),
    [charterDate, config.startTimes, durationHours, windows],
  );

  const effectiveStartTime = slotOptions.includes(startTime)
    ? startTime
    : (slotOptions[0] ?? "");

  const isCharterDateBlocked = useMemo(
    () =>
      (date: string) =>
        availableSlotsForDate(date, config.startTimes, durationHours, windows)
          .length === 0,
    [config.startTimes, durationHours, windows],
  );

  const selection = useMemo(
    () => ({
      category: "yacht" as const,timeZone:Intl.DateTimeFormat().resolvedOptions().timeZone,
      itemId: resolvedYacht?.id ?? "",
      charterDate,
      startTime: effectiveStartTime,
      durationLabel,
      gratuityPct,
    }),
    [charterDate, durationLabel, effectiveStartTime, gratuityPct, resolvedYacht?.id],
  );

  const quote = useMemo(() => {
    if (!resolvedYacht) return null;
    try {
      return computeBookingQuote(selection,resolvedYacht);
    } catch {
      return null;
    }
  }, [resolvedYacht, selection]);

  if (!resolvedYacht) return null;

  const isInline = layout === "inline";
  const timeLocale = locale === "es" ? "es" : "en";

  const priceDisplay = quote?.payableOnline
    ? localizeYachtBookingQuoteLabel(quote.priceLabel, locale)
    : localizeYachtBookingUnavailableReason(quote?.reasonIfUnavailable, locale, t) ??
      t("yachtsPage.booking.quoteRequired");

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div
        className={cn(
          "rounded-sm border border-gold/15 bg-[#080808] p-4",
          isInline && "border-0 bg-transparent p-0",
        )}
      >
        {isInline ? null : (
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-gold/75">
            {t("yachtsPage.booking.liveCharterBooking")}
          </p>
        )}
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <AvailabilityDatePicker
              id={`${resolvedYacht.id}-charter-date`}
              label={t("yachtsPage.booking.charterDate")}
              value={charterDate}
              minDate={todayPlus(0)}
              isBlocked={isCharterDateBlocked}
              onChange={(next) => {
                setCharterDate(next);
                setLocalError(null);
              }}
            />
          </div>
          <div>
            <label
              htmlFor={`${resolvedYacht.id}-start-time`}
              className="text-[0.6rem] font-medium uppercase tracking-[0.24em] text-gold/65"
            >
              {t("yachtsPage.booking.departureTime")}
            </label>
            <select
              id={`${resolvedYacht.id}-start-time`}
              value={effectiveStartTime}
              onChange={(e) => setStartTime(e.target.value)}
              className={fieldClass}
            >
              {slotOptions.length > 0 ? (
                slotOptions.map((slot) => (
                  <option key={slot} value={slot}>
                    {formatTimeAmPm(slot, timeLocale)}
                  </option>
                ))
              ) : (
                <option value="">{t("yachtsPage.booking.noDeparturesOpen")}</option>
              )}
            </select>
          </div>
        </div>

        {isInline ? null : (
          <>
            <div className="mt-4">
              <p className="text-[0.6rem] font-medium uppercase tracking-[0.24em] text-gold/65">
                {t("yachtsPage.booking.duration")}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {displayDurationOptions.map((option, index) => {
                  const canonicalLabel = rawDurationOptions[index]?.label ?? option.label;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setDurationLabel(canonicalLabel)}
                      className={cn(
                        pillClass,
                        durationLabel === canonicalLabel
                          ? "border-gold/45 bg-gold/12 text-cream"
                          : "border-gold/15 text-cream/55 hover:border-gold/30",
                      )}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4">
              <label
                htmlFor={`${resolvedYacht.id}-gratuity`}
                className="text-[0.6rem] font-medium uppercase tracking-[0.24em] text-gold/65"
              >
                {t("yachtsPage.booking.crewGratuity")}
              </label>
              <select
                id={`${resolvedYacht.id}-gratuity`}
                value={gratuityPct}
                onChange={(e) => setGratuityPct(Number.parseInt(e.target.value, 10))}
                className={fieldClass}
              >
                {[15, 18, 20, 22].map((value) => (
                  <option key={value} value={value}>
                    {value}%
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>

      <div
        className={cn(
          "rounded-sm border border-gold/15 bg-[#080808] p-4",
          isInline && "mt-0 border-0 bg-transparent p-0",
        )}
      >
        {isInline ? null : (
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-gold/75">
            {t("yachtsPage.booking.summaryTitle")}
          </p>
        )}
        <p className="mt-2 text-sm text-cream/72">
          {describeYachtSelectionLocalized(selection, locale, t)}
        </p>
        <p className="mt-2 font-serif text-xl text-gold-secondary">{priceDisplay}</p>
        {quote?.payableOnline ? (
          <>
            {isInline ? null : (
              <ul className="mt-3 space-y-1 text-[0.78rem] text-cream/50">
                {quote.breakdown.map((row) => (
                  <li key={row.label}>
                    {localizeYachtBreakdownLabel(row.label, t)}: $
                    {row.amountUsd.toLocaleString(locale === "es" ? "es-ES" : "en-US")}
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 text-[0.75rem] text-cream/48">
              {t("yachtsPage.booking.depositDue", {
                amount: quote.depositUsd.toLocaleString(
                  locale === "es" ? "es-ES" : "en-US",
                ),
              })}
            </p>
          </>
        ) : null}
      </div>

      {isInline ? null : (
        <div className="rounded-sm border border-gold/15 bg-[#080808] p-4">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-gold/75">
            {t("yachtsPage.booking.availability")}
          </p>
          {loading ? (
            <p className="mt-2 text-sm text-cream/48">
              {t("yachtsPage.booking.loadingHolds")}
            </p>
          ) : error ? (
            <p className="mt-2 text-sm text-red-300/90">{error}</p>
          ) : windows.length > 0 ? (
            <ul className="mt-3 space-y-2 text-[0.78rem] text-cream/52">
              {windows.slice(0, 4).map((window) => (
                <li key={window.bookingId}>{window.label}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-cream/58">
              {t("yachtsPage.booking.noBlockedWindows")}
            </p>
          )}
        </div>
      )}

      {localError ? (
        <p className="text-[0.78rem] text-red-300/90">{localError}</p>
      ) : null}

      <button
        type="button"
        onClick={() => {
          if (slotOptions.length === 0) {
            setLocalError(t("yachtsPage.booking.noSlotsError"));
            return;
          }
          if (!quote) {
            setLocalError(t("yachtsPage.booking.completeDetailsError"));
            return;
          }
          addItem({
            category: "yacht",
            id: resolvedYacht.id,
            title: localizedYacht?.name ?? resolvedYacht.name,
            subtitle: localizedYacht?.location ?? resolvedYacht.subtitle,
            priceHint: priceDisplay,
            href: `/services/yachts/${resolvedYacht.id}`,
            bookingSelection: selection,
            bookingQuote: quote,
          });
          setLocalError(null);
        }}
        className="inline-flex min-h-11 items-center justify-center border border-gold/40 bg-gold px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#0b0b0b] transition-all hover:bg-gold-secondary"
      >
        {t("yachtsPage.booking.addToCheckout")}
      </button>
    </div>
  );
}
