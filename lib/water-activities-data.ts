import type { WaterActivityTab } from "@/lib/water-activities-tabs";

export type WaterOverviewCard = {
  id: string;
  title: string;
  description: string;
  /** Short line shown on the overview card when pricing is fixed (matches detail tabs). */
  priceLabel?: string;
  image: string;
  imageAlt: string;
  tab: Exclude<WaterActivityTab, "overview">;
};

/** Hero / overview grid — each card switches the activity tab. */
export const WATER_OVERVIEW_CARDS: readonly WaterOverviewCard[] = [
  {
    id: "pwc",
    title: "Jet skis & jetcars",
    description:
      "Personal watercraft and amphibious jet car sessions in Miami Beach and Fort Lauderdale — timed with your stay, with clear from-rates and add-to-booking options.",
    image: "/sitephotos/jetski3.jpg",
    imageAlt: "Jet ski on the water in Miami",
    tab: "pwc",
  },
  {
    id: "kayak",
    title: "Kayak",
    description:
      "Calm, scenic paddles in the Miami Beach area with flexible time blocks, easy check-in, and routes that fit your day.",
    priceLabel: "$40 / person · 60 min",
    image: "/onthewater/kayak/kayak1.jpeg",
    imageAlt: "Kayak on calm Miami Beach waters",
    tab: "kayak",
  },
  {
    id: "sup",
    title: "Paddle board (SUP)",
    description:
      "Stand-up paddle sessions for skyline views and a relaxed pace on the bay — slotted into your stay with the same single-thread Blackline coordination.",
    priceLabel: "$40 / person · 60 min",
    image: "/onthewater/paddleboard/paddleboard.jpg",
    imageAlt: "Stand-up paddle board on clear water",
    tab: "sup",
  },
  {
    id: "banana",
    title: "Banana boat",
    description:
      "High-energy, social tow rides for groups that want a splash of fun in the same waterfront window — we handle timing and partner handoff.",
    image: "/onthewater/bananaboats/bananaboat3.avif",
    imageAlt: "Group banana boat adventure on the water",
    tab: "banana",
  },
  {
    id: "parasailing",
    title: "Parasailing",
    description:
      "Tandem and triple flights over Biscayne Bay with meeting-time coordination, optional photo add-ons, and clear pre-ride details.",
    priceLabel: "Shared or private — from $120 / flyer",
    image: "/onthewater/parasailling/parasailling1.webp",
    imageAlt: "Parasailing over Biscayne Bay off Miami Beach",
    tab: "parasailing",
  },
  {
    id: "fishing",
    title: "Fishing trips",
    description:
      "Cruising, inshore Skimmer Skiff, and offshore Boston Whaler / Sea Pro charters with tournament-ready gear, bait, and USCG safety — rates and tiers below.",
    image: "/sitephotos/fishing1.webp",
    imageAlt: "Sport fishing from a charter boat",
    tab: "fishing",
  },
] as const;

export const WATER_HERO_OVERVIEW = {
  src: "/sitephotos/miamibeach.jpg",
  alt: "Miami Beach shoreline and ocean",
} as const;

export function getWaterActivityHero(tab: WaterActivityTab): {
  src: string;
  alt: string;
} {
  if (tab === "overview") return WATER_HERO_OVERVIEW;
  const card = WATER_OVERVIEW_CARDS.find((c) => c.tab === tab);
  return card
    ? { src: card.image, alt: card.imageAlt }
    : WATER_HERO_OVERVIEW;
}

export const FLYSOBE_PARASAIL_URL = "https://flysobe.com/parasailing" as const;
export const FLYSOBE_HOME_URL = "https://flysobe.com/" as const;
