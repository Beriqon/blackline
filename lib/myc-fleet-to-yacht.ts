import { MYC_FLEET } from "./myc-yachts.generated";
import type { Yacht, YachtPriceTier, YachtRegion } from "./yachts-data";

const TIER_NOTE =
  "Plus 7% tax and crew gratuity — confirmed in your Blackline proposal";

type YachtOverride = Omit<
  Partial<Yacht>,
  "id" | "cardPriceLine" | "listingPriceUsd" | "lengthFt" | "region" | "catalogOrder" | "productPageHref"
>;

/**
 * Targeted copy/spec overrides for specific fleet-snapshot listings.
 * Keeps pricing + photo/gallery plumbing from the snapshot, while letting us
 * present correct Blackline product info for curated catalog pages.
 */
const YACHT_OVERRIDES: Readonly<Record<string, YachtOverride>> = {
  "110-horizon": {
    cardCoverSrc: "/yachts/110horizon/110horizon.jpg",
    subtitle: "110′ Horizon · Miami Beach Marina",
    location: "Miami Beach Marina (300 Alton Rd, Miami Beach, FL 33139)",
    capacityGuests: 13,
    staterooms: 4,
    bathrooms: 4,
    aboutTagline: "110′ HORIZON Yacht – Cruise Above the Ordinary",
    aboutQuote: "Where every deck feels like a dream and every view is first class.",
    description: `Welcome aboard the stunning 110′ Horizon, docked at the iconic Miami Beach Marina (300 Alton Rd, Miami Beach, FL 33139)—your launchpad for an unforgettable day at sea. This sleek and spacious yacht is designed for upscale celebrations, elegant family gatherings, or simply escaping into a world of modern luxury. With Horizon’s renowned craftsmanship and comfort, this yacht turns every cruise into a statement.

Step inside to discover a thoughtfully designed interior featuring soft tones, expansive lounges, and a fully equipped kitchen ready for anything from gourmet meals to sunset snacks. The panoramic windows bring the ocean into every room, while the outdoor decks offer perfect spots for sunbathing, sipping cocktails, or taking in the sparkling views of Miami’s vibrant coastline.

Whether you’re hosting a sunset soirée, celebrating a milestone, or craving a serene weekend surrounded by sea and sky, the Horizon delivers the perfect blend of sophistication and freedom. Glide past the skyline, anchor in a quiet cove, or just let the moment unfold—this is your private escape, redefined.

Your charter includes a fully equipped modern kitchen, licensed captain and professional crew, local fuel, water, sodas, and ice. With no complicated add-ons or extras to manage, everything you need for a luxurious, worry-free experience is already onboard—just step in and sail away.`,
    inclusions: [
      "Fully inspected yacht",
      "Licensed captain & crew",
      "Local fuel",
      "Water, sodas & ice",
      "Floating mat",
      "2 Jet Skis (1hr included in all reservations)",
      "Trampoline (only for 6hrs/8hrs reservations)",
    ],
    highlights: [
      "Miami Beach Marina · up to 13 guests cruising",
      "4 staterooms · 4 bathrooms · modern galley & lounge spaces",
      "Jet skis (1hr included) · floating mat · trampoline on 6/8 hr charters",
    ],
  },
  "56-lagoon-nassau": {
    cardCoverSrc: "/yachts/56lagoonnassau/56lagoonnassau.jpg",
    subtitle: "56′ Lagoon Nassau · Bahamas",
    capacityGuests: 13,
    staterooms: 2,
    bathrooms: 1,
    inclusions: [
      "Fully inspected yacht",
      "Licensed captain & crew",
      "Local fuel",
      "Water, sodas & ice",
    ],
    highlights: [
      "Nassau / Bahamas routing · up to 13 guests cruising",
      "2 staterooms · 1 bathroom · catamaran layout",
      "Captain & crew · fuel · refreshments included",
    ],
  },
  "70-azimut-2023": {
    cardCoverSrc: "/yachts/70azimut2023/70azimut2023-1.jpg",
    subtitle: "70′ Azimut 2023 “Spysea” · Bill Bird Marina",
    location: "Bill Bird Marina (10800 Collins Ave, Miami Beach, FL 33154)",
    capacityGuests: 13,
    staterooms: 3,
    bathrooms: 3,
    aboutTagline: "70’ Azimut Spysea – Modern Italian Elegance on the Water",
    aboutQuote:
      "Every detail of the Azimut Spysea has been designed for those who appreciate beauty, comfort, and the thrill of open-water adventure — a truly modern expression of Italian luxury on the sea.",
    description: `Departing from the exclusive Bill Bird Marina (10800 Collins Ave, Miami Beach, FL 33154), the 2023 Azimut Spysea embodies the perfect blend of performance, sophistication, and style. This 70-foot flybridge motor yacht was crafted by Azimut, one of Italy’s most prestigious shipyards, renowned for creating vessels that balance innovation with timeless elegance.

Built for luxury charters in the Bahamas and beyond, Spysea captivates with its sleek Italian lines, open social spaces, and refined contemporary finishes. Her spacious aft deck welcomes guests into a beautifully designed main saloon, where large windows fill the interior with natural light, highlighting high-gloss wood accents and a polished modern atmosphere.

Below deck, Spysea offers three elegantly appointed cabins, including a full-beam master stateroom that provides a private retreat at sea. The flybridge is a true highlight — a panoramic upper deck featuring plush seating, a retractable shade canopy, and ample space for alfresco dining or sunset cocktails. For those who prefer to soak up the sun, the private bow lounge with adjustable sunbeds and drink holders creates the ultimate relaxation haven.`,
    inclusions: [
      "Fully inspected yacht",
      "Licensed captain & crew",
      "Local fuel",
      "Water, sodas & ice",
      "Large floating mat",
    ],
    highlights: [
      "Bill Bird Marina · up to 13 guests cruising",
      "3 staterooms · 3 bathrooms · contemporary flybridge layout",
      "Large floating mat included",
    ],
  },
  "80-azimut-s8": {
    cardCoverSrc: "/yachts/80azimuts8/80azimuts8-1.jpg",
    subtitle: "80′ Azimut S8 · Miami Beach Marina",
    location: "Miami Beach Marina",
    capacityGuests: 13,
    staterooms: 4,
    bathrooms: 3,
    aboutTagline: "80′ Azimut S8 – Sail in Style",
    aboutQuote: "Where bold design meets effortless luxury.",
    description: `Step aboard the 80′ Azimut S8, your floating oasis of luxury and good vibes, docked at the vibrant Miami Beach Marina. This sleek Italian yacht is the perfect setting for unforgettable moments—think chic birthday bashes, engagement parties, family celebrations, or just a sun-soaked escape with your favorite people. From its stylish silhouette to its powerful performance, the S8 isn’t just a yacht—it’s your passport to the ultimate Miami experience.

Inside, the atmosphere is modern and inviting. You’ll find a fully equipped kitchen ready for your private chef or your own culinary creations, plush lounging areas, and wide windows that frame the ocean like a living postcard. The seamless indoor-outdoor flow makes entertaining easy, whether you’re popping champagne on the sun deck or vibing to your playlist with the sea breeze in your hair.

Feel the freedom as you cruise through crystal-clear waters, anchor at a sandbar, or zip around on a jetski—all while soaking in the sun and good company. This yacht is all about living in the moment and making memories. Whether you’re planning a lively party or a laid-back day trip, the 80′ Azimut S8 delivers a fun, luxe experience from bow to stern.

Your charter includes everything you need for a smooth, unforgettable day at sea: a fully equipped kitchen, licensed captain and crew, local fuel, water, sodas & ice, and one hour of Jetski use. Just bring your people—we’ll handle the rest. Let’s get this party (or peaceful getaway) started.`,
    inclusions: [
      "Fully inspected yacht",
      "Licensed captain & crew",
      "Local fuel",
      "Water, sodas & ice",
      "1 Jet Ski x 1 hour",
    ],
    highlights: [
      "Miami Beach Marina · up to 13 guests cruising",
      "4 staterooms · 3 bathrooms · sleek S-series styling",
      "1-hour Jet Ski included",
    ],
  },
  "105-aqua": {
    cardCoverSrc: "/yachts/105aqua/105aqua.jpg",
    subtitle: "105′ Aqua · Venetian Marina & Yacht Club",
    location: "Venetian Marina & Yacht Club",
    capacityGuests: 13,
    aboutTagline: "105′ Aqua – Live Large, Cruise Bold",
    aboutQuote: "Where luxury flows as freely as the ocean breeze.",
    description: `Welcome aboard the 105′ Aqua, your passport to indulgence on the water—docked at the prestigious Venetian Marina & Yacht Club in the heart of Miami. Sleek, spacious, and ready to impress, this beauty is perfect for everything from high-energy birthday bashes to laid-back family escapes, romantic proposals, or corporate celebrations with a splash of style. The Aqua isn’t just a yacht—it’s your floating VIP lounge.

Step inside and you’re greeted by expansive interiors with plush lounges, luxe finishes, and a fully equipped kitchen that’s perfect for prepping sunset bites or cocktails on demand. Whether you’re toasting on the deck, soaking in the Jacuzzi, or vibing to the music as the skyline lights up, every detail is designed to make you feel like royalty. It’s the kind of atmosphere that turns a day on the water into a lifelong memory.

Craving good energy and even better views? This yacht delivers both. Cruise past Miami’s iconic coastline, drop anchor at a sandbar, or unwind in the Jacuzzi with your favorite people and a cold drink in hand. The 105′ Aqua brings a perfect mix of elegance and fun—ideal for guests who want to relax, celebrate, and live it up on the water.

Your charter includes everything you need for a carefree, luxury-filled day: a fully inspected yacht, licensed captain and crew, local fuel, water, sodas, and ice, and a Jacuzzi for pure relaxation. Plus, enjoy a $200 cash certificate toward your next yacht experience with us—because once is never enough. Let’s make your next Miami memory happen.`,
    inclusions: [
      "Fully inspected yacht",
      "Licensed captain & crew",
      "Local fuel",
      "Water, sodas & ice",
      "Jacuzzi",
    ],
    highlights: [
      "Venetian Marina & Yacht Club · up to 13 guests cruising",
      "Jacuzzi onboard · expansive lounge areas",
      "Captain & crew · fuel · refreshments included",
    ],
  },
  "66-azimut-2018": {
    cardCoverSrc: "/yachts/66azimut2018/66azimut2018-1.jpg",
    subtitle: "66′ Azimut 2018 · Fountainebleau Marina",
    location: "Fountainebleau Marina in Miami Beach",
    capacityGuests: 13,
    staterooms: 3,
    bathrooms: 2,
    aboutTagline: "66′ Azimut 2018 – Chic Cruising, Miami Style",
    aboutQuote: "Where sleek Italian design meets the soul of the sea.",
    description: `Climb aboard the stunning 66′ Azimut 2018, your private escape moored at the elegant Fountainebleau Marina in Miami Beach. Designed for those who crave luxury with a playful edge, this yacht is your go-to for elevated birthday parties, romantic getaways, stylish family outings, or vibey weekend retreats. It’s more than a vessel—it’s your personal retreat on the water, wrapped in class and comfort.

Step inside and you’ll be met with modern, Italian-crafted interiors, panoramic windows, and a fully equipped kitchen ready for gourmet bites or fresh cocktails. Lounge in total comfort or entertain in style as the sunlight floods in. The spacious decks give you plenty of room to dance, relax, or simply soak in the iconic Miami coastline with your crew.

Whether you’re chasing the golden hour across Biscayne Bay, floating on the water carpet with your friends, or just kicking back under the sun with music and drinks, the Azimut 2018 delivers a perfect blend of luxury and fun. This yacht was built for those who want the finer things—without missing a moment of the good times.

Your experience includes everything you need for a seamless and unforgettable day at sea: a fully inspected yacht, licensed captain and crew, local fuel, water, sodas & ice, and a floating carpet for lounging in the ocean.`,
    inclusions: [
      "Fully inspected yacht",
      "Licensed captain & crew",
      "Local fuel",
      "Water, sodas & ice",
      "Floating carpet",
    ],
    highlights: [
      "Fountainebleau Marina · up to 13 guests cruising",
      "3 staterooms · 2 bathrooms · Italian-crafted interior",
      "Floating carpet included",
    ],
  },
  "88-azimut-sati": {
    cardCoverSrc: "/yachts/88azimutsati/88azimutsati.jpg",
    subtitle: "88′ Azimut Sati · Aston Martin Residences",
    location: "The Aston Martin Residences",
    capacityGuests: 13,
    staterooms: 3,
    bathrooms: 3,
    aboutTagline: "88′ Azimut Sati – Power, Prestige & Pure Indulgence",
    aboutQuote:
      "Where sleek design meets serious style—your unforgettable Miami escape starts now.",
    description: `Step aboard the stunning 88′ Azimut Sati, a yacht that fuses Italian craftsmanship with Miami’s vibrant energy. Docked at The Aston Martin Residences, this striking vessel turns heads with its bold profile, expansive decks, and interiors bathed in natural light. Whether you’re planning an elevated celebration, a luxury family day, or an unforgettable escape with friends, this yacht sets the stage for an extraordinary day on the water.

Outside, the Azimut 88 offers a variety of lounging and entertaining zones—from the spacious flybridge with retractable hardtop to the stylish aft cockpit and oversized foredeck sunpads. Whether you’re catching rays, enjoying drinks at sunset, or dining alfresco, there’s a perfect spot for every vibe. Designed with seamless flow between indoor and outdoor living, this yacht lets you experience Miami from every angle.

Step inside and be swept away by the refined interior, featuring sleek light wood finishes, oversized windows, and elegantly curated furnishings. The open-plan main salon invites conversation and comfort, while the staterooms—each designed with luxe materials and calming tones—accommodate up to 8 guests in pure comfort. A separate crew area ensures every detail of your charter is handled with professionalism and ease.

Ready for an upscale escape in the heart of Miami? The 88′ Azimut Sati offers a blend of performance, elegance, and sun-soaked relaxation that’s second to none. Let’s make your next yacht day truly unforgettable.`,
    inclusions: [
      "Fully inspected yacht",
      "Licensed captain & crew",
      "Local fuel",
      "Water, sodas & ice",
      "Sunchill pad",
      "Floating dock",
    ],
    highlights: [
      "Aston Martin Residences · up to 13 guests cruising",
      "3 staterooms · 3 bathrooms · flybridge & foredeck sunpads",
      "Sunchill pad · floating dock",
    ],
  },
  "70-azimut-lupo-ii": {
    cardCoverSrc: "/yachts/70azimutlupoii/70azimutlupoii.jpg",
    subtitle: "70′ Azimut “Lupo II” · Bill Bird Marina",
    location: "Bill Bird Marina in Miami Beach",
    capacityGuests: 13,
    aboutTagline: '70′ Azimut “Lupo II” – Sleek. Chic. Unforgettable.',
    aboutQuote: "Luxury unleashed, where the ocean is your playground.",
    description: `Set sail on the 70′ Azimut Lupo II, docked at the scenic Bill Bird Marina in Miami Beach. This sleek Italian-crafted beauty blends high-performance with pure comfort, creating the perfect escape for chic celebrations, relaxed family outings, or spontaneous weekend getaways. Whether you’re popping champagne on the bow or cruising into the sunset, Lupo II turns every moment into a memory.

Step aboard and you’ll instantly feel the vibe—plush interiors, stylish finishes, and a spacious layout that makes entertaining a breeze. The fully-equipped kitchen is perfect for prepping snacks or cocktails, while the ample lounge areas—inside and out—invite you to kick back and enjoy the ride in total luxury.

Glide through the turquoise waters of Miami with your favorite crew, jet ski into adventure, or drift atop the ocean on a floating carpet with a cold drink in hand. Lupo II is designed for both high-energy fun and low-key lounging, offering the perfect balance of excitement and serenity on the sea.

Your charter includes everything you need for a hassle-free day: a fully inspected yacht, licensed captain & crew, local fuel, refreshing water, sodas & ice, 1 Jet Ski, and a floating carpet. Just bring your vibes—we’ll handle the rest.`,
    inclusions: [
      "Fully inspected yacht",
      "Licensed captain & crew",
      "Local fuel",
      "Water, sodas & ice",
      "1 Jet Ski",
      "Floating carpet",
    ],
    highlights: [
      "Bill Bird Marina · up to 13 guests cruising",
      "Jet Ski + floating carpet included",
      "Tax & gratuity estimate panel on this page",
    ],
  },
  "90-azimut-day-dreamin": {
    cardCoverSrc: "/yachts/90azimutdaydreamin/90azimutdaydreamin.jpg",
    subtitle: "90′ Azimut Day Dreamin' · Miami Beach Marina",
    location: "Miami Beach Marina",
    capacityGuests: 13,
    staterooms: 4,
    bathrooms: 4,
    aboutTagline: "90′ Azimut Day Dreamin – Luxury That Makes Waves",
    aboutQuote: "Live larger, sail farther, party harder—Miami style.",
    description: `Climb aboard the 90′ Azimut, docked at the lively Miami Beach Marina, and get ready for a day (or night) of pure indulgence. This bold beauty is made for unforgettable moments—whether you’re throwing an epic celebration, enjoying a luxe family getaway, or simply living it up under the Miami sun. With its iconic Italian design and spacious layout, every inch of this yacht screams high-end comfort and cool sophistication.

Inside, you’ll find sleek interiors, plush lounging areas, and a fully-equipped kitchen for all your snacking or gourmet needs. Outside, the fun never stops—from soaking in the on-deck Jacuzzi to catching rays on the floating mat, or gliding across the water on a paddle board. The 90′ Azimut brings together relaxation and adventure in the most luxurious way possible.

Looking to take things up a notch? Amp up your experience with high-energy add-ons like a giant water slide, an ocean pool, or go all-in with both for just $850. Whatever your vibe—chill or thrill—this yacht delivers it in style.

Your charter includes a fully inspected yacht, licensed captain & crew, local fuel, refreshing water, sodas & ice, plus all listed amenities. Whether you’re planning a birthday bash, engagement celebration, or just a much-needed escape, the 90′ Azimut turns the ordinary into the unforgettable.`,
    inclusions: [
      "Fully inspected yacht",
      "Licensed captain & crew",
      "Local fuel",
      "Water, sodas & ice",
    ],
    highlights: [
      "Miami Beach Marina · up to 13 guests cruising",
      "4 staterooms · 4 bathrooms · party-ready deck layout",
      "Optional add-ons available on request (slide / ocean pool)",
    ],
  },
  "74-princess": {
    cardCoverSrc: "/yachts/74princess/74princess.jpg",
    galleryCount: 13,
    subtitle: "74′ Princess · North Bay Village",
    location: "7910 West Dr, North Bay Village, FL 33141",
    capacityGuests: 13,
    staterooms: 3,
    bathrooms: 2,
    aboutTagline: "Regal Seas: 74′ Princess Yacht – Grace Meets the Ocean",
    aboutQuote:
      "Where elegance cruises with ease—your private yacht escape starts here.",
    description: `Step aboard the 74′ Princess Yacht, a sleek sanctuary of style docked at 7910 West Dr, North Bay Village, FL 33141. Whether you’re planning a sun-kissed celebration, a peaceful family getaway, or a day of pure indulgence with friends, this stunning yacht is designed to deliver sophistication without the fuss. From the moment you arrive, you’ll feel the serene magic of Miami’s vibrant coastline—wrapped in luxury, of course.

Inside, the Princess features a beautifully appointed gourmet kitchen, plush interiors, and plenty of space to unwind, entertain, and soak in the views. Outside, stretch out on the deck or drift atop the floating carpet, surrounded by sunshine and sea breeze. Every detail is crafted for comfort, from smooth cruising to stylish lounging.

This yacht is perfect for hosting elegant birthdays, romantic anniversaries, or unforgettable get-togethers with your closest crew. While there are no extra add-ons, the experience is anything but basic—your time on board is all about ease, elegance, and good vibes on the water.

Your charter includes a fully inspected yacht, licensed captain and crew, local fuel, refreshing water, sodas & ice, a floating carpet, and a $200 cash certificate toward your next yacht experience with us. So come aboard, feel the breeze, and let the 74′ Princess show you how magical Miami looks from the sea.`,
    inclusions: [
      "Fully inspected yacht",
      "Licensed captain & crew",
      "Local fuel",
      "Water, sodas & ice",
      "Floating carpet",
    ],
    highlights: [
      "North Bay Village · up to 13 guests cruising",
      "3 staterooms · 2 bathrooms · gourmet galley",
      "$200 certificate toward your next charter (per offer)",
    ],
  },
  "84-sunseeker": {
    cardCoverSrc: "/yachts/84sunseeker/84sunseeker.jpg",
    galleryCount: 12,
    subtitle: "84′ Sunseeker · Miami Beach Marina",
    location: "Miami Beach Marina (300 Alton Rd, Miami Beach, FL 33139)",
    capacityGuests: 13,
    staterooms: 4,
    bathrooms: 3,
    aboutTagline: "Sea Luxe: 84′ Sunseeker Yacht – Bold Style, Endless Vibes",
    aboutQuote: "Your perfect day? It starts right here on the Sunseeker.",
    description: `Climb aboard the 84′ Sunseeker, where modern luxury meets effortless fun, docked at the iconic Miami Beach Marina (300 Alton Rd, Miami Beach, FL 33139). This yacht isn’t just a boat—it’s your floating VIP lounge, perfect for celebrating birthdays, entertaining out-of-town guests, hosting a sun-drenched bachelorette, or just escaping into a world of oceanfront bliss.

With sleek lines and spacious decks, this beauty is made for everything from stylish lounging to lively dancing under the sun. Inside, she offers plush interiors and a vibe that feels equal parts yacht club and private resort. Whether you’re floating off the coast or anchored in a hidden cove, every moment aboard the Sunseeker feels like a scene from your favorite summer movie.

Bring the energy or bring the zen—the choice is yours. Splash into the fun with paddle boards, a floating island, and a floating mat for sun-soaked lounging. It’s all about ocean vibes, good tunes, and great company.

Your experience includes a fully inspected yacht, licensed captain & crew, local fuel, water, sodas & ice, plus all the water toys listed above to keep the party going. Come aboard and make your next Miami yacht day absolutely unforgettable.`,
    inclusions: [
      "Fully inspected yacht",
      "Licensed captain & crew",
      "Local fuel",
      "Water, sodas & ice",
    ],
    highlights: [
      "Miami Beach Marina · up to 13 guests cruising",
      "4 staterooms · 3 bathrooms · spacious decks",
      "Paddle boards · floating island · floating mat (onboard)",
    ],
  },
  "80-sunseeker": {
    cardCoverSrc: "/yachts/80sunseeker/80sunseeker.jpg",
    galleryCount: 12,
    subtitle: "80′ Sunseeker Manhattan · Miami Beach Marina",
    location: "Miami Beach Marina",
    capacityGuests: 13,
    staterooms: 4,
    bathrooms: 4,
    aboutTagline: "80′ Sunseeker Manhattan – Big Style, Bigger Memories",
    aboutQuote: "Because every celebration deserves a stunning backdrop.",
    description: `Step aboard the 80′ Sunseeker Manhattan, where contemporary luxury meets timeless elegance. Docked at the prestigious Miami Beach Marina, this yacht is a floating masterpiece—perfect for upscale gatherings, milestone celebrations, romantic escapes, or sun-soaked family days. With sleek lines, spacious decks, and signature Sunseeker styling, this yacht sets the tone for a day (or night) you’ll never forget.

Inside, enjoy sophisticated living areas with panoramic windows, plush furnishings, and a state-of-the-art kitchen designed for onboard dining and entertaining. Multiple lounge spaces invite you to relax and connect, whether you’re savoring cocktails in the salon or unwinding with ocean views from the flybridge. The vibe is effortlessly cool—Miami luxury with a European edge.

Out on deck, the Sunseeker Manhattan offers plenty of room to soak in the sun or dance under the stars. Take in the coastal breeze from the bow sunpads, host a sunset toast on the aft deck, or slip into the water for a swim in your own floating paradise. Every space is crafted for comfort, celebration, and unforgettable views.

Your charter includes a fully inspected yacht, licensed captain & crew, local fuel, water, sodas & ice, and a $200 cash certificate toward your next yacht experience with us. Whether you’re planning an elegant soirée or a laid-back escape, the 80′ Sunseeker Manhattan is ready to deliver pure magic on the Miami seas.`,
    inclusions: [
      "Fully inspected yacht",
      "Licensed captain & crew",
      "Local fuel",
      "Water, sodas & ice",
    ],
    highlights: [
      "Miami Beach Marina · up to 13 guests cruising",
      "4 staterooms · 4 bathrooms · flybridge & sunpads",
      "$200 certificate toward your next charter (per offer)",
    ],
  },
  "70-azimut-le-grand-bleu": {
    cardCoverSrc: "/yachts/70azimutlegrandbleu/70azimutlegrandbleu.jpg",
    galleryCount: 12,
    subtitle: "70′ Azimut Le Grand Bleu · Bill Bird Marina",
    location: "Bill Bird Marina (10800 Collins Ave, Miami Beach, FL 33154)",
    capacityGuests: 13,
    staterooms: 3,
    bathrooms: 2,
    aboutTagline: "Le Grand Bleu: 70′ Azimut Yacht – Where Sophistication Meets the Sea",
    aboutQuote: "Luxury has a new name—and it’s floating in Miami.",
    description: `Step aboard the 70′ Azimut Le Grand Bleu, docked at the exclusive Bill Bird Marina (10800 Collins Ave, Miami Beach, FL 33154), and get ready to sail into pure indulgence. With sleek Italian design, spacious lounging areas, and an inviting atmosphere, this yacht is the perfect blend of upscale comfort and effortless style—ideal for birthdays, family escapes, bachelorette weekends, or just a high-end day under the sun.

Inside, every detail is curated for your comfort. Lounge in luxury as you soak in the views, enjoy a breeze from the bow, or sip cocktails while the water sparkles around you. This yacht isn’t just a ride—it’s an experience designed to impress. Want to switch up the scenery? Cruise from Sea Isle or Venetian Marina for an additional $400, and explore more of Miami’s iconic waters in true style.

Whether you’re diving into the water or dancing on deck, Le Grand Bleu sets the mood. With room to relax, celebrate, or just vibe with your crew, you’ll feel like you’re floating in your own private resort. Perfect for golden hour cocktails, brunch-at-sea vibes, or a day full of sun and sea.

What’s included: A fully inspected yacht, licensed captain & crew, local fuel, water, sodas & ice, and an unforgettable experience curated just for you. Step into Le Grand Bleu—and let the good times flow.`,
    inclusions: [
      "Fully inspected yacht",
      "Licensed captain & crew",
      "Local fuel",
      "Water, sodas & ice",
    ],
    highlights: [
      "Bill Bird Marina · up to 13 guests cruising",
      "3 staterooms · 2 bathrooms · Italian flybridge styling",
      "Alternate pickup from Sea Isle / Venetian Marina +$400 (on request)",
    ],
  },
  "88-sunseeker": {
    cardCoverSrc: "/yachts/88sunseeker/88sunseeker.jpg",
    galleryCount: 8,
    subtitle: "88′ Sunseeker · Venetian Marina & Yacht Club",
    location: "Venetian Marina & Yacht Club (1635 N Bayshore Dr, Miami, FL 33132)",
    capacityGuests: 13,
    staterooms: 4,
    bathrooms: 4,
    aboutTagline: "Sunseeker Luxe: 88′ Yacht – Make Waves in Style",
    aboutQuote:
      "Where sleek design meets unforgettable moments on the water.",
    description: `Step aboard the 88′ Sunseeker, a bold expression of elegance, power, and pure fun. Docked at the prestigious Venetian Marina & Yacht Club (1635 N Bayshore Dr, Miami, FL 33132), this stunning yacht delivers the perfect setting for upscale celebrations, milestone birthdays, family escapes, or just a carefree day cruising through Miami’s shimmering coastline. Whether you’re looking for chill vibes or high-end excitement, the Sunseeker sets the tone.

With its fully-equipped gourmet kitchen, spacious indoor lounges, and sleek sun decks, this yacht invites you to relax in comfort or entertain in style. Imagine sipping champagne on the bow as the skyline glows behind you, or savoring a chef-prepped meal with your guests as the waves roll by. The 88′ Sunseeker isn’t just a yacht—it’s a floating five-star experience, tailored for those who love the good life.

As you cruise, take advantage of all the fun at your fingertips. With floating toys onboard, you can dive into the warm Miami waters, lounge on a floating carpet, or just drift under the sun with a drink in hand. This yacht is made for making memories—from first toast to final sunset.

What’s included: Every charter includes a fully inspected yacht, licensed captain & crew, local fuel, water, sodas & ice, and floating toys to keep the good vibes flowing. Set sail aboard the 88′ Sunseeker—and let your luxury adventure begin.`,
    inclusions: [
      "Fully inspected yacht",
      "Licensed captain & crew",
      "Local fuel",
      "Water, sodas & ice",
      "Floating carpet",
    ],
    highlights: [
      "Venetian Marina & Yacht Club · up to 13 guests cruising",
      "4 staterooms · 4 bathrooms · gourmet galley & sun decks",
      "Floating toys · floating carpet",
    ],
  },
  "70-azimut-211": {
    cardCoverSrc: "/yachts/70azimut211/70azimut211-1.jpg",
    galleryCount: 10,
    subtitle: "70′ Azimut 211 · Bayshore Landing Marina",
    location: "Bayshore Landing Marina (2550 S Bayshore Dr, Coconut Grove, FL 33133)",
    capacityGuests: 13,
    staterooms: 3,
    bathrooms: 2,
    aboutTagline: "Ocean Escape: 70′ Azimut 211 Yacht – Sail Into Luxury",
    aboutQuote: "Elegance on the waves, unforgettable moments on deck.",
    description: `Step aboard the 70′ Azimut and get ready to cruise in style through the heart of Miami. Docked at the charming Bayshore Landing Marina (2550 S Bayshore Dr, Coconut Grove, FL 33133), this sleek yacht offers the perfect blend of Italian design, comfort, and open-sea magic. Whether you’re planning a sophisticated celebration, a fun family escape, or a peaceful day soaking up the sun, this yacht delivers the ideal setting for memories that last.

Inside, you’ll find plush interiors and a fully-equipped gourmet kitchen, designed for those who love to dine, toast, and unwind in elegance. Every corner of this yacht reflects luxury, from the sun-kissed decks to the stylish lounge spaces—it’s your floating retreat for leisure and laughter.

Want to add a splash of fun? Lounge on the floating carpet, dip into crystal-clear waters, or simply cruise along Miami’s stunning coastline with music playing and drinks flowing. The 70′ Azimut is all about creating an elevated, yet carefree vibe—where relaxation meets indulgence.

What’s included: Your charter comes with a fully inspected yacht, licensed captain & crew, local fuel, water, sodas & ice, and a floating carpet to enhance your experience. Climb aboard and let your luxury adventure begin—Miami style.`,
    inclusions: [
      "Fully inspected yacht",
      "Licensed captain & crew",
      "Local fuel",
      "Water, sodas & ice",
      "Floating carpet",
    ],
    highlights: [
      "Coconut Grove · up to 13 guests cruising",
      "3 staterooms · 2 bathrooms · gourmet galley",
      "Floating carpet included",
    ],
  },
  "60-azimut-freedom": {
    cardCoverSrc: "/yachts/60azimutfreedom/60azimutfreedom.jpg",
    galleryCount: 11,
    subtitle: "60′ Azimut Freedom · Miami Beach Marina",
    location: "Miami Beach Marina",
    capacityGuests: 13,
    staterooms: 3,
    bathrooms: 2,
    aboutTagline: "60′ Azimut Freedom – Feel the Breeze, Live the Luxury",
    aboutQuote: "Step into your private floating escape at Miami Beach Marina.",
    description: `Welcome aboard the 60′ Azimut Freedom, where sleek Italian design meets laid-back Miami luxury. Docked at the iconic Miami Beach Marina, this stylish yacht offers the perfect setting for unforgettable moments on the water. From the moment you step on deck, you’re surrounded by sunshine, sea breeze, and pure elegance. Whether you’re lounging on the bow or sipping cocktails in the salon, every inch of this yacht is designed to impress—and relax.

The Freedom is made for good times. It’s perfect for birthdays with a splash, romantic anniversaries, sunset engagement cruises, or casual family days soaking in the sun. With a fully equipped kitchen onboard, your group can enjoy everything from light bites to full gourmet meals while cruising through Miami’s shimmering coastline. The vibe? Effortless, inviting, and full of possibilities.

With spacious indoor and outdoor areas, you’ll find the perfect spot for every mood—whether you’re dancing to your playlist under the sky or enjoying a quiet moment while gazing at the horizon. This yacht blends comfort and class in the best way, offering the ideal space to celebrate life or escape from the everyday. Your only job? Show up, unwind, and enjoy every sun-drenched second.

What’s included:
Your charter includes a fully inspected yacht with a licensed captain and attentive crew, local fuel, plus complimentary water, sodas, and ice to keep everyone refreshed. You’ll also receive a $200 cash certificate toward your next yacht experience with us, so the luxury doesn’t stop when you step off. The 60′ Azimut Freedom is all about living your best sea life—and then coming back for more.`,
    inclusions: [
      "Fully inspected yacht",
      "Licensed captain & crew",
      "Local fuel",
      "Water, sodas & ice",
    ],
    highlights: [
      "Miami Beach Marina · up to 13 guests cruising",
      "3 staterooms · 2 bathrooms · indoor & outdoor lounge spaces",
      "$200 certificate toward your next charter (per offer)",
    ],
  },
  "62-pershing": {
    cardCoverSrc: "/yachts/62pershing/62pershing.jpg",
    galleryCount: 12,
    subtitle: "62′ Pershing · Venetian Marina & Yacht Club",
    location:
      "Venetian Marina & Yacht Club — pickup also at Duffy’s, Shuckers & River Landing",
    capacityGuests: 13,
    staterooms: 2,
    bathrooms: 2,
    aboutTagline: "Velocity & Elegance: 62′ Pershing – A Thrill Ride Wrapped in Luxury",
    aboutQuote:
      "Because fast feels better when it’s wrapped in sleek Italian style.",
    description: `Welcome aboard the 62′ Pershing, a powerhouse of performance and luxury docked at the exclusive Venetian Marina & Yacht Club in Miami, with convenient pickup options also available at Duffy’s, Shuckers, and River Landing. This stunning yacht is where speed meets sophistication, designed for those who crave both the rush of open water and the elegance of a luxury retreat. Whether you’re chasing the horizon or anchored in the moment, the 62′ Pershing delivers a charter experience that’s bold, beautiful, and absolutely unforgettable.

From the moment you step aboard, you’re surrounded by refined finishes, modern design, and open spaces that flow effortlessly from indoor to out. The salon is bright and inviting, perfect for cool conversations or cocktails with a view. The fully equipped galley makes onboard dining a breeze, while plush lounging areas and spacious decks invite you to stretch out and enjoy Miami’s sunshine in comfort.

Outside, the yacht’s sleek profile cuts through the water with ease—ideal for exploring Biscayne Bay, cruising along the coast, or stopping at hidden gems only accessible by boat. And when it’s time to unwind, you’ll have a floating mat, fun floats, and snorkeling gear ready to go, turning the ocean into your personal playground.

What’s included: Your charter includes a fully inspected yacht, licensed captain and crew, local fuel, water, sodas, and ice, along with a floating mat, floats, and snorkeling gear for in-the-water fun. Plus, enjoy a $200 cash certificate toward your next unforgettable yacht experience with us.

If you’re looking to make waves in style—whether for a birthday, romantic escape, or laid-back luxury day—the 62′ Pershing is your ticket to the perfect Miami adventure. Let’s cruise!`,
    inclusions: [
      "Fully inspected yacht",
      "Licensed captain & crew",
      "Local fuel",
      "Water, sodas & ice",
      "Floating mat",
      "Floats",
      "Snorkeling gear",
    ],
    highlights: [
      "Venetian Marina & Yacht Club · alternate pickups on request",
      "2 staterooms · 2 bathrooms · performance Pershing lines",
      "$200 certificate toward your next charter (per offer)",
    ],
  },
  "70-aicon": {
    cardCoverSrc: "/yachts/70aicon/70aicon.jpg",
    galleryCount: 6,
    subtitle: "70′ Aicon · River Landing Marina",
    location: "River Landing Marina",
    capacityGuests: 13,
    staterooms: 3,
    bathrooms: 3,
    aboutTagline: "70′ Aicon – Smooth Sailing, Stylish Living",
    aboutQuote: "Where elegance meets the energy of the Miami River.",
    description: `Step aboard the 70′ Aicon and get ready to elevate your day on the water with comfort, class, and a splash of Miami magic. Departing from River Landing Marina, this beautifully designed yacht offers the perfect blend of spacious living and sleek style, making it ideal for unforgettable celebrations, intimate gatherings, or easygoing escapes with family and friends.

From the moment you board, you’ll feel right at home in the open, airy interiors. A fully-equipped kitchen allows for gourmet meals on the go, while the elegant lounges and sunny decks invite you to relax, connect, and make memories against the backdrop of Miami’s vibrant waterways. Whether you’re cruising past the skyline or anchoring for a swim, every moment onboard feels effortless and refined.

The 70′ Aicon is all about versatility—host a birthday brunch with views, toast to love during a romantic sunset cruise, or simply kick back with your crew and let the gentle waves set the tone. With its generous indoor and outdoor spaces, this yacht delivers a balanced mix of luxury and fun that’s perfect for any occasion.

Your charter includes a fully inspected yacht, licensed captain and crew, local fuel, water, sodas, and ice. With everything you need for a seamless, upscale day on the water, the 70′ Aicon is ready to welcome you aboard. Come sail through Miami in style—you deserve it.`,
    inclusions: [
      "Fully inspected yacht",
      "Licensed captain & crew",
      "Local fuel",
      "Water, sodas & ice",
    ],
    highlights: [
      "River Landing Marina · up to 13 guests cruising",
      "3 staterooms · 3 bathrooms · airy saloon & decks",
      "Gourmet galley · lounges inside and out",
    ],
  },
  "66-marquis": {
    cardCoverSrc: "/yachts/66marquis/66marquis.jpg",
    galleryCount: 15,
    subtitle: "66′ Marquis · Miami Beach Marina",
    location: "Miami Beach Marina",
    capacityGuests: 13,
    staterooms: 3,
    bathrooms: 2,
    aboutTagline: "66′ Marquis – Classic Charm, Modern Luxury",
    aboutQuote:
      "Because the best memories are made where the ocean meets elegance.",
    description: `Welcome aboard the 66′ Marquis, where timeless style meets contemporary comfort on the sparkling waters of Miami. Docked at the iconic Miami Beach Marina, this yacht is your gateway to a day of luxury, laughter, and laid-back vibes. Whether you’re hosting a chic celebration, bonding with family, or just looking for the perfect escape, the Marquis sets the tone for an unforgettable yachting experience.

Inside, you’ll find sleek, thoughtfully designed interiors with plenty of room to lounge, connect, and unwind. The fully equipped kitchen is perfect for everything from casual snacks to gourmet meals, so bring your favorite bites or let your private chef work their magic. From the cozy salon to the staterooms, every inch of the yacht is crafted to deliver both comfort and class.

Out on deck, relax with a drink in hand as the Miami skyline fades into the horizon. With plenty of space to soak up the sun, take in the breeze, and celebrate life’s best moments, this yacht turns ordinary days into something extraordinary. Cruise to Haulover, anchor at a hidden sandbar, or just drift in good company—the 66′ Marquis is all about enjoying the moment.

Your charter includes a fully inspected yacht, licensed captain and crew, local fuel, water, sodas, and ice, plus a beautifully equipped kitchen for all your onboard culinary adventures. With no add-ons to worry about, it’s smooth sailing from start to finish. Step aboard the Marquis and let the ocean be your backdrop for an effortlessly elegant Miami escape.`,
    inclusions: [
      "Fully inspected yacht",
      "Licensed captain & crew",
      "Local fuel",
      "Water, sodas & ice",
    ],
    highlights: [
      "Miami Beach Marina · up to 13 guests cruising",
      "3 staterooms · 2 bathrooms · salon & equipped galley",
      "Cruise Haulover · sandbars · skyline views",
    ],
  },
  "43-pardo-2021": {
    cardCoverSrc: "/yachts/43pardo2021/43pardo2021-1.jpg",
    galleryCount: 10,
    subtitle: "43′ Pardo (2021) · Rickenbacker Marina",
    location: "Rickenbacker Marina",
    capacityGuests: 13,
    staterooms: 1,
    bathrooms: 1,
    aboutTagline: "43′ Pardo – Sleek, Stylish, and Made for Miami",
    aboutQuote: "Modern luxury meets sun-soaked adventure on the open water.",
    description: `Step aboard the 43′ Pardo, a 2021 model that blends cutting-edge Italian design with laid-back Miami charm. Docked at Rickenbacker Marina, this yacht is a showstopper—sleek, powerful, and crafted for unforgettable days on the water. Whether you’re planning a birthday bash, a romantic escape, or a fun outing with friends, the 43′ Pardo sets the perfect scene for making memories in style.

With its open layout, oversized sunpads, and a spacious shaded cockpit, every inch of this yacht is designed for comfort and connection. Lounge, dine, and vibe to your favorite playlist as you soak in the views of Biscayne Bay and beyond. Inside, the cabin is tastefully appointed, offering a cool, quiet space for mid-day breaks or getting ready for golden hour.

The modern design isn’t just for looks—it’s functional, too. Built for performance, the 43′ Pardo slices smoothly through the water, making your cruise feel effortless and elegant. Whether you’re anchored at a hidden cove or cruising past the skyline, this yacht keeps the energy up and the stress down.

What’s included:
Your charter includes a fully inspected vessel, a licensed captain and crew, local fuel, water, sodas, and ice. It’s a seamless experience from start to finish—just show up with your favorite swimwear, your crew, and your sense of adventure, and let the Pardo do the rest.`,
    inclusions: [
      "Fully inspected yacht",
      "Licensed captain & crew",
      "Local fuel",
      "Water, sodas & ice",
    ],
    highlights: [
      "Rickenbacker Marina · up to 13 guests cruising",
      "1 stateroom · 1 bathroom · open deck & sunpads",
      "2021 Pardo · Italian design · Biscayne Bay cruising",
    ],
  },
  "57-azimut-thales": {
    cardCoverSrc: "/yachts/57azimutthales/57azimutthales.jpg",
    galleryCount: 11,
    subtitle: "57′ Azimut Thales · Miami Beach Marina",
    location: "Miami Beach Marina",
    capacityGuests: 13,
    staterooms: 2,
    bathrooms: 2,
    aboutTagline: "Chic Serenity: 57′ Azimut Thales – Where Style Meets the Sea",
    aboutQuote:
      "Because every moment deserves a touch of elegance and a splash of fun.",
    description: `Step aboard the 57′ Azimut Thales, docked at the iconic Miami Beach Marina, and discover a yacht that perfectly balances refined luxury with playful relaxation. Whether you’re planning a stylish birthday bash, an intimate family cruise, or a serene escape with friends, Thales sets the scene for unforgettable memories on Miami’s sparkling waters.

Inside, you’ll find sleek, modern interiors filled with natural light, comfortable lounges, and all the amenities you need to feel at home on the waves. Outside, the spacious deck invites you to soak up the sun or share laughs over cocktails, while the playful water toys add a dash of excitement to your day.

Ready to dive in? The large floating mat and floating pool provide the ultimate spots for water fun, while the paddleboard offers a chance to explore the beautiful coastline at your own pace. With a professional crew handling every detail, all you have to do is relax and enjoy the ride.

What’s included: Your charter includes a fully inspected yacht, licensed captain and crew, local fuel, water, sodas, and ice, plus a large floating mat, floating pool, paddleboard, and a $200 cash certificate toward your next yacht adventure with us.

For a day that’s equal parts chic and cheerful, the 57′ Azimut Thales is your perfect Miami escape. Let’s set sail!`,
    inclusions: [
      "Fully inspected yacht",
      "Licensed captain & crew",
      "Local fuel",
      "Water, sodas & ice",
      "Large floating mat",
      "Floating pool",
      "Paddle board",
    ],
    highlights: [
      "Miami Beach Marina · up to 13 guests cruising",
      "2 staterooms · 2 bathrooms · deck lounge spaces",
      "$200 certificate toward your next charter (per offer)",
    ],
  },
  "55-azimut-azure": {
    cardCoverSrc: "/yachts/55azimutazure/55azimutazure.jpg",
    galleryCount: 5,
    subtitle: "55′ Azimut Azure · Venetian Marina",
    location: "Venetian Marina (1635 N Bayshore Dr, Miami, FL 33132)",
    capacityGuests: 13,
    staterooms: 2,
    bathrooms: 2,
    aboutTagline: "55′ Azimut Azure – Where Style Meets Sea Breeze",
    aboutQuote: "Sleek, stylish, and made for Miami moments.",
    description: `Step aboard the 55′ Azimut Azure — a modern classic that brings together luxury, comfort, and that signature Miami flair. Docked at the iconic Venetian Marina (1635 N Bayshore Dr, Miami, FL 33132), this yacht is perfect for soaking up the sun, cruising the coast, and celebrating life’s best moments in style. Whether you’re planning a chic birthday bash, a romantic sunset cruise, or a fun family day out, the Azimut Azure delivers the kind of experience you’ll be talking about long after you dock.

From the moment you board, you’re greeted with spacious decks, plush seating, and an effortlessly cool atmosphere. Lounge on the sunpads, sip cocktails on the aft deck, or relax in the air-conditioned salon with panoramic views all around. The design is sleek and welcoming — polished wood, soft leather, and wide-open spaces that make every inch feel like a luxury retreat on the water.

Up top, the flybridge is your go-to for good vibes and great views. Kick back under the shade or dance in the sunshine — whatever your vibe, this space is made for it. The 55′ Azimut is perfect for intimate gatherings or easygoing charters with a little splash of glam. Think engagements, anniversaries, girls’ days out, or just a refreshing escape from the ordinary.

Your charter includes a fully inspected yacht, a licensed captain and crew, local fuel, water, sodas, ice, and a floating carpet to level up the fun when you anchor and dive in. It’s your day — and the 55′ Azimut Azure is ready to make it effortlessly unforgettable.`,
    inclusions: [
      "Fully inspected yacht",
      "Licensed captain & crew",
      "Local fuel",
      "Water, sodas & ice",
      "Floating carpet",
    ],
    highlights: [
      "Venetian Marina · up to 13 guests cruising",
      "2 staterooms · 2 bathrooms · flybridge & sunpads",
      "Salon AC · aft deck · coastal cruising",
    ],
  },
  "38-pardo-2023": {
    cardCoverSrc: "/yachts/38pardo2023/38pardo2023-1.jpg",
    galleryCount: 7,
    subtitle: "38′ Pardo (2023) · Venetian Marina & Yacht Club",
    location: "Venetian Marina & Yacht Club (1635 N Bayshore Dr, Miami, FL 33132)",
    capacityGuests: 13,
    staterooms: 1,
    bathrooms: 1,
    aboutTagline: "38′ Pardo 2023 – Modern Style Meets Laid-Back Vibes",
    aboutQuote:
      "Sleek, sun-drenched, and ready for fun — your Miami day escape awaits.",
    description: `Hop aboard the stunning 38′ Pardo 2023 and discover a new level of open-air freedom and fun. Docked at the Venetian Marina & Yacht Club (1635 N Bayshore Dr, Miami, FL 33132), this sleek, modern day yacht is built for soaking up the sun, good vibes, and even better company. Whether you’re planning a fun-filled birthday, a beachy engagement celebration, or a spontaneous day out with friends, this Pardo makes every moment feel effortlessly cool.

With its minimalist Italian design and wide open deck layout, the Pardo 38 offers an unbeatable balance of luxury and casual comfort. Stretch out on the oversized sun pads, sip cocktails under the shade, or dance to your playlist with the breeze in your hair. This is the kind of yacht where laughter comes easy, the views are endless, and everyone feels like VIP.

Looking to dive in — literally? You’re in luck. This charter comes with ScubaSets, noodles, and a floating dock so you can jump off, float around, and chill in the water without a care. It’s the perfect setup for a sandbar hangout, a snorkeling session, or just lounging with a drink in hand. Whether you’re anchored in the bay or cruising along the coast, every part of the day feels like a sun-soaked celebration.

Your charter includes a licensed captain and crew, local fuel, a fully inspected yacht, bottled water, sodas, ice, and fun water toys like the floating dock, noodles, and scuba gear. Just show up with your favorite swimsuit and your best vibe — the 38′ Pardo brings the party.`,
    inclusions: [
      "Fully inspected yacht",
      "Licensed captain & crew",
      "Local fuel",
      "Water, sodas & ice",
      "Floating dock",
      "Noodles",
      "Scuba sets",
    ],
    highlights: [
      "Venetian Marina & Yacht Club · up to 13 guests cruising",
      "1 stateroom · 1 bathroom · open deck & sun pads",
      "Water toys: dock, noodles, scuba sets",
    ],
  },
  "52-beneteau-fly": {
    cardCoverSrc: "/yachts/52beneteaufly/52beneteaufly.jpg",
    galleryCount: 9,
    subtitle: "52′ Beneteau Flybridge · Venetian Marina & Yacht Club",
    location: "Venetian Marina & Yacht Club (1635 N Bayshore Dr, Miami, FL 33132)",
    capacityGuests: 13,
    staterooms: 2,
    bathrooms: 2,
    aboutTagline: "52′ Beneteau Flybridge – Easy Elegance, Elevated Views",
    aboutQuote:
      "Chic comfort meets breezy adventure — welcome to your Miami escape.",
    description: `Step aboard the 52′ Beneteau Flybridge and get ready for a charter that blends sleek European style with laid-back Miami vibes. Docked at the beautiful Venetian Marina & Yacht Club (1635 N Bayshore Dr), this yacht is all about soaking up the sunshine, enjoying great company, and making memories on the water. It’s the ideal choice for birthdays, engagements, family outings, or just a carefree day spent living your best life on the bay.

From the moment you step on, you’ll feel right at home — only better. The open-concept layout and wraparound windows flood the interior with natural light, while plush seating and modern finishes add a sense of casual sophistication. Whether you’re relaxing in the salon, dining on the aft deck, or prepping snacks in the fully-equipped kitchen, every detail is designed to keep you comfortable and connected to the sea.

The standout feature? That elevated flybridge. With panoramic views, ample seating, and space to stretch out under the sun or stars, it’s your own private rooftop lounge on the water. Grab a drink, snap some pics, or simply cruise along the coast in style. There’s no better spot to toast to good times and take in the magic of Miami from a whole new angle.

Your charter comes complete with a licensed captain and crew, a fully inspected yacht, local fuel, water, sodas, and ice, plus a floating carpet to lounge on once you anchor. Just bring your favorite playlist and your favorite people — the 52′ Beneteau Flybridge takes care of the rest.`,
    inclusions: [
      "Fully inspected yacht",
      "Licensed captain & crew",
      "Local fuel",
      "Water, sodas & ice",
      "Floating carpet",
    ],
    highlights: [
      "Venetian Marina & Yacht Club · up to 13 guests cruising",
      "2 staterooms · 2 bathrooms · flybridge lounge",
      "Salon · aft deck · equipped galley",
    ],
  },
  "48-cruiser-sport": {
    cardCoverSrc: "/yachts/48cruisersport/48cruisersport.jpg",
    galleryCount: 9,
    subtitle: "48′ Cruiser Sport · Miami Beach Marina",
    location: "Miami Beach Marina (300 Alton Rd, Miami Beach, FL 33139)",
    capacityGuests: 13,
    staterooms: 1,
    bathrooms: 1,
    aboutTagline: "48′ Cruiser Sport – Bold Style, Nonstop Fun",
    aboutQuote:
      "Sleek, sporty, and made for unforgettable moments on the water.",
    description: `Hop aboard the 48′ Cruiser Sport — a head-turning yacht that mixes sporty energy with a splash of Miami glam. Docked at the iconic Miami Beach Marina (300 Alton Rd, Miami Beach, FL 33139), this yacht is built for those who like their getaways with a bit of flair. Whether you’re planning a birthday bash, a bachelorette celebration, or a chill weekend escape, this sleek vessel is ready to deliver all the vibes.

From the moment you step on board, the Cruiser Sport wraps you in modern comfort. Think stylish lounge seating, a cozy galley for light bites and drinks, and an open deck layout that’s perfect for dancing, sunbathing, or toasting to the good life. The design is fun and inviting — a floating hotspot that’s all about good energy and great company.

Take in the best of Miami from every angle — cruise past the skyline, anchor near a sandbar, or drift into a golden sunset with your favorite playlist on deck. The 48′ Cruiser Sport is ideal for small groups who want to keep it casual but still ride in style. It’s perfect for family outings, engagement celebrations, or just vibing with your inner circle.

Your charter includes a licensed captain and professional crew, local fuel, a fully inspected yacht, water, sodas, and ice — everything you need for a smooth day at sea. So grab your crew, bring the good vibes, and let the Cruiser Sport take it from there.`,
    inclusions: [
      "Fully inspected yacht",
      "Licensed captain & crew",
      "Local fuel",
      "Water, sodas & ice",
    ],
    highlights: [
      "Miami Beach Marina · up to 13 guests cruising",
      "1 stateroom · 1 bathroom · open deck layout",
      "Skyline · sandbars · sunset cruises",
    ],
  },
  "44-sea-ray-sea-daze": {
    cardCoverSrc: "/yachts/44searayseadaze/44searayseadaze.jpg",
    galleryCount: 6,
    subtitle: "44′ Sea Ray Sea Daze · Rickenbacker Marina",
    location: "Rickenbacker Marina (3301 Rickenbacker Cswy, Miami, FL 33149)",
    capacityGuests: 13,
    staterooms: 1,
    bathrooms: 1,
    aboutTagline: "44′ Sea Ray – Sea Daze",
    aboutQuote:
      "Sunshine, sea breezes, and smooth cruising—this is your kind of daze.",
    description: `Set sail on Sea Daze, our 44′ Sea Ray yacht designed for effortless fun and laid-back luxury. Docked at Rickenbacker Marina (3301 Rickenbacker Cswy, Miami, FL 33149), this sleek and sporty beauty is your perfect escape from the everyday. Whether you’re celebrating a birthday, planning a romantic outing, or just looking for a chill day on the water with friends, Sea Daze is all about sunshine, good vibes, and making the most of every Miami moment.

The vibe on board is relaxed yet elevated. With a spacious open deck, comfortable lounges, and a cozy interior cabin, there’s plenty of room to stretch out, turn up the music, and enjoy the ride. Catch some rays up front, pop a bottle on the back deck, or cool off with a dip at your favorite sandbar—whatever your day looks like, this yacht is built to make it happen in style.

Perfect for small group celebrations, family adventures, or spontaneous getaways, Sea Daze lets you experience the best of Miami’s sparkling waters at your own pace. Whether you want to cruise past the skyline, drop anchor for a swim, or simply drift and disconnect, this yacht is all about carefree, sun-drenched fun.

Your charter includes a fully inspected yacht, licensed captain and professional crew, local fuel, water, sodas, and ice to keep you refreshed all day long. Just bring your playlist, your favorite people, and a sense of adventure—Sea Daze will take care of the rest.`,
    inclusions: [
      "Fully inspected yacht",
      "Licensed captain & crew",
      "Local fuel",
      "Water, sodas & ice",
    ],
    highlights: [
      "Rickenbacker Marina · up to 13 guests cruising",
      "1 stateroom · 1 bathroom · open deck & cabin",
      "Sandbars · skyline · relaxed day charters",
    ],
  },
} as const;

