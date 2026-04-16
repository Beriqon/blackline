import {
  AZIMUT_88_CARD_COVER_SRC,
  AZIMUT_88_GALLERY_COUNT,
} from "./azimut-88-gallery";
import {
  AZIMUT_105_SV_CARD_COVER_SRC,
  AZIMUT_105_SV_GALLERY_COUNT,
} from "./azimut-105-sv-gallery";
import {
  SIRENA_88_CARD_COVER_SRC,
  SIRENA_88_GALLERY_COUNT,
} from "./sirena-88-gallery";
import {
  SUNSEEKER_96_CARD_COVER_SRC,
  SUNSEEKER_96_GALLERY_COUNT,
} from "./sunseeker-96-gallery";
import {
  SUNSEEKER_76_CARD_COVER_SRC,
  SUNSEEKER_76_GALLERY_COUNT,
} from "./sunseeker-76-gallery";
import {
  PRINCESS_88_PFO_CARD_COVER_SRC,
  PRINCESS_88_PFO_GALLERY_COUNT,
} from "./princess-88-pfo-gallery";
import {
  AZIMUT_116_CARD_COVER_SRC,
  AZIMUT_116_GALLERY_COUNT,
} from "./azimut-116-gallery";
import {
  PERSHING_GTX_CARD_COVER_SRC,
  PERSHING_GTX_GALLERY_COUNT,
} from "./pershing-gtx-gallery";
import {
  PERSHING_90_REFIT_CARD_COVER_SRC,
  PERSHING_90_REFIT_GALLERY_COUNT,
} from "./pershing-90-refit-gallery";
import { SAN_LORENZO_97_CARD_COVER_SRC, SAN_LORENZO_97_GALLERY_COUNT } from "./san-lorenzo-97-gallery";
import { TRINITY_CARD_COVER_SRC, TRINITY_GALLERY_COUNT } from "./trinity-gallery";
import {
  getMycEntryForInternalId,
  yachtFromMycEntry,
} from "./myc-fleet-to-yacht";

export type YachtPriceTier = {
  durationLabel: string;
  amount: string;
  note?: string;
};

export type YachtPromotion = {
  label: string;
  detail: string;
};

/** Departure / cruising area for catalog filters. */
export type YachtRegion =
  | "north-miami"
  | "miami"
  | "fort-lauderdale"
  | "bahamas";

export type YachtPriceBand = "all" | "under-4k" | "3k-5k" | "over-5k";

export type YachtSizeBand =
  | "all"
  | "under-50"
  | "50-70"
  | "70-100"
  | "over-100";

export type Yacht = {
  id: string;
  name: string;
  /** Shown under title, e.g. length and builder. */
  subtitle: string;
  /** Short line on cards, e.g. "From $1,400 · 4 hrs". */
  cardPriceLine: string;
  /** Lowest planning rate (typically 4 hr) for filters & sorting — numeric USD. */
  listingPriceUsd: number;
  /** Overall length in feet — for size filters. */
  lengthFt: number;
  region: YachtRegion;
  /**
   * When set, the default catalog sort uses this ascending order so listings
   * stay in a curated sequence (pagination stays aligned).
   */
  catalogOrder?: number;
  /** Shown in the “Featured” tab when true. */
  featured?: boolean;
  /** Listing is for layout only until you replace with real specs — hidden from the custom package builder. */
  hideFromQuoteBuilder?: boolean;
  /** When true, product page omits the pricing calculator until real tiers are published. */
  ratesPending?: boolean;
  description: string;
  priceTiers: readonly YachtPriceTier[];
  promotions?: readonly YachtPromotion[];
  highlights: readonly string[];
  inclusions?: readonly string[];
  location?: string;
  capacityGuests?: number;
  staterooms?: number;
  bathrooms?: number;
  /** Overrides default “About” headline on fleet product pages. */
  aboutTagline?: string;
  /** Optional italic line under the about headline. */
  aboutQuote?: string;
  /** Muted legal/policy lines. */
  policyNotes?: readonly string[];
  galleryCount: number;
  /** If set, the catalog card links here instead of opening the quick-view dialog. */
  productPageHref?: string;
  /** Optional cover image on the fleet catalog card (`public/` path). */
  cardCoverSrc?: string;
};

function fleetListing(
  catalogOrder: number,
  id: string,
  name: string,
  lengthFt: number,
  region: YachtRegion = "miami",
  featured?: boolean,
): Yacht {
  const listingPriceUsd = Math.round(1500 + lengthFt * 38);
  const amt = `$${listingPriceUsd.toLocaleString("en-US")}`;
  const locHint =
    region === "bahamas"
      ? "Nassau / Bahamas routing — details on booking."
      : "Miami-area departure — details on booking.";
  return {
    id,
    name,
    subtitle: `${lengthFt} ft motor yacht`,
    cardPriceLine: `From ${amt} · 4 hrs`,
    listingPriceUsd,
    lengthFt,
    region,
    catalogOrder,
    featured,
    description:
      "Crewed day charter through Blackline — itinerary, inclusions, fuel zones, and final rates are confirmed in your quote.",
    priceTiers: [
      { durationLabel: "4 hours", amount: amt, note: "Quote on inquiry" },
    ],
    highlights: [
      `${lengthFt} ft vessel`,
      "Captain and crew coordinated through Blackline",
      locHint,
    ],
    policyNotes: [
      "Final rate, fuel zones, and gratuity are confirmed in your written proposal.",
    ],
    galleryCount: 6,
    productPageHref: `/services/yachts/${id}`,
  };
}

/**
 * Prefer imported fleet snapshot rows when present; otherwise a generic placeholder.
 * Snapshot data lives in the repo only (no live external fleet API).
 */
function mergedFleetEntry(
  catalogOrder: number,
  internalId: string,
  name: string,
  lengthFt: number,
  region: YachtRegion = "miami",
  featured?: boolean,
): Yacht {
  const entry = getMycEntryForInternalId(internalId);
  if (entry) {
    return yachtFromMycEntry(entry, { catalogOrder, id: internalId, lengthFt });
  }
  return fleetListing(catalogOrder, internalId, name, lengthFt, region, featured);
}

/** Name-first listing: photos & published rates added later; product page hides the calculator. */
function namedPreviewFleetEntry(
  catalogOrder: number,
  id: string,
  name: string,
  lengthFt: number,
  region: YachtRegion = "miami",
): Yacht {
  const base = fleetListing(catalogOrder, id, name, lengthFt, region);
  return {
    ...base,
    ratesPending: true,
    cardPriceLine: "Rates coming soon",
    description: `${name} — full specifications, photography, and charter rates will be added to this listing soon. Crewed day charter through Blackline; request a quote for current availability.`,
  };
}

export function getYachtBySlug(slug: string): Yacht | undefined {
  return YACHTS.find((y) => y.id === slug);
}

