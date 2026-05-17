import type { ClientMomentSlide } from "@/components/client-moments-carousel";

export type PrivateChefProfile = {
  id: string;
  name: string;
  role: string;
  bio: string;
  highlights: readonly string[];
  image: string;
  imageAlt: string;
  available: boolean;
};

/** Drop assets into `public/privatechefs/` and swap URLs here when ready. */
export const PRIVATE_CHEFS_HERO_IMAGE =
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=88&w=2400";

export const PRIVATE_CHEF_SERVICE_CARDS = [
  {
    id: "private-chef",
    eyebrow: "On your schedule",
    title: "Your private chef",
    description:
      "Hire a dedicated chef for a single dinner, a full weekend at the villa, or the length of your charter — timed to your party, dietary needs, and service style.",
    bullets: [
      "In-villa, on-yacht, and estate kitchens — plated dinners, family-style, or tasting menus",
      "Menus built around your preferences, allergies, and wine pairings",
      "Same concierge thread as your yachts, stays, and transport",
    ],
  },
  {
    id: "travel-chef",
    eyebrow: "Beyond Miami",
    title: "Travel chef",
    description:
      "When the itinerary moves, your chef can move with you. Our travel chef holds a valid passport and can fly with your group for domestic and international bookings.",
    bullets: [
      "Fly-outs for houses, yachts, and destination events outside the U.S.",
      "Provisioning and kitchen walk-throughs coordinated before arrival",
      "Discreet, professional service from prep through cleanup",
    ],
  },
] as const;

export const PRIVATE_CHEF_VENUES = [
  "Private homes & estates",
  "Yacht charters",
  "Villa stays",
  "Celebrations & corporate events",
] as const;

export const PRIVATE_CHEFS_ROSTER: readonly PrivateChefProfile[] = [
  {
    id: "billy-crocker",
    name: "Billy Crocker",
    role: "Celebrity private chef",
    bio: "Billy Crocker brings restaurant-level cooking to private settings — from intimate villa dinners to full-service yacht charters and large-format events. Menus are tailored to your guests, your kitchen, and the rhythm of your day on the water or at home.",
    highlights: [
      "Estates, yachts, and private residences",
      "Custom menus — dietary needs and wine pairings welcome",
      "Available for Miami and travel bookings",
    ],
    image: "/privatechefs/chefs/billycrocker.png",
    imageAlt: "Billy Crocker — celebrity private chef",
    available: true,
  },
];

export const PRIVATE_CHEFS_COMING_SOON = {
  title: "More chefs joining the roster",
  description:
    "Additional private chefs — more cuisines, languages, and travel schedules — coming soon.",
} as const;

/** Placeholder slots beside active roster chefs (Meet the chefs grid). */
export const PRIVATE_CHEFS_COMING_SOON_COUNT = 3;

/** Food & experience carousel — `public/privatechefs/food/`. */
export const PRIVATE_CHEF_GALLERY_SLIDES: readonly ClientMomentSlide[] = [
  { src: "/privatechefs/food/food2.avif", alt: "Private chef dining — plated course" },
  { src: "/privatechefs/food/food3.jpg", alt: "Private chef dining — table presentation" },
  { src: "/privatechefs/food/food4.jpg", alt: "Private chef dining — chef-prepared dishes" },
  { src: "/privatechefs/food/food5.webp", alt: "Private chef dining — fine dining spread" },
  { src: "/privatechefs/food/food6.jpg", alt: "Private chef dining — celebration meal" },
  { src: "/privatechefs/food/food7.jpg", alt: "Private chef dining — yacht or villa service" },
  { src: "/privatechefs/food/food8.webp", alt: "Private chef dining — curated menu" },
];
