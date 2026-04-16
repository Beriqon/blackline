import type { Metadata } from "next";

import { Yacht105AzimutSvProduct } from "@/components/yacht-105-azimut-sv-product";

export const metadata: Metadata = {
  title: "105 Azimut SV — Yacht charter",
  description:
    "105′ Azimut SV — 13 guests cruising, 5 staterooms, 4 baths. Charter rates with 7% tax and selectable crew gratuity (15–22%). Request a quote through Blackline.",
};

export default function Azimut105SvYachtPage() {
  return <Yacht105AzimutSvProduct />;
}
