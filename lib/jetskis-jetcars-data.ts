/** Stills in Look & feel — Jet skis & jetcars (`public/jetski/`). */
export const JET_SKI_JETCAR_LOOK_IMAGES = [
  { src: "/jetski/jetski1.jpg", alt: "Jet ski on the water" },
  { src: "/jetski/jetski2.jpg", alt: "Jet ski on the water" },
] as const;

/** Wide strip between sections — panoramic (`public/sitephotos/miamibeach.jpg`). */
export const JETSKIS_PANORAMIC_PLACEHOLDER = {
  src: "/sitephotos/miamibeach.jpg",
  alt: "Miami Beach shoreline and ocean",
} as const;

/** Thumbnails for the photography add-on strip on the jet skis & jetcars page (`public/photography/jetskiphotos/`). */
export const JETSKIS_PHOTO_ADDON_IMAGES = [
  {
    src: "/photography/jetskiphotos/jetskiphoto1.jpg",
    alt: "Jet ski on the water — shoot still",
  },
  {
    src: "/photography/jetskiphotos/jetskiphoto2.jpg",
    alt: "Jet ski session — shoot still",
  },
  {
    src: "/photography/jetskiphotos/jetskiphoto3.jpg",
    alt: "Personal watercraft — shoot still",
  },
] as const;

/** Combined jet ski & jetcar block — South Florida hourly from-rates and service areas. */
export const JET_SKI_JETCAR_SECTION = {
  headline: "Jet skis & jetcars",
  intro: [
    "Personal watercraft along the bay and shoreline, plus high-energy amphibious jet car runs — timed and routed with your stay. Safety briefing, typical fuel, and launch coordination are folded in once your session is confirmed.",
    "Starting hourly rates are below. Exact marina or ramp, session length, group size, and add-ons are quoted when you share your dates — we reply with a clear, tailored proposal.",
  ],
  locationsLabel: "Service areas",
  locations: ["Miami Beach", "Fort Lauderdale"] as const,
  rates: [
    { label: "Jet ski — per hour (from)", price: "$150+" },
    { label: "Jetcar — per hour (from)", price: "$250+" },
  ],
  footnote:
    "Permitted zones, marina details, and any seasonal adjustments are confirmed on your booking. Contact us for availability and a firm quote.",
} as const;

export const JETSKIS_OFFERINGS = [
  {
    title: "Jet skis",
    description:
      "Bay and shoreline sessions on personal watercraft — Miami Beach and Fort Lauderdale areas, timed with your stay; safety and fuel handled upfront.",
    image: "/sitephotos/jetski3.jpg",
    imageAlt: "Jet ski on the water",
    sectionHref: "/services/jetskis-jetcars#jetskis-jetcars-look-and-feel",
    ctaLabel: "Rates & details",
  },
  {
    title: "Jetcars",
    description:
      "Amphibious jet car runs on the water — Miami Beach or Fort Lauderdale; a high-energy option for groups who want more than a standard rental.",
    image: "/sitephotos/jetcar1.webp",
    imageAlt: "Jet car on the water",
    sectionHref: "/services/jetskis-jetcars#jetcars-pricing",
    ctaLabel: "Rates & details",
  },
  {
    title: "Fishing trips",
    description:
      "Cruising, inshore flats, and offshore sport fishing — tournament-ready gear, bait, and Coast Guard–certified setups. Charter options and rates below.",
    image: "/sitephotos/fishing1.webp",
    imageAlt: "Sport fishing from a charter boat",
    sectionHref: "/services/jetskis-jetcars#fishing-charters",
    ctaLabel: "Charter options & rates",
  },
] as const;

/** Detailed fishing charter packages for the jetskis & jetcars page */
export const FISHING_CRUISING_CHARTER = {
  title: "Cruising charter",
  locations: ["Miami Beach", "Key Biscayne", "Miami River"],
  rate: "$250/hr",
} as const;

export const FISHING_INSHORE_CHARTER = {
  title: "Inshore fishing charter",
  vessel: "Skimmer Skiff 165",
  targets:
    "Tarpon, Snook, Redfish, Bonefish, Snapper, Jack",
  tiers: [
    { duration: "4 hrs", price: "$525" },
    { duration: "6 hrs", price: "$625" },
    { duration: "8–10 hrs", price: "$725" },
  ],
} as const;

export const FISHING_OFFSHORE_CHARTER = {
  title: "Offshore fishing charter",
  vessels: ["24′ Boston Whaler Outrage", "27′ Sea Pro"],
  targets:
    "Tuna, Mackerel, Jack, Sailfish, and a wide variety of bottom fish including Snapper, Grouper, and Tilefish",
  tiers: [
    { duration: "4 hrs", price: "$575" },
    { duration: "6 hrs", price: "$725" },
    { duration: "8–10 hrs", price: "$825" },
  ],
} as const;

export const FISHING_CHARTER_INCLUSIONS = [
  "All tournament-ready gear featuring Shimano, Penn, and Daiwa rods and reels.",
  "Boat comes fully prepared with bait, water, ice, and Coast Guard–certified safety equipment.",
  "Sunscreen and sunglasses available if needed.",
] as const;
