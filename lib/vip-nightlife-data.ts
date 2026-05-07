/**
 * VIP Nightlife — edit names, copy, and lists here. Page layout lives in
 * `app/services/vip-nightlife/page.tsx`.
 *
 * Venue photos live in `/public/vipvenues/` — filenames match venue names (see
 * `vipFeaturedVenues` below). Each venue uses 3 images total: 1 cover on the card
 * plus 2 in `gallery` (shown after “More photos” — never duplicates the cover).
 */

export const vipNightlifeHero = {
  eyebrow: "VIP nightlife",
  headline:
    "Luxury Miami nightclubs first — beach clubs when you want day-to-night energy",
  lead:
    "Skip the guesswork at the rope. We coordinate VIP tables and preferred entry at the city's top nightclubs; when you want pool-deck or oceanfront parties, we line up beach club access too — with clear pricing and follow-through.",
} as const;

/** Main story section — short paragraphs under the headline area */
export const vipNightlifeIntro = [
  "Miami's clubs are always a good idea — if you walk in with the right setup. Tired of long lines, surprise cover charges, and promoters who vanish when you reach the door? Here, our word is our bond. We've spent years building relationships with the city's most in-demand nightclubs and late-night rooms.",
  "If you want prime sections, real bottle service, and a night that moves on your schedule — not the crowd's — this is the service for you.",
] as const;

export type VenueGalleryImage = {
  src: string;
  alt: string;
};

export type FeaturedVenue = {
  name: string;
  subtitle?: string;
  /** Path under `/public`, e.g. `/vipvenues/livmiami.jpg` */
  imageSrc: string;
  /** Describe the image for accessibility (not the venue's trademarked interior unless it's your photo). */
  imageAlt: string;
  /** Short description — shown on the card and repeated when visitors expand for more photos */
  about: string;
  /** Two extra photos in the expanded panel (cover is separate; 3 images per venue total) */
  gallery: readonly VenueGalleryImage[];
};

