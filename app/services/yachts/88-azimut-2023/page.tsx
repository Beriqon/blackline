import type { Metadata } from "next";

import { Yacht88Azimut2023Product } from "@/components/yacht-88-azimut-2023-product";

export const metadata: Metadata = {
  title: "88 Azimut 2023 — Yacht charter",
  description:
    "88′ Azimut (2023) — 13 guests cruising, 5 staterooms, 6 baths. Charter rates with 7% tax and selectable crew gratuity (14–22%). Request a quote through Blackline.",
};

export default function Azimut88Yacht2023Page() {
  return <Yacht88Azimut2023Product />;
}
