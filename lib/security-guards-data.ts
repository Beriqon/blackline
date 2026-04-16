/** Shared copy for security rate cards — used on the security page and add-to-cart. */
export const SECURITY_GUARD_RATE_CARDS = [
  {
    id: "unarmed" as const,
    category: "security-unarmed" as const,
    eyebrow: "Unarmed",
    title: "Unarmed bodyguard",
    price: "$125/hr",
    hourlyRateUsd: 125,
    minimum: "4 hours minimum per booking",
    minimumHours: 4,
    minimumTotalUsd: 500,
    cartTitle: "Unarmed bodyguard",
    lines: [
      "Discreet close protection and venue coverage without visible firearms — ideal for many nightlife, hospitality, and corporate settings.",
      "Coordinated with your existing Blackline itinerary so arrival, movement, and exit windows stay aligned with transport and reservations.",
    ],
  },
  {
    id: "armed" as const,
    category: "security-armed" as const,
    eyebrow: "Armed",
    title: "Armed bodyguard",
    price: "$150/hr",
    hourlyRateUsd: 150,
    minimum: "4 hours minimum per booking",
    minimumHours: 4,
    minimumTotalUsd: 600,
    cartTitle: "Armed bodyguard",
    lines: [
      "Licensed armed protection where policy and venue rules allow — scoped in advance with clear comms on dress, positioning, and escalation protocols.",
      "Same coordination model as our unarmed team: one concierge thread for timing alongside cars, yachts, villas, and VIP access.",
    ],
  },
] as const;
