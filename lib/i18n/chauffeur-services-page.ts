import type { Locale } from "@/lib/i18n/config";
import { hasTranslations } from "@/lib/i18n/config";
import { applyChauffeurPhrasesEs } from "@/lib/i18n/chauffeur-phrases-es";
import { localizeCatalogText } from "@/lib/i18n/localize-catalog-text";
import type { Translator } from "@/lib/i18n/translate";
import {
  CHAUFFEUR_FLEET_SORTED,
  chauffeurQuoteRateLine,
  sanitizeChauffeurRateLine,
  type ChauffeurFleetEntry,
} from "@/lib/chauffeur-fleet-data";
import type { ExoticCarSpec } from "@/lib/exotic-cars-data";

const SPEC_LABEL_KEYS: Record<string, string> = {
  Finish: "chauffeurServicesPage.specs.finish",
  Service: "chauffeurServicesPage.specs.service",
  Type: "chauffeurServicesPage.specs.type",
  Brand: "chauffeurServicesPage.specs.brand",
  Model: "chauffeurServicesPage.specs.model",
  Seats: "chauffeurServicesPage.specs.seats",
  Style: "chauffeurServicesPage.specs.style",
  Color: "chauffeurServicesPage.specs.color",
  Terms: "chauffeurServicesPage.specs.terms",
  "Security deposit": "chauffeurServicesPage.specs.securityDeposit",
  "Minimum days": "chauffeurServicesPage.specs.minimumDays",
  Engine: "chauffeurServicesPage.specs.engine",
  "0–60 mph": "chauffeurServicesPage.specs.zeroToSixty",
  MSRP: "chauffeurServicesPage.specs.msrp",
  Transmission: "chauffeurServicesPage.specs.transmission",
  Drivetrain: "chauffeurServicesPage.specs.drivetrain",
  Power: "chauffeurServicesPage.specs.power",
  Year: "chauffeurServicesPage.specs.year",
  Interior: "chauffeurServicesPage.specs.interior",
  Exterior: "chauffeurServicesPage.specs.exterior",
  Fuel: "chauffeurServicesPage.specs.fuel",
  Doors: "chauffeurServicesPage.specs.doors",
};

const SPEC_VALUE_KEYS: Record<string, string> = {
  "Chauffeur only": "chauffeurServicesPage.values.chauffeurOnly",
  "Chauffeur only (driver included)": "chauffeurServicesPage.values.chauffeurOnly",
  "Maybach van": "chauffeurServicesPage.values.maybachVan",
};

function chauffeurContentKey(carId: string, field: string): string {
  return `chauffeurContent.${carId}.${field}`;
}

function translatedOrFallback(
  t: Translator,
  key: string,
  fallback: string,
): string {
  const value = t(key);
  return value === key ? fallback : value;
}

function localizeChauffeurBody(text: string, locale: Locale): string {
  if (!text || !hasTranslations(locale) || locale === "en") {
    return text;
  }
  return applyChauffeurPhrasesEs(localizeCatalogText(text, locale));
}

function localizedDescription(
  car: ChauffeurFleetEntry,
  locale: Locale,
  t: Translator,
): string {
  const perId = translatedOrFallback(
    t,
    chauffeurContentKey(car.id, "description"),
    car.description,
  );
  if (perId !== car.description) {
    return localizeChauffeurBody(perId, locale);
  }
  if (car.id.startsWith("maybach-van")) {
    const shared = translatedOrFallback(
      t,
      "chauffeurContent.maybachVan.description",
      car.description,
    );
    if (shared !== car.description) {
      return localizeChauffeurBody(shared, locale);
    }
  }
  return localizeChauffeurBody(car.description, locale);
}

function localizeSpecValue(
  value: string,
  locale: Locale,
  t: Translator,
): string {
  const normalized = sanitizeChauffeurRateLine(value);
  const valueKey = SPEC_VALUE_KEYS[value] ?? SPEC_VALUE_KEYS[normalized];
  if (valueKey && hasTranslations(locale) && locale !== "en") {
    const translated = t(valueKey);
    if (translated !== valueKey) return translated;
  }
  return localizeChauffeurBody(normalized, locale);
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

function localizeRequirement(
  req: string,
  locale: Locale,
  t: Translator,
): string {
  if (req === "Chauffeur service only — self-drive is not available.") {
    const key = "chauffeurContent.shared.requirementChauffeurOnly";
    if (hasTranslations(locale) && locale !== "en") {
      const translated = t(key);
      if (translated !== key) return translated;
    }
  }
  return localizeChauffeurBody(req, locale);
}

export function localizeChauffeurFleetEntry(
  car: ChauffeurFleetEntry,
  locale: Locale,
  t: Translator,
): ChauffeurFleetEntry {
  if (!hasTranslations(locale) || locale === "en") {
    return car;
  }

  return {
    ...car,
    group: localizeCatalogText(car.group, locale),
    priceLine: localizeCatalogText(car.priceLine, locale),
    chauffeurPriceLine: car.chauffeurPriceLine
      ? localizeCatalogText(car.chauffeurPriceLine, locale)
      : car.chauffeurPriceLine,
    description: localizedDescription(car, locale, t),
    specs: car.specs?.map((row) => localizeSpec(row, locale, t)),
    requirements: car.requirements?.map((req) =>
      localizeRequirement(req, locale, t),
    ),
  };
}

export function getLocalizedChauffeurFleet(
  locale: Locale,
  t: Translator,
): ChauffeurFleetEntry[] {
  return CHAUFFEUR_FLEET_SORTED.map((car) =>
    localizeChauffeurFleetEntry(car, locale, t),
  );
}

export function localizedChauffeurQuoteRateLine(
  car: ChauffeurFleetEntry,
  locale: Locale,
): string {
  return sanitizeChauffeurRateLine(
    localizeCatalogText(chauffeurQuoteRateLine(car), locale),
  );
}
