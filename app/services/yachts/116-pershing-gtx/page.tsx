import type { Metadata } from "next";

import { YachtPershingGtxProduct } from "@/components/yacht-pershing-gtx-product";

export const metadata: Metadata = {
  title: "116 Pershing GTX — Yacht charter",
  description:
    "116′ Pershing GTX motor yacht — 13 guests, 5 staterooms. Charter rates with 7% tax and selectable crew gratuity (15–22%). Request a quote through Blackline.",
};

export default function PershingGtxYachtPage() {
  return <YachtPershingGtxProduct />;
}
