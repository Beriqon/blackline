import type { Locale } from "@/lib/i18n/config";
import { hasTranslations } from "@/lib/i18n/config";
import { localizeCatalogText } from "@/lib/i18n/localize-catalog-text";
import { applyVillaPhrasesEs } from "@/lib/i18n/villa-phrases-es";
import type { Translator } from "@/lib/i18n/translate";
import {
  formatVillaUsd,
  type Villa,
  type VillaFact,
  type VillaNightlyRates,
} from "@/lib/villas-data";

const FACT_LABEL_KEYS: Record<string, string> = {
  Location: "villasPage.facts.location",
  "Property size": "villasPage.facts.propertySize",
  "Property type": "villasPage.facts.propertyType",
  Bedrooms: "villasPage.facts.bedrooms",
  Bathrooms: "villasPage.facts.bathrooms",
  "Max guests": "villasPage.facts.maxGuests",
  "Listing status": "villasPage.facts.listingStatus",
  "Check-in & check-out": "villasPage.facts.checkInOut",
  "Check-in": "villasPage.facts.checkIn",
  "Check-out": "villasPage.facts.checkOut",
  Weekday: "villasPage.facts.weekday",
  Weekend: "villasPage.facts.weekend",
};

const FACT_VALUE_KEYS: Record<string, string> = {
  "Confirmed when you book": "villasPage.values.confirmedWhenBook",
  "Details coming soon": "villasPage.values.detailsComingSoon",
  "After 3:00 pm": "villasPage.values.after3pm",
  "After 11:00 am": "villasPage.values.after11am",
  "After 12:00 pm": "villasPage.values.after12pm",
  "After 4:00 pm": "villasPage.values.after4pm",
  "Miami area": "villasPage.values.miamiArea",
  "Single-family pool home": "villasPage.values.singleFamilyPool",
};

function localizeVillaBody(text: string, locale: Locale): string {
  if (!text || !hasTranslations(locale) || locale === "en") {
    return text;
  }
  return applyVillaPhrasesEs(localizeCatalogText(text, locale));
}

export function localizeVillaText(
  text: string,
  locale: Locale,
  t: Translator,
): string {
  if (!text) return text;

  const valueKey = FACT_VALUE_KEYS[text];
  if (valueKey && hasTranslations(locale) && locale !== "en") {
    const translated = t(valueKey);
    if (translated !== valueKey) return translated;
  }

  return localizeVillaBody(text, locale);
}

function localizeFact(
  fact: VillaFact,
  locale: Locale,
  t: Translator,
): VillaFact {
  const labelKey = FACT_LABEL_KEYS[fact.label];
  const label =
    labelKey && hasTranslations(locale) && locale !== "en"
      ? t(labelKey)
      : fact.label;

  return {
    label,
    value: localizeVillaText(fact.value, locale, t),
  };
}

export function getVillaNightlyRateFacts(
  rates: VillaNightlyRates,
  locale: Locale,
  t: Translator,
): readonly VillaFact[] {
  const perNight = (amount: number) =>
    `${formatVillaUsd(amount)}${hasTranslations(locale) && locale !== "en" ? " / noche" : " / night"}`;

  return [
    {
      label:
        hasTranslations(locale) && locale !== "en"
          ? t("villasPage.facts.weekday")
          : "Weekday",
      value: perNight(rates.weekdayUsd),
    },
    {
      label:
        hasTranslations(locale) && locale !== "en"
          ? t("villasPage.facts.weekend")
          : "Weekend",
      value: perNight(rates.weekendUsd),
    },
  ];
}

function villaContentKey(villaId: string, field: string): string {
  return `villaContent.${villaId}.${field}`;
}

function translatedOrFallback(
  t: Translator,
  key: string,
  fallback: string,
): string {
  const value = t(key);
  return value === key ? fallback : value;
}

function localizedVillaProse(
  villa: Villa,
  t: Translator,
): Pick<Villa, "lede" | "description" | "highlights"> {
  const ledeKey = villaContentKey(villa.id, "lede");
  const descriptionKey = villaContentKey(villa.id, "description");

  return {
    lede: translatedOrFallback(t, ledeKey, villa.lede),
    description: translatedOrFallback(t, descriptionKey, villa.description),
    highlights: villa.highlights.map((highlight, index) =>
      translatedOrFallback(
        t,
        villaContentKey(villa.id, `highlight${index}`),
        highlight,
      ),
    ),
  };
}

export function localizeVilla(
  villa: Villa,
  locale: Locale,
  t: Translator,
): Villa {
  if (!hasTranslations(locale) || locale === "en") {
    return villa;
  }

  const prose = localizedVillaProse(villa, t);

  return {
    ...villa,
    subtitle: localizeVillaText(villa.subtitle, locale, t),
    cardTagline: localizeVillaText(villa.cardTagline, locale, t),
    lede: prose.lede,
    description: prose.description,
    facts: villa.facts.map((f) => localizeFact(f, locale, t)),
    highlights: prose.highlights,
    vipNote: villa.vipNote
      ? localizeVillaText(villa.vipNote, locale, t)
      : undefined,
    inclusions: villa.inclusions?.map((line) =>
      localizeVillaText(line, locale, t),
    ),
    policyNotes: villa.policyNotes?.map((note) =>
      localizeVillaText(note, locale, t),
    ),
  };
}

export function villaMapLocationLabel(
  villa: Villa,
  t: Translator,
): string {
  return t("villasPage.locationMiami", { neighborhood: villa.neighborhood });
}
