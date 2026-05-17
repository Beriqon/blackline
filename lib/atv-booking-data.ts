export const ATV_MEDIA = {
  hero: "/atv/atv2.webp",
  gridA: "/atv/atv1.webp",
  gridB: "/atv/atv2.webp",
  gridC: "/atv/atv3.webp",
  utvHero: "/atv/utv1.webp",
  utv2Seat: "/atv/utv-2seat.webp",
  utv4Seat: "/atv/utv-4seat.webp",
} as const;

export const ATV_TOURS = [
  {
    id: "45m",
    duration: "45 min",
    price: 115,
    unit: "per ATV",
    note: "Monday–Thursday only",
    badge: null as string | null,
    image: ATV_MEDIA.gridA,
    ridersPerMachine: 2,
  },
  {
    id: "1h",
    duration: "1 hour",
    price: 135,
    unit: "per ATV",
    note: null as string | null,
    badge: "Most popular",
    image: ATV_MEDIA.gridB,
    ridersPerMachine: 2,
  },
  {
    id: "2h",
    duration: "2 hours",
    price: 175,
    unit: "per ATV",
    note: "Extra trail time",
    badge: null as string | null,
    image: ATV_MEDIA.gridC,
    ridersPerMachine: 2,
  },
] as const;

export const UTV_TWO_SEAT = {
  id: "utv-2",
  title: "2-seat UTV",
  tagline: "Side-by-side for two",
  image: ATV_MEDIA.utv2Seat,
  seats: 2,
  badge: null as string | null,
  options: [
    { id: "1h", duration: "1 hour", price: 230 },
    { id: "2h", duration: "2 hours", price: 350 },
  ],
} as const;

export const UTV_FOUR_SEAT = {
  id: "utv-4",
  title: "4-seat UTV",
  tagline: "Great for families",
  image: ATV_MEDIA.utv4Seat,
  seats: 4,
  badge: "Best for groups",
  options: [
    { id: "1h", duration: "1 hour", price: 300 },
    { id: "2h", duration: "2 hours", price: 450 },
  ],
} as const;

export const UTV_PRODUCTS = [UTV_TWO_SEAT, UTV_FOUR_SEAT] as const;

export type AtvTourProduct = (typeof ATV_TOURS)[number];
export type UtvProduct = (typeof UTV_PRODUCTS)[number];
export type UtvDurationOption = UtvProduct["options"][number];

/** Booking dialog / cart — allows i18n-localized duration & titles from the grid. */
export type AtvTourForBooking = Omit<
  AtvTourProduct,
  "duration" | "unit" | "note" | "badge"
> & {
  duration: string;
  unit: string;
  note: string | null;
  badge: string | null;
};

export type UtvDurationOptionForBooking = {
  id: string;
  duration: string;
  price: number;
};

export type UtvForBooking = Omit<UtvProduct, "options" | "title" | "tagline"> & {
  title: string;
  tagline: string;
  options: readonly UtvDurationOptionForBooking[];
};

export type AtvBookingOffer =
  | {
      kind: "atv";
      tour: AtvTourForBooking;
    }
  | {
      kind: "utv";
      utv: UtvForBooking;
      option: UtvDurationOptionForBooking;
    };

export const ATV_BOOKING_HREF = "/services/atv";
