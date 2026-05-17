import type { BookingSelection } from "@/lib/bookings";
import type { Locale } from "@/lib/i18n/config";
import { hasTranslations } from "@/lib/i18n/config";
import { localizeCatalogText } from "@/lib/i18n/localize-catalog-text";
import { getDictionary, type Translator } from "@/lib/i18n/translate";
import type { Yacht, YachtPriceTier, YachtPromotion } from "@/lib/yachts-data";
import { YACHTS } from "@/lib/yachts-data";

type YachtContentBlock = {
  description?: string;
  highlights?: string[];
  inclusions?: string[];
  policyNotes?: string[];
  aboutTagline?: string;
  aboutQuote?: string;
  cardPriceLine?: string;
  subtitle?: string;
  priceTiers?: { durationLabel: string; note?: string }[];
  promotions?: { label: string; detail: string }[];
};

function getYachtContent(
  locale: Locale,
  yachtId: string,
): YachtContentBlock | undefined {
  if (!hasTranslations(locale) || locale === "en") return undefined;
  const dict = getDictionary(locale) as Record<string, unknown>;
  const root = dict.yachtContent as Record<string, unknown> | undefined;
  const block = root?.[yachtId] as Record<string, unknown> | undefined;
  if (!block) return undefined;

  const priceTiers = Array.isArray(block.priceTiers)
    ? block.priceTiers
        .filter((t): t is Record<string, unknown> => t && typeof t === "object")
        .map((t) => ({
          durationLabel:
            typeof t.durationLabel === "string" ? t.durationLabel : "",
          note: typeof t.note === "string" ? t.note : undefined,
        }))
        .filter((t) => t.durationLabel)
    : undefined;

  const promotions = Array.isArray(block.promotions)
    ? block.promotions
        .filter((p): p is Record<string, unknown> => p && typeof p === "object")
        .map((p) => ({
          label: typeof p.label === "string" ? p.label : "",
          detail: typeof p.detail === "string" ? p.detail : "",
        }))
        .filter((p) => p.label)
    : undefined;

  return {
    description:
      typeof block.description === "string" ? block.description : undefined,
    highlights: Array.isArray(block.highlights)
      ? block.highlights.filter((x): x is string => typeof x === "string")
      : undefined,
    inclusions: Array.isArray(block.inclusions)
      ? block.inclusions.filter((x): x is string => typeof x === "string")
      : undefined,
    policyNotes: Array.isArray(block.policyNotes)
      ? block.policyNotes.filter((x): x is string => typeof x === "string")
      : undefined,
    aboutTagline:
      typeof block.aboutTagline === "string" ? block.aboutTagline : undefined,
    aboutQuote:
      typeof block.aboutQuote === "string" ? block.aboutQuote : undefined,
    cardPriceLine:
      typeof block.cardPriceLine === "string" ? block.cardPriceLine : undefined,
    subtitle: typeof block.subtitle === "string" ? block.subtitle : undefined,
    priceTiers,
    promotions,
  };
}

function localizeYachtBody(text: string, locale: Locale): string {
  if (!text || !hasTranslations(locale) || locale === "en") {
    return text;
  }
  return localizeCatalogText(text, locale);
}

function mergePriceTiers(
  tiers: readonly YachtPriceTier[],
  content: YachtContentBlock | undefined,
  locale: Locale,
): readonly YachtPriceTier[] {
  return tiers.map((tier, i) => {
    const fromContent = content?.priceTiers?.[i];
    return {
      durationLabel: fromContent?.durationLabel
        ? localizeYachtBody(fromContent.durationLabel, locale)
        : localizeYachtBody(tier.durationLabel, locale),
      amount: localizeYachtBody(tier.amount, locale),
      note: fromContent?.note
        ? localizeYachtBody(fromContent.note, locale)
        : tier.note
          ? localizeYachtBody(tier.note, locale)
          : tier.note,
    };
  });
}

function mergePromotions(
  promos: readonly YachtPromotion[] | undefined,
  content: YachtContentBlock | undefined,
  locale: Locale,
): readonly YachtPromotion[] | undefined {
  if (!promos?.length) return promos;
  return promos.map((p, i) => {
    const fromContent = content?.promotions?.[i];
    return {
      label: fromContent?.label
        ? localizeYachtBody(fromContent.label, locale)
        : localizeYachtBody(p.label, locale),
      detail: fromContent?.detail
        ? localizeYachtBody(fromContent.detail, locale)
        : localizeYachtBody(p.detail, locale),
    };
  });
}

