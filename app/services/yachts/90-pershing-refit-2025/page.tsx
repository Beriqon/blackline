import type { Metadata } from "next";

import { Yacht90PershingRefitProduct } from "@/components/yacht-90-pershing-refit-product";

export const metadata: Metadata = {
  title: "90 Pershing Refit 2025 — Yacht charter",
  description:
    "90′ Pershing (refit 2025) — 13 guests cruising, 4 staterooms, 4 baths. North Miami departure. Charter rates with 7% tax and selectable crew gratuity (15–22%). Request a quote through Blackline.",
};

export default function Pershing90RefitYachtPage() {
  return <Yacht90PershingRefitProduct />;
}