export const vipFeaturedVenues: readonly FeaturedVenue[] = [
  {
    name: "LIV Miami",
    subtitle: "VIP access",
    imageSrc: "/vipvenues/livmiami.jpg",
    imageAlt: "LIV Miami nightclub",
    about:
      "Iconic Fontainebleau nightclub with big-room energy, rotating headliners, and bottle service across multiple tiers. We route you past the rope with clear table minimums and timing so the night matches your group.",
    gallery: [
      { src: "/vipvenues/livmiami1.jpg", alt: "LIV Miami — additional photo 1" },
      { src: "/vipvenues/livmiami2.jpg", alt: "LIV Miami — additional photo 2" },
    ],
  },
  {
    name: "COCO Miami",
    subtitle: "VIP access",
    imageSrc: "/vipvenues/cocomiami.jpg",
    imageAlt: "COCO Miami nightclub",
    about:
      "Downtown Miami energy — bottle service, DJ-driven nights, and a dressed-up crowd. Tell us your group size and how close you want to be to the action; we lock tables and entry with clear minimums.",
    gallery: [
      { src: "/vipvenues/cocomiami1.webp", alt: "COCO Miami — additional photo 1" },
      { src: "/vipvenues/cocomiami2.webp", alt: "COCO Miami — additional photo 2" },
    ],
  },
  {
    name: "E11EVEN",
    subtitle: "VIP access",
    imageSrc: "/vipvenues/e11even.jpg",
    imageAlt: "E11EVEN Miami",
    about:
      "24/7 downtown venue with multiple rooms and formats — tell us at what time you're going and we'll align entry, sections, and pickup with your transport.",
    gallery: [
      { src: "/vipvenues/e11even1.jpg", alt: "E11EVEN — additional photo 1" },
      { src: "/vipvenues/e11even2.jpg", alt: "E11EVEN — additional photo 2" },
    ],
  },
  {
    name: "Mr. Jones",
    subtitle: "VIP access",
    imageSrc: "/vipvenues/mrjones.jpg",
    imageAlt: "Mr. Jones Miami",
    about:
      "Miami Beach nightclub with intimate-meets-late-night energy, strong bottle programming, and a crowd that dresses the part. Share your vibe — lounge tables vs. dance floor — and we'll hold the right real estate.",
    gallery: [
      { src: "/vipvenues/mrjones1.webp", alt: "Mr. Jones — additional photo 1" },
      { src: "/vipvenues/mrjones2.png", alt: "Mr. Jones — additional photo 2" },
    ],
  },
  {
    name: "Club Space",
    subtitle: "VIP access",
    imageSrc: "/vipvenues/clubspace.jpg",
    imageAlt: "Club Space Miami",
    about:
      "Legendary after-hours institution — marathon sets and a global crowd. Tell us how late you're going; we align entry, re-entry, and pickup when the sun comes up.",
    gallery: [
      { src: "/vipvenues/clubspace1.jpg", alt: "Club Space — additional photo 1" },
      { src: "/vipvenues/clubspace3.jpg", alt: "Club Space — additional photo 2" },
    ],
  },
  {
    name: "Vendome",
    subtitle: "VIP access",
    imageSrc: "/vipvenues/rockwell1.jpg",
    imageAlt: "Vendome",
    about:
      "Miami Beach nightclub with bottle-forward tables and a dressed-up room. Ask us about table placement for visibility vs. intimacy — we match the section to your group.",
    gallery: [
      { src: "/vipvenues/rockwell3.jpg", alt: "Vendome — additional photo 1" },
      { src: "/vipvenues/rockwell4.jpg", alt: "Vendome — additional photo 2" },
    ],
  },
  {
    name: "M2 Miami",
    subtitle: "VIP access",
    imageSrc: "/vipvenues/m2miami.jpg",
    imageAlt: "M2 Miami",
    about:
      "South Beach nightclub with big-room energy, DJ-driven nights, and bottle service across the floor. Tell us your group size and how close you want to the stage — we lock tables and entry with clear minimums.",
    gallery: [
      { src: "/vipvenues/m2miami1.jpg", alt: "M2 Miami — additional photo 1" },
      { src: "/vipvenues/m2miami2.jpg", alt: "M2 Miami — additional photo 2" },
    ],
  },
  {
    name: "Nikki Beach Miami",
    subtitle: "Beach club",
    imageSrc: "/vipvenues/nikkibeach1.webp",
    imageAlt: "Nikki Beach Miami",
    about:
      "Day-to-night beach club on the sand — pool decks, daybeds, and DJ-driven afternoons that roll into sunset bottles. Ideal when you want ocean air before the late-night clubs.",
    gallery: [
      { src: "/vipvenues/nikkibeach2.webp", alt: "Nikki Beach Miami — additional photo 1" },
      { src: "/vipvenues/nikkibeach3.webp", alt: "Nikki Beach Miami — additional photo 2" },
    ],
  },
  {
    name: "Joia Beach",
    subtitle: "Beach club",
    imageSrc: "/vipvenues/joiabeach1.jpg",
    imageAlt: "Joia Beach Miami",
    about:
      "Beachfront day club energy — cabanas, DJs, and bottle service with your feet in the sand. We line up entry and table minimums so the afternoon matches your group.",
    gallery: [
      { src: "/vipvenues/joiabeach2.webp", alt: "Joia Beach — additional photo 1" },
      { src: "/vipvenues/joiabeach3.jpg", alt: "Joia Beach — additional photo 2" },
    ],
  },
  // New venues (photos coming soon)
  {
    name: "Mona",
    subtitle: "VIP access",
    imageSrc: "/vipvenues/mona1.jpg",
    imageAlt: "Mona Miami",
    about:
      "Intimate, late-night room with a dressed-up crowd and bottle-forward tables. Tell us your group size and preferred time; we’ll coordinate entry and table placement with clear minimums.",
    gallery: [
      { src: "/vipvenues/mona2.jpg", alt: "Mona — additional photo 1" },
      { src: "/vipvenues/mona3.jpg", alt: "Mona — additional photo 2" },
    ],
  },
  {
    name: "Madclub",
    subtitle: "VIP access",
    imageSrc: "/vipvenues/madclub1.jpg",
    imageAlt: "Madclub Miami",
    about:
      "High-energy nightclub setup with VIP sections and bottle service. We align arrival time, table placement, and transport so the night runs smoothly for your group.",
    gallery: [
      { src: "/vipvenues/madclub2.jpg", alt: "Madclub — additional photo 1" },
      { src: "/vipvenues/madclub3.jpg", alt: "Madclub — additional photo 2" },
    ],
  },
  {
    name: "Palm Tree Club",
    subtitle: "Beach club",
    imageSrc: "/vipvenues/palmtreeclub1.png",
    imageAlt: "Palm Tree Club Miami",
    about:
      "Day-club energy with cabanas, tables, and bottle service — ideal for daytime celebrations that roll into sunset. We coordinate entry and table placement around your itinerary.",
    gallery: [
      { src: "/vipvenues/palmtreeclub2.jpg", alt: "Palm Tree Club — additional photo 1" },
      { src: "/vipvenues/palmtreeclub3.webp", alt: "Palm Tree Club — additional photo 2" },
    ],
  },
  {
    name: "Strawberry Moon",
    subtitle: "Beach club",
    imageSrc: "/vipvenues/strawberrymoon1.jpg",
    imageAlt: "Strawberry Moon Miami",
    about:
      "Pool-deck, day-to-night vibe with cabanas and table service — great for birthdays and group days. We confirm entry, minimums, and the right placement for your headcount.",
    gallery: [
      { src: "/vipvenues/strawberrymoon2.webp", alt: "Strawberry Moon — additional photo 1" },
      { src: "/vipvenues/strawberrymoon3.jpeg", alt: "Strawberry Moon — additional photo 2" },
    ],
  },
  {
    name: "Booby Trap on the River",
    subtitle: "VIP access",
    imageSrc: "/vipvenues/boobytrap1.jpg",
    imageAlt: "Booby Trap on the River",
    about:
      "Late-night riverfront spot with VIP seating options and bottle service. Share your group size and preferred time; we’ll coordinate entry and table setup.",
    gallery: [
      { src: "/vipvenues/boobytrap2.jpg", alt: "Booby Trap on the River — additional photo 1" },
      { src: "/vipvenues/boobytrap3.jpg", alt: "Booby Trap on the River — additional photo 2" },
    ],
  },
  {
    name: "Tootsies",
    subtitle: "VIP access",
    imageSrc: "/vipvenues/tootsies1.jpg",
    imageAlt: "Tootsies Miami",
    about:
      "Classic late-night destination — VIP seating and bottle service arranged on inquiry. We coordinate entry, seating, and timing around your night’s route and pickups.",
    gallery: [
      { src: "/vipvenues/tootsies2.jpg", alt: "Tootsies — additional photo 1" },
      { src: "/vipvenues/tootsies3.jpg", alt: "Tootsies — additional photo 2" },
    ],
  },
  {
    name: "Sexy Fish",
    subtitle: "VIP dining",
    imageSrc: "/vipvenues/sexyfish1.webp",
    imageAlt: "Sexy Fish Miami",
    about:
      "High-demand dinner room with strong nightlife crossover — perfect to anchor the evening before clubs. We coordinate reservations and VIP table requests around your timing.",
    gallery: [
      { src: "/vipvenues/sexyfish2.webp", alt: "Sexy Fish — additional photo 1" },
      { src: "/vipvenues/sexyfish3.webp", alt: "Sexy Fish — additional photo 2" },
    ],
  },
  {
    name: "Komodo",
    subtitle: "VIP dining",
    imageSrc: "/vipvenues/komodo1.jpg",
    imageAlt: "Komodo Miami",
    about:
      "Brickell staple for dinner-to-night flow — strong vibe, busy peak hours, and VIP table requests. We align reservation timing with transport and after-dinner plans.",
    gallery: [
      { src: "/vipvenues/komodo2.jpg", alt: "Komodo — additional photo 1" },
      { src: "/vipvenues/komodo3.avif", alt: "Komodo — additional photo 2" },
    ],
  },
  {
    name: "Gekko",
    subtitle: "VIP dining",
    imageSrc: "/vipvenues/gekko1.webp",
    imageAlt: "Gekko Miami",
    about:
      "Upscale dining with a nightlife-ready atmosphere. Tell us your date, headcount, and timing; we’ll coordinate reservations and VIP table requests when available.",
    gallery: [
      { src: "/vipvenues/gekko2.webp", alt: "Gekko — additional photo 1" },
      { src: "/vipvenues/gekko3.jpg", alt: "Gekko — additional photo 2" },
    ],
  },
  {
    name: "Bagatelle",
    subtitle: "VIP access",
    imageSrc: "/vipvenues/bagatelle1.avif",
    imageAlt: "Bagatelle Miami",
    about:
      "High-energy venue where dinner can turn into a party — VIP tables and entry coordinated on inquiry. We confirm minimums and the best placement for your group size.",
    gallery: [
      { src: "/vipvenues/bagatelle2.jpg", alt: "Bagatelle — additional photo 1" },
      { src: "/vipvenues/bagatelle3.jpg", alt: "Bagatelle — additional photo 2" },
    ],
  },
  {
    name: "Kiki on the River",
    subtitle: "VIP access",
    imageSrc: "/vipvenues/kikiontheriver1.jpg",
    imageAlt: "Kiki on the River Miami",
    about:
      "Riverfront favorite with a lively, nightlife-leaning atmosphere. VIP reservations arranged on inquiry — we coordinate timing, entry, and transport pickups.",
    gallery: [
      { src: "/vipvenues/kikiontheriver2.jpg", alt: "Kiki on the River — additional photo 1" },
      { src: "/vipvenues/kikiontheriver3.jpg", alt: "Kiki on the River — additional photo 2" },
    ],
  },
  {
    name: "Habibi",
    subtitle: "VIP access",
    imageSrc: "/vipvenues/habibi1.jpg",
    imageAlt: "Habibi Miami",
    about:
      "Late-night venue with VIP seating and bottle service options. Share group size and the kind of section you want; we’ll coordinate entry and table setup on inquiry.",
    gallery: [
      { src: "/vipvenues/habibi2.jpg", alt: "Habibi — additional photo 1" },
      { src: "/vipvenues/habibi3.webp", alt: "Habibi — additional photo 2" },
    ],
  },
  {
    name: "Sea Spice",
    subtitle: "VIP dining",
    imageSrc: "/vipvenues/seaspice1.jpg",
    imageAlt: "Sea Spice Miami",
    about:
      "Waterfront dining that pairs well with a full nightlife itinerary — great for early-to-mid evening plans. We coordinate reservations and timing around your transfers.",
    gallery: [
      { src: "/vipvenues/seaspice2.jpg", alt: "Sea Spice — additional photo 1" },
      { src: "/vipvenues/seaspice3.webp", alt: "Sea Spice — additional photo 2" },
    ],
  },
  {
    name: "Casa Neos",
    subtitle: "VIP access",
    imageSrc: "/vipvenues/casaneos1.webp",
    imageAlt: "Casa Neos Miami",
    about:
      "Nightlife venue with VIP table options and a dressed-up crowd. We confirm entry, minimums, and table placement on inquiry based on your headcount and timing.",
    gallery: [
      { src: "/vipvenues/casaneos2.webp", alt: "Casa Neos — additional photo 1" },
      { src: "/vipvenues/casaneos3.webp", alt: "Casa Neos — additional photo 2" },
    ],
  },
];

/** Additional club names — strip section (avoid duplicating featured venues above) */
export const vipSouthBeachClubs: readonly string[] = [
  "Mynt Lounge",
  "Treehouse",
  "Mango's",
  "Hyde Beach",
  "Ora Miami",
] as const;

export const vipTransport = {
  title: "Transportation",
  lead:
    "Move your whole group in one vehicle — tell us headcount and itinerary and we'll line up the right ride.",
  minimum: "4 hour minimum",
  options: [
    "Sprinter vans",
    "Party buses",
    "Limousines",
    "Luxury SUVs",
  ] as const,
} as const;

/** What to include when requesting a VIP table (WhatsApp / call) */
export const vipTableRequestHints: readonly string[] = [
  "Venue name & preferred night (date)",
  "Group size & occasion",
  "Budget range or bottle / table preference",
  "Any arrival time or after-party plans",
] as const;