/** Blackline fleet — order matches curated catalog pagination (9 per page). */
export const YACHTS: readonly Yacht[] = [
  {
    id: "166-trinity",
    catalogOrder: 1,
    featured: true,
    name: "166 Trinity",
    subtitle: "166 ft motor yacht",
    cardPriceLine: "From $30,000 · 4 hrs",
    listingPriceUsd: 30_000,
    lengthFt: 166,
    region: "miami",
    productPageHref: "/services/yachts/166-trinity",
    cardCoverSrc: TRINITY_CARD_COVER_SRC,
    capacityGuests: 13,
    location: "Island Gardens Marina, Miami",
    description:
      "166′ Trinity — Island Gardens departure. Flagship day charter with Jet Skis, Seabobs, tender, kayaks, paddle boards, massage table, and 12+ hour Aquabanas & waterslide. Full story and inclusions on the listing.",
    inclusions: [
      "2 Jet Skis · 3 Seabobs · tender · kayaks · paddle boards",
      "Massage table & masseuse",
      "Aquabanas & slide on 12+ hr charters",
    ],
    priceTiers: [
      {
        durationLabel: "4 hours",
        amount: "$30,000",
        note: "Plus 7% tax and crew gratuity — calculator on full listing",
      },
      {
        durationLabel: "6 hours",
        amount: "$35,000",
        note: "Plus 7% tax and crew gratuity — calculator on full listing",
      },
      {
        durationLabel: "8 hours",
        amount: "$45,000",
        note: "Plus 7% tax and crew gratuity — calculator on full listing",
      },
    ],
    highlights: [
      "166′ · up to 13 guests · Island Gardens Marina",
      "7 staterooms · 13 bathrooms · flagship toy package",
      "Tax & gratuity calculator on the full listing",
    ],
    policyNotes: [
      "Final routing, dock fees, and inclusions are confirmed in your written proposal.",
    ],
    galleryCount: TRINITY_GALLERY_COUNT,
  },
  {
    id: "116-pershing-gtx",
    catalogOrder: 2,
    featured: true,
    name: "116 Pershing GTX",
    subtitle: "116 ft motor yacht",
    cardPriceLine: "From $17,000 · 4 hrs",
    listingPriceUsd: 17_000,
    lengthFt: 116,
    region: "miami",
    productPageHref: "/services/yachts/116-pershing-gtx",
    cardCoverSrc: PERSHING_GTX_CARD_COVER_SRC,
    capacityGuests: 13,
    location: "Island Gardens Marina · Miami Beach Marina",
    description:
      "2022 Pershing GTX116 — triple jets, beach club, sport bridge, tender garage. Island Gardens or Miami Beach Marina. Williams tender, Jet Ski, toys — details on the listing.",
    inclusions: [
      "Jet Ski · Williams tender · 2 paddle boards · floating mat",
      "Licensed crew · fuel · water, sodas & ice",
    ],
    priceTiers: [
      {
        durationLabel: "4 hours",
        amount: "$17,000",
        note: "Plus 7% tax and crew gratuity — calculator on full listing",
      },
      {
        durationLabel: "6 hours",
        amount: "$19,000",
        note: "Plus 7% tax and crew gratuity — calculator on full listing",
      },
      {
        durationLabel: "8 hours",
        amount: "$21,000",
        note: "Plus 7% tax and crew gratuity — calculator on full listing",
      },
    ],
    highlights: [
      "116′ GTX · Island Gardens or Miami Beach Marina",
      "5 staterooms · beach club & sport bridge",
      "Tax & gratuity calculator on the full listing",
    ],
    policyNotes: [
      "Final routing, dock fees, and inclusions are confirmed in your written proposal.",
    ],
    galleryCount: PERSHING_GTX_GALLERY_COUNT,
  },
  {
    id: "116-azimut",
    catalogOrder: 3,
    featured: true,
    name: "116 Azimut",
    subtitle: "116 ft motor yacht",
    cardPriceLine: "From $10,500 · 4 hrs",
    listingPriceUsd: 10_500,
    lengthFt: 116,
    region: "north-miami",
    productPageHref: "/services/yachts/116-azimut",
    cardCoverSrc: AZIMUT_116_CARD_COVER_SRC,
    capacityGuests: 13,
    location: "Haulover Marina · Aston Martin Residences",
    description:
      "116′ Azimut — jacuzzi, Starlink, slide (8 hr), jetski, tender, Seabobs, Fiesta Island, and full entertainment. Docked Haulover & Aston Martin Residences.",
    inclusions: [
      "Jetski · tender · hot tub · 2 Seabobs · snorkel · paddle boards",
      "Starlink · DirecTV · Bluetooth sound",
    ],
    priceTiers: [
      {
        durationLabel: "4 hours",
        amount: "$10,500",
        note: "Plus 7% tax and crew gratuity — calculator on full listing",
      },
      {
        durationLabel: "6 hours",
        amount: "$12,000",
        note: "Plus 7% tax and crew gratuity — calculator on full listing",
      },
      {
        durationLabel: "8 hours",
        amount: "$15,000",
        note: "Plus 7% tax and crew gratuity — calculator on full listing",
      },
    ],
    highlights: [
      "116′ · Haulover & Aston Martin Residences",
      "Jacuzzi · slide on 8 hr · Starlink throughout",
      "Tax & gratuity calculator on the full listing",
    ],
    policyNotes: [
      "Final routing, dock fees, and inclusions are confirmed in your written proposal.",
    ],
    galleryCount: AZIMUT_116_GALLERY_COUNT,
  },
  {
    id: "88-azimut-2023",
    catalogOrder: 4,
    name: "88 Azimut 2023",
    subtitle: "88 ft · 2023 Azimut",
    cardPriceLine: "From $9,000 · 4 hrs",
    listingPriceUsd: 9_000,
    lengthFt: 88,
    region: "miami",
    productPageHref: "/services/yachts/88-azimut-2023",
    cardCoverSrc: AZIMUT_88_CARD_COVER_SRC,
    capacityGuests: 13,
    location: "Island Gardens Marina, Miami",
    description:
      "88′ 2023 Azimut from Island Gardens — Jet Ski, Seabob, floating mat, paddle boards, and snorkel gear. Relaxed Miami day charter with crew handling the details.",
    inclusions: [
      "Jet Ski · Seabob · large floating mat · 2 paddle boards",
      "Snorkeling equipment · licensed crew · fuel · refreshments",
    ],
    priceTiers: [
      {
        durationLabel: "4 hours",
        amount: "$9,000",
        note: "Plus 7% tax and crew gratuity — calculator on full listing",
      },
      {
        durationLabel: "6 hours",
        amount: "$10,500",
        note: "Plus 7% tax and crew gratuity — calculator on full listing",
      },
      {
        durationLabel: "8 hours",
        amount: "$12,500",
        note: "Plus 7% tax and crew gratuity — calculator on full listing",
      },
    ],
    highlights: [
      "88′ 2023 · Island Gardens Marina",
      "5 staterooms · toy-heavy day charter",
      "Tax & gratuity calculator on the full listing",
    ],
    policyNotes: [
      "Final routing, dock fees, and inclusions are confirmed in your written proposal.",
    ],
    galleryCount: AZIMUT_88_GALLERY_COUNT,
  },
  {
    id: "88-sirena",
    catalogOrder: 5,
    name: "88 Sirena",
    subtitle: "88 ft motor yacht",
    cardPriceLine: "From $8,500 · 4 hrs",
    listingPriceUsd: 8_500,
    lengthFt: 88,
    region: "miami",
    productPageHref: "/services/yachts/88-sirena",
    ...(SIRENA_88_CARD_COVER_SRC
      ? { cardCoverSrc: SIRENA_88_CARD_COVER_SRC }
      : {}),
    capacityGuests: 13,
    location: "Santa Maria, Brickell",
    description:
      "88′ Sirena — Brickell departure. Jacuzzi, plunge pool, flybridge bar & grill, Fiesta Cabana, tubing, and snorkel gear. Luxury meets serious on-the-water fun.",
    inclusions: [
      "Jacuzzi & plunge pool · flybridge bar · grill",
      "2 Seabobs · jetski · Aquabana · trampoline · snorkel",
    ],
    priceTiers: [
      {
        durationLabel: "4 hours",
        amount: "$8,500",
        note: "Plus 7% tax and crew gratuity — calculator on full listing",
      },
      {
        durationLabel: "6 hours",
        amount: "$10,500",
        note: "Plus 7% tax and crew gratuity — calculator on full listing",
      },
      {
        durationLabel: "8 hours",
        amount: "$12,500",
        note: "Plus 7% tax and crew gratuity — calculator on full listing",
      },
    ],
    highlights: [
      "88′ · Santa Maria (Brickell)",
      "Jacuzzi · plunge pool · full toy roster",
      "Tax & gratuity calculator on the full listing",
    ],
    policyNotes: [
      "Final routing, dock fees, and inclusions are confirmed in your written proposal.",
    ],
    galleryCount: SIRENA_88_GALLERY_COUNT,
  },
  {
    id: "105-azimut-sv",
    catalogOrder: 6,
    name: "105 Azimut SV",
    subtitle: "105 ft · Azimut “Sale Vita”",
    cardPriceLine: "From $7,500 · 4 hrs",
    listingPriceUsd: 7_500,
    lengthFt: 105,
    region: "miami",
    productPageHref: "/services/yachts/105-azimut-sv",
    ...(AZIMUT_105_SV_CARD_COVER_SRC
      ? { cardCoverSrc: AZIMUT_105_SV_CARD_COVER_SRC }
      : {}),
    capacityGuests: 13,
    location: "2550 S Bayshore Dr, Suite 102, Miami",
    description:
      "105′ Azimut “Sale Vita” — Italian build, twin MTU power, five staterooms, crew of four. Floating lounge, 2 Jet Skis, 3 Seabobs. Bayshore departure.",
    inclusions: [
      "4 crew · floating lounge · 2 Jet Skis · 3 Seabobs",
      "Licensed captain · fuel · water, sodas & ice",
    ],
    priceTiers: [
      {
        durationLabel: "4 hours",
        amount: "$7,500",
        note: "Plus 7% tax and crew gratuity — calculator on full listing",
      },
      {
        durationLabel: "6 hours",
        amount: "$9,850",
        note: "Plus 7% tax and crew gratuity — calculator on full listing",
      },
      {
        durationLabel: "8 hours",
        amount: "$11,000",
        note: "Plus 7% tax and crew gratuity — calculator on full listing",
      },
    ],
    highlights: [
      "105′ Sale Vita · Coconut Grove / Bayshore",
      "5 staterooms · 25 kn cruise · toy package",
      "Tax & gratuity calculator on the full listing",
    ],
    policyNotes: [
      "Final routing, dock fees, and inclusions are confirmed in your written proposal.",
    ],
    galleryCount: AZIMUT_105_SV_GALLERY_COUNT,
  },
  {
    id: "96-sunseeker",
    catalogOrder: 7,
    name: "96 Sunseeker",
    subtitle: "96 ft motor yacht",
    cardPriceLine: "From $6,900 · 4 hrs",
    listingPriceUsd: 6_900,
    lengthFt: 96,
    region: "miami",
    productPageHref: "/services/yachts/96-sunseeker",
    ...(SUNSEEKER_96_CARD_COVER_SRC
      ? { cardCoverSrc: SUNSEEKER_96_CARD_COVER_SRC }
      : {}),
    capacityGuests: 12,
    location: "Miami Beach Marina",
    description:
      "96′ Sunseeker — Miami Beach Marina. Chic indoor-outdoor layout, floating pool, two Sunchill pads, and dinghy. Big style for sandbars and skyline cruises.",
    inclusions: [
      "Floating pool · 2 Sunchill pads · dinghy",
      "Licensed crew · fuel · water, sodas & ice",
    ],
    priceTiers: [
      {
        durationLabel: "4 hours",
        amount: "$6,900",
        note: "Plus 7% tax and crew gratuity — calculator on full listing",
      },
      {
        durationLabel: "6 hours",
        amount: "$8,050",
        note: "Plus 7% tax and crew gratuity — calculator on full listing",
      },
      {
        durationLabel: "8 hours",
        amount: "$9,200",
        note: "Plus 7% tax and crew gratuity — calculator on full listing",
      },
    ],
    highlights: [
      "96′ · Miami Beach Marina",
      "Sunchill pads · floating pool · dinghy",
      "Tax & gratuity calculator on the full listing",
    ],
    policyNotes: [
      "Final routing, dock fees, and inclusions are confirmed in your written proposal.",
    ],
    galleryCount: SUNSEEKER_96_GALLERY_COUNT,
  },
  {
    id: "97-san-lorenzo",
    catalogOrder: 8,
    name: "97 San Lorenzo",
    subtitle: "97 ft motor yacht",
    cardPriceLine: "From $6,500 · 4 hrs",
    listingPriceUsd: 6_500,
    lengthFt: 97,
    region: "miami",
    productPageHref: "/services/yachts/97-san-lorenzo",
    ...(SAN_LORENZO_97_CARD_COVER_SRC
      ? { cardCoverSrc: SAN_LORENZO_97_CARD_COVER_SRC }
      : {}),
    capacityGuests: 13,
    location: "Miami Beach Marina",
    description:
      "97′ San Lorenzo — Miami Beach Marina. Two Jet Skis, jungle gym, trampoline; optional inflatable pool add-on ($500). Sun, skyline, and open decks.",
    inclusions: [
      "2 Jet Skis · jungle gym · trampoline",
      "Optional inflatable pool ($500) — request when booking",
    ],
    priceTiers: [
      {
        durationLabel: "4 hours",
        amount: "$6,500",
        note: "Plus 7% tax and crew gratuity — calculator on full listing",
      },
      {
        durationLabel: "6 hours",
        amount: "$8,000",
        note: "Plus 7% tax and crew gratuity — calculator on full listing",
      },
      {
        durationLabel: "8 hours",
        amount: "$9,500",
        note: "Plus 7% tax and crew gratuity — calculator on full listing",
      },
    ],
    highlights: [
      "97′ · Miami Beach Marina",
      "4 staterooms · Jet Skis & play equipment",
      "Tax & gratuity calculator on the full listing",
    ],
    policyNotes: [
      "Final routing, dock fees, and inclusions are confirmed in your written proposal.",
    ],
    galleryCount: SAN_LORENZO_97_GALLERY_COUNT,
  },
  {
    id: "90-pershing-refit-2025",
    catalogOrder: 9,
    name: "90 Pershing Refit 2025",
    subtitle: "90 ft · Pershing refit 2025",
    cardPriceLine: "From $6,000 · 4 hrs",
    listingPriceUsd: 6_000,
    lengthFt: 90,
    region: "north-miami",
    productPageHref: "/services/yachts/90-pershing-refit-2025",
    ...(PERSHING_90_REFIT_CARD_COVER_SRC
      ? { cardCoverSrc: PERSHING_90_REFIT_CARD_COVER_SRC }
      : {}),
    capacityGuests: 13,
    location: "Regal Marina · optional Miami Beach Marina",
    description:
      "90′ Pershing refit 2025 — Regal Marina (no landing fee) or upgrade to Miami Beach ($480). Seabob & trampoline included; water slide add-on $1,200.",
    inclusions: [
      "Seabob · trampoline · licensed crew · fuel · refreshments",
      "Optional Miami Beach Marina ($480) · optional slide ($1,200)",
    ],
    priceTiers: [
      {
        durationLabel: "4 hours",
        amount: "$6,000",
        note: "Plus 7% tax and crew gratuity — calculator on full listing",
      },
      {
        durationLabel: "6 hours",
        amount: "$8,000",
        note: "Plus 7% tax and crew gratuity — calculator on full listing",
      },
      {
        durationLabel: "8 hours",
        amount: "$10,000",
        note: "Plus 7% tax and crew gratuity — calculator on full listing",
      },
    ],
    highlights: [
      "90′ refit 2025 · Regal or Miami Beach",
      "4 staterooms · Seabob & trampoline",
      "Tax & gratuity calculator on the full listing",
    ],
    policyNotes: [
      "Final routing, dock fees, and inclusions are confirmed in your written proposal.",
    ],
    galleryCount: PERSHING_90_REFIT_GALLERY_COUNT,
  },
  {
    id: "76-sunseeker",
    catalogOrder: 10,
    name: "76 Sunseeker",
    subtitle: "76 ft motor yacht",
    cardPriceLine: "From $5,650 · 4 hrs",
    listingPriceUsd: 5_650,
    lengthFt: 76,
    region: "north-miami",
    productPageHref: "/services/yachts/76-sunseeker",
    ...(SUNSEEKER_76_CARD_COVER_SRC
      ? { cardCoverSrc: SUNSEEKER_76_CARD_COVER_SRC }
      : {}),
    capacityGuests: 13,
    location: "Marina Palms, North Miami Beach",
    description:
      "76′ Sunseeker — Marina Palms, North Miami Beach. Flybridge lounging, sleek interior, and crewed day charters from sandbars to skyline cruises.",
    inclusions: [
      "Licensed captain & crew · local fuel · water, sodas & ice",
      "Floating carpet",
    ],
    priceTiers: [
      {
        durationLabel: "4 hours",
        amount: "$5,650",
        note: "Plus 7% tax and crew gratuity — calculator on full listing",
      },
      {
        durationLabel: "6 hours",
        amount: "$6,850",
        note: "Plus 7% tax and crew gratuity — calculator on full listing",
      },
      {
        durationLabel: "8 hours",
        amount: "$8,150",
        note: "Plus 7% tax and crew gratuity — calculator on full listing",
      },
    ],
    highlights: [
      "76′ · Marina Palms · up to 13 guests cruising",
      "Flybridge bar & lounging · modern salon",
      "Tax & gratuity calculator on the full listing",
    ],
    policyNotes: [
      "Final routing, dock fees, and inclusions are confirmed in your written proposal.",
    ],
    galleryCount: SUNSEEKER_76_GALLERY_COUNT,
  },
  {
    id: "88-princess-pfo",
    catalogOrder: 11,
    name: "88 Princess PFO",
    subtitle: "88′ Princess · Overtime",
    cardPriceLine: "From $5,500 · 4 hrs",
    listingPriceUsd: 5_500,
    lengthFt: 88,
    region: "miami",
    productPageHref: "/services/yachts/88-princess-pfo",
    ...(PRINCESS_88_PFO_CARD_COVER_SRC
      ? { cardCoverSrc: PRINCESS_88_PFO_CARD_COVER_SRC }
      : {}),
    capacityGuests: 13,
    location: "Aston Martin Residences, Miami",
    description:
      "88′ Princess – Overtime — Aston Martin Residences. Jacuzzi, float mat, paddle boards, and crewed Miami charters. Charter, tax, and gratuity on the listing.",
    inclusions: [
      "Jacuzzi · float mat · paddle boards",
      "Licensed captain & crew · fuel · water, sodas & ice",
    ],
    priceTiers: [
      {
        durationLabel: "4 hours",
        amount: "$5,500",
        note: "Plus 7% tax and crew gratuity — calculator on full listing",
      },
      {
        durationLabel: "6 hours",
        amount: "$6,500",
        note: "Plus 7% tax and crew gratuity — calculator on full listing",
      },
      {
        durationLabel: "8 hours",
        amount: "$7,500",
        note: "Plus 7% tax and crew gratuity — calculator on full listing",
      },
    ],
    highlights: [
      "88′ Overtime · Aston Martin Residences · up to 13 guests cruising",
      "4 staterooms · 5 baths · jacuzzi & water toys",
      "Tax & gratuity calculator on the full listing",
    ],
    policyNotes: [
      "Final routing, dock fees, and inclusions are confirmed in your written proposal.",
    ],
    galleryCount: PRINCESS_88_PFO_GALLERY_COUNT,
  },
  {
    id: "75-prestige-oceana",
    catalogOrder: 12,
    name: "75 Prestige Oceana",
    subtitle: "75′ Prestige · Loggerhead Marina",
    cardPriceLine: "From $5,000 · 4 hrs",
    listingPriceUsd: 5_000,
    lengthFt: 75,
    region: "fort-lauderdale",
    featured: true,
    productPageHref: "/services/yachts/75-prestige-oceana",
    cardCoverSrc: "/yachts/75prestigeoceana/75prestigeoceana.jpg",
    capacityGuests: 13,
    staterooms: 3,
    bathrooms: 2,
    location: "Loggerhead Marina, Hollywood",
    aboutTagline: "75′ Prestige – Effortless Luxury, Nonstop Fun",
    description: `Get ready to escape the ordinary aboard the 75′ Prestige, your floating playground for sun-soaked fun and laid-back luxury. Docked at the beautiful Loggerhead Marina in Hollywood, this sleek and spacious yacht is perfect for everything from birthday bashes and bachelorette parties to chill family days and spontaneous getaways with friends. The moment you step on board, the vacation vibes kick in — and they don’t stop.

This yacht was made for good times, with open lounge areas, modern interiors, and plenty of space to relax, party, or soak up the views. The flybridge is perfect for catching ocean breezes and sunshine, while the rear deck offers the ideal hangout spot for sipping cocktails, snapping pics, or just kicking back as you cruise through Miami’s stunning waterways.

Every charter comes fully loaded with fun: you’ll have 1 Jet Ski for adrenaline-packed rides, a floating carpet for lounging in the water, floating seats to relax with a drink in hand, and an inflatable paddle board if you’re in the mood to explore. Want to turn the energy up a notch? Add the Fiesta Island ($250) for the ultimate float party or bounce around on the inflatable Trampoline ($350) — both guaranteed to level up your day and bring out everyone’s inner kid.

But it’s not just about the toys — it’s about the full experience. Picture this: your favorite playlist playing in the background, the warm sun on your skin, a cool drink in hand, and your crew smiling from ear to ear as you cruise past palm-lined shores and sparkling blue water. Whether you’re dancing on deck, floating in a calm cove, or watching the sunset paint the sky, the 75′ Prestige delivers feel-good moments from start to finish.

With a friendly, professional crew making sure everything runs smoothly, all you have to do is show up, let loose, and enjoy every second. From relaxing mornings to high-energy afternoons, this is your chance to live the yacht life — and make memories that feel like magic.`,
    highlights: [
      "Loggerhead Marina, Hollywood · up to 13 guests cruising",
      "3 staterooms · 2 baths · flybridge & open lounge",
      "Water toys included — Jet Ski, floating carpet, seats, paddle board",
      "Tax & gratuity — use the estimate panel on this page",
    ],
    inclusions: [
      "Fully inspected yacht",
      "Licensed captain & crew",
      "Local fuel",
      "Water, sodas & ice",
      "1 Jet Ski",
      "Floating carpet",
      "Floating seats",
      "Inflatable paddle board",
      "Fiesta Island",
    ],
    policyNotes: [
      "Charter rates are quoted before tax. A 7% state tax and crew gratuity apply — use the calculator on this page for an estimate.",
      "Final routing, dock fees, fuel surcharges, and inclusions are confirmed in your written proposal.",
      "Availability changes by season; your inquiry locks the current quote window.",
    ],
    priceTiers: [
      {
        durationLabel: "4 hours",
        amount: "$5,000",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
      {
        durationLabel: "6 hours",
        amount: "$5,500",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
      {
        durationLabel: "8 hours",
        amount: "$6,500",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
    ],
    galleryCount: 10,
  },
  {
    id: "74-sunseeker",
    catalogOrder: 13,
    name: "74 Sunseeker 2023",
    subtitle: "74′ Sunseeker Predator · Miami",
    cardPriceLine: "From $4,900 · 4 hrs",
    listingPriceUsd: 4_900,
    lengthFt: 74,
    region: "miami",
    featured: true,
    productPageHref: "/services/yachts/74-sunseeker",
    cardCoverSrc: "/yachts/74sunseeker2023/74sunseeker2023.jpg",
    capacityGuests: 13,
    staterooms: 4,
    bathrooms: 3,
    location:
      "1110 NW North River Dr. · Miami Beach Marina (300 Alton Rd, Miami Beach, FL 33139)",
    aboutTagline:
      "74′ Sunseeker Predator – Bold, Chic, and Built for the Ultimate Day on the Water",
    description: `Welcome aboard the 74′ Sunseeker Predator 2023 — a sleek, head-turning yacht that brings the perfect mix of luxury, speed, and good vibes to the heart of Miami. Docked at 1110 NW North River Dr. and Miami Beach Marina (300 Alton Rd, Miami Beach, FL 33139), this fresh-from-the-shipyard stunner is built for those who want to cruise in style and make memories that feel like a scene from a movie. Whether you’re celebrating something big or just want to escape the ordinary, the Predator sets the tone for an epic day.

From the moment you step on board, the energy is effortless and elevated. The spacious, open deck design invites you to spread out, socialize, and soak in the panoramic views while the Miami breeze flows through. Whether you’re lounging with a mimosa, catching the sun on the bow, or getting the perfect golden hour photos, every space feels designed with your perfect day in mind.

Inside, you’ll find a bright and modern interior that’s equal parts stylish and comfortable — perfect for relaxing between dips in the water or escaping the heat for a chilled cocktail. The yacht’s sleek profile is matched by high-end finishes, plush seating, and thoughtful lighting that sets the mood whether it’s an afternoon cruise or an evening party under the stars.

But the real magic happens when you hit the water. Float, lounge, and laugh with your crew on the floating carpet, turning the sea into your personal pool party. Whether you’re anchored at a secluded cove or vibing at a lively sandbar, you’ll be surrounded by music, sunshine, and a crew that’s there to keep things running smoothly so you can focus on the fun.

From celebratory champagne pops to laid-back lounging with your favorite people, the 74′ Sunseeker Predator creates a full sensory experience — one that blends Miami’s glam with the thrill of adventure. It’s not just a charter… it’s the kind of day you’ll talk about long after the sun sets.`,
    highlights: [
      "1110 NW North River Dr. · Miami Beach Marina · up to 13 guests cruising",
      "4 staterooms · 3 baths · open deck & modern interior",
      "Floating carpet included",
      "Tax & gratuity — use the estimate panel on this page",
    ],
    inclusions: [
      "Fully inspected yacht",
      "Licensed captain & crew",
      "Local fuel",
      "Water, sodas & ice",
      "Floating carpet",
    ],
    policyNotes: [
      "Charter rates are quoted before tax. A 7% state tax and crew gratuity apply — use the calculator on this page for an estimate.",
      "Final routing, dock fees, fuel surcharges, and inclusions are confirmed in your written proposal.",
      "Availability changes by season; your inquiry locks the current quote window.",
    ],
    priceTiers: [
      {
        durationLabel: "4 hours",
        amount: "$4,900",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
      {
        durationLabel: "6 hours",
        amount: "$6,100",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
      {
        durationLabel: "8 hours",
        amount: "$7,300",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
    ],
    galleryCount: 12,
  },
  {
    id: "72-azimut-7s",
    catalogOrder: 14,
    name: "72 Azimut 7S",
    subtitle: "72′ Azimut 7S · Harbour Island & Miami Beach",
    cardPriceLine: "From $4,600 · 4 hrs",
    listingPriceUsd: 4_600,
    lengthFt: 72,
    region: "north-miami",
    featured: true,
    productPageHref: "/services/yachts/72-azimut-7s",
    cardCoverSrc: "/yachts/72azimut7s/72azimut7s.jpg",
    capacityGuests: 13,
    staterooms: 3,
    bathrooms: 3,
    location:
      "Harbour Island Marina (7900 Harbour Island) · optional: Miami Beach Marina (300 Alton Rd, Miami Beach, FL 33139)",
    aboutTagline:
      "Ocean Flair: 72′ Azimut 7S Yacht – Sleek, Stylish, and So Miami",
    aboutQuote:
      "Because unforgettable days start where the land ends and the party begins.",
    description: `Welcome aboard the 72′ Azimut 7S, a sleek symbol of style and sophistication anchored at Harbour Island Marina – 7900 Harbour Island, with an additional departure option available at Miami Beach Marina (300 Alton Rd, Miami Beach, FL 33139). This beauty is your passport to a luxurious day on the water, ideal for upscale get-togethers, relaxing family cruises, or laid-back celebrations with friends. Whether you’re sun-chasing or simply vibing with the sea breeze, this yacht was built for it.

Step inside and discover a modern, fully-equipped kitchen, plush interiors, and spacious outdoor lounges where memories are just waiting to happen. Out on deck, enjoy the best of both worlds—relaxation and adventure—with paddle boards, a floating island, and fun floaters that turn the ocean into your personal playground.

Whether you’re toasting to something big or just soaking up the sunshine, the Azimut 7S delivers an unforgettable blend of elegance and easy-going fun. Cruise the glittering Miami coastline in style, surrounded by friends, music, and the endless ocean horizon.

Your experience includes a fully inspected yacht, licensed captain & crew, local fuel, water, sodas & ice, a floating island, paddle boards, several floaters, and a $200 cash certificate toward your next charter with us. It’s time to turn your Miami daydream into reality—let’s sail!`,
    highlights: [
      "Harbour Island Marina · optional Miami Beach Marina · up to 13 guests cruising",
      "3 staterooms · 3 baths · kitchen & outdoor lounges",
      "Floating island, paddle boards, floaters & more",
      "$200 certificate toward your next charter · tax & gratuity on this page",
    ],
    inclusions: [
      "Fully inspected yacht",
      "Licensed captain & crew",
      "Local fuel",
      "Water, sodas & ice",
      "Floating carpet",
      "2 paddle boards",
      "Floating pool",
    ],
    policyNotes: [
      "Charter rates are quoted before tax. A 7% state tax and crew gratuity apply — use the calculator on this page for an estimate.",
      "Final routing, dock fees, fuel surcharges, and inclusions are confirmed in your written proposal.",
      "Availability changes by season; your inquiry locks the current quote window.",
    ],
    priceTiers: [
      {
        durationLabel: "4 hours",
        amount: "$4,600",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
      {
        durationLabel: "6 hours",
        amount: "$5,700",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
      {
        durationLabel: "8 hours",
        amount: "$6,800",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
    ],
    galleryCount: 15,
  },
  {
    id: "80-sunseeker-smu",
    catalogOrder: 15,
    name: "80 Sunseeker SMU",
    subtitle: "80′ Sunseeker Start Me Up · Miami Beach Marina",
    cardPriceLine: "From $4,500 · 4 hrs",
    listingPriceUsd: 4_500,
    lengthFt: 80,
    region: "miami",
    featured: true,
    productPageHref: "/services/yachts/80-sunseeker-smu",
    cardCoverSrc: "/yachts/80sunseekersmu/80sunseekersmu.jpg",
    capacityGuests: 13,
    staterooms: 4,
    bathrooms: 3,
    location: "Miami Beach Marina (300 Alton Rd, Miami Beach, FL 33139)",
    aboutTagline:
      "80′ Sunseeker Start Me Up – Power. Prestige. Perfection.",
    description: `Departing from the iconic Miami Beach Marina (300 Alton Rd, Miami Beach, FL 33139), the 80′ Sunseeker Start Me Up invites you to experience the thrill of high-performance yachting wrapped in unmistakable British luxury.

Crafted by the world-renowned Sunseeker Yachts, this 80-foot express cruiser is a masterpiece of design and power — where sleek, aggressive styling meets refined comfort. With Arneson surface drives, Start Me Up can reach exhilarating speeds of up to 46 knots, delivering both adrenaline and elegance in perfect harmony.

Inside, the open-plan saloon is flooded with natural light through full-length windows, creating a seamless connection to the sea. Below deck, four beautifully appointed cabins — including a spacious master suite and VIP cabin — offer the ideal retreat after a sun-soaked day on the water.

Outdoors, unwind on the expansive bow sunpad, or indulge in the optional jacuzzi while taking in panoramic ocean views. Every detail of the Start Me Up has been crafted to redefine what a performance yacht can be — sporty yet sophisticated, bold yet effortlessly luxurious.

Whether you’re cruising the Miami coastline or anchoring in a secluded bay, the 80′ Sunseeker Start Me Up promises an unforgettable yachting experience — one where power meets pure indulgence.`,
    highlights: [
      "Miami Beach Marina · up to 13 guests cruising",
      "4 staterooms · 3 baths · Arneson drives · up to ~46 knots",
      "Bow sunpad · optional jacuzzi · express-cruiser layout",
      "Tax & gratuity — use the estimate panel on this page",
    ],
    inclusions: [
      "Fully inspected yacht",
      "Licensed captain & crew",
      "Local fuel",
      "Water, sodas & ice",
      "2 floating mats",
      "2 inflatable unicorns",
      "Floating pool",
    ],
    policyNotes: [
      "Charter rates are quoted before tax. A 7% state tax and crew gratuity apply — use the calculator on this page for an estimate.",
      "Final routing, dock fees, fuel surcharges, and inclusions are confirmed in your written proposal.",
      "Availability changes by season; your inquiry locks the current quote window.",
    ],
    priceTiers: [
      {
        durationLabel: "4 hours",
        amount: "$4,500",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
      {
        durationLabel: "6 hours",
        amount: "$5,500",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
      {
        durationLabel: "8 hours",
        amount: "$6,500",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
    ],
    galleryCount: 11,
  },
  {
    id: "68-galeon-2025",
    catalogOrder: 16,
    name: "68 Galeon 2025",
    subtitle: "68′ Galeon “Seven Seas” · Miami Beach Marina",
    cardPriceLine: "From $4,500 · 4 hrs",
    listingPriceUsd: 4_500,
    lengthFt: 68,
    region: "miami",
    featured: true,
    productPageHref: "/services/yachts/68-galeon-2025",
    cardCoverSrc: "/yachts/68galeon2025/68galeon2025.jpg",
    capacityGuests: 13,
    staterooms: 3,
    bathrooms: 2,
    location: "Miami Beach Marina (300 Alton Rd, Miami Beach, FL 33139)",
    aboutTagline:
      "68′ Galeon “Seven Seas” | Cruise, Chill, and Stay Connected in Style",
    description: `Say hello to your next unforgettable adventure aboard “Seven Seas”, a sleek and stylish 68′ Galeon 2025 that brings luxury, comfort, and cutting-edge tech together in one stunning package. Docked at the vibrant Miami Beach Marina (300 Alton Rd, Miami Beach, FL 33139), this beauty is ready to take you on a sun-soaked journey around the best sights Miami has to offer. Whether you’re planning a quick escape or a week-long getaway, this yacht delivers the ultimate balance of laid-back vibes and high-end sophistication.

Step on board and feel instantly at home. With 3 beautifully appointed staterooms, 2 modern bathrooms, and a private crew cabin, there’s room for everyone to relax, recharge, and enjoy the ride. The interior is designed with panoramic windows and warm finishes that make the space feel bright, open, and welcoming — perfect for both entertaining and unwinding.

Cruise through the sparkling blue, enjoy a champagne toast on deck, or take in a gorgeous sunset with the city lights on the horizon. The outdoor dining area is perfect for alfresco meals, whether you’re snacking on charcuterie or grilling up the catch of the day.

This yacht is built for longer trips, with plenty of space, amenities, and the freedom to explore. And when you’re just out for a fun-filled day cruise or celebrating a birthday, anniversary, or romantic escape, the atmosphere on board is always one of ease, luxury, and pure enjoyment.

From weekend adventures to extended vacations, Seven Seas is your ticket to oceanfront bliss — where every moment is curated, every view is breathtaking, and every toast is well-earned. So gather your crew, pack your sunnies, and let the sea set the pace. This is your time to unplug (or not), unwind, and enjoy the magic of the water.`,
    highlights: [
      "Miami Beach Marina · “Seven Seas” · up to 13 guests cruising",
      "3 staterooms · 2 baths · crew cabin · outdoor dining",
      "Floating pool · Sublue scooters · trampoline on 6+ hr charters",
      "Tax & gratuity — use the estimate panel on this page",
    ],
    inclusions: [
      "Fully inspected yacht",
      "Licensed captain & crew",
      "Local fuel",
      "Water, sodas & ice",
      "Floating pool",
      "2 brand-new Sublue underwater sea scooters",
      "Inflatable trampoline (6 hr & 8 hr reservations only)",
    ],
    policyNotes: [
      "Charter rates are quoted before tax. A 7% state tax and crew gratuity apply — use the calculator on this page for an estimate.",
      "Final routing, dock fees, fuel surcharges, and inclusions are confirmed in your written proposal.",
      "Availability changes by season; your inquiry locks the current quote window.",
    ],
    priceTiers: [
      {
        durationLabel: "4 hours",
        amount: "$4,500",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
      {
        durationLabel: "6 hours",
        amount: "$5,500",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
      {
        durationLabel: "8 hours",
        amount: "$6,700",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
    ],
    galleryCount: 22,
  },
  {
    id: "68-galeon",
    catalogOrder: 17,
    name: "68 Galeon",
    subtitle: "68′ Galeon Let’s Toast · North Miami / Hollywood",
    cardPriceLine: "From $4,000 · 4 hrs",
    listingPriceUsd: 4_000,
    lengthFt: 68,
    region: "north-miami",
    featured: true,
    productPageHref: "/services/yachts/68-galeon",
    cardCoverSrc: "/yachts/68galeon/68galeon.jpg",
    capacityGuests: 13,
    staterooms: 2,
    bathrooms: 2,
    location: "North Miami – Hollywood",
    aboutTagline:
      "68′ Galeon – Let’s Toast | Sip, Splash & Celebrate in Style",
    description: `Welcome aboard the 68′ Galeon – Let’s Toast — where everyday worries drift away and unforgettable memories are made under the sun. Docked in the heart of North Miami – Hollywood, this luxury yacht is designed for those who love a little bit of everything: upscale relaxation, sun-soaked fun, and lively moments that turn into stories you’ll be telling for years.

From the moment you step aboard, the vibe is effortlessly elegant yet totally laid-back. Whether you’re toasting to a special occasion or just seizing the day, Let’s Toast is your floating escape to pure joy. With multiple levels to explore, plenty of indoor-outdoor lounge space, and a modern layout that invites connection, this yacht creates the perfect setting for everything from chill sunbathing to upbeat celebrations.

Stretch out on the sun pads up front with your favorite drink in hand, turn up the music, and soak in the warm breeze as the city fades behind you. Want to turn up the action? The Jet Ski is ready and waiting for some high-speed thrills, while the water toys on board make it easy to jump, splash, and laugh the afternoon away with friends. Planning to hit the iconic Haulover Sandbar? Fuel is already included in the price for that itinerary — it’s practically an open invitation to anchor, vibe, and party in the sunshine. Craving a cruise further south toward the Miami skyline? Add just $300 in fuel and the ocean is yours.

Inside, the Galeon doesn’t disappoint. With a sleek interior that feels more like a floating boutique hotel than a boat, you’ll find plush seating, spacious living areas, and thoughtful features like a water maker and washing machine to keep things fresh and seamless. Whether you’re relaxing in the climate-controlled salon or preparing for golden hour on the flybridge, every moment on board feels special.

Perfect for birthdays, bachelorette parties, anniversaries, or simply enjoying life to the fullest, the 68′ Galeon – Let’s Toast is all about bringing people together for fun, connection, and a touch of luxury. With a professional and friendly crew taking care of everything behind the scenes, all you have to do is bring the good vibes — and maybe a bottle of bubbly.

Because no matter what you’re celebrating, this is your moment. Let’s toast to that. 🥂`,
    highlights: [
      "North Miami – Hollywood · up to 13 guests cruising",
      "2 staterooms · 2 baths · salon & flybridge",
      "Haulover routing fuel included · optional $300 fuel toward Miami skyline",
      "Tax & gratuity — use the estimate panel on this page",
    ],
    inclusions: [
      "Fully inspected yacht",
      "Licensed captain & crew",
      "Local fuel",
      "Water, sodas & ice",
    ],
    policyNotes: [
      "Charter rates are quoted before tax. A 7% state tax and crew gratuity apply — use the calculator on this page for an estimate.",
      "Final routing, dock fees, fuel surcharges, and inclusions are confirmed in your written proposal.",
      "Availability changes by season; your inquiry locks the current quote window.",
    ],
    priceTiers: [
      {
        durationLabel: "4 hours",
        amount: "$4,000",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
      {
        durationLabel: "6 hours",
        amount: "$5,000",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
      {
        durationLabel: "8 hours",
        amount: "$6,300",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
    ],
    galleryCount: 12,
  },
  {
    id: "65-prestige",
    catalogOrder: 18,
    name: "65 Prestige",
    subtitle: "65′ Prestige · Miami Beach Marina",
    cardPriceLine: "From $3,500 · 4 hrs",
    listingPriceUsd: 3_500,
    lengthFt: 65,
    region: "miami",
    featured: true,
    productPageHref: "/services/yachts/65-prestige",
    cardCoverSrc: "/yachts/65prestige/65prestige.jpg",
    capacityGuests: 13,
    staterooms: 3,
    bathrooms: 2,
    location: "Miami Beach Marina",
    aboutTagline:
      "65′ Prestige – Where Comfort Meets Coastal Adventure",
    aboutQuote:
      "Sail smooth, play hard, and soak up the best of Miami.",
    description: `Welcome aboard the 65′ Prestige, docked at Miami Beach Marina — your sleek and stylish escape on the water. This modern beauty was made for those who crave both sophistication and fun. Whether you’re planning a chic family outing, a lively group celebration, or simply a laid-back day under the sun, the Prestige offers an experience that hits all the right notes. With panoramic ocean views and a design that’s all about open-air luxury, this yacht invites you to relax, reconnect, and explore in total comfort.

Inside, you’ll find a fully-equipped gourmet kitchen, elegant interiors, and spacious lounge areas that make entertaining feel effortless. Everything is designed for easy living—think cool ocean breezes through wide windows, plush seating for kicking back, and just the right amount of modern flair. It’s your floating retreat, perfect for long, leisurely lunches or spontaneous sunset toasts with your favorite crew.

When it’s time to play, the 65′ Prestige brings the fun. Lounge in the water hammock, drift across the sea on the floating carpet, hop onto the inflatable island, or zip around on the water scooter — it’s your personal ocean playground. Whether you’re swimming, sunbathing, or just floating with a drink in hand, the vibe is relaxed, carefree, and totally unforgettable.

Your charter includes a fully inspected yacht, licensed captain and professional crew, local fuel, water, sodas, and ice, along with all the water toys you need for an epic day: a water hammock, floating carpet, inflatable island, and water scooter. Ready to make waves? The 65′ Prestige is waiting — just bring your favorite people and let the good times roll.`,
    highlights: [
      "Miami Beach Marina · up to 13 guests cruising",
      "3 staterooms · 2 baths · gourmet kitchen & lounge",
      "Water hammock, floating carpet, inflatable island & water scooter",
      "Tax & gratuity — use the estimate panel on this page",
    ],
    inclusions: [
      "Fully inspected yacht",
      "Licensed captain & crew",
      "Local fuel",
      "Water, sodas & ice",
      "Floating carpet",
      "Inflatable island",
      "Water scooter",
    ],
    policyNotes: [
      "Charter rates are quoted before tax. A 7% state tax and crew gratuity apply — use the calculator on this page for an estimate.",
      "Final routing, dock fees, fuel surcharges, and inclusions are confirmed in your written proposal.",
      "Availability changes by season; your inquiry locks the current quote window.",
    ],
    priceTiers: [
      {
        durationLabel: "4 hours",
        amount: "$3,500",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
      {
        durationLabel: "6 hours",
        amount: "$4,300",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
      {
        durationLabel: "8 hours",
        amount: "$5,500",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
    ],
    galleryCount: 12,
  },
  {
    id: "64-azimut",
    catalogOrder: 19,
    name: "64 Azimut",
    subtitle: "64′ Azimut · Cox Landing, Fort Lauderdale",
    cardPriceLine: "From $3,500 · 4 hrs",
    listingPriceUsd: 3_500,
    lengthFt: 64,
    region: "fort-lauderdale",
    featured: true,
    productPageHref: "/services/yachts/64-azimut",
    cardCoverSrc: "/yachts/64azimut/64azimut.jpg",
    capacityGuests: 13,
    staterooms: 3,
    bathrooms: 2,
    location: "Cox Landing, Fort Lauderdale",
    aboutTagline: "64′ Azimut Yacht – Sleek Style, Smooth Sailing",
    aboutQuote:
      "Your private escape aboard this Italian-crafted beauty in Fort Lauderdale.",
    description: `Step aboard the 64′ Azimut and let the sea set the pace for your perfect day. Docked at the elegant Cox Landing in Fort Lauderdale, this yacht is your front-row seat to South Florida’s sparkling coastline. With sleek Italian lines and a thoughtfully designed layout, this floating retreat brings both relaxation and celebration to life. Lounge under the sun, sip something chilled, and let the waves carry you away — it’s luxury without the stiff edges.

The Azimut is ideal for those looking to celebrate life in style. Think upscale birthday parties, romantic sunset cruises, bachelorette weekends, or laid-back family adventures. The fully equipped gourmet kitchen makes it easy to enjoy onboard dining, and the indoor-outdoor spaces are perfect for mingling, dancing, or just catching the breeze with your favorite people. Whether you want to turn up the energy or just unwind to the sound of the ocean, this yacht adapts to your vibe.

Every corner of the Azimut is crafted to enhance your experience. Stretch out on the sunbeds, splash into the sea with the included Seabobs, or cozy up inside the chic salon between destinations. The atmosphere is warm, welcoming, and always ready for whatever celebration — or serenity — you have in mind. From golden hour selfies to spontaneous toasts on the bow, every moment aboard is made to be remembered.

Your experience includes a fully inspected yacht, a licensed and professional captain with dedicated crew, local fuel, and plenty of refreshments like water, sodas, and ice to keep the good times flowing. For added fun, you’ll have access to 2 Seabobs — perfect for underwater exploring and play. As a thank-you for cruising with us, we’ll also send you off with a $200 cash certificate to use toward your next unforgettable yacht day.`,
    highlights: [
      "Cox Landing, Fort Lauderdale · up to 13 guests cruising",
      "3 staterooms · 2 baths · gourmet kitchen & salon",
      "2 Seabobs · floating carpet · snorkeling gear",
      "$200 certificate toward your next charter · tax & gratuity on this page",
    ],
    inclusions: [
      "Fully inspected yacht",
      "Licensed captain & crew",
      "Local fuel",
      "Water, sodas & ice",
      "2 Seabobs",
      "Floating carpet",
      "Snorkeling gear",
    ],
    policyNotes: [
      "Charter rates are quoted before tax. A 7% state tax and crew gratuity apply — use the calculator on this page for an estimate.",
      "Final routing, dock fees, fuel surcharges, and inclusions are confirmed in your written proposal.",
      "Availability changes by season; your inquiry locks the current quote window.",
    ],
    priceTiers: [
      {
        durationLabel: "4 hours",
        amount: "$3,500",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
      {
        durationLabel: "6 hours",
        amount: "$4,250",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
      {
        durationLabel: "8 hours",
        amount: "$5,050",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
    ],
    galleryCount: 12,
  },
  {
    id: "75-aicon",
    catalogOrder: 20,
    name: "75 Aicon",
    subtitle: "75′ Aicon · Epic Marina, Downtown Miami",
    cardPriceLine: "From $3,500 · 4 hrs",
    listingPriceUsd: 3_500,
    lengthFt: 75,
    region: "miami",
    featured: true,
    productPageHref: "/services/yachts/75-aicon",
    cardCoverSrc: "/yachts/75aicon/75aicon.jpg",
    capacityGuests: 13,
    staterooms: 4,
    bathrooms: 3,
    location: "Epic Marina, Downtown Miami",
    aboutTagline:
      "75′ Aicon — Luxury, Thrill & Pure Vibes on the Water",
    aboutQuote:
      "Let’s just say — these are the kinds of “days you’ll talk about for years.”",
    description: `Step aboard the stunning 75′ Aicon, where every detail is designed to turn your day at sea into an extraordinary escape. Docked at the prestigious Epic Marina in Downtown Miami, this sleek, Italian-crafted yacht is more than just a vessel — it’s a floating playground for sun-chasers, thrill-seekers, and celebration-makers.

From the moment you hop on board, you’ll feel the energy shift — the Miami skyline behind you, the open sea ahead, and an elegant yet laid-back vibe all around. Lounge on the expansive flybridge with a drink in hand, soak up the sun on the oversized bow sun pads, or unwind in the plush indoor salon with panoramic views and cool ocean breezes flowing through. Whether you’re planning a birthday bash, bachelor/bachelorette party, anniversary cruise, or just a well-deserved day to unplug, the 75′ Aicon delivers an unforgettable experience every time.

And let’s talk about the fun. Want to crank up the adrenaline? Add on 2 Jet Skis and rip through the waves, or launch yourself into the ocean from the epic water slide — guaranteed to make your inner child smile. Looking to try something truly next level? Try the E-Hydrofoil and fly over the water like a pro. Prefer to float and chill? No problem. You’ve got plenty of deck space, cozy spots to lounge, and unbeatable views to enjoy while you vibe out.

Inside, the yacht offers a modern and airy interior with elegant finishes and room to relax, dine, and celebrate. From morning mimosas on deck to golden hour champagne toasts, every moment feels elevated and effortless. The crew is professional, friendly, and there to make sure your only job is to enjoy the ride.

So whether you’re in it for the high-speed thrills, the laid-back luxury, or the Instagram-worthy moments (let’s be honest — you’ll get plenty), days aboard the Aicon are anything but ordinary. It’s where unforgettable memories are made, one splash, one laugh, one toast at a time.`,
    highlights: [
      "Epic Marina, Downtown Miami · up to 13 guests cruising",
      "4 staterooms · 3 baths · flybridge, bow sun pads & salon",
      "Optional: Jet Skis, water slide & E-Hydrofoil (priced on listing)",
      "Tax & gratuity — use the estimate panel on this page",
    ],
    inclusions: [
      "Fully inspected yacht",
      "Licensed captain & crew",
      "Local fuel",
      "Water, sodas & ice",
      "2 Jet Skis: $400 each (add-on)",
      "Water slide: $500 (add-on)",
      "E-Hydrofoil: $450 (add-on)",
    ],
    policyNotes: [
      "Charter rates are quoted before tax. A 7% state tax and crew gratuity apply — use the calculator on this page for an estimate.",
      "Final routing, dock fees, fuel surcharges, and inclusions are confirmed in your written proposal.",
      "Availability changes by season; your inquiry locks the current quote window.",
    ],
    priceTiers: [
      {
        durationLabel: "4 hours",
        amount: "$3,500",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
      {
        durationLabel: "6 hours",
        amount: "$4,500",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
      {
        durationLabel: "8 hours",
        amount: "$5,500",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
    ],
    galleryCount: 9,
  },
  {
    id: "70-azimut-days-like-this",
    catalogOrder: 21,
    name: "70 Azimut Days Like This",
    subtitle: "70′ Azimut Days Like This · Venetian Marina & Yacht Club",
    cardPriceLine: "From $3,500 · 4 hrs",
    listingPriceUsd: 3_500,
    lengthFt: 70,
    region: "miami",
    featured: true,
    productPageHref: "/services/yachts/70-azimut-days-like-this",
    cardCoverSrc: "/yachts/70azimutdayslikethis/70azimutdayslikethis.jpg",
    capacityGuests: 13,
    staterooms: 3,
    bathrooms: 2,
    location: "Venetian Marina & Yacht Club",
    aboutTagline:
      "70′ Azimut – Days Like This | Where Every Day Feels Like a Vacation",
    description: `Get ready to soak up the sun, the skyline, and all the good vibes aboard the 70′ Azimut – Days Like This — your personal escape to luxury and adventure on the water. Docked at the elegant Venetian Marina & Yacht Club, this sleek and stylish yacht is your front-row seat to the very best of Miami’s coastline, whether you’re cruising for the day, celebrating something special, or just living it up because… why not?

From the moment you step aboard, Days Like This delivers that “I never want to leave” kind of feeling. With its modern Italian design, spacious decks, and panoramic views at every turn, this yacht is built for both chilling in style and celebrating life’s best moments. Whether you’re stretched out on the bow, sipping cocktails on the flybridge, or taking in the warm breeze from the shaded aft deck, every inch of this yacht invites you to relax, connect, and enjoy.

But it’s not just about lounging — this yacht brings the fun too. Dive into the clear blue with snorkel gear, float the day away on a mix of fun inflatables, or paddle around the bay with the included paddle board for a bit of laid-back adventure. The water is your playground, and there’s no better backdrop than the Miami skyline or a quiet tropical cove just a short cruise away.

Inside, the yacht offers a beautifully appointed interior — sleek, airy, and effortlessly elegant. Whether you’re cooling off in the salon with a cold drink or enjoying lunch with a view, the open layout and thoughtful details make every moment onboard feel elevated and easy. It’s perfect for intimate gatherings, romantic getaways, birthdays, or just a long-overdue escape with your favorite people.

Days Like This isn’t just a name — it’s a whole mood. The kind of experience where time slows down, the music plays just right, and the only thing on your agenda is having the best day ever. With a professional crew on hand to take care of every detail, all you need to do is show up and enjoy.

So go ahead — lean back, dive in, and raise a glass to days that turn into unforgettable stories. Because the best memories are made on the water.`,
    highlights: [
      "Venetian Marina & Yacht Club · up to 13 guests cruising",
      "3 staterooms · 2 baths · bow, flybridge & aft deck",
      "Snorkel gear, inflatables & paddle board",
      "Tax & gratuity — use the estimate panel on this page",
    ],
    inclusions: [
      "Fully inspected yacht",
      "Licensed captain & crew",
      "Local fuel",
      "Water, sodas & ice",
    ],
    policyNotes: [
      "Charter rates are quoted before tax. A 7% state tax and crew gratuity apply — use the calculator on this page for an estimate.",
      "Final routing, dock fees, fuel surcharges, and inclusions are confirmed in your written proposal.",
      "Availability changes by season; your inquiry locks the current quote window.",
    ],
    priceTiers: [
      {
        durationLabel: "4 hours",
        amount: "$3,500",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
      {
        durationLabel: "6 hours",
        amount: "$4,200",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
      {
        durationLabel: "8 hours",
        amount: "$5,200",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
    ],
    galleryCount: 13,
  },
  {
    id: "68-azimut-the-one",
    catalogOrder: 22,
    name: "68 Azimut The One",
    subtitle: "68′ Azimut “The One” · Miami Beach Marina",
    cardPriceLine: "From $3,400 · 4 hrs",
    listingPriceUsd: 3_400,
    lengthFt: 68,
    region: "miami",
    featured: true,
    productPageHref: "/services/yachts/68-azimut-the-one",
    cardCoverSrc: "/yachts/68azimuttheone/68azimuttheone.jpg",
    capacityGuests: 13,
    staterooms: 4,
    bathrooms: 3,
    location: "Miami Beach Marina",
    aboutTagline: "68′ Azimut – “The One”",
    description: `Step aboard “The One” — a 68′ Azimut yacht that blends sleek Italian design with that laid-back Miami luxury. Docked at Miami Beach Marina in the heart of the city, this beauty is your gateway to an unforgettable adventure on the water — whether you’re out for a day of fun, a weekend escape, or celebrating a special moment in style.

You’ll walk through a modern marina, hop aboard, and be welcomed into a world of elegance and ease. Inside, the yacht feels like a floating modern villa — bright, airy, and made for relaxing. The salon is wrapped in panoramic windows, so wherever you sit, you’re treated to endless ocean views and natural light that shifts beautifully throughout the day. Luxurious leathers, rich wood finishes, and a thoughtful open layout make it easy to settle in and feel at home.

Up top, the flybridge is your personal rooftop lounge. Catch a tan on the sun pads, sip cocktails at the bar, or take in the sea breeze under the shaded canopy — it’s one of the best places to unwind, snap pics, and let the Miami magic kick in. The spacious aft deck is perfect for dining outdoors or just hanging out with friends, and the foredeck sunpad gives you a front-row seat to the horizon.

With four beautifully appointed staterooms and three bathrooms, this yacht is also great for overnight charters. Whether it’s an anniversary weekend, a group getaway, or a VIP client experience, you’ll have all the space and comfort you need — and the crew’s tucked away in separate quarters, so your privacy is never compromised.

For guests looking to turn up the fun, jet skis, paddleboards, and a floating mat can be added to the mix. Want to jump off the back and swim at Haulover Sandbar? Lounge under the stars with music playing and a drink in hand? You’ve got the freedom to do it all — or nothing at all.

At its core, “The One” is more than a yacht — it’s your private floating sanctuary. From the moment you step on board at Miami Beach Marina in Miami, you’re in for an immersive, personalized, and seriously stylish escape. Just bring your vibe — we’ll bring the rest.`,
    highlights: [
      "Miami Beach Marina · up to 13 guests cruising",
      "4 staterooms · 3 baths · flybridge, aft deck & foredeck",
      "Floating dock & Sunchill pad included · optional jet skis & toys",
      "Tax & gratuity — use the estimate panel on this page",
    ],
    inclusions: [
      "Fully inspected yacht",
      "Licensed captain & crew",
      "Local fuel",
      "Water, sodas & ice",
      "Floating dock",
      "Sunchill pad",
    ],
    policyNotes: [
      "Charter rates are quoted before tax. A 7% state tax and crew gratuity apply — use the calculator on this page for an estimate.",
      "Final routing, dock fees, fuel surcharges, and inclusions are confirmed in your written proposal.",
      "Availability changes by season; your inquiry locks the current quote window.",
    ],
    priceTiers: [
      {
        durationLabel: "4 hours",
        amount: "$3,400",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
      {
        durationLabel: "6 hours",
        amount: "$4,300",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
      {
        durationLabel: "8 hours",
        amount: "$5,400",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
    ],
    galleryCount: 10,
  },
  {
    id: "65-azimut-allegra",
    catalogOrder: 23,
    name: "65 Azimut Allegra",
    subtitle: "65′ Azimut Allegra · Miami Beach Marina",
    cardPriceLine: "From $3,400 · 4 hrs",
    listingPriceUsd: 3_400,
    lengthFt: 65,
    region: "miami",
    featured: true,
    productPageHref: "/services/yachts/65-azimut-allegra",
    cardCoverSrc: "/yachts/65azimutallegra/65azimutallegra.jpg",
    capacityGuests: 13,
    staterooms: 3,
    bathrooms: 2,
    location: "Miami Beach Marina",
    aboutTagline:
      "65′ Azimut Allegra — Sail Into Style, Savor the Moment",
    aboutQuote:
      "Luxury, laughter, and ocean breezes — this is how Miami does yachting.",
    description: `Step aboard the 65′ Azimut Allegra, a sleek and stylish escape docked at Miami Beach Marina — the city’s iconic gateway to the sea. Whether you’re planning a birthday bash, celebrating love with an engagement cruise, or gathering your crew for a chic family day out, the Allegra delivers a perfect mix of elegance and excitement. It’s where modern Italian design meets Miami’s vibrant coastal lifestyle.

As you glide away from the marina, the city fades and your private sanctuary begins. Inside, you’ll find a fully-equipped kitchen perfect for prepping gourmet bites, a plush salon bathed in natural light, and interiors that feel more like a luxury suite than a boat. Outside, the spacious decks invite you to lounge, sip, and soak in panoramic views of the skyline and sparkling sea. There’s no rush — just smooth sailing, cool drinks, and good vibes.

The Allegra is all about versatility. Want to unwind under the sun with a glass of rosé? Done. Prefer to add a little thrill to your day? Floating toys can be added on request to keep the energy going. With both high-end comfort and optional fun built in, this yacht is designed to let you do Miami your way — elevated, effortless, and unforgettable.

Your charter includes a fully inspected yacht, a licensed captain and professional crew, local fuel, water, sodas, and ice. Floating toys are also available upon request, making it easy to turn up the fun whenever you’re ready. The 65′ Azimut Allegra isn’t just a yacht — it’s your front-row ticket to living the good life on the water. Ready to sail? Let’s go!`,
    highlights: [
      "Miami Beach Marina · up to 13 guests cruising",
      "3 staterooms · 2 baths · gourmet kitchen & salon",
      "Floating toys available on request",
      "Tax & gratuity — use the estimate panel on this page",
    ],
    inclusions: [
      "Fully inspected yacht",
      "Licensed captain & crew",
      "Local fuel",
      "Water, sodas & ice",
    ],
    policyNotes: [
      "Charter rates are quoted before tax. A 7% state tax and crew gratuity apply — use the calculator on this page for an estimate.",
      "Final routing, dock fees, fuel surcharges, and inclusions are confirmed in your written proposal.",
      "Availability changes by season; your inquiry locks the current quote window.",
    ],
    priceTiers: [
      {
        durationLabel: "4 hours",
        amount: "$3,400",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
      {
        durationLabel: "6 hours",
        amount: "$4,400",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
      {
        durationLabel: "8 hours",
        amount: "$5,000",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
    ],
    galleryCount: 8,
  },
  {
    id: "53-galeon-h",
    catalogOrder: 24,
    name: "53 Galeon H",
    subtitle: "53′ Galeon Hummingbird · River Landing Marina",
    cardPriceLine: "From $3,300 · 4 hrs",
    listingPriceUsd: 3_300,
    lengthFt: 53,
    region: "miami",
    featured: true,
    productPageHref: "/services/yachts/53-galeon-h",
    cardCoverSrc: "/yachts/53galeonh/53galeonh.jpg",
    capacityGuests: 13,
    staterooms: 3,
    bathrooms: 2,
    location: "River Landing Marina",
    aboutTagline:
      "53′ Galeon – Hummingbird | Where Comfort Meets Adventure on the River Landing Marina",
    description: `Your unforgettable yachting experience starts the moment you arrive at River Landing Marina, where the 53′ Galeon Hummingbird is ready to welcome you aboard. This sleek and modern yacht is designed for those who crave a perfect blend of relaxation, luxury, and adventure — all wrapped up in that iconic Miami vibe.

From the expansive teak cockpit balcony to the smooth functionality of the hydraulic gangway, this yacht is built for both style and convenience. Lounge under the sun, toast with friends as you cruise past the vibrant sights of the River Landing Marina, or dive into the clear blue from the swimming ladder for an instant refresh. As evening sets in, the underwater lights create a glowing, dreamlike atmosphere that makes your time on the water even more magical.

Onboard, the vibe is effortless. Whether you’re throwing a small celebration, relaxing with family, or enjoying an intimate escape with your partner, the Hummingbird provides the perfect setting. The passerelle and eco-friendly solar panels show that every detail has been thoughtfully designed to enhance your time on board — while keeping things smooth, sustainable, and stylish.

Inside, you’ll discover a bright, open interior with plenty of space to chill, snack, sip, or simply enjoy the ride. The yacht flows seamlessly between indoor comfort and outdoor fun, giving you options whether you’re looking to turn up the music or kick back in peace. With easy access to local hotspots, the sandbar, or more tranquil waterways, your day on the Hummingbird is whatever you make it — chill, chic, or full of energy.

This is more than just a yacht rental — it’s a whole vibe. Come aboard, feel the breeze, and let your Miami moment begin.`,
    highlights: [
      "River Landing Marina · up to 13 guests cruising",
      "3 staterooms · 2 baths · teak cockpit balcony & hydraulic gangway",
      "Tax & gratuity — use the estimate panel on this page",
    ],
    inclusions: [
      "Fully inspected yacht",
      "Licensed captain & crew",
      "Local fuel",
      "Water, sodas & ice",
    ],
    policyNotes: [
      "Charter rates are quoted before tax. A 7% state tax and crew gratuity apply — use the calculator on this page for an estimate.",
      "Final routing, dock fees, fuel surcharges, and inclusions are confirmed in your written proposal.",
      "Availability changes by season; your inquiry locks the current quote window.",
    ],
    priceTiers: [
      {
        durationLabel: "4 hours",
        amount: "$3,300",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
      {
        durationLabel: "6 hours",
        amount: "$3,750",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
      {
        durationLabel: "8 hours",
        amount: "$4,100",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
    ],
    galleryCount: 4,
  },
  {
    id: "60-azimut-supreme-1",
    catalogOrder: 25,
    name: "60 Azimut Supreme 1",
    subtitle: "60′ Azimut Supreme 1 · Miami Beach Marina",
    cardPriceLine: "From $3,200 · 4 hrs",
    listingPriceUsd: 3_200,
    lengthFt: 60,
    region: "miami",
    featured: true,
    productPageHref: "/services/yachts/60-azimut-supreme-1",
    cardCoverSrc: "/yachts/60azimutsupreme1/60azimutsupreme1-1.jpg",
    capacityGuests: 13,
    staterooms: 2,
    bathrooms: 2,
    location: "Miami Beach Marina",
    aboutTagline:
      "60′ Azimut Supreme 1 — Sleek, Stylish, and Ready for Your Perfect Day on the Water",
    description: `Step into your dream day aboard the 60′ Azimut Supreme 1, where Italian design meets Miami’s vibrant energy for a yachting experience that’s both luxurious and full of life. Departing from the iconic Miami Beach Marina, this sleek yacht is your floating paradise — ideal for everything from relaxed daytime cruising to lively celebrations under the stars.

The moment you board, you’ll feel the blend of modern elegance and warm comfort. Inside, the yacht features spacious living areas, high-end finishes, and a full-beam master suite that’s perfect for unwinding in total privacy. The main salon is bright and airy, offering panoramic views and plush seating, making it a great space to catch your breath or pop a bottle with your crew. Every detail has been designed to elevate your time on the water — from the chic décor to the top-tier entertainment systems.

Outside, the yacht opens up into a world of endless fun. The expansive flybridge offers the best views in the house, complete with room to sunbathe, lounge, or simply vibe to your favorite playlist as the Miami skyline floats by. Whether you’re catching a tan with a cocktail in hand or enjoying lunch al fresco, the vibe is always just right. And when it’s time to dive into the action, the optional water slide and private pool turn the yacht into your personal floating playground.

Powered by twin Volvo Penta engines, the Azimut Supreme 1 cruises smoothly and powerfully, whether you’re heading out to the famous Haulover Sandbar, exploring hidden coves, or watching the sunset paint the skyline in gold. It’s perfect for birthdays, bachelorettes, anniversaries, client outings, or just an unforgettable day with your favorite people.

From the elegance of the design to the excitement of the open sea, every moment aboard the 60′ Azimut Supreme 1 is designed to be savored. It’s more than just a charter — it’s a full-on Miami moment.`,
    highlights: [
      "Miami Beach Marina · up to 13 guests cruising",
      "2 staterooms · 2 baths · full-beam master & flybridge",
      "Optional water slide & pool (priced on listing)",
      "Tax & gratuity — use the estimate panel on this page",
    ],
    inclusions: [
      "Fully inspected yacht",
      "Licensed captain & crew",
      "Local fuel",
      "Water, sodas & ice",
      "Water slide: $850 (add-on)",
      "Pool: $550 (add-on)",
    ],
    policyNotes: [
      "Charter rates are quoted before tax. A 7% state tax and crew gratuity apply — use the calculator on this page for an estimate.",
      "Final routing, dock fees, fuel surcharges, and inclusions are confirmed in your written proposal.",
      "Availability changes by season; your inquiry locks the current quote window.",
    ],
    priceTiers: [
      {
        durationLabel: "4 hours",
        amount: "$3,200",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
      {
        durationLabel: "6 hours",
        amount: "$3,700",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
      {
        durationLabel: "8 hours",
        amount: "$4,400",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
    ],
    galleryCount: 9,
  },
  {
    id: "60-azimut-supreme-2",
    catalogOrder: 26,
    name: "60 Azimut Supreme 2",
    subtitle: "60′ Azimut Supreme 2 · Miami Beach Marina",
    cardPriceLine: "From $3,200 · 4 hrs",
    listingPriceUsd: 3_200,
    lengthFt: 60,
    region: "miami",
    featured: true,
    productPageHref: "/services/yachts/60-azimut-supreme-2",
    cardCoverSrc:
      "/yachts/60azimutesupreme2/60azimutsupreme2-1.jpg",
    capacityGuests: 13,
    staterooms: 3,
    bathrooms: 2,
    location: "Miami Beach Marina",
    aboutTagline:
      "60′ Azimut Supreme 2 – Cruise in Style, Celebrate in Luxury",
    aboutQuote: "Where Italian elegance meets Miami celebration.",
    description: `Step aboard the 60′ Azimut Supreme 2 and experience the perfect fusion of sleek Italian craftsmanship and Miami’s sun-soaked vibes. Docked at the prestigious Miami Beach Marina, this luxury yacht is made for unforgettable days — whether you’re throwing a lively party, planning a romantic escape, or just cruising through paradise with your favorite people.

Inside, you’ll find a bright and spacious layout with refined touches throughout. From the polished finishes to the cozy salon and full-beam master suite, everything is designed to feel inviting yet upscale. The gourmet kitchen on board is ready for anything — whether you’re snacking, sipping, or dining in style. It’s the perfect balance of modern design and comfortable luxury.

But the real magic happens outside. The flybridge is your personal sky lounge, made for sunbathing, champagne toasts, and catching Miami’s breeze in total bliss. Want to dial up the fun? Add the optional water slide for some splashy excitement or turn the day into a true floating escape with the inflatable private pool. Whether you’re anchored at Haulover or drifting along the coastline, the Supreme 2 creates the ultimate yacht day vibe.

Every charter includes a fully inspected yacht, a licensed captain and crew, local fuel, and all the essentials — water, sodas, ice, and a floating carpet for lounging in the sun. Want more? You can add a water slide for $850, a floating pool for $550, and you’ll also receive a $200 cash certificate to use toward your next yacht experience with us — a little something extra for your next adventure.

The 60′ Azimut Supreme 2 is perfect for birthday celebrations, bachelorette parties, date-day escapes, or any time you just want to treat yourself and your crew to something unforgettable. Come aboard, hit play on your favorite playlist, and let the ocean take care of the rest.`,
    highlights: [
      "Miami Beach Marina · up to 13 guests cruising",
      "3 staterooms · 2 baths · flybridge & full-beam master",
      "Floating carpet included · $200 certificate toward your next charter",
      "Optional water slide & pool (priced on listing) · tax & gratuity on this page",
    ],
    inclusions: [
      "Fully inspected yacht",
      "Licensed captain & crew",
      "Local fuel",
      "Water, sodas & ice",
      "Floating carpet",
      "Water slide: $850 (add-on)",
      "Pool: $550 (add-on)",
      "$200 certificate toward your next charter",
    ],
    policyNotes: [
      "Charter rates are quoted before tax. A 7% state tax and crew gratuity apply — use the calculator on this page for an estimate.",
      "Final routing, dock fees, fuel surcharges, and inclusions are confirmed in your written proposal.",
      "Availability changes by season; your inquiry locks the current quote window.",
    ],
    priceTiers: [
      {
        durationLabel: "4 hours",
        amount: "$3,200",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
      {
        durationLabel: "6 hours",
        amount: "$3,700",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
      {
        durationLabel: "8 hours",
        amount: "$4,400",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
    ],
    galleryCount: 14,
  },
  {
    id: "52-prestige",
    catalogOrder: 27,
    name: "52 Prestige",
    subtitle: "52 ft motor yacht",
    cardPriceLine: "From $2,500 · 4 hrs",
    listingPriceUsd: 2_500,
    lengthFt: 52,
    region: "north-miami",
    featured: true,
    productPageHref: "/services/yachts/52-prestige",
    cardCoverSrc: "/yachts/52prestige/52prestige.jpg",
    capacityGuests: 13,
    location: "North Miami",
    description:
      "Crewed motor yacht day charter on the 52 Prestige (52′). Typical departure: North Miami. Itinerary, fuel zones, inclusions, and final rates are confirmed in your Blackline proposal.",
    priceTiers: [
      {
        durationLabel: "4 hours",
        amount: "$2,500",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
      {
        durationLabel: "6 hours",
        amount: "$3,250",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
      {
        durationLabel: "8 hours",
        amount: "$4,000",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
    ],
    highlights: [
      "52′ motor yacht · up to 13 guests",
      "Typical departure: North Miami area — slip confirmed when you book.",
      "Use the estimate panel for 7% tax and crew gratuity on the charter",
    ],
    inclusions: [
      "Fully inspected yacht",
      "Licensed captain & crew",
      "Local fuel for standard routing as quoted",
      "Water, sodas & ice",
      "USCG-compliant safety equipment",
    ],
    policyNotes: [
      "Charter rates are quoted before tax. A 7% state tax and crew gratuity apply — use the calculator on this page for an estimate.",
      "Final routing, dock fees, fuel surcharges, and inclusions are confirmed in your written proposal.",
      "Availability changes by season; your inquiry locks the current quote window.",
    ],
    galleryCount: 14,
  },
  {
    id: "40-fjord",
    catalogOrder: 28,
    name: "40 Fjord",
    subtitle: "40′ Fjord Open · Miami",
    cardPriceLine: "From $2,200 · 4 hrs",
    listingPriceUsd: 2_200,
    lengthFt: 40,
    region: "miami",
    featured: true,
    productPageHref: "/services/yachts/40-fjord",
    cardCoverSrc: "/yachts/40fjord/40fjord.jpg",
    capacityGuests: 13,
    staterooms: 1,
    bathrooms: 1,
    location: "2060 NW 13th St, Miami, FL 33125",
    aboutTagline: "Fjord 40 Open — Your Perfect Day on the Water Starts Here",
    aboutQuote:
      "If you’re looking for a boat that screams effortless style, fun in the sun, and laid-back luxury, the Fjord 40 Open is calling your name.",
    description: `If you’re looking for a boat that screams effortless style, fun in the sun, and laid-back luxury, the Fjord 40 Open is calling your name. This sleek, European-inspired yacht was practically made for Miami’s iconic waterfront lifestyle — whether you’re cruising to a chic waterfront restaurant, anchoring out at a sandbar, or just floating the day away with your favorite crew.

With a modern, open layout and tons of deck space, the Fjord 40 Open is all about outdoor living and good vibes. Stretch out on the oversized front sun pad, sip a drink around the cockpit table (which also transforms into a comfy sunbed!), and let the breeze do the rest. The clean, minimalist design keeps things cool and casual — no clutter, just comfort and style in every direction.

This yacht is the perfect match for birthday parties, bachelor or bachelorette outings, date-day escapes, or a casual Sunday Funday with friends. It’s just the right size for socializing while still feeling like your own private oasis on the water. And thanks to its smooth ride and smart layout, you’ll spend less time figuring things out and more time enjoying every second.

The experience is relaxed, the energy is high, and the memories? Yeah, those come easy when you’re cruising through Miami’s stunning waterways aboard something this effortlessly cool. Whether you’re dancing on the deck with music playing or chilling with your feet in the water and a drink in hand, this is the boat for living in the moment.

Board at 2060 NW 13th St Miami, FL 33125, bring your favorite playlist, and get ready for the kind of day you’ll be talking about long after the sun goes down.`,
    highlights: [
      "2060 NW 13th St, Miami · up to 13 guests cruising",
      "1 stateroom · 1 bath · open layout & oversized sun pad",
      "Floating carpet included · tax & gratuity on this page",
    ],
    inclusions: [
      "Fully inspected yacht",
      "Licensed captain & crew",
      "Local fuel",
      "Water, sodas & ice",
      "Floating carpet",
    ],
    policyNotes: [
      "Charter rates are quoted before tax. A 7% state tax and crew gratuity apply — use the calculator on this page for an estimate.",
      "Final routing, dock fees, fuel surcharges, and inclusions are confirmed in your written proposal.",
      "Availability changes by season; your inquiry locks the current quote window.",
    ],
    priceTiers: [
      {
        durationLabel: "4 hours",
        amount: "$2,200",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
      {
        durationLabel: "6 hours",
        amount: "$2,500",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
      {
        durationLabel: "8 hours",
        amount: "$2,900",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
    ],
    galleryCount: 11,
  },
  {
    id: "48-formula",
    catalogOrder: 29,
    name: "48 Formula",
    subtitle: "48′ Formula Yacht · Miami",
    cardPriceLine: "From $1,800 · 4 hrs",
    listingPriceUsd: 1_800,
    lengthFt: 48,
    region: "miami",
    featured: true,
    productPageHref: "/services/yachts/48-formula",
    cardCoverSrc: "/yachts/48formula/48formula.jpg",
    capacityGuests: 13,
    staterooms: 2,
    bathrooms: 2,
    location: "Bayshore Landing Marina, 2550 S Bayshore Dr, Miami, FL",
    aboutTagline: "Formula 48 Yacht – Comfort, Class, and Coastal Luxury",
    aboutQuote:
      "Every inch of the Formula 48 Yacht reflects a balance of performance, craftsmanship, and comfort — making it the ideal vessel for those seeking a sophisticated yet inviting yachting experience along Miami’s stunning coastline.",
    description: `Departing from the scenic Bayshore Landing Marina (2550 S Bayshore Dr, Miami, FL), the Formula 48 Yacht delivers a seamless blend of style, comfort, and craftsmanship — the perfect choice for guests who appreciate refined cruising and relaxed sophistication on the water.

Built for elegant leisure rather than raw speed, this luxury express cruiser showcases Formula’s reputation for high-quality construction and meticulous attention to detail. Powered by twin inboard diesel engines or Volvo IPS 600 pod drives, the Formula 48 glides effortlessly across the water, offering a smooth, quiet, and stable ride for guests looking to unwind and indulge.

Step inside and experience what can only be described as comfortable opulence. The bright, inviting main salon features generous headroom, plush Ultraleather seating, and rich cherrywood joinery, creating a warm and elegant atmosphere. The fully equipped galley rivals that of a larger yacht, boasting glossy cabinetry, Corian countertops, a two-burner stove, convection oven, and full-size refrigerator/freezer — perfect for gourmet dining on board. Entertainment is effortless with a widescreen HDTV, surround-sound system, and integrated media options for an immersive experience.

Below deck, two luxurious staterooms offer the ideal retreat after a day on the water. The forward master suite features a centerline queen bed and en suite bath, while the guest cabin includes twin beds that can convert into a queen — both with private heads and showers for added comfort and privacy.

Above deck, the Formula 48 was designed for socializing and open-air enjoyment. The cockpit offers ample seating for up to ten guests, complete with an aft U-shaped lounge, a mid-cockpit wet bar, and a built-in refrigerator or icemaker for effortless entertaining. The foredeck, easily accessed through a walk-through windshield, invites you to relax on cushioned sunpads, while the full-width swim platform provides convenient water access, a concealed ladder, and a freshwater shower.`,
    highlights: [
      "Bayshore Landing Marina · up to 13 guests cruising",
      "2 staterooms · 2 baths · salon, galley & express-cruiser layout",
      "Water mat included · tax & gratuity on this page",
    ],
    inclusions: [
      "Fully inspected yacht",
      "Licensed captain & crew",
      "Local fuel",
      "Water, sodas & ice",
      "Water mat",
    ],
    policyNotes: [
      "Charter rates are quoted before tax. A 7% state tax and crew gratuity apply — use the calculator on this page for an estimate.",
      "Final routing, dock fees, fuel surcharges, and inclusions are confirmed in your written proposal.",
      "Availability changes by season; your inquiry locks the current quote window.",
    ],
    priceTiers: [
      {
        durationLabel: "4 hours",
        amount: "$1,800",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
      {
        durationLabel: "6 hours",
        amount: "$2,000",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
      {
        durationLabel: "8 hours",
        amount: "$2,400",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
    ],
    galleryCount: 9,
  },
  {
    id: "105-azimut",
    catalogOrder: 30,
    name: "105 Azimut",
    subtitle: "105′ Azimut · Miami River",
    cardPriceLine: "From $12,100 · 4 hrs",
    listingPriceUsd: 12_100,
    lengthFt: 105,
    region: "miami",
    featured: false,
    productPageHref: "/services/yachts/105-azimut",
    cardCoverSrc: "/yachts/105azimut/105azimut.jpg",
    capacityGuests: 13,
    staterooms: 5,
    bathrooms: 4,
    location: "5th Street Marina, Miami River (341 NW South River Dr, Miami, FL 33128)",
    aboutTagline: "105′ AZIMUT Yacht – The Ultimate Escape on the Water",
    aboutQuote: "Go beyond luxury—this is your floating VIP lounge.",
    description: `Step aboard the breathtaking 105′ Azimut, docked at the prestigious 5th Street Marina on the Miami River (341 NW South River Dr, Miami, FL 33128), and get ready to cruise in serious style. With its sleek lines, expansive decks, and unmistakable Italian flair, this yacht is designed to impress from the moment you step on. Whether you’re hosting a celebration, treating your crew to a day of luxury, or just escaping the ordinary, the Azimut delivers an unforgettable experience on the water.

This yacht is made for both elegance and fun. Stretch out on the flybridge with a cocktail in hand, gather with friends in the spacious salon, or dine al fresco as the sun sets over the Miami skyline. The interior boasts rich finishes, a fully equipped galley, and luxe lounge areas—perfect for entertaining, relaxing, or both. Every space is crafted for comfort, so you can cruise, chill, and celebrate in total luxury.

The overall vibe? Effortlessly elevated. It’s ideal for birthdays, anniversaries, family days, or simply living your best life with those who matter most. Whether you’re anchored at a private island or gliding past the city lights, the 105′ Azimut offers a high-end yacht charter with a fun, feel-good twist. No stuffy vibes here—just great energy, stunning views, and unforgettable memories.

Your charter includes everything you need for a flawless day on the water: a licensed captain and professional crew, local fuel, water, sodas, and ice, along with full access to the yacht’s stylish interior and spacious outdoor decks. Everything is ready for you—just step aboard and enjoy the ride.`,
    highlights: [
      "5th Street Marina, Miami River · up to 13 guests cruising",
      "5 staterooms · 4 baths · flybridge, salon & galley",
      "Jacuzzi, grill, jetski, tender, paddle boards, Seabobs & more — see inclusions",
      "Tax & gratuity — use the estimate panel on this page",
    ],
    inclusions: [
      "Fully inspected yacht",
      "Licensed captain & crew",
      "Local fuel",
      "Water, sodas & ice",
      "Jacuzzi",
      "Grill",
      "Jetski",
      "Tender",
      "2 paddle boards",
      "2 Seabobs",
      "Kayaks",
      "Floating island",
      "Wet bar",
    ],
    policyNotes: [
      "Charter rates are quoted before tax. A 7% state tax and crew gratuity apply — use the calculator on this page for an estimate.",
      "Final routing, dock fees, fuel surcharges, and inclusions are confirmed in your written proposal.",
      "Availability changes by season; your inquiry locks the current quote window.",
    ],
    priceTiers: [
      {
        durationLabel: "6 hours",
        amount: "$12,100",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
      {
        durationLabel: "8 hours",
        amount: "$14,100",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
    ],
    galleryCount: 6,
  },
  {
    id: "103-azimut",
    catalogOrder: 31,
    name: "103 Azimut",
    subtitle: "103′ Azimut · Miami River",
    cardPriceLine: "From $11,500 · 4 hrs",
    listingPriceUsd: 11_500,
    lengthFt: 103,
    region: "miami",
    featured: false,
    productPageHref: "/services/yachts/103-azimut",
    cardCoverSrc: "/yachts/103azimut/103azimut.jpg",
    capacityGuests: 13,
    staterooms: 4,
    bathrooms: 4,
    location: "Miami River (slip confirmed when you book)",
    aboutTagline: "103′ Azimut Yacht – Luxury, Elevated",
    aboutQuote: "Smooth sailing, sleek living, and serious wow factor.",
    description: `Step aboard the stunning 103′ Azimut, docked along the scenic Miami River, and discover a yacht that redefines what luxury on the water feels like. With sleek lines, spacious decks, and effortlessly elegant interiors, this showstopping vessel is where European craftsmanship meets Miami’s sun-soaked vibe. Whether you’re throwing a next-level celebration, enjoying an intimate family getaway, or just soaking up a lavish day under the sun, the 103′ Azimut delivers in every way.

From the moment you board, you’re wrapped in comfort and class. Inside, you’ll find a refined living space with luxe furnishings, serene bedrooms, and a fully equipped galley perfect for everything from chef-prepared meals to casual snacks. Outside, multiple lounging decks, a stylish dining area, and shaded spaces make it easy to relax, reconnect, and enjoy the moment—whether you’re cruising the bay or anchored in a hidden cove.

This yacht isn’t just about looks—it’s packed with fun too. Get your heart racing with 2 Jet Skis, 2 Seabobs, and 2 paddle boards, or take it easy on the floating water mat and inflatable water slide pool. There’s no shortage of ways to splash, chill, and make memories with your crew.

What’s included? Your charter comes with a fully inspected yacht, a licensed captain and crew, local fuel, water, sodas, ice, a fully equipped galley, plus access to all water toys: 2 Jet Skis, 2 Seabobs, 2 paddle boards, a water slide pool, and a floating water mat. No hidden extras—just pure, elevated yachting. Ready for your ultimate Miami escape? Let’s cruise.`,
    highlights: [
      "Miami River · up to 13 guests cruising",
      "4 staterooms · 4 baths · galley & multiple decks",
      "2 Jet Skis, 2 Seabobs, slide, pool, mat & more — see inclusions",
      "Tax & gratuity — use the estimate panel on this page",
    ],
    inclusions: [
      "Fully inspected yacht",
      "Licensed captain & crew",
      "Local fuel",
      "Water, sodas & ice",
      "2 Jet Skis",
      "2 Seabobs",
      "2 paddle boards",
      "Water slide",
      "Pool",
      "Water mat",
      "Jousting poles",
      "Towable tube",
    ],
    policyNotes: [
      "Charter rates are quoted before tax. A 7% state tax and crew gratuity apply — use the calculator on this page for an estimate.",
      "Final routing, dock fees, fuel surcharges, and inclusions are confirmed in your written proposal.",
      "Availability changes by season; your inquiry locks the current quote window.",
    ],
    priceTiers: [
      {
        durationLabel: "8 hours",
        amount: "$11,500",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
    ],
    galleryCount: 8,
  },
  {
    id: "112-custom-privilege",
    catalogOrder: 32,
    name: "112 Custom Privilege",
    subtitle: "112′ Custom Privilege · Miami",
    cardPriceLine: "From $9,200 · 4 hrs",
    listingPriceUsd: 9_200,
    lengthFt: 112,
    region: "miami",
    featured: false,
    productPageHref: "/services/yachts/112-custom-privilege",
    cardCoverSrc: "/yachts/112customprivilege/112customprivilege.jpg",
    capacityGuests: 13,
    staterooms: 5,
    bathrooms: 5,
    location: "Aston Martin Residences (300 Biscayne Boulevard Way, Miami, FL 33131)",
    aboutTagline: "112′ Custom Privilege – Luxury That Goes Beyond the Surface",
    aboutQuote:
      "From saunas to sea toys—this is how you elevate the everyday.",
    description: `Welcome aboard the 112′ Custom Privilege, your private sanctuary on the water, where sleek design and indulgent amenities come together for a one-of-a-kind Miami escape. Docked at The Aston Martin Residences (300 Biscayne Boulevard Way, Miami, FL 33131) and ready to impress, this yacht offers the perfect blend of relaxation and thrill, ideal for unforgettable celebrations, upscale getaways, or luxurious cruising with your favorite people.

Inside, you’re greeted with elegant interiors, spacious lounging areas, and a serene ambiance made for total comfort. Whether you’re enjoying the indoor Jacuzzi or stepping into your own onboard sauna, this yacht feels like your personal floating spa. For those who prefer the outdoors, the second Jacuzzi offers stunning views and endless sun-drenched vibes, while the deck is made for entertaining or simply kicking back.

Whether you’re throwing a celebration, planning a wellness-inspired weekend, or just want to experience Miami like a VIP, the 112′ Custom Privilege has everything you need. Dive into the adventure with water toys, soak in style, or relax with a cool drink as you cruise past the coastline—every moment feels elevated and unforgettable.

Your charter includes a licensed captain and professional crew, local fuel, water, sodas, and ice, plus full access to luxury amenities like 2 jet skis, underwater scooters, a water mattress, 2 Jacuzzis (indoor and outdoor), and your own private sauna. All fully inspected and ready for you—just show up and enjoy the ride.`,
    highlights: [
      "Aston Martin Residences · up to 13 guests cruising",
      "5 staterooms · 5 baths · indoor & outdoor Jacuzzis · sauna",
      "2 Jet Skis, underwater scooters & water mattress — see inclusions",
      "Tax & gratuity — use the estimate panel on this page",
    ],
    inclusions: [
      "Fully inspected yacht",
      "Licensed captain & crew",
      "Local fuel",
      "Water, sodas & ice",
      "2 Jet Skis",
      "Underwater scooters",
      "Water mattress",
      "2 Jacuzzis (indoor and outdoor)",
      "Sauna",
    ],
    policyNotes: [
      "Charter rates are quoted before tax. A 7% state tax and crew gratuity apply — use the calculator on this page for an estimate.",
      "Final routing, dock fees, fuel surcharges, and inclusions are confirmed in your written proposal.",
      "Availability changes by season; your inquiry locks the current quote window.",
    ],
    priceTiers: [
      {
        durationLabel: "4 hours",
        amount: "$9,200",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
      {
        durationLabel: "6 hours",
        amount: "$13,800",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
      {
        durationLabel: "8 hours",
        amount: "$18,400",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
    ],
    galleryCount: 19,
  },
  {
    id: "68-sunseeker-nassau",
    catalogOrder: 33,
    name: "68 Sunseeker Nassau",
    subtitle: "68′ Sunseeker · Nassau / Bahamas",
    cardPriceLine: "From $7,800 · 4 hrs",
    listingPriceUsd: 7_800,
    lengthFt: 68,
    region: "bahamas",
    featured: false,
    productPageHref: "/services/yachts/68-sunseeker-nassau",
    cardCoverSrc: "/yachts/68sunseekernassau/68sunseekernassau.jpg",
    capacityGuests: 13,
    staterooms: 2,
    bathrooms: 1,
    location: "Nassau / Bahamas (slip confirmed when you book)",
    description: `Crewed day charter on the 68′ Sunseeker in Nassau / the Bahamas — a refined express layout with space to relax and take in turquoise water. Perfect for groups who want a polished on-water day with captain and crew handling the details while you enjoy the ride.

Specs at a glance: up to 13 guests cruising, two staterooms, and one bathroom — ideal for socializing on deck between swims and island views.`,
    highlights: [
      "Nassau / Bahamas routing · up to 13 guests cruising",
      "2 staterooms · 1 bath · Sunseeker express layout",
      "Tax & gratuity — use the estimate panel on this page",
    ],
    inclusions: [
      "Fully inspected yacht",
      "Licensed captain & crew",
      "Local fuel",
      "Water, sodas & ice",
    ],
    policyNotes: [
      "Charter rates are quoted before tax. A 7% state tax and crew gratuity apply — use the calculator on this page for an estimate.",
      "Final routing, dock fees, fuel surcharges, and inclusions are confirmed in your written proposal.",
      "Availability changes by season; your inquiry locks the current quote window.",
    ],
    priceTiers: [
      {
        durationLabel: "4 hours",
        amount: "$7,800",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
      {
        durationLabel: "6 hours",
        amount: "$9,100",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
      {
        durationLabel: "8 hours",
        amount: "$11,800",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
    ],
    galleryCount: 10,
  },
  {
    id: "105-leopard",
    catalogOrder: 34,
    name: "105 Leopard",
    subtitle: "105′ Leopard · Miami Beach Marina",
    cardPriceLine: "From $7,500 · 4 hrs",
    listingPriceUsd: 7_500,
    lengthFt: 105,
    region: "miami",
    featured: false,
    productPageHref: "/services/yachts/105-leopard",
    cardCoverSrc: "/yachts/105leopard/105leopard.jpg",
    capacityGuests: 13,
    staterooms: 4,
    bathrooms: 4,
    location: "Miami Beach Marina",
    aboutTagline: "105′ Leopard – Cruise in Style, Celebrate in Luxury",
    aboutQuote: "High-end glamour meets endless fun on the open sea.",
    description: `Step aboard the jaw-dropping 105′ Leopard yacht and elevate your next Miami getaway to pure luxury. Docked at the prestigious Miami Beach Marina, this sleek, powerful yacht is designed to impress — with bold styling, lavish interiors, and expansive outdoor lounging areas that are perfect for hosting upscale parties, laid-back family days, or dreamlike escapes along Miami’s iconic coastline.

From the moment you board, you’ll be surrounded by elegance. The interiors offer a mix of modern refinement and comfort, while the fully equipped kitchen means every meal can feel like a five-star dining experience. Whether you’re sipping cocktails on the sun deck, diving off the swim platform, or cruising past the city skyline, the 105′ Leopard is your ultimate floating sanctuary.

When it comes to fun, this yacht goes above and beyond. Make a splash with the brand new custom FunAir slide, ride the waves on the 2022 Yamaha Jet Ski, or explore underwater with top-tier snorkel gear and Seabobs. Prefer a more relaxed vibe? Stretch out on the floating island, take a spin on towable toys, or paddle your way around with four included paddle boards. There’s something for every kind of guest — from thrill-seekers to sun-chasers.

Your charter comes with a licensed captain and crew, local fuel, and complimentary water, sodas, and ice. You’ll also enjoy a 2022 Yamaha Jet Ski, two Seabobs, a custom Fun-Air slide, floating island (8-person), floating dock, towable toys, snorkel gear, four paddle boards, and a 16’ Zodiac tender (available for term charters).`,
    highlights: [
      "Miami Beach Marina · up to 13 guests cruising",
      "4 staterooms · 4 baths · sun deck & swim platform",
      "FunAir slide, Jet Ski, Seabobs, floating island & more — see inclusions",
      "Tax & gratuity — use the estimate panel on this page",
    ],
    inclusions: [
      "Fully inspected yacht",
      "Licensed captain & crew",
      "Local fuel",
      "Water, sodas & ice",
      "Brand new FunAir custom slide",
      "Brand new Yamaha Jet Ski (2022)",
      "2 Seabobs",
      "4 paddle boards",
      "Floating island (8 persons)",
      "Floating dock",
      "Towable toys & snorkeling gear",
      "Jacuzzi",
      "16′ Zodiac tender (term charters only)",
    ],
    policyNotes: [
      "Charter rates are quoted before tax. A 7% state tax and crew gratuity apply — use the calculator on this page for an estimate.",
      "Final routing, dock fees, fuel surcharges, and inclusions are confirmed in your written proposal.",
      "Availability changes by season; your inquiry locks the current quote window.",
    ],
    priceTiers: [
      {
        durationLabel: "4 hours",
        amount: "$7,500",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
      {
        durationLabel: "6 hours",
        amount: "$9,500",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
      {
        durationLabel: "8 hours",
        amount: "$11,500",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
    ],
    galleryCount: 19,
  },
  {
    id: "70-sunreef-supreme",
    catalogOrder: 35,
    name: "70 Sunreef Supreme",
    subtitle: "70′ Sunreef Supreme (PowerCat) · Miami Beach",
    cardPriceLine: "From $7,000 · 4 hrs",
    listingPriceUsd: 7_000,
    lengthFt: 70,
    region: "north-miami",
    featured: false,
    productPageHref: "/services/yachts/70-sunreef-supreme",
    cardCoverSrc: "/yachts/70sunreefsupreme/70sunreefsupreme.jpg",
    capacityGuests: 13,
    staterooms: 3,
    bathrooms: 3,
    location: "Bill Bird Marina (10800 Collins Ave, Miami Beach, FL 33154)",
    aboutTagline: "70′ Sunreef Supreme – Luxury, Adventure, and Miami’s Finest Waters",
    aboutQuote:
      "Vibrant energy, unparalleled luxury, and memories that last a lifetime—guaranteed.",
    description: `Step aboard the 70′ Sunreef Supreme, also known as the 70′ Sunreef PowerCat, departing from Bill Bird Marina (10800 Collins Ave, Miami Beach, FL 33154), and experience a new standard of luxury yachting. This extraordinary catamaran blends bold innovation, eco-conscious engineering, and unrivaled comfort to create an unforgettable journey on the waters of Miami.

From the moment you step on deck, expansive living areas invite you to unwind in absolute style. Foldout balconies, sun-drenched lounging spaces, and seamless interior flow provide the perfect environment to relax, entertain, or simply soak in the breathtaking surroundings. The commanding flybridge is a true showstopper, thoughtfully designed to accommodate a spa pool, cocktail bar, and generous sunning areas, delivering the ultimate open-air retreat.

Every detail of the 70′ Sunreef Supreme reflects meticulous craftsmanship and a commitment to sustainability. Teak-free decking, natural materials, and Sunreef’s advanced electric propulsion system, paired with Solar Skin 3.0 technology, allow for silent, emission-free cruising without compromising performance or luxury. Glide across the waves with precision, indulge in eco-conscious elegance, and savor every moment of life at sea.

More than a yacht, the 70′ Sunreef Supreme is a floating sanctuary of sophistication, style, and adventure. Whether you’re hosting an intimate gathering, celebrating a special occasion, or simply chasing the horizon, this power catamaran promises an experience that is as exhilarating as it is indulgent—a true testament to the future of luxury yachting.`,
    highlights: [
      "Bill Bird Marina · up to 13 guests cruising",
      "3 staterooms · 3 baths · flybridge & foldout balconies",
      "PowerCat layout · tax & gratuity on this page",
    ],
    inclusions: [
      "Fully inspected yacht",
      "Licensed captain & crew",
      "Local fuel",
      "Water, sodas & ice",
    ],
    policyNotes: [
      "Charter rates are quoted before tax. A 7% state tax and crew gratuity apply — use the calculator on this page for an estimate.",
      "Final routing, dock fees, fuel surcharges, and inclusions are confirmed in your written proposal.",
      "Availability changes by season; your inquiry locks the current quote window.",
    ],
    priceTiers: [
      {
        durationLabel: "4 hours",
        amount: "$7,000",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
      {
        durationLabel: "6 hours",
        amount: "$8,500",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
      {
        durationLabel: "8 hours",
        amount: "$10,000",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
    ],
    galleryCount: 19,
  },
  {
    id: "100-dominator",
    catalogOrder: 36,
    name: "100 Dominator",
    subtitle: "100′ Dominator · Miami Beach Marina",
    cardPriceLine: "From $6,500 · 4 hrs",
    listingPriceUsd: 6_500,
    lengthFt: 100,
    region: "miami",
    featured: false,
    productPageHref: "/services/yachts/100-dominator",
    cardCoverSrc: "/yachts/100dominator/100dominator.jpg",
    capacityGuests: 13,
    staterooms: 4,
    bathrooms: 4,
    location: "Miami Beach Marina",
    aboutTagline: "Ocean Majesty: 100′ DOMINATOR – Reign Over the Waves",
    aboutQuote: "Bigger flybridge. Bolder views. Your kingdom awaits.",
    description: `Step aboard the 100′ DOMINATOR, docked at the prestigious Miami Beach Marina, and discover a yacht that truly lives up to its name. This striking vessel combines bold design with refined luxury, offering the perfect setting for upscale celebrations, cherished family moments, or laid-back days at sea. Whether you’re cruising under the sun or anchored under the stars, the Dominator makes every occasion feel like a private escape into elegance.

Inside, you’ll find deluxe interiors designed for both comfort and style, complete with a fully equipped gourmet kitchen for everything from chef-prepared meals to fresh oceanfront bites. Thoughtfully designed lighting throughout the yacht—inside and out—sets the perfect ambiance, while panoramic windows frame every unforgettable view. From cocktail hour to quiet sunset moments, it’s made to impress.

Above deck, you’ll be amazed by the 120′ yacht-sized flybridge, one of the largest in its class, perfect for sunbathing, mingling, or enjoying the bow Jacuzzi with a chilled drink in hand. Fire up the XL BBQ grill, launch off into the water toys, or simply soak in the salt air. This is your floating paradise—tailored for fun, luxury, and total freedom.

Your charter includes a deluxe, fully-equipped kitchen, bow Jacuzzi, XL BBQ grill, unique custom lighting throughout, a massive flybridge, a 16′ Zodiac tender with 150hp, 2 standup paddleboards, water skis, a wakeboard, a kayak, and a large watermat. Also included are a licensed captain and crew, local fuel, water, sodas, and ice. No need for add-ons—everything you need for an extraordinary yacht day is already onboard.`,
    highlights: [
      "Miami Beach Marina · up to 13 guests cruising",
      "4 staterooms · 4 baths · gourmet galley & panoramic windows",
      "Bow Jacuzzi, XL BBQ, oversized flybridge & full toy list — see inclusions",
      "Tax & gratuity — use the estimate panel on this page",
    ],
    inclusions: [
      "Fully inspected yacht",
      "Licensed captain & crew",
      "Local fuel",
      "Water, sodas & ice",
      "Bow Jacuzzi",
      "XL BBQ grill",
      "Unique custom lighting inside and out",
      "120′ yacht-sized flybridge",
      "16′ Zodiac tender with 150hp",
      "2 standup paddleboards",
      "Large water mat, water skis, wakeboard",
      "Kayak",
    ],
    policyNotes: [
      "Charter rates are quoted before tax. A 7% state tax and crew gratuity apply — use the calculator on this page for an estimate.",
      "Final routing, dock fees, fuel surcharges, and inclusions are confirmed in your written proposal.",
      "Availability changes by season; your inquiry locks the current quote window.",
    ],
    priceTiers: [
      {
        durationLabel: "4 hours",
        amount: "$6,500",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
      {
        durationLabel: "6 hours",
        amount: "$8,000",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
      {
        durationLabel: "8 hours",
        amount: "$9,500",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
    ],
    galleryCount: 15,
  },
  mergedFleetEntry(37, "110-horizon", "110 Horizon", 110),
  mergedFleetEntry(38, "56-lagoon-nassau", "56 Lagoon Nassau", 56, "bahamas"),
  mergedFleetEntry(39, "70-azimut-2023", "70 Azimut 2023", 70),
  mergedFleetEntry(40, "80-azimut-s8", "80 Azimut S8", 80),
  mergedFleetEntry(41, "105-aqua", "105 Aqua", 105),
  mergedFleetEntry(42, "66-azimut-2018", "66 Azimut 2018", 66),
  mergedFleetEntry(43, "88-azimut-sati", "88 Azimut Sati", 88),
  mergedFleetEntry(44, "70-azimut-lupo-ii", "70 Azimut Lupo II", 70),
  mergedFleetEntry(45, "90-azimut-day-dreamin", "90 Azimut Day Dreamin'", 90),
  mergedFleetEntry(46, "74-princess", "74 Princess", 74),
  mergedFleetEntry(47, "84-sunseeker", "84 Sunseeker", 84),
  mergedFleetEntry(48, "80-sunseeker", "80 Sunseeker", 80),
  mergedFleetEntry(49, "70-azimut-le-grand-bleu", "70 Azimut Le Grand Bleu", 70),
  mergedFleetEntry(50, "88-sunseeker", "88 Sunseeker", 88),
  mergedFleetEntry(51, "70-azimut-211", "70 Azimut 211", 70),
  mergedFleetEntry(52, "60-azimut-freedom", "60 Azimut Freedom", 60),
  mergedFleetEntry(53, "62-pershing", "62 Pershing", 62),
  mergedFleetEntry(54, "70-aicon", "70 Aicon", 70),
  mergedFleetEntry(55, "66-marquis", "66 Marquis", 66),
  mergedFleetEntry(56, "43-pardo-2021", "43 Pardo 2021", 43),
  mergedFleetEntry(57, "57-azimut-thales", "57 Azimut Thales", 57),
  mergedFleetEntry(58, "55-azimut-azure", "55 Azimut Azure", 55),
  mergedFleetEntry(59, "38-pardo-2023", "38 Pardo 2023", 38),
  mergedFleetEntry(60, "52-beneteau-fly", "52 Beneteau Fly", 52),
  mergedFleetEntry(61, "48-cruiser-sport", "48 Cruiser Sport", 48),
  mergedFleetEntry(62, "44-sea-ray-sea-daze", "44 Sea Ray Sea Daze", 44),
  {
    id: "50-searay-fly-one-love",
    catalogOrder: 63,
    name: "50′ Sea Ray Fly — One Love",
    subtitle: "50′ Sea Ray Fly",
    cardPriceLine: "From $1,500 · 4 hrs",
    listingPriceUsd: 1_500,
    lengthFt: 50,
    region: "miami",
    productPageHref: "/services/yachts/50-searay-fly-one-love",
    cardCoverSrc: "/yachts/50searayflyonelove/50searayflyonelove.png",
    capacityGuests: 13,
    location: "Miami-area departure — confirmed on booking",
    aboutTagline: "50′ Sea Ray Fly — One Love",
    description: `Step aboard the 50′ Sea Ray Fly One Love for a laid-back day on the water with room for your whole group — up to 13 guests cruising. Enjoy your playlist on the Bluetooth sound system, spread out on the floating water mat, and let the crew handle the rest.

Your charter includes a USCG-licensed captain, mate/crew, a large cooler with ice, fuel on standard routing as quoted, and the essentials for a smooth Miami-area day charter. Rates below are the charter base before tax; Florida sales tax (7%) and crew gratuity (your choice of percentage) are broken out in the estimate panel.`,
    highlights: [
      "Up to 13 guests cruising",
      "USCG-licensed captain · mate/crew",
      "Cooler & ice · fuel (standard routing) · Bluetooth sound · floating water mat",
      "Tax & gratuity — use the calculator on this page",
    ],
    inclusions: [
      "USCG licensed captain",
      "Mate/crew",
      "Large cooler",
      "Ice",
      "Fuel (standard routing as quoted)",
      "Bluetooth sound system",
      "Floating water mat",
    ],
    policyNotes: [
      "Charter rates are quoted before tax. A 7% state tax and crew gratuity apply — use the calculator on this page for an estimate.",
      "Final routing, dock fees, fuel surcharges, and inclusions are confirmed in your written proposal.",
    ],
    priceTiers: [
      {
        durationLabel: "4 hours",
        amount: "$1,500",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
      {
        durationLabel: "6 hours",
        amount: "$2,000",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
    ],
    galleryCount: 9,
  },
  {
    id: "60-ferretti-catalaya",
    catalogOrder: 64,
    name: "60′ Ferretti — Catalaya",
    subtitle: "60′ Ferretti",
    cardPriceLine: "From $2,200 · 4 hrs",
    listingPriceUsd: 2_200,
    lengthFt: 60,
    region: "miami",
    productPageHref: "/services/yachts/60-ferretti-catalaya",
    cardCoverSrc: "/yachts/60ferretticatalaya/60ferretticatalaya.png",
    capacityGuests: 13,
    location: "Miami-area departure — confirmed on booking",
    aboutTagline: "60′ Ferretti — Catalaya",
    description: `The 60′ Ferretti Catalaya offers generous deck space and Italian styling for your Miami-area day charter — up to 13 guests cruising. Relax with your playlist on the Bluetooth sound system, cool drinks from the large cooler, and time on the floating water mat while captain and crew run the day.

Your charter includes a USCG-licensed captain, mate/crew, cooler and ice, fuel on standard routing as quoted, and the listed amenities. Charter rates below are before tax; Florida sales tax (7%) and crew gratuity (select a percentage) are shown in the estimate panel.`,
    highlights: [
      "Up to 13 guests cruising",
      "USCG-licensed captain · mate/crew",
      "Cooler & ice · fuel (standard routing) · Bluetooth sound · floating water mat",
      "4, 6 & 8 hr tiers — tax & gratuity on this page",
    ],
    inclusions: [
      "USCG licensed captain",
      "Mate/crew",
      "Large cooler",
      "Ice",
      "Fuel (standard routing as quoted)",
      "Bluetooth sound system",
      "Floating water mat",
    ],
    policyNotes: [
      "Charter rates are quoted before tax. A 7% state tax and crew gratuity apply — use the calculator on this page for an estimate.",
      "Final routing, dock fees, fuel surcharges, and inclusions are confirmed in your written proposal.",
    ],
    priceTiers: [
      {
        durationLabel: "4 hours",
        amount: "$2,200",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
      {
        durationLabel: "6 hours",
        amount: "$2,600",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
      {
        durationLabel: "8 hours",
        amount: "$3,200",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
    ],
    galleryCount: 14,
  },
  {
    id: "70-azimut-andiamo",
    catalogOrder: 65,
    name: "70′ Azimut — Andiamo",
    subtitle: "70′ Azimut",
    cardPriceLine: "From $2,500 · 4 hrs",
    listingPriceUsd: 2_500,
    lengthFt: 70,
    region: "miami",
    productPageHref: "/services/yachts/70-azimut-andiamo",
    cardCoverSrc: "/yachts/70azimutandiamo/70azimutandiamo.png",
    capacityGuests: 13,
    location: "Miami-area departure — confirmed on booking",
    aboutTagline: "70′ Azimut — Andiamo",
    description: `The 70′ Azimut Andiamo brings Italian flybridge style and space for your group — up to 13 guests cruising. Unwind in the jacuzzi, cue up music on the Bluetooth sound system, and enjoy cooler service and the floating water mat while the crew runs a smooth Miami-area charter.

Your charter includes a USCG-licensed captain, mate/crew, cooler and ice, fuel on standard routing as quoted, and the listed amenities. Charter rates below are before tax; Florida sales tax (7%) and crew gratuity (select a percentage) are shown in the estimate panel.`,
    highlights: [
      "Up to 13 guests cruising",
      "USCG-licensed captain · mate/crew",
      "Jacuzzi · cooler & ice · fuel (standard routing) · Bluetooth sound · floating water mat",
      "Tax & gratuity — use the calculator on this page",
    ],
    inclusions: [
      "USCG licensed captain",
      "Mate/crew",
      "Large cooler",
      "Ice",
      "Fuel (standard routing as quoted)",
      "Bluetooth sound system",
      "Floating water mat",
      "Jacuzzi",
    ],
    policyNotes: [
      "Charter rates are quoted before tax. A 7% state tax and crew gratuity apply — use the calculator on this page for an estimate.",
      "Final routing, dock fees, fuel surcharges, and inclusions are confirmed in your written proposal.",
    ],
    priceTiers: [
      {
        durationLabel: "4 hours",
        amount: "$2,500",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
      {
        durationLabel: "6 hours",
        amount: "$3,200",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
    ],
    galleryCount: 14,
  },
  {
    id: "55-searay-fly-miami-mistress",
    catalogOrder: 66,
    name: "55′ Sea Ray Fly — Miami Mistress",
    subtitle: "55′ Sea Ray Fly",
    cardPriceLine: "From $1,500 · 4 hrs",
    listingPriceUsd: 1_500,
    lengthFt: 55,
    region: "miami",
    productPageHref: "/services/yachts/55-searay-fly-miami-mistress",
    cardCoverSrc: "/yachts/55searayflymiamimistress/55searayflymiamimistress.png",
    capacityGuests: 13,
    location: "Miami-area departure — confirmed on booking",
    aboutTagline: "55′ Sea Ray Fly — Miami Mistress",
    description: `The 55′ Sea Ray Fly Miami Mistress is built for easy entertaining on the water — up to 13 guests cruising. Bluetooth sound, a large cooler with ice, and a floating water mat pair with a USCG-licensed captain and mate/crew for a smooth Miami-area day charter.

Charter rates below are the base before tax; Florida sales tax (7%) and crew gratuity (select a percentage) are shown in the estimate panel.`,
    highlights: [
      "Up to 13 guests cruising",
      "USCG-licensed captain · mate/crew",
      "Cooler & ice · fuel (standard routing) · Bluetooth sound · floating water mat",
      "Tax & gratuity — use the calculator on this page",
    ],
    inclusions: [
      "USCG licensed captain",
      "Mate/crew",
      "Large cooler",
      "Ice",
      "Fuel (standard routing as quoted)",
      "Bluetooth sound system",
      "Floating water mat",
    ],
    policyNotes: [
      "Charter rates are quoted before tax. A 7% state tax and crew gratuity apply — use the calculator on this page for an estimate.",
      "Final routing, dock fees, fuel surcharges, and inclusions are confirmed in your written proposal.",
    ],
    priceTiers: [
      {
        durationLabel: "4 hours",
        amount: "$1,500",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
      {
        durationLabel: "6 hours",
        amount: "$2,500",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
    ],
    galleryCount: 12,
  },
  {
    id: "50-searay-salty",
    catalogOrder: 67,
    name: "50′ Sea Ray — Salty",
    subtitle: "50′ Sea Ray",
    cardPriceLine: "From $1,500 · 4 hrs",
    listingPriceUsd: 1_500,
    lengthFt: 50,
    region: "miami",
    productPageHref: "/services/yachts/50-searay-salty",
    cardCoverSrc: "/yachts/50searaysalty/50searaysalty.png",
    capacityGuests: 13,
    location: "Miami-area departure — confirmed on booking",
    aboutTagline: "50′ Sea Ray — Salty",
    description: `The 50′ Sea Ray Salty is set up for relaxed Miami-area days on the water — up to 13 guests cruising. Bluetooth sound, cooler and ice, and a floating water mat pair with a USCG-licensed captain and mate/crew.

Charter rates below are the base before tax; Florida sales tax (7%) and crew gratuity (select a percentage) are shown in the estimate panel.`,
    highlights: [
      "Up to 13 guests cruising",
      "USCG-licensed captain · mate/crew",
      "Cooler & ice · fuel (standard routing) · Bluetooth sound · floating water mat",
      "Tax & gratuity — use the calculator on this page",
    ],
    inclusions: [
      "USCG licensed captain",
      "Mate/crew",
      "Large cooler",
      "Ice",
      "Fuel (standard routing as quoted)",
      "Bluetooth sound system",
      "Floating water mat",
    ],
    policyNotes: [
      "Charter rates are quoted before tax. A 7% state tax and crew gratuity apply — use the calculator on this page for an estimate.",
      "Final routing, dock fees, fuel surcharges, and inclusions are confirmed in your written proposal.",
    ],
    priceTiers: [
      {
        durationLabel: "4 hours",
        amount: "$1,500",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
      {
        durationLabel: "6 hours",
        amount: "$2,000",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
    ],
    galleryCount: 11,
  },
  {
    id: "90-sunseeker-mistrial",
    catalogOrder: 68,
    name: "90′ Sunseeker — Mistrial",
    subtitle: "90′ Sunseeker",
    cardPriceLine: "From $3,200 · 4 hrs",
    listingPriceUsd: 3_200,
    lengthFt: 90,
    region: "miami",
    productPageHref: "/services/yachts/90-sunseeker-mistrial",
    cardCoverSrc: "/yachts/90sunseekermistrial/90sunseekermistrial.png",
    capacityGuests: 13,
    location: "Miami-area departure — confirmed on booking",
    aboutTagline: "90′ Sunseeker — Mistrial",
    description: `The 90′ Sunseeker Mistrial delivers Sunseeker performance and generous deck space for your Miami-area day charter — up to 13 guests cruising. Cooler service, Bluetooth sound, and a floating water mat pair with a USCG-licensed captain and mate/crew.

Charter rates below are the base before tax; Florida sales tax (7%) and crew gratuity (select a percentage) are shown in the estimate panel.`,
    highlights: [
      "Up to 13 guests cruising",
      "USCG-licensed captain · mate/crew",
      "Cooler & ice · fuel (standard routing) · Bluetooth sound · floating water mat",
      "4, 6 & 8 hr tiers — tax & gratuity on this page",
    ],
    inclusions: [
      "USCG licensed captain",
      "Mate/crew",
      "Large cooler",
      "Ice",
      "Fuel (standard routing as quoted)",
      "Bluetooth sound system",
      "Floating water mat",
    ],
    policyNotes: [
      "Charter rates are quoted before tax. A 7% state tax and crew gratuity apply — use the calculator on this page for an estimate.",
      "Final routing, dock fees, fuel surcharges, and inclusions are confirmed in your written proposal.",
    ],
    priceTiers: [
      {
        durationLabel: "4 hours",
        amount: "$3,200",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
      {
        durationLabel: "6 hours",
        amount: "$4,100",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
      {
        durationLabel: "8 hours",
        amount: "$6,200",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
    ],
    galleryCount: 17,
  },
  {
    id: "68-azimut",
    catalogOrder: 69,
    name: "68′ Azimut — Cerulean",
    subtitle: "68′ Azimut",
    cardPriceLine: "From $3,200 · 4 hrs",
    listingPriceUsd: 3_200,
    lengthFt: 68,
    region: "miami",
    productPageHref: "/services/yachts/68-azimut",
    cardCoverSrc: "/yachts/68azimut/68azimut.webp",
    capacityGuests: 13,
    staterooms: 4,
    location: "Miami-area departure — confirmed on booking",
    aboutTagline: "Cerulean — 68′ Azimut",
    aboutQuote: "The largest flybridge in her class — Italian detail from bow to stern.",
    description: `About Cerulean

The largest flybridge space in her class is just the start for this luxurious Azimut yacht. Stand out from the crowd on board this beautiful and modern 68′ Azimut. Her stunning beauty resonates but the quality is in the details. Comfort, safety, technology and elegance all attribute to the Italian ingenuity that can be seen throughout this gorgeous model. Her attractive hardtop is made versatile thanks to a retractable sunroof.

Everything on this Azimut is amplified: more space and unparalleled livability offered by a 28 m² flybridge, the largest in its category. Three separate areas make this the ideal place to enjoy unique experiences in complete freedom and privacy. Azimut also appointed an extremely generous area for the cockpit and her large overhang that created the extra large bridge. Space above provides tremendous shade overhead — perfect for al fresco dining or cocktails over an evening sunset or champagne cruise. Inside the ample saloon, formal dining is found midships, centered on a well-appointed galley complete with bar. The lounge space makes best use of the elongated flybridge over the prow. The saloon exudes Azimut style, with luxe couches, a formal dining area for six, and the ubiquitous pop-up TV.

The accommodation below deck makes the most of the yacht’s volume, creating space for four cabins with no option to significantly alter that plan. It’s the foredeck that seals the deal with seating for eight and two very wide sunbeds — all achieved without encroaching on the walkways to and from the bow.`,
    highlights: [
      "Up to 13 guests cruising · 4 staterooms below deck",
      "28 m² flybridge · retractable hardtop sunroof · generous cockpit & bridge shade",
      "Saloon dining for six · well-appointed galley & bar · pop-up TV",
      "Foredeck lounge & twin wide sunbeds · charter math on this page (tax & gratuity)",
    ],
    inclusions: [
      "Private captain",
      "Stewardess",
      "VIP marina lounge pre-boarding",
      "Responsible and sanitized charter procedures",
      "Sodas selection",
      "Ice, water and tableware",
      "Towel services for all guests",
      "Trip fuel (standard routing as quoted)",
      "Floating mat · 2 paddle boards · snorkel gear · water toys",
    ],
    policyNotes: [
      "Charter rates on this page are before tax. Florida sales tax (7%) and crew gratuity apply — use the calculator for an estimate; your written proposal confirms final taxes, fees, and routing.",
      "Final dock fees, fuel surcharges outside standard routing, and seasonal adjustments are confirmed in your Blackline proposal.",
    ],
    priceTiers: [
      {
        durationLabel: "4 hours",
        amount: "$3,200",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
      {
        durationLabel: "6 hours",
        amount: "$3,700",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
    ],
    galleryCount: 12,
  },
  {
    id: "45-sunseeker-la-pedro",
    catalogOrder: 70,
    name: "45′ Sunseeker — La Pedro",
    subtitle: "45′ Sunseeker · Venetian Marina",
    cardPriceLine: "From $1,250 · 4 hrs",
    listingPriceUsd: 1_250,
    lengthFt: 45,
    region: "north-miami",
    productPageHref: "/services/yachts/45-sunseeker-la-pedro",
    cardCoverSrc: "/yachts/45sunseekerlapedro/45sunseekerlapedro.JPG",
    capacityGuests: 12,
    location: "Venetian Marina — confirmed on booking",
    aboutTagline: "La Pedro — 45′ Sunseeker",
    description: `Charter the 45′ Sunseeker La Pedro from Venetian Marina for a crewed day on the water. Rates below are the charter base before add-ons; Florida sales tax (7% on the charter) and crew gratuity (your choice of 15%, 18%, 20%, or 22% on the charter) follow the same math as the rest of the Blackline fleet — use the estimate panel on this page for live totals.

Indicative all-in estimates (charter + tax + gratuity): 4 hours about $1,526–$1,613; 6 hours about $1,830–$1,935; 8 hours about $2,684–$2,838 — depending on gratuity tier. Your written proposal confirms final taxes, fees, and routing.`,
    highlights: [
      "Venetian Marina · up to 12 guests cruising",
      "USCG-licensed captain & crew — day charter coordination through Blackline",
      "4, 6 & 8 hr published tiers — tax & gratuity on this page",
    ],
    inclusions: [
      "USCG licensed captain",
      "Crew",
      "Standard charter inclusions as quoted",
    ],
    policyNotes: [
      "Charter rates are quoted before tax. A 7% state tax and crew gratuity apply — use the calculator on this page for an estimate.",
      "Final routing, dock fees, fuel surcharges, and inclusions are confirmed in your written proposal.",
    ],
    priceTiers: [
      {
        durationLabel: "4 hours",
        amount: "$1,250",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
      {
        durationLabel: "6 hours",
        amount: "$1,500",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
      {
        durationLabel: "8 hours",
        amount: "$2,200",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
    ],
    galleryCount: 8,
  },
  {
    id: "58-azimut-letz-go",
    catalogOrder: 71,
    name: "58′ Azimut — Letz Go",
    subtitle: "58′ Azimut",
    cardPriceLine: "From $1,900 · 4 hrs",
    listingPriceUsd: 1_900,
    lengthFt: 58,
    region: "miami",
    productPageHref: "/services/yachts/58-azimut-letz-go",
    cardCoverSrc: "/yachts/58azimutletzgo/58azimutletzgo.jpeg",
    capacityGuests: 13,
    location: "Miami-area departure — confirmed on booking",
    aboutTagline: "Letz Go — 58′ Azimut",
    description: `Crewed day charter on the 58′ Azimut Letz Go — rates below are the charter base before add-ons. Florida sales tax (7% on the charter) and crew gratuity (15%, 18%, 20%, or 22% on the charter) match the standard Blackline calculator on this page.

Indicative all-in estimates (charter + tax + gratuity): 4 hours about $2,318–$2,451; 6 hours about $2,806–$2,967 — depending on gratuity tier. Your written proposal confirms final taxes, fees, and routing.`,
    highlights: [
      "Up to 13 guests cruising",
      "Licensed captain & crew — day charter through Blackline",
      "4 & 6 hr published tiers — tax & gratuity on this page",
    ],
    inclusions: [
      "Licensed captain",
      "Crew",
      "Standard charter inclusions as quoted",
    ],
    policyNotes: [
      "Charter rates are quoted before tax. A 7% state tax and crew gratuity apply — use the calculator on this page for an estimate.",
      "Final routing, dock fees, fuel surcharges, and inclusions are confirmed in your written proposal.",
    ],
    priceTiers: [
      {
        durationLabel: "4 hours",
        amount: "$1,900",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
      {
        durationLabel: "6 hours",
        amount: "$2,300",
        note: "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal",
      },
    ],
    galleryCount: 14,
  },
];

/** Vessels that can be selected in the custom package / WhatsApp builder (excludes catalog placeholders). */
export const YACHTS_QUOTABLE: readonly Yacht[] = YACHTS.filter(
  (y) => !y.hideFromQuoteBuilder,
);

/** Thumbnails for the photography add-on strip (`public/photography/yachtphotos/`). */
export const YACHT_PHOTO_ADDON_IMAGES = [
  {
    src: "/photography/yachtphotos/yachtphoto1.jpg",
    alt: "Yacht charter — shoot still",
  },
  {
    src: "/photography/yachtphotos/yachtphoto2.png",
    alt: "On deck — shoot still",
  },
  {
    src: "/photography/yachtphotos/yachtphoto3.png",
    alt: "Yacht on the water — shoot still",
  },
] as const;