/**
 * When our catalog `id` differs from the slug in the imported fleet snapshot file.
 */
export const YACHT_INTERNAL_ID_TO_MYC_SLUG: Readonly<Record<string, string>> = {
  "88-princess-pfo": "88-princess-overtime",
  "74-sunseeker": "74-sunseeker-2023-2",
  "74-princess": "74princess",
  "72-azimut-7s": "72-azimut",
  "75-aicon": "75aicon",
  "70-azimut-days-like-this": "70azimut-days",
  "65-azimut-allegra": "65-azimut",
  "60-azimut-supreme-1": "60-azimut",
  "60-azimut-supreme-2": "60azimut-s",
  "66-azimut-2018": "66-azimut",
  "88-azimut-sati": "88-azimut-s",
  "70-azimut-211": "70azimut211",
  "62-pershing": "62-pershing-2",
  "66-marquis": "66marquis",
};

export type MycFleetEntry = (typeof MYC_FLEET)[number];

export const MYC_FLEET_BY_ID = new Map<string, MycFleetEntry>(
  MYC_FLEET.map((e) => [e.id, e]),
);

export function resolveMycSlug(internalId: string): string {
  return YACHT_INTERNAL_ID_TO_MYC_SLUG[internalId] ?? internalId;
}

function parseUsdAmount(s: string): number {
  const m = s.replace(/,/g, "").match(/\$?\s*([\d.]+)/);
  if (!m) return 0;
  return Math.round(parseFloat(m[1]));
}

