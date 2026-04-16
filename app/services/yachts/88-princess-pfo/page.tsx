import type { Metadata } from "next";

import { Yacht88PrincessPfoProduct } from "@/components/yacht-88-princess-pfo-product";

export const metadata: Metadata = {
  title: "88 Princess PFO — Yacht charter",
  description:
    "88′ Princess – Overtime — Aston Martin Residences, Miami. Up to 13 guests, 4 staterooms, 5 baths. Charter rates with 7% tax and selectable crew gratuity (15–22%). Request a quote through Blackline.",
};

export default function Princess88PfoYachtPage() {
  return <Yacht88PrincessPfoProduct />;
}
