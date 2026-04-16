import type { Metadata } from "next";

import { Yacht97SanLorenzoProduct } from "@/components/yacht-97-san-lorenzo-product";

export const metadata: Metadata = {
  title: "97 San Lorenzo — Yacht charter",
  description:
    "97′ San Lorenzo — 13 guests cruising, 4 staterooms, 5 baths. Charter rates with 7% tax and selectable crew gratuity (15–22%). Request a quote through Blackline.",
};

export default function SanLorenzo97YachtPage() {
  return <Yacht97SanLorenzoProduct />;
}
