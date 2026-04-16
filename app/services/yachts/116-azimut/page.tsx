import type { Metadata } from "next";

import { Yacht116AzimutProduct } from "@/components/yacht-116-azimut-product";

export const metadata: Metadata = {
  title: "116 Azimut — Yacht charter",
  description:
    "116′ Azimut motor yacht — 13 guests, 5 staterooms. Charter rates with 7% tax and selectable crew gratuity (15–22%). Request a quote through Blackline.",
};

export default function Azimut116YachtPage() {
  return <Yacht116AzimutProduct />;
}
