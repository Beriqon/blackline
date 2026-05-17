import {
  Bike,
  Bus,
  CarFront,
  type LucideIcon,
} from "lucide-react";

import {
  ATV_TOURS,
  UTV_PRODUCTS,
  type AtvTourForBooking,
  type UtvForBooking,
} from "@/lib/atv-booking-data";
import type { Translator } from "@/lib/i18n/translate";

const RIDER_CARD_KEYS = ["atv", "utv2", "utv4"] as const;
const RIDER_ICONS: Record<(typeof RIDER_CARD_KEYS)[number], LucideIcon> = {
  atv: Bike,
  utv2: CarFront,
  utv4: Bus,
};

const FAQ_COUNT = 7;
const NIGHT_GLOW_BULLET_COUNT = 4;
const BOOKING_STEP_COUNT = 4;

const PRICING_FEATURES = [
  "atvPage.pricingGrid.featureHelmet",
  "atvPage.pricingGrid.featureGuided",
  "atvPage.pricingGrid.featurePhotos",
] as const;

export function tAtv(
  t: Translator,
  key: string,
  fallback?: string,
): string {
  const value = t(key);
  if (value !== key) return value;
  return fallback ?? key;
}

export function tAtvParams(
  t: Translator,
  key: string,
  params: Record<string, string | number>,
  fallback?: string,
): string {
  const value = t(key, params);
  if (value !== key) return value;
  if (!fallback) return key;
  return fallback.replace(/\{(\w+)\}/g, (_, k: string) =>
    params[k] === undefined ? `{${k}}` : String(params[k]),
  );
}

export type AtvRiderCardDisplay = {
  key: (typeof RIDER_CARD_KEYS)[number];
  eyebrow: string;
  title: string;
  line: string;
  blurb: string;
  icon: LucideIcon;
};

export function getAtvRiderCards(t: Translator): AtvRiderCardDisplay[] {
  return RIDER_CARD_KEYS.map((key) => ({
    key,
    icon: RIDER_ICONS[key],
    eyebrow: t(`atvPage.riderCards.${key}.eyebrow`),
    title: t(`atvPage.riderCards.${key}.title`),
    line: t(`atvPage.riderCards.${key}.line`),
    blurb: t(`atvPage.riderCards.${key}.blurb`),
  }));
}

export function getAtvFaqItems(t: Translator): { q: string; a: string }[] {
  return Array.from({ length: FAQ_COUNT }, (_, i) => ({
    q: t(`atvPage.faq.${i}.q`),
    a: t(`atvPage.faq.${i}.a`),
  }));
}

export function getAtvNightGlowBullets(t: Translator): string[] {
  return Array.from({ length: NIGHT_GLOW_BULLET_COUNT }, (_, i) =>
    t(`atvPage.nightGlowBullets.${i}`),
  );
}

export function getAtvBookingSteps(t: Translator): string[] {
  return Array.from({ length: BOOKING_STEP_COUNT }, (_, i) =>
    t(`atvPage.bookingSteps.${i}`),
  );
}

export type LocalizedAtvTour = AtvTourForBooking;

export function getLocalizedAtvTours(t: Translator): LocalizedAtvTour[] {
  return ATV_TOURS.map((tour) => {
    const prefix = `atvPage.tours.${tour.id}`;
    const noteKey = `${prefix}.note`;
    const badgeKey = `${prefix}.badge`;
    const noteRaw = t(noteKey);
    const badgeRaw = t(badgeKey);
    return {
      ...tour,
      duration: t(`${prefix}.duration`),
      unit: t(`${prefix}.unit`),
      note: noteRaw === noteKey ? tour.note : noteRaw,
      badge: badgeRaw === badgeKey ? tour.badge : badgeRaw,
    };
  });
}

export type LocalizedUtvProduct = UtvForBooking;

export function getLocalizedUtvProducts(t: Translator): LocalizedUtvProduct[] {
  return UTV_PRODUCTS.map((utv) => {
    const prefix = `atvPage.utvProducts.${utv.id}`;
    const badgeKey = `${prefix}.badge`;
    const badgeRaw = t(badgeKey);
    return {
      ...utv,
      title: t(`${prefix}.title`),
      tagline: t(`${prefix}.tagline`),
      badge: badgeRaw === badgeKey ? utv.badge : badgeRaw,
      options: utv.options.map((opt) => ({
        ...opt,
        duration: t(`${prefix}.durations.${opt.id}`),
      })),
    };
  });
}

export function getAtvPricingFeatures(t: Translator): string[] {
  return PRICING_FEATURES.map((key) => t(key));
}

export function buildAtvWhatsappHref(t: Translator, kind: "atv" | "night"): string {
  const text =
    kind === "night"
      ? t("atvPage.whatsappNight")
      : t("atvPage.whatsappAtv");
  return `https://wa.me/17866840345?text=${encodeURIComponent(text)}`;
}