export function localizeYacht(yacht: Yacht, locale: Locale): Yacht {
  if (!hasTranslations(locale) || locale === "en") {
    return yacht;
  }

  const content = getYachtContent(locale, yacht.id);

  return {
    ...yacht,
    subtitle: content?.subtitle
      ? localizeYachtBody(content.subtitle, locale)
      : localizeYachtBody(yacht.subtitle, locale),
    cardPriceLine: content?.cardPriceLine
      ? localizeYachtBody(content.cardPriceLine, locale)
      : localizeYachtBody(yacht.cardPriceLine, locale),
    description: content?.description
      ? localizeYachtBody(content.description, locale)
      : localizeYachtBody(yacht.description, locale),
    highlights:
      content?.highlights?.length === yacht.highlights.length
        ? content.highlights.map((h) => localizeYachtBody(h, locale))
        : yacht.highlights.map((h) => localizeYachtBody(h, locale)),
    priceTiers: mergePriceTiers(yacht.priceTiers, content, locale),
    promotions: mergePromotions(yacht.promotions, content, locale),
    inclusions:
      content?.inclusions?.length === (yacht.inclusions?.length ?? 0) &&
      yacht.inclusions
        ? content.inclusions.map((line) => localizeYachtBody(line, locale))
        : yacht.inclusions?.map((line) => localizeYachtBody(line, locale)),
    location: yacht.location
      ? localizeYachtBody(yacht.location, locale)
      : yacht.location,
    policyNotes:
      content?.policyNotes?.length === (yacht.policyNotes?.length ?? 0) &&
      yacht.policyNotes
        ? content.policyNotes.map((note) => localizeYachtBody(note, locale))
        : yacht.policyNotes?.map((note) => localizeYachtBody(note, locale)),
    aboutTagline: content?.aboutTagline
      ? localizeYachtBody(content.aboutTagline, locale)
      : yacht.aboutTagline
        ? localizeYachtBody(yacht.aboutTagline, locale)
        : yacht.aboutTagline,
    aboutQuote: content?.aboutQuote
      ? localizeYachtBody(content.aboutQuote, locale)
      : yacht.aboutQuote
        ? localizeYachtBody(yacht.aboutQuote, locale)
        : yacht.aboutQuote,
  };
}

export function getLocalizedYachts(locale: Locale, _t: Translator): Yacht[] {
  return YACHTS.map((yacht) => localizeYacht(yacht, locale));
}

export function getYachtProductMetadataDescription(
  yacht: Yacht,
  locale: Locale,
): string {
  const localized = localizeYacht(yacht, locale);
  const desc = localized.description;
  return desc.length > 155 ? `${desc.slice(0, 152)}…` : desc;
}

function formatTimeAmPmEs(time24: string): string {
  const match = time24.match(/^(\d{2}):(\d{2})$/);
  if (!match) return time24;
  const hour24 = Number.parseInt(match[1]!, 10);
  const minute = match[2]!;
  const hour12 = hour24 % 12 || 12;
  const ampm = hour24 >= 12 ? "p. m." : "a. m.";
  return `${hour12}:${minute} ${ampm}`;
}

function formatTimeAmPmEn(time24: string): string {
  const match = time24.match(/^(\d{2}):(\d{2})$/);
  if (!match) return time24;
  const hour24 = Number.parseInt(match[1]!, 10);
  const minute = match[2]!;
  const hour12 = hour24 % 12 || 12;
  const ampm = hour24 >= 12 ? "PM" : "AM";
  return `${hour12}:${minute} ${ampm}`;
}

const YACHT_BOOKING_REASON_KEYS: Record<string, string> = {
  "This yacht is still quote-only and cannot be booked online yet.":
    "yachtsPage.booking.quoteOnlyReason",
};

export function localizeYachtBookingQuoteLabel(
  label: string,
  locale: Locale,
): string {
  if (!label || !hasTranslations(locale) || locale === "en") {
    return label;
  }
  let out = localizeCatalogText(label, locale);
  if (/\btotal$/i.test(out)) {
    out = out.replace(/\btotal$/i, "en total");
  }
  return out;
}

export function localizeYachtBookingUnavailableReason(
  reason: string | undefined,
  locale: Locale,
  t: Translator,
): string | undefined {
  if (!reason) return undefined;
  const key = YACHT_BOOKING_REASON_KEYS[reason];
  if (key && hasTranslations(locale) && locale !== "en") {
    const translated = t(key);
    if (translated !== key) return translated;
  }
  return localizeCatalogText(reason, locale);
}

export function localizeYachtBreakdownLabel(
  label: string,
  t: Translator,
): string {
  const map: Record<string, string> = {
    Charter: t("yachtsPage.booking.breakdownCharter"),
    Tax: t("yachtsPage.booking.breakdownTax"),
    Gratuity: t("yachtsPage.booking.breakdownGratuity"),
  };
  return map[label] ?? label;
}

export function describeYachtSelectionLocalized(
  selection: BookingSelection,
  locale: Locale,
  t: Translator,
): string {
  if (selection.category !== "yacht") return "";

  const formatTime =
    hasTranslations(locale) && locale !== "en"
      ? formatTimeAmPmEs
      : formatTimeAmPmEn;

  const duration = localizeCatalogText(selection.durationLabel, locale);
  const time = formatTime(selection.startTime);

  if (hasTranslations(locale) && locale !== "en") {
    return t("yachtsPage.booking.selectionSummary", {
      date: selection.charterDate,
      time,
      duration,
    });
  }

  return `${selection.charterDate} ${time} · ${selection.durationLabel} charter`;
}
