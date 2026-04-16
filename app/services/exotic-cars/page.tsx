import type { Metadata } from "next";

import { ExoticCarsCatalog } from "@/components/exotic-cars-catalog";

export const metadata: Metadata = {
  title: "Exotic car rentals",
  description:
    "Hourly chauffeur fleet and daily self-drive exotics in Miami — inquire for current lineup and rates.",
};

export default function ExoticCarsPage() {
  return <ExoticCarsCatalog />;
}
