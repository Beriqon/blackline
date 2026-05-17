"use client";

import { ShoppingBag, X } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { useCart } from "@/components/cart-context";
import { useTranslations } from "@/components/locale-provider";
import type { AtvBookingOffer } from "@/lib/atv-booking-data";
import { ATV_BOOKING_HREF } from "@/lib/atv-booking-data";
import { formatUsd } from "@/lib/bookings";
import type { CartLineInput } from "@/lib/cart-types";
import { tAtvParams } from "@/lib/i18n/atv-page";

const fieldClass =
  "mt-2 w-full border border-gold/20 bg-[#0b0b0b] px-3 py-2.5 text-sm tabular-nums text-cream outline-none transition-[border-color] focus-visible:border-gold/50";

type AtvBookingContextValue = {
  openOffer: (offer: AtvBookingOffer) => void;
};

const AtvBookingContext = createContext<AtvBookingContextValue | null>(null);

export function useAtvBooking() {
  const ctx = useContext(AtvBookingContext);
  if (!ctx) {
    throw new Error("useAtvBooking must be used within AtvBookingProvider");
  }
  return ctx;
}

export function AtvBookingProvider({ children }: { children: ReactNode }) {
  const [offer, setOffer] = useState<AtvBookingOffer | null>(null);

  const openOffer = useCallback((next: AtvBookingOffer) => {
    setOffer(next);
  }, []);

  return (
    <AtvBookingContext.Provider value={{ openOffer }}>
      {children}
      <AtvBookingDialog offer={offer} onClose={() => setOffer(null)} />
    </AtvBookingContext.Provider>
  );
}

