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
    image: "/sitephotos/miamibeach.jpg",
    imageAlt: "Calm water kayak scene in Miami",
    tab: "kayak",
  },
  {
    id: "sup",
    title: "Paddle board (SUP)",
    description:
      "Stand-up paddle sessions for skyline views and a relaxed pace on the bay — slotted into your stay with the same single-thread Blackline coordination.",
    priceLabel: "$40 / person · 60 min",
    image: "/sitephotos/miamibeach.jpg",
    imageAlt: "Paddle board on clear water",
    tab: "sup",
  },
  {
    id: "banana",
    title: "Banana boat",
    description:
      "High-energy, social tow rides for groups that want a splash of fun in the same waterfront window — we handle timing and partner handoff.",
    image: "/sitephotos/miamibeach.jpg",
    imageAlt: "Tropical water surface for water sports",
    tab: "banana",
  },
  {
    id: "parasailing",
    title: "Parasailing",
    description:
      "Tandem and triple flights over Biscayne Bay with meeting-time coordination, optional photo add-ons, and clear pre-ride details.",
    priceLabel: "Shared or private — from $120 / flyer",
    image: "/sitephotos/miamibeach.jpg",
    imageAlt: "Open water off Miami suitable for parasailing",
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

export const FLYSOBE_PARASAIL_URL = "https://flysobe.com/parasailing" as const;
export const FLYSOBE_HOME_URL = "https://flysobe.com/" as const;
