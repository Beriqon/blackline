import type { Metadata } from "next";

import { ExoticCarsCatalog } from "@/components/exotic-cars-catalog";

export const metadata: Metadata = {
  title: "Exotic car rentals",
  description:
    "Daily self-drive exotic and luxury car rentals in Miami — inquire for current lineup, rates, and chauffeur options where offered.",
};

export default function ExoticCarsPage() {
  return <ExoticCarsCatalog />;
}
