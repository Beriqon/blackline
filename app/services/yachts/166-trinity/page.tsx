import type { Metadata } from "next";

import { YachtTrinityProduct } from "@/components/yacht-trinity-product";

export const metadata: Metadata = {
  title: "166 Trinity — Yacht charter",
  description:
    "166′ Trinity motor yacht — 13 guests, 7 staterooms. Charter rates with 7% tax and selectable crew gratuity (15–22%). Request a quote through Blackline.",
};

export default function TrinityYachtPage() {
  return <YachtTrinityProduct />;
}
