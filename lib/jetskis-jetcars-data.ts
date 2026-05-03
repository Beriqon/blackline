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
    src: "/onthewater/bananaboats/bananaboat1.avif",
    alt: "Banana boat ride on open water",
  },
  {
    src: "/photography/jetskiphotos/jetskiphoto2.jpg",
    alt: "Jet ski session — shoot still",
  },
  {
    src: "/onthewater/kayak/kayak1.jpeg",
    alt: "Kayak on Miami Beach waters",
  },
  {
    src: "/photography/jetskiphotos/jetskiphoto3.jpg",
    alt: "Personal watercraft — shoot still",
  },
  {
    src: "/onthewater/parasailling/parasailling1.webp",
    alt: "Parasailing over Miami Beach",
  },
  {
    src: "/photography/jetskiphotos/jetski4.jpg",
    alt: "Jet ski rider carving across the water",
  },
  {
    src: "/onthewater/paddleboard/paddleboard.jpg",
    alt: "Paddleboard session near the coast",
  },
  {
    src: "/photography/jetskiphotos/jetski5.jpg",
    alt: "Jet ski action shot on bright water",
  },
  {
    src: "/onthewater/bananaboats/bananaboat3.avif",
    alt: "Group banana boat adventure",
  },
  {
    src: "/photography/jetskiphotos/jetski6.jpeg",
    alt: "Jet ski rider in motion",
  },
  {
    src: "/onthewater/kayak/kayak2.jpg",
    alt: "Kayak route with scenic views",
  },
  {
    src: "/photography/jetskiphotos/jetski7.jpeg",
    alt: "Jet ski cruising along Miami waters",
  },
  {
    src: "/onthewater/bananaboats/bananaboat.2.avif",
    alt: "Banana boat turning over light chop",
  },
  {
    src: "/photography/jetskiphotos/jetski8.jpg",
    alt: "Close-up jet ski run",
  },
  {
    src: "/onthewater/kayak/kayak3.jpg",
    alt: "Kayak group on calm water",
  },
  {
    src: "/photography/jetskiphotos/jetski9.jpg",
    alt: "Jet ski spray and speed on the bay",
  },
  {
    src: "/photography/jetskiphotos/jetski10.jpg",
    alt: "Jet ski rental moment in Miami Beach",
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

/** Minimum advertised hourly from-rate per unit — used for multi-unit selection estimates. */
export const JETSKI_HOURLY_FROM_USD_PER_UNIT = 150;
export const JETCAR_HOURLY_FROM_USD_PER_UNIT = 250;

export const JETSKIS_OFFERINGS = [
  {
    title: "Jet skis",
    description:
      "Bay and shoreline sessions on personal watercraft — Miami Beach and Fort Lauderdale areas, timed with your stay; safety and fuel handled upfront.",
    image: "/sitephotos/jetski3.jpg",
    imageAlt: "Jet ski on the water",
    sectionHref: "/services/jetskis-jetcars?tab=pwc#jetskis-jetcars-look-and-feel",
    ctaLabel: "Rates & details",
  },
  {
    title: "Jetcars",
    description:
      "Amphibious jet car runs on the water — Miami Beach or Fort Lauderdale; a high-energy option for groups who want more than a standard rental.",
    image: "/sitephotos/jetcar1.webp",
    imageAlt: "Jet car on the water",
    sectionHref: "/services/jetskis-jetcars?tab=pwc#jetcars-pricing",
    ctaLabel: "Rates & details",
  },
  {
    title: "Fishing trips",
    description:
      "Cruising, inshore flats, and offshore sport fishing — tournament-ready gear, bait, and Coast Guard–certified setups. Charter options and rates below.",
    image: "/sitephotos/fishing1.webp",
    imageAlt: "Sport fishing from a charter boat",
    sectionHref: "/services/jetskis-jetcars?tab=fishing#fishing-charters",
    ctaLabel: "Charter options & rates",
  },
] as const;

/** Detailed fishing charter packages for the jetskis & jetcars page */
export const FISHING_CRUISING_CHARTER = {
  title: "Cruising charter",
  locations: ["Miami Beach", "Key Biscayne", "Miami River"],
  /** Shown in the rate callout — billed as fixed blocks below. */
  rate: "$250/hr",
  /** Bookable duration blocks (hourly rate × hours). */
  tiers: [
    { duration: "2 hrs", price: "$500" },
    { duration: "3 hrs", price: "$750" },
    { duration: "4 hrs", price: "$1,000" },
    { duration: "5 hrs", price: "$1,250" },
    { duration: "6 hrs", price: "$1,500" },
  ],
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
