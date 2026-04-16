/**
 * Gallery for /experiences — photos from `/public` (yachts, venues, fleet, etc.).
 */
export type GalleryIconId =
  | "ship"
  | "sparkles"
  | "car"
  | "home"
  | "plane"
  | "waves"
  | "carFront"
  | "palmtree"
  | "wine";

export type GalleryPhotoItem = {
  id: string;
  caption: string;
  src: string;
  alt: string;
};

export type ExperiencesGalleryCategory = {
  id: string;
  category: string;
  blurb: string;
  icon: GalleryIconId;
  photos: readonly GalleryPhotoItem[];
};

export const experiencesGalleryCategories: readonly ExperiencesGalleryCategory[] =
  [
    {
      id: "yachts",
      category: "Yacht charters",
      blurb: "Days on the water — crewed and routed.",
      icon: "ship",
      photos: [
        {
          id: "yachts-1",
          caption: "On the water",
          src: "/photography/yachtphotos/yachtphoto1.jpg",
          alt: "Yacht on the water",
        },
        {
          id: "yachts-2",
          caption: "Azimut exterior",
          src: "/yachts/68azimuttheone/68azimuttheone1.jpg",
          alt: "68 Azimut yacht exterior",
        },
        {
          id: "yachts-3",
          caption: "Deck & horizon",
          src: "/yachts/68azimuttheone/68azimuttheone3.jpg",
          alt: "Yacht deck with ocean view",
        },
        {
          id: "yachts-4",
          caption: "Flybridge",
          src: "/yachts/68azimuttheone/68azimuttheone8.jpg",
          alt: "Yacht flybridge and seating",
        },
      ],
    },
    {
      id: "nightlife",
      category: "VIP nightlife",
      blurb: "Tables, access, and timing.",
      icon: "sparkles",
      photos: [
        {
          id: "nightlife-1",
          caption: "LIV Miami",
          src: "/vipvenues/livmiami.jpg",
          alt: "LIV Miami nightclub exterior",
        },
        {
          id: "nightlife-2",
          caption: "E11EVEN",
          src: "/vipvenues/e11even.jpg",
          alt: "E11EVEN Miami venue",
        },
        {
          id: "nightlife-3",
          caption: "M2 Miami",
          src: "/vipvenues/m2miami.jpg",
          alt: "M2 Miami nightlife venue",
        },
        {
          id: "nightlife-4",
          caption: "Coco Miami",
          src: "/vipvenues/cocomiami.jpg",
          alt: "Coco Miami club exterior",
        },
      ],
    },
    {
      id: "cars",
      category: "Exotic cars",
      blurb: "Fleet moments and arrivals.",
      icon: "car",
      photos: [
        {
          id: "cars-1",
          caption: "Fleet",
          src: "/photography/carphotos/carphoto1.jpg",
          alt: "Exotic sports car",
        },
        {
          id: "cars-2",
          caption: "On location",
          src: "/photography/carphotos/carphoto5.jpg",
          alt: "Luxury car photography",
        },
        {
          id: "cars-3",
          caption: "Huracán",
          src: "/exoticcar/lamborghini/huracanwhite/huracanwhite.webp",
          alt: "White Lamborghini Huracán",
        },
        {
          id: "cars-4",
          caption: "Detail",
          src: "/photography/carphotos/carphoto8.jpg",
          alt: "Exotic car detail shot",
        },
      ],
    },
    {
      id: "villas",
      category: "Villas & stays",
      blurb: "Estates matched to your group.",
      icon: "home",
      photos: [
        {
          id: "villas-1",
          caption: "Joia Beach",
          src: "/vipvenues/joiabeach1.jpg",
          alt: "Joia Beach venue and palm trees",
        },
        {
          id: "villas-2",
          caption: "Nikki Beach",
          src: "/vipvenues/nikkibeach1.webp",
          alt: "Nikki Beach Miami",
        },
        {
          id: "villas-3",
          caption: "Miami shoreline",
          src: "/sitephotos/miamibeach.jpg",
          alt: "Miami Beach shoreline",
        },
        {
          id: "villas-4",
          caption: "Waterfront",
          src: "/vipvenues/joiabeach3.jpg",
          alt: "Waterfront dining and ocean view",
        },
      ],
    },
    {
      id: "jets",
      category: "Private aviation",
      blurb: "Charters and terminals.",
      icon: "plane",
      photos: [
        {
          id: "jets-1",
          caption: "Gulfstream",
          src: "/privatejets/gulfstreamg550/gulfstreamg550.webp",
          alt: "Gulfstream G550 private jet",
        },
        {
          id: "jets-2",
          caption: "Learjet",
          src: "/privatejets/learjet60/learjet60.webp",
          alt: "Learjet 60 on the ramp",
        },
        {
          id: "jets-3",
          caption: "Falcon",
          src: "/privatejets/falcon2000/falcon2000.webp",
          alt: "Dassault Falcon 2000",
        },
        {
          id: "jets-4",
          caption: "Challenger",
          src: "/privatejets/challenger350/challenger350.webp",
          alt: "Bombardier Challenger 350",
        },
      ],
    },
    {
      id: "water",
      category: "Jet skis & water",
      blurb: "Bay sessions and shoreline.",
      icon: "waves",
      photos: [
        {
          id: "water-1",
          caption: "Jet ski",
          src: "/jetski/jetski1.jpg",
          alt: "Jet ski on the water",
        },
        {
          id: "water-2",
          caption: "Bay run",
          src: "/jetski/jetski2.jpg",
          alt: "Jet ski in the bay",
        },
        {
          id: "water-3",
          caption: "On the water",
          src: "/photography/jetskiphotos/jetskiphoto1.jpg",
          alt: "Jet ski session",
        },
        {
          id: "water-4",
          caption: "Golden hour",
          src: "/sitephotos/jetski3.jpg",
          alt: "Jet ski at sunset on the water",
        },
      ],
    },
    {
      id: "chauffeur",
      category: "Chauffeur",
      blurb: "Black-car transfers.",
      icon: "carFront",
      photos: [
        {
          id: "chauffeur-1",
          caption: "Suburban",
          src: "/exoticcar/chauffeur/chevsuburban/chevsuburban1.jpg",
          alt: "Chevrolet Suburban chauffeur vehicle",
        },
        {
          id: "chauffeur-2",
          caption: "Sprinter",
          src: "/exoticcar/chauffeur/exclusivesprinter/exclusivesprinter1.jpg",
          alt: "Mercedes Sprinter executive van",
        },
        {
          id: "chauffeur-3",
          caption: "Royal blue",
          src: "/exoticcar/chauffeur/royalblue/ROYAL.jpg",
          alt: "Executive van exterior",
        },
        {
          id: "chauffeur-4",
          caption: "5-star fleet",
          src: "/exoticcar/chauffeur/tiffanyblue/5STAR.jpg",
          alt: "Premium chauffeur vehicle",
        },
      ],
    },
    {
      id: "beach",
      category: "Beach & pool",
      blurb: "Stays and golden-hour hours.",
      icon: "palmtree",
      photos: [
        {
          id: "beach-1",
          caption: "Miami Beach",
          src: "/sitephotos/miamibeach.jpg",
          alt: "Miami Beach ocean and skyline",
        },
        {
          id: "beach-2",
          caption: "On the water",
          src: "/sitephotos/fishing1.webp",
          alt: "Boating and open water",
        },
        {
          id: "beach-3",
          caption: "Nikki Beach",
          src: "/vipvenues/nikkibeach2.webp",
          alt: "Nikki Beach pool and venue",
        },
        {
          id: "beach-4",
          caption: "Joia Beach",
          src: "/vipvenues/joiabeach2.webp",
          alt: "Joia Beach pool and palms",
        },
      ],
    },
    {
      id: "clubs",
      category: "Clubs & lounges",
      blurb: "Bottle service and rooms.",
      icon: "wine",
      photos: [
        {
          id: "clubs-1",
          caption: "Rockwell",
          src: "/vipvenues/rockwell1.jpg",
          alt: "Rockwell Miami",
        },
        {
          id: "clubs-2",
          caption: "Mr Jones",
          src: "/vipvenues/mrjones.jpg",
          alt: "Mr Jones venue",
        },
        {
          id: "clubs-3",
          caption: "Club Space",
          src: "/vipvenues/clubspace.jpg",
          alt: "Club Space Miami",
        },
        {
          id: "clubs-4",
          caption: "LIV",
          src: "/vipvenues/livmiami1.jpg",
          alt: "LIV Miami entrance",
        },
      ],
    },
  ] as const;
