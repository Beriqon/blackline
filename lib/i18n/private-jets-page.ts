import type { Locale } from "@/lib/i18n/config";
import { hasTranslations } from "@/lib/i18n/config";
import { localizeCatalogText } from "@/lib/i18n/localize-catalog-text";
import type { Translator } from "@/lib/i18n/translate";
import {
  PRIVATE_JETS,
  PRIVATE_JET_CATEGORY_FILTERS,
  type PrivateJet,
} from "@/lib/private-jets-data";

const FILTER_KEYS: Record<string, string> = {
  all: "privateJetsPage.filters.all",
  "ultra-long-range": "privateJetsPage.filters.ultraLongRange",
  "super-mid-size": "privateJetsPage.filters.superMidSize",
  "mid-size": "privateJetsPage.filters.midSize",
};

function jetContentKey(jetId: string, field: string): string {
  return `jetContent.${jetId}.${field}`;
}

function translatedOrFallback(
  t: Translator,
  key: string,
  fallback: string,
): string {
  const value = t(key);
  return value === key ? fallback : value;
}

function localizeJetField(text: string, locale: Locale): string {
  return localizeCatalogText(text, locale);
}

export function localizePrivateJet(
  jet: PrivateJet,
  locale: Locale,
  t: Translator,
): PrivateJet {
  if (!hasTranslations(locale) || locale === "en") {
    return jet;
  }

  return {
    ...jet,
    categoryLabel: localizeJetField(jet.categoryLabel, locale),
    passengers: localizeJetField(jet.passengers, locale),
    range: localizeJetField(jet.range, locale),
    cruisingSpeed: localizeJetField(jet.cruisingSpeed, locale),
    baggage: localizeJetField(jet.baggage, locale),
    interiorWidth: localizeJetField(jet.interiorWidth, locale),
    interiorHeight: localizeJetField(jet.interiorHeight, locale),
    overview: translatedOrFallback(
      t,
      jetContentKey(jet.id, "overview"),
      jet.overview,
    ),
    amenities: jet.amenities.map((amenity) =>
      localizeJetField(amenity, locale),
    ),
  };
}

export function getLocalizedPrivateJets(
  locale: Locale,
  t: Translator,
): PrivateJet[] {
  return PRIVATE_JETS.map((jet) => localizePrivateJet(jet, locale, t));
}

export function getPrivateJetCategoryFilters(t: Translator) {
  return PRIVATE_JET_CATEGORY_FILTERS.map((filter) => {
    const key = FILTER_KEYS[filter.id];
    return {
      ...filter,
      label: key ? t(key) : filter.label,
    };
  });
}
