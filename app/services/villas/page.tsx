import type { Metadata } from "next";

import { VillasCatalog } from "@/components/villas-catalog";

export const metadata: Metadata = {
  title: "Villas & stays",
  description:
    "Curated Miami-area villa stays — request availability and terms through Blackline.",
};

export default function VillasPage() {
  return <VillasCatalog />;
}
