import type { BookingSelection } from "@/lib/bookings";
import type { Locale } from "@/lib/i18n/config";
import { hasTranslations } from "@/lib/i18n/config";
import { applyExoticPhrasesEs } from "@/lib/i18n/exotic-phrases-es";
import { localizeCatalogText } from "@/lib/i18n/localize-catalog-text";
import { getDictionary, type Translator } from "@/lib/i18n/translate";
import {
  EXOTIC_CARS_DAILY,
  type ExoticCar,
  type ExoticCarSpec,
} from "@/lib/exotic-cars-data";

const SPEC_LABEL_KEYS: Record<string, string> = {
  Finish: "exoticCarsPage.specs.finish",
  Service: "exoticCarsPage.specs.service",
  Type: "exoticCarsPage.specs.type",
  Brand: "exoticCarsPage.specs.brand",
  Model: "exoticCarsPage.specs.model",
  Seats: "exoticCarsPage.specs.seats",
  Style: "exoticCarsPage.specs.style",
  Color: "exoticCarsPage.specs.color",
  Terms: "exoticCarsPage.specs.terms",
  "Security deposit": "exoticCarsPage.specs.securityDeposit",
  "Minimum days": "exoticCarsPage.specs.minimumDays",
  Engine: "exoticCarsPage.specs.engine",
  "0–60 mph": "exoticCarsPage.specs.zeroToSixty",
  MSRP: "exoticCarsPage.specs.msrp",
  Transmission: "exoticCarsPage.specs.transmission",
  Drivetrain: "exoticCarsPage.specs.drivetrain",
  Power: "exoticCarsPage.specs.power",
  Year: "exoticCarsPage.specs.year",
  Interior: "exoticCarsPage.specs.interior",
  Exterior: "exoticCarsPage.specs.exterior",
  Fuel: "exoticCarsPage.specs.fuel",
  Doors: "exoticCarsPage.specs.doors",
  "Self-drive": "exoticCarsPage.specs.selfDrive",
  Chauffeur: "exoticCarsPage.specs.chauffeur",
  Segment: "exoticCarsPage.specs.segment",
  Trim: "exoticCarsPage.specs.trim",
};

const SPEC_VALUE_KEYS: Record<string, string> = {
  "License & insurance required": "exoticCarsPage.values.licenseInsurance",
};

type ExoticCarContentBlock = {
  description?: string;
  highlights?: string[];
  priceNote?: string;
};

function getExoticCarContent(
  locale: Locale,
  carId: string,
): ExoticCarContentBlock | undefined {
  if (!hasTranslations(locale) || locale === "en") return undefined;
  const dict = getDictionary(locale) as Record<string, unknown>;
  const root = dict.exoticContent as Record<string, unknown> | undefined;
  const block = root?.[carId] as Record<string, unknown> | undefined;
  if (!block) return undefined;
  return {
    description:
      typeof block.description === "string" ? block.description : undefined,
    highlights: Array.isArray(block.highlights)
      ? block.highlights.filter((x): x is string => typeof x === "string")
      : undefined,
    priceNote:
      typeof block.priceNote === "string" ? block.priceNote : undefined,
  };
}

function exoticContentKey(carId: string, field: string): string {
  return `exoticContent.${carId}.${field}`;
}

function translatedOrFallback(
  t: Translator,
  key: string,
  fallback: string,
): string {
  const value = t(key);
  return value === key ? fallback : value;
}

function localizeExoticBody(text: string, locale: Locale): string {
  if (!text || !hasTranslations(locale) || locale === "en") {
    return text;
  }
  return applyExoticPhrasesEs(localizeCatalogText(text, locale));
}

function localizedDescription(
  car: ExoticCar,
  locale: Locale,
  t: Translator,
): string {
  const content = getExoticCarContent(locale, car.id);
  if (content?.description) {
    return localizeExoticBody(content.description, locale);
  }
  const perId = translatedOrFallback(
    t,
    exoticContentKey(car.id, "description"),
    car.description,
  );
  return localizeExoticBody(
    perId !== car.description ? perId : car.description,
    locale,
  );
}

function localizedHighlights(
  car: ExoticCar,
  locale: Locale,
): readonly string[] | undefined {
  if (!car.highlights?.length) return car.highlights;
  const content = getExoticCarContent(locale, car.id);
  if (content?.highlights?.length === car.highlights.length) {
    return content.highlights.map((h) => localizeExoticBody(h, locale));
  }
  return car.highlights.map((h) => localizeExoticBody(h, locale));
}

function localizeSpecValue(
  value: string,
  locale: Locale,
  t: Translator,
): string {
  const valueKey = SPEC_VALUE_KEYS[value];
  if (valueKey && hasTranslations(locale) && locale !== "en") {
    const translated = t(valueKey);
    if (translated !== valueKey) return translated;
  }
  return localizeExoticBody(value, locale);
}

