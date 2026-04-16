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
    name: "Rockwell Miami",
    subtitle: "VIP access",
    imageSrc: "/vipvenues/rockwell1.jpg",
    imageAlt: "Rockwell Miami",
    about:
      "Miami Beach nightclub with bottle-forward tables and a dressed-up room. Ask us about table placement for visibility vs. intimacy — we match the section to your group.",
    gallery: [
      { src: "/vipvenues/rockwell3.jpg", alt: "Rockwell Miami — additional photo 1" },
      { src: "/vipvenues/rockwell4.jpg", alt: "Rockwell Miami — additional photo 2" },
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
