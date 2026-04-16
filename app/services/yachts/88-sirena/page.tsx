import type { Metadata } from "next";

import { Yacht88SirenaProduct } from "@/components/yacht-88-sirena-product";

export const metadata: Metadata = {
  title: "88 Sirena — Yacht charter",
  description:
    "88′ Sirena — 13 guests cruising, 5 staterooms, 4 baths. Charter rates with 7% tax and selectable crew gratuity (15–22%). Request a quote through Blackline.",
};

export default function Sirena88YachtPage() {
  return <Yacht88SirenaProduct />;
}
