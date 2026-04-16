import type { Metadata } from "next";

import { Yacht96SunseekerProduct } from "@/components/yacht-96-sunseeker-product";

export const metadata: Metadata = {
  title: "96 Sunseeker — Yacht charter",
  description:
    "96′ Sunseeker — 12 guests cruising, 4 staterooms, 5 baths. Charter rates with 7% tax and selectable crew gratuity (15–22%). Request a quote through Blackline.",
};

export default function Sunseeker96YachtPage() {
  return <Yacht96SunseekerProduct />;
}