function localizeSpec(
  row: ExoticCarSpec,
  locale: Locale,
  t: Translator,
): ExoticCarSpec {
  const labelKey = SPEC_LABEL_KEYS[row.label];
  const label =
    labelKey && hasTranslations(locale) && locale !== "en"
      ? t(labelKey)
      : row.label;

  return {
    label,
    value: localizeSpecValue(row.value, locale, t),
  };
}

export function localizeExoticCar(
  car: ExoticCar,
  locale: Locale,
  t: Translator,
): ExoticCar {
  if (!hasTranslations(locale) || locale === "en") {
    return car;
  }

  const content = getExoticCarContent(locale, car.id);

  return {
    ...car,
    group: localizeCatalogText(car.group, locale),
    priceLine: localizeCatalogText(car.priceLine, locale),
    priceNote: content?.priceNote
      ? localizeExoticBody(content.priceNote, locale)
      : car.priceNote
        ? localizeExoticBody(car.priceNote, locale)
        : car.priceNote,
    chauffeurPriceLine: car.chauffeurPriceLine
      ? localizeCatalogText(car.chauffeurPriceLine, locale)
      : car.chauffeurPriceLine,
    description: localizedDescription(car, locale, t),
    highlights: localizedHighlights(car, locale),
    specs: car.specs?.map((row) => localizeSpec(row, locale, t)),
    requirements: car.requirements?.map((req) =>
      localizeExoticBody(req, locale),
    ),
  };
}

export function getLocalizedExoticCars(
  locale: Locale,
  t: Translator,
): ExoticCar[] {
  return EXOTIC_CARS_DAILY.map((car) => localizeExoticCar(car, locale, t));
}

export function exoticBrandFilterLabel(
  group: string,
  t: Translator,
): string {
  if (group === "Maybach") {
    const key = "exoticCarsPage.brands.maybachVans";
    const translated = t(key);
    if (translated !== key) return translated;
  }
  return group;
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

const BOOKING_REASON_KEYS: Record<string, string> = {
  "This vehicle needs a custom quote before online payment.":
    "exoticCarsPage.booking.customQuoteReason",
  "Chauffeur pricing is not published yet for online payment.":
    "exoticCarsPage.booking.chauffeurQuoteReason",
};

export function localizeBookingQuoteLabel(
  label: string,
  locale: Locale,
): string {
  return localizeExoticBody(label, locale);
}

export function localizeBookingUnavailableReason(
  reason: string | undefined,
  locale: Locale,
  t: Translator,
): string | undefined {
  if (!reason) return undefined;
  const key = BOOKING_REASON_KEYS[reason];
  if (key && hasTranslations(locale) && locale !== "en") {
    const translated = t(key);
    if (translated !== key) return translated;
  }
  return localizeExoticBody(reason, locale);
}

export function describeExoticSelectionLocalized(
  selection: BookingSelection,
  locale: Locale,
  t: Translator,
): string {
  if (selection.category !== "exotic-car") {
    return "";
  }

  const formatTime =
    hasTranslations(locale) && locale !== "en"
      ? formatTimeAmPmEs
      : (time: string) => {
          const match = time.match(/^(\d{2}):(\d{2})$/);
          if (!match) return time;
          const hour24 = Number.parseInt(match[1]!, 10);
          const minute = match[2]!;
          const hour12 = hour24 % 12 || 12;
          const ampm = hour24 >= 12 ? "PM" : "AM";
          return `${hour12}:${minute} ${ampm}`;
        };

  if (selection.rentalMode === "self-drive") {
    const endDate = selection.endDate ?? selection.startDate;
    const startTime = selection.startTime ?? "09:00";
    const endTime = selection.endTime ?? "20:00";
    if (hasTranslations(locale) && locale !== "en") {
      return `${t("exoticCarsPage.booking.selfDrive")} · ${selection.startDate} ${formatTime(
        startTime,
      )} ${t("exoticCarsPage.booking.dateRangeTo")} ${endDate} ${formatTime(endTime)}`;
    }
    return `Self-drive · ${selection.startDate} ${formatTime(
      startTime,
    )} to ${endDate} ${formatTime(endTime)}`;
  }

  const hours = Math.min(12, Math.max(4, selection.durationHours ?? 4));
  const startTime = selection.startTime ?? "09:00";
  if (hasTranslations(locale) && locale !== "en") {
    return `${t("exoticCarsPage.booking.chauffeur")} · ${t("exoticCarsPage.booking.chauffeurFrom", {
      date: selection.startDate,
      time: formatTime(startTime),
      hours,
    })}`;
  }
  return `Chauffeur · from ${selection.startDate} ${formatTime(
    startTime,
  )} for ${hours} hrs`;
}
