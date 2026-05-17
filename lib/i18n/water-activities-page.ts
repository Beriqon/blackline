import type { Locale } from "@/lib/i18n/config";
import { hasTranslations } from "@/lib/i18n/config";
import { localizeCatalogText } from "@/lib/i18n/localize-catalog-text";
import type { Translator } from "@/lib/i18n/translate";
import {
  FISHING_CHARTER_INCLUSIONS,
  FISHING_CRUISING_CHARTER,
  FISHING_INSHORE_CHARTER,
  FISHING_OFFSHORE_CHARTER,
  JET_SKI_JETCAR_SECTION,
  JETSKIS_OFFERINGS,
} from "@/lib/jetskis-jetcars-data";
import {
  WATER_ACTIVITY_TABS,
  type WaterActivityTab,
} from "@/lib/water-activities-tabs";
import {
  WATER_HERO_OVERVIEW,
  WATER_OVERVIEW_CARDS,
  type WaterOverviewCard,
} from "@/lib/water-activities-data";

/** Returns translated string or English fallback when key is missing. */
export function tWater(t: Translator, key: string, en: string): string {
  const value = t(key);
  return value === key ? en : value;
}

function interpolateEn(
  template: string,
  params: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = params[key];
    return value === undefined ? `{${key}}` : String(value);
  });
}

/** Like `tWater` but supports `{param}` placeholders in both dictionary and fallback. */
export function tWaterParams(
  t: Translator,
  key: string,
  en: string,
  params: Record<string, string | number>,
): string {
  const value = t(key, params);
  if (value !== key) return value;
  return interpolateEn(en, params);
}

export function getWaterBulletList(
  t: Translator,
  keyPrefix: string,
  enItems: readonly string[],
): string[] {
  return enItems.map((item, i) => tWater(t, `${keyPrefix}.${i}`, item));
}

export function localizeWaterText(
  text: string,
  locale: Locale,
): string {
  return localizeCatalogText(text, locale);
}

const TAB_KEYS: Record<WaterActivityTab, string> = {
  overview: "onTheWater.tabs.overview",
  pwc: "onTheWater.tabs.pwc",
  kayak: "onTheWater.tabs.kayak",
  sup: "onTheWater.tabs.sup",
  banana: "onTheWater.tabs.banana",
  parasailing: "onTheWater.tabs.parasailing",
  fishing: "onTheWater.tabs.fishing",
};

const TAB_LABELS_EN: Record<WaterActivityTab, string> = {
  overview: "Overview",
  pwc: "Jet skis & jetcars",
  kayak: "Kayak",
  sup: "Paddle board",
  banana: "Banana boat",
  parasailing: "Parasailing",
  fishing: "Fishing",
};

export function getWaterActivityTabs(t: Translator) {
  return WATER_ACTIVITY_TABS.map((tab) => ({
    ...tab,
    label: tWater(t, TAB_KEYS[tab.id], TAB_LABELS_EN[tab.id]),
  }));
}

const OVERVIEW_CARD_KEYS: Record<
  (typeof WATER_OVERVIEW_CARDS)[number]["id"],
  { title: string; description: string; priceLabel?: string; imageAlt: string }
> = {
  pwc: {
    title: "onTheWater.overview.cards.pwc.title",
    description: "onTheWater.overview.cards.pwc.description",
    imageAlt: "onTheWater.overview.cards.pwc.imageAlt",
  },
  kayak: {
    title: "onTheWater.overview.cards.kayak.title",
    description: "onTheWater.overview.cards.kayak.description",
    priceLabel: "onTheWater.overview.cards.kayak.priceLabel",
    imageAlt: "onTheWater.overview.cards.kayak.imageAlt",
  },
  sup: {
    title: "onTheWater.overview.cards.sup.title",
    description: "onTheWater.overview.cards.sup.description",
    priceLabel: "onTheWater.overview.cards.sup.priceLabel",
    imageAlt: "onTheWater.overview.cards.sup.imageAlt",
  },
  banana: {
    title: "onTheWater.overview.cards.banana.title",
    description: "onTheWater.overview.cards.banana.description",
    imageAlt: "onTheWater.overview.cards.banana.imageAlt",
  },
  parasailing: {
    title: "onTheWater.overview.cards.parasailing.title",
    description: "onTheWater.overview.cards.parasailing.description",
    priceLabel: "onTheWater.overview.cards.parasailing.priceLabel",
    imageAlt: "onTheWater.overview.cards.parasailing.imageAlt",
  },
  fishing: {
    title: "onTheWater.overview.cards.fishing.title",
    description: "onTheWater.overview.cards.fishing.description",
    imageAlt: "onTheWater.overview.cards.fishing.imageAlt",
  },
};

export function getWaterOverviewCards(
  t: Translator,
  locale: Locale,
): readonly WaterOverviewCard[] {
  return WATER_OVERVIEW_CARDS.map((card) => {
    const keys = OVERVIEW_CARD_KEYS[card.id];
    return {
      ...card,
      title: tWater(t, keys.title, card.title),
      description: tWater(t, keys.description, card.description),
      priceLabel: card.priceLabel
        ? localizeWaterText(
            tWater(t, keys.priceLabel!, card.priceLabel),
            locale,
          )
        : undefined,
      imageAlt: tWater(t, keys.imageAlt, card.imageAlt),
    };
  });
}

