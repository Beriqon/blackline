import type { Metadata } from "next";

import { Yacht76SunseekerProduct } from "@/components/yacht-76-sunseeker-product";

export const metadata: Metadata = {
  title: "76 Sunseeker — Yacht charter",
  description:
    "76′ Sunseeker — Marina Palms, North Miami Beach. Up to 13 guests cruising. Charter rates with 7% tax and selectable crew gratuity (15–22%). Request a quote through Blackline.",
};

export default function Sunseeker76YachtPage() {
  return <Yacht76SunseekerProduct />;
}
