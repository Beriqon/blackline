import {
  vipFeaturedVenues,
  vipTableRequestHints,
  vipTransport,
  type FeaturedVenue,
} from "@/lib/vip-nightlife-data";
import type { Translator } from "@/lib/i18n/translate";

const VENUE_IDS = [
  "livMiami",
  "cocoMiami",
  "e11even",
  "mrJones",
  "clubSpace",
  "vendome",
  "m2Miami",
  "nikkiBeach",
  "joiaBeach",
  "mona",
  "madclub",
  "palmTreeClub",
  "strawberryMoon",
  "boobyTrap",
  "tootsies",
  "sexyFish",
  "komodo",
  "gekko",
  "bagatelle",
  "kikiOnTheRiver",
  "habibi",
  "seaSpice",
  "casaNeos",
] as const;

function translateSubtitle(t: Translator, subtitle?: string): string | undefined {
  if (!subtitle) return undefined;
  if (subtitle === "VIP access") return t("vipNightlifePage.subtitleVipAccess");
  if (subtitle === "Beach club") return t("vipNightlifePage.subtitleBeachClub");
  if (subtitle === "VIP dining") return t("vipNightlifePage.subtitleVipDining");
  return subtitle;
}

export function getVipNightlifeHero(t: Translator) {
  return {
    eyebrow: t("nav.vipNightlife"),
    headline: t("vipNightlifePage.heroHeadline"),
    lead: t("vipNightlifePage.heroLead"),
  };
}

export function getVipNightlifeIntroParagraphs(t: Translator): readonly string[] {
  return [t("vipNightlifePage.intro.0"), t("vipNightlifePage.intro.1")];
}

export function getVipFeaturedVenues(t: Translator): readonly FeaturedVenue[] {
  return vipFeaturedVenues.map((venue, index) => {
    const id = VENUE_IDS[index];
    if (!id) return venue;

    return {
      ...venue,
      subtitle: translateSubtitle(t, venue.subtitle),
      imageAlt: t(`vipNightlifePage.venues.${id}.imageAlt`),
      about: t(`vipNightlifePage.venues.${id}.about`),
      gallery: venue.gallery.map((img, gi) => ({
        src: img.src,
        alt: t(`vipNightlifePage.venues.${id}.gallery${gi + 1}`),
      })),
    };
  });
}

export function getVipTransport(t: Translator) {
  return {
    title: t("vipNightlifePage.transportTitle"),
    lead: t("vipNightlifePage.transportLead"),
    minimum: t("vipNightlifePage.transportMinimum"),
    options: vipTransport.options.map((_, i) =>
      t(`vipNightlifePage.transportOption.${i}`),
    ),
  };
}

export function getVipTableRequestHints(t: Translator): readonly string[] {
  return vipTableRequestHints.map((_, i) => t(`vipNightlifePage.requestHint.${i}`));
}
