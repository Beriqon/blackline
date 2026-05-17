export type HomeServiceItem = {
  title: string;
  description: string;
  href: string;
  image: string;
  imageAlt: string;
  badge?: string;
};

export const HOME_SERVICES: HomeServiceItem[] = [
  {
    title: "Chauffeur services",
    badge: "Most booked",
    description:
      "Mercedes-Maybach vans, executive SUVs, and VIP sprinters — professional drivers for airports, nights out, and multi-stop Miami days.",
    href: "/services/chauffeur-services",
    image: "/exoticcar/chauffeur/royalblue/ROYAL.jpg",
    imageAlt: "Mercedes-Maybach chauffeur van in royal blue finish",
  },
  {
    title: "Exotic cars",
    description:
      "Curated self-drive exotics and supercars — delivered and ready for Miami streets.",
    href: "/services/exotic-cars",
    image: "/exoticcar/lamborghini/lamborghiniurusmblack/lamborghiniurusmblack1.png",
    imageAlt: "Black exotic supercar parked at night under city lights",
  },
  {
    title: "Yacht charters",
    description:
      "Day charters and celebrations on the water — crewed, stocked, and routed.",
    href: "/services/yachts",
    image: "/yachts/166trinity/166trinity.jpg",
    imageAlt: "Superyacht charter at night with underwater hull lighting",
  },
  {
    title: "Villas & stays",
    description:
      "Private residences and estates matched to your group, dates, and standards.",
    href: "/services/villas",
    image: "/stays/soleil/soleil1.jpg",
    imageAlt: "Modern luxury villa with illuminated pool at night",
  },
  {
    title: "Private chefs",
    description:
      "In-villa and on-yacht private chefs — menus, dietary needs, and service timed to your stay.",
    href: "/services/private-chefs",
    image: "/yachts/166trinity/166trinity.jpg",
    imageAlt: "Luxury yacht entertaining and dining on the water",
  },
  {
    title: "Private jets",
    description:
      "Charter coordination for personal and corporate travel — terminals, timing, crew.",
    href: "/services/private-jets",
    image: "/privatejets/challenger605/challenger605.webp",
    imageAlt: "Luxury private jet cabin with leather seating",
  },
  {
    title: "On the water",
    description:
      "Jet skis, jetcars, parasailing, kayaks, and fishing — coordinated in one thread.",
    href: "/services/jetskis-jetcars",
    image: "/sitephotos/jetski3.jpg",
    imageAlt: "Jet ski on turquoise water at speed",
  },
  {
    title: "ATV",
    description:
      "Guided ATV and UTV trail rides — helmets, gear, and photos included.",
    href: "/services/atv",
    image: "/atv/atv1.webp",
    imageAlt: "ATV off-road ride",
  },
  {
    title: "VIP nightlife",
    description:
      "Table reservations and priority access at Miami’s most sought-after venues.",
    href: "/services/vip-nightlife",
    image: "/vipvenues/cocomiami2.webp",
    imageAlt: "Dimly lit premium bar with bottles and neon accent lighting",
  },
  {
    title: "Photo & video",
    description:
      "Camera crew on yachts, villas, nights out, and more — stills and motion on your timeline.",
    href: "/services/photographer",
    image: "/photography/Schermafbeelding 2026-04-15 165659.png",
    imageAlt: "Professional camera and lens in moody lighting",
  },
  {
    title: "Security guards",
    description:
      "Licensed armed and unarmed bodyguards — coordinated with your itinerary.",
    href: "/services/security-guards",
    image: "/sitephotos/securityguard2.jpg",
    imageAlt: "Velvet rope and evening venue entrance with soft lighting",
  },
];