export function getWaterHeroOverview(t: Translator) {
  return {
    src: WATER_HERO_OVERVIEW.src,
    alt: tWater(
      t,
      "onTheWater.hero.overviewImageAlt",
      WATER_HERO_OVERVIEW.alt,
    ),
  };
}

export function getWaterFaqItems(
  t: Translator,
  section: string,
  items: readonly { q: string; a: string }[],
): { q: string; a: string }[] {
  return items.map((item, i) => ({
    q: tWater(t, `onTheWater.${section}.faq.${i}.q`, item.q),
    a: tWater(t, `onTheWater.${section}.faq.${i}.a`, item.a),
  }));
}

export function getJetSkiJetcarSection(t: Translator) {
  return {
    headline: tWater(
      t,
      "onTheWater.pwc.section.headline",
      JET_SKI_JETCAR_SECTION.headline,
    ),
    intro: JET_SKI_JETCAR_SECTION.intro.map((p, i) =>
      tWater(t, `onTheWater.pwc.section.intro.${i}`, p),
    ),
    locationsLabel: tWater(
      t,
      "onTheWater.pwc.section.locationsLabel",
      JET_SKI_JETCAR_SECTION.locationsLabel,
    ),
    locations: JET_SKI_JETCAR_SECTION.locations.map((loc, i) =>
      tWater(t, `onTheWater.pwc.section.locations.${i}`, loc),
    ),
    rates: JET_SKI_JETCAR_SECTION.rates.map((row, i) => ({
      label: tWater(t, `onTheWater.pwc.section.rates.${i}.label`, row.label),
      price: row.price,
    })),
    footnote: tWater(
      t,
      "onTheWater.pwc.section.footnote",
      JET_SKI_JETCAR_SECTION.footnote,
    ),
  };
}

export function getJetskisOfferings(t: Translator) {
  return JETSKIS_OFFERINGS.map((item, index) => ({
    ...item,
    title: tWater(t, `onTheWater.pwc.offerings.${index}.title`, item.title),
    description: tWater(
      t,
      `onTheWater.pwc.offerings.${index}.description`,
      item.description,
    ),
    imageAlt: tWater(
      t,
      `onTheWater.pwc.offerings.${index}.imageAlt`,
      item.imageAlt,
    ),
    ctaLabel: tWater(
      t,
      `onTheWater.pwc.offerings.${index}.ctaLabel`,
      item.ctaLabel,
    ),
  }));
}

function localizeFishingTiers(
  t: Translator,
  locale: Locale,
  charterKey: "cruising" | "inshore" | "offshore",
  tiers: readonly { readonly duration: string; readonly price: string }[],
) {
  return tiers.map((tier, i) => ({
    duration: localizeWaterText(
      tWater(
        t,
        `onTheWater.fishing.${charterKey}.tiers.${i}.duration`,
        tier.duration,
      ),
      locale,
    ),
    price: tier.price,
  }));
}

export function getFishingCruisingCharter(t: Translator, locale: Locale) {
  return {
    title: tWater(
      t,
      "onTheWater.fishing.cruising.title",
      FISHING_CRUISING_CHARTER.title,
    ),
    locations: FISHING_CRUISING_CHARTER.locations.map((loc, i) =>
      tWater(t, `onTheWater.fishing.cruising.locations.${i}`, loc),
    ),
    rate: localizeWaterText(
      tWater(
        t,
        "onTheWater.fishing.cruising.rate",
        FISHING_CRUISING_CHARTER.rate,
      ),
      locale,
    ),
    tiers: localizeFishingTiers(
      t,
      locale,
      "cruising",
      FISHING_CRUISING_CHARTER.tiers,
    ),
  };
}

export function getFishingInshoreCharter(t: Translator, locale: Locale) {
  return {
    title: tWater(
      t,
      "onTheWater.fishing.inshore.title",
      FISHING_INSHORE_CHARTER.title,
    ),
    vessel: tWater(
      t,
      "onTheWater.fishing.inshore.vessel",
      FISHING_INSHORE_CHARTER.vessel,
    ),
    targets: tWater(
      t,
      "onTheWater.fishing.inshore.targets",
      FISHING_INSHORE_CHARTER.targets,
    ),
    tiers: localizeFishingTiers(
      t,
      locale,
      "inshore",
      FISHING_INSHORE_CHARTER.tiers,
    ),
  };
}

export function getFishingOffshoreCharter(t: Translator, locale: Locale) {
  return {
    title: tWater(
      t,
      "onTheWater.fishing.offshore.title",
      FISHING_OFFSHORE_CHARTER.title,
    ),
    vessels: FISHING_OFFSHORE_CHARTER.vessels.map((v, i) =>
      tWater(t, `onTheWater.fishing.offshore.vessels.${i}`, v),
    ),
    targets: tWater(
      t,
      "onTheWater.fishing.offshore.targets",
      FISHING_OFFSHORE_CHARTER.targets,
    ),
    tiers: localizeFishingTiers(
      t,
      locale,
      "offshore",
      FISHING_OFFSHORE_CHARTER.tiers,
    ),
  };
}

export function getFishingCharterInclusions(t: Translator): string[] {
  return FISHING_CHARTER_INCLUSIONS.map((line, i) =>
    tWater(t, `onTheWater.fishing.inclusions.${i}`, line),
  );
}