function regionFromMyc(filterLocation?: string): YachtRegion {
  if (filterLocation === "north-miami") return "north-miami";
  if (filterLocation === "fort-lauderdale") return "fort-lauderdale";
  if (filterLocation === "bahamas") return "bahamas";
  return "miami";
}

/** Decode a few common HTML entities from snapshot names/descriptions. */
function decodeEntities(s: string): string {
  return s
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8242;/g, "'")
    .replace(/&#038;/g, "&")
    .replace(/&amp;/g, "&")
    .replace(/&#\d+;/g, "'");
}

function cleanLocation(loc: string): string {
  return loc.replace(/\s*\(slip confirmed on booking\)\s*/gi, "").trim();
}

function regionHighlightLine(filterLocation?: string): string {
  switch (filterLocation) {
    case "north-miami":
      return "Typical departure: North Miami area — slip confirmed when you book.";
    case "bahamas":
      return "Typical departure: Bahamas routing — slip confirmed when you book.";
    case "fort-lauderdale":
      return "Typical departure: Fort Lauderdale area — slip confirmed when you book.";
    default:
      return "Typical departure: Miami area — slip confirmed when you book.";
  }
}

/** Standard inclusions for fleet snapshot listings (neutral copy only). */
function neutralInclusions(): readonly string[] {
  return [
    "Fully inspected yacht",
    "Licensed captain & crew",
    "Local fuel for standard routing as quoted",
    "Water, sodas & ice",
    "USCG-compliant safety equipment",
  ] as const;
}

function neutralDescription(
  name: string,
  lengthFt: number,
  location: string,
): string {
  const loc = cleanLocation(location);
  return `Crewed motor yacht day charter on the ${decodeEntities(name)} (${lengthFt}′). Typical departure: ${loc}. Itinerary, fuel zones, inclusions, and final rates are confirmed in your Blackline proposal.`;
}

const NEUTRAL_POLICY: readonly string[] = [
  "Charter rates are quoted before tax. A 7% state tax and crew gratuity apply — use the calculator on this page for an estimate.",
  "Final routing, dock fees, fuel surcharges, and inclusions are confirmed in your written proposal.",
  "Availability changes by season; your inquiry locks the current quote window.",
];

/**
 * Maps a locally stored fleet snapshot row into the catalog `Yacht` shape.
 * Display copy is Blackline-branded only (no third-party site names).
 */
export function yachtFromMycEntry(
  entry: MycFleetEntry,
  opts: { catalogOrder: number; id: string; lengthFt: number },
): Yacht {
  const listingPriceUsd = entry.priceTiers.length
    ? parseUsdAmount(entry.priceTiers[0].amount)
    : parseUsdAmount(entry.cardPriceLine);

  const priceTiers: readonly YachtPriceTier[] = entry.priceTiers.map((t) => ({
    durationLabel: t.durationLabel,
    amount: t.amount,
    note: TIER_NOTE,
  }));

  const cap = entry.capacityGuests;
  const highlights: readonly string[] = [
    `${opts.lengthFt}′ motor yacht · up to ${cap} guests`,
    regionHighlightLine(entry.filterLocation),
    "Use the estimate panel for 7% tax and crew gratuity on the charter",
  ];

  const base: Yacht = {
    id: opts.id,
    name: decodeEntities(entry.name),
    subtitle: `${opts.lengthFt} ft motor yacht`,
    cardPriceLine: entry.cardPriceLine,
    listingPriceUsd,
    lengthFt: opts.lengthFt,
    region: regionFromMyc(entry.filterLocation),
    catalogOrder: opts.catalogOrder,
    featured: entry.featured === true,
    description: neutralDescription(entry.name, opts.lengthFt, entry.location),
    priceTiers,
    highlights,
    inclusions: neutralInclusions(),
    location: cleanLocation(entry.location),
    capacityGuests: entry.capacityGuests,
    policyNotes: NEUTRAL_POLICY,
    galleryCount: entry.galleryCount,
    productPageHref: `/services/yachts/${opts.id}`,
  };

  const override = YACHT_OVERRIDES[opts.id];
  if (!override) return base;

  return {
    ...base,
    ...override,
    ...(override.inclusions ? { inclusions: override.inclusions } : {}),
    ...(override.highlights ? { highlights: override.highlights } : {}),
    ...(override.policyNotes ? { policyNotes: override.policyNotes } : {}),
    ...(override.priceTiers ? { priceTiers: override.priceTiers } : {}),
    ...(override.promotions ? { promotions: override.promotions } : {}),
  };
}

export function getMycEntryForInternalId(
  internalId: string,
): MycFleetEntry | undefined {
  return MYC_FLEET_BY_ID.get(resolveMycSlug(internalId));
}