function AtvBookingDialog({
  offer,
  onClose,
}: {
  offer: AtvBookingOffer | null;
  onClose: () => void;
}) {
  const titleId = useId();
  const t = useTranslations();
  const { addItem } = useCart();
  const [machines, setMachines] = useState(1);
  const [riders, setRiders] = useState(1);

  const seatsPerMachine =
    offer?.kind === "atv"
      ? offer.tour.ridersPerMachine
      : offer?.kind === "utv"
        ? offer.utv.seats
        : 2;

  const unitPrice =
    offer?.kind === "atv"
      ? offer.tour.price
      : offer?.kind === "utv"
        ? offer.option.price
        : 0;

  const durationLabel =
    offer?.kind === "atv"
      ? offer.tour.duration
      : offer?.kind === "utv"
        ? offer.option.duration
        : "";

  const maxMachines = 12;

  useEffect(() => {
    if (!offer) return;
    setMachines(1);
    setRiders(1);
  }, [offer]);

  useEffect(() => {
    if (!offer) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [offer]);

  useEffect(() => {
    if (!offer) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [offer, onClose]);

  const safeMachines = Math.min(
    maxMachines,
    Math.max(1, Math.floor(machines) || 1),
  );
  const maxRiders = safeMachines * seatsPerMachine;
  const safeRiders = Math.min(maxRiders, Math.max(1, Math.floor(riders) || 1));

  useEffect(() => {
    if (riders > maxRiders) setRiders(maxRiders);
  }, [maxRiders, riders]);

  const totalUsd = unitPrice * safeMachines;

  const cartItem: CartLineInput | null = useMemo(() => {
    if (!offer) return null;

    if (offer.kind === "atv") {
      const { tour } = offer;
      const machineLabel =
        safeMachines === 1 ? t("atvPage.dialog.atv") : t("atvPage.dialog.atvs");
      const riderLabel =
        safeRiders === 1 ? t("atvPage.dialog.rider") : t("atvPage.dialog.riders");
      return {
        category: "atv",
        id: `atv-${tour.id}-m${safeMachines}-r${safeRiders}`,
        title: tAtvParams(t, "atvPage.dialog.tourTitle", {
          duration: tour.duration,
        }),
        subtitle: tAtvParams(t, "atvPage.dialog.cartSubtitleAtv", {
          machines: safeMachines,
          machineLabel,
          riders: safeRiders,
          riderLabel,
        }),
        priceHint: `${formatUsd(totalUsd)} (${formatUsd(tour.price)} ${tour.unit})`,
        href: `${ATV_BOOKING_HREF}#pricing`,
      };
    }

    const { utv, option } = offer;
    const machineLabel =
      safeMachines === 1 ? t("atvPage.dialog.utv") : t("atvPage.dialog.utvs");
    const riderLabel =
      safeRiders === 1 ? t("atvPage.dialog.rider") : t("atvPage.dialog.riders");
    return {
      category: "utv",
      id: `${utv.id}-${option.id}-m${safeMachines}-r${safeRiders}`,
      title: tAtvParams(t, "atvPage.dialog.utvTourTitle", { title: utv.title }),
      subtitle: tAtvParams(t, "atvPage.dialog.cartSubtitleUtv", {
        duration: option.duration,
        machines: safeMachines,
        machineLabel,
        riders: safeRiders,
        riderLabel,
      }),
      priceHint: `${formatUsd(totalUsd)} (${formatUsd(option.price)} ${t("atvPage.pricingGrid.perUtv")})`,
      href: `${ATV_BOOKING_HREF}#utv`,
    };
  }, [offer, safeMachines, safeRiders, t, totalUsd]);

  if (!offer || !cartItem) return null;

  const machinesPluralLabel =
    offer.kind === "utv"
      ? safeMachines === 1
        ? t("atvPage.dialog.utv")
        : t("atvPage.dialog.utvs")
      : safeMachines === 1
        ? t("atvPage.dialog.atv")
        : t("atvPage.dialog.atvs");

  const perMachineTypeLabel =
    offer.kind === "utv" ? t("atvPage.dialog.utv") : t("atvPage.dialog.atv");

  const machineWord =
    safeMachines === 1
      ? t("atvPage.dialog.machine")
      : t("atvPage.dialog.machines");

  const headline =
    offer.kind === "atv"
      ? tAtvParams(t, "atvPage.dialog.tourTitle", {
          duration: offer.tour.duration,
        })
      : tAtvParams(t, "atvPage.dialog.utvTourTitle", {
          title: offer.utv.title,
        });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center overflow-x-clip sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-[#0b0b0b]/82 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label={t("atvPage.dialog.closeBooking")}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[min(92vh,720px)] w-full max-w-lg flex-col overflow-hidden border border-gold/18 bg-[#0b0b0b] shadow-[0_32px_120px_rgba(0,0,0,0.75)] sm:mx-4 sm:rounded-sm"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gold/12 px-4 py-3 sm:px-6 sm:py-4">
          <h2
            id={titleId}
            className="pr-8 font-serif text-lg leading-snug tracking-tight text-cream sm:text-xl"
          >
            {headline}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center border border-gold/15 text-cream/70 transition-colors hover:border-gold/35 hover:text-gold-secondary"
            aria-label={t("atvPage.dialog.close")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-gold/80">
            {durationLabel}
            {offer.kind === "atv" && offer.tour.note
              ? ` · ${offer.tour.note}`
              : null}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-cream/58">
            {t("atvPage.dialog.body")}
          </p>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="atv-booking-machines"
                className="text-[0.6rem] font-medium uppercase tracking-[0.24em] text-gold/65"
              >
                {tAtvParams(t, "atvPage.dialog.machinesLabel", {
                  machines: machinesPluralLabel,
                })}
              </label>
              <input
                id="atv-booking-machines"
                type="number"
                inputMode="numeric"
                min={1}
                max={maxMachines}
                value={machines}
                onChange={(e) => {
                  const n = Number.parseInt(e.target.value, 10);
                  setMachines(
                    Number.isFinite(n)
                      ? Math.min(maxMachines, Math.max(1, n))
                      : 1,
                  );
                }}
                className={fieldClass}
              />
            </div>
            <div>
              <label
                htmlFor="atv-booking-riders"
                className="text-[0.6rem] font-medium uppercase tracking-[0.24em] text-gold/65"
              >
                {t("atvPage.dialog.ridersLabel")}
              </label>
              <input
                id="atv-booking-riders"
                type="number"
                inputMode="numeric"
                min={1}
                max={maxRiders}
                value={riders}
                onChange={(e) => {
                  const n = Number.parseInt(e.target.value, 10);
                  setRiders(
                    Number.isFinite(n)
                      ? Math.min(maxRiders, Math.max(1, n))
                      : 1,
                  );
                }}
                className={fieldClass}
              />
              <p className="mt-1.5 text-[0.7rem] leading-snug text-cream/42">
                {tAtvParams(t, "atvPage.dialog.ridersHint", {
                  perMachine: seatsPerMachine,
                  machineType: perMachineTypeLabel,
                  maxRiders,
                  count: safeMachines,
                  machineWord,
                })}
              </p>
            </div>
          </div>

          <div className="mt-6 border border-gold/20 bg-[#0a0a0a]/90 px-4 py-3.5">
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-gold/70">
              {t("atvPage.dialog.estimatedTotal")}
            </p>
            <p className="mt-1 font-serif text-2xl tracking-tight text-gold-secondary">
              {formatUsd(totalUsd)}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-cream/52">
              {safeMachines} × {formatUsd(unitPrice)} = {formatUsd(totalUsd)}
              {offer.kind === "atv"
                ? ` (${offer.tour.unit})`
                : ` ${t("atvPage.dialog.perUtvParen")}`}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              addItem(cartItem);
              onClose();
            }}
            className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 border border-gold/30 bg-transparent px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-gold transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-gold/55 hover:text-gold-secondary hover:shadow-[0_0_36px_rgba(198,164,108,0.12)] active:translate-y-0"
          >
            <ShoppingBag className="size-4 shrink-0" aria-hidden />
            {t("common.addToSelection")}
          </button>
        </div>
      </div>
    </div>
  );
}

export const atvPriceTileClass =
  "w-full rounded-lg border border-gold/12 bg-[#0e0e0e] px-4 py-3.5 text-left transition-[border-color,background-color,box-shadow] duration-200 hover:border-gold/30 hover:bg-[#121212] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold/45 cursor-pointer";
