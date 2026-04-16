import type { Metadata } from "next";

import { PrivateJetsCatalog } from "@/components/private-jets-catalog";

export const metadata: Metadata = {
  title: "Private jets",
  description:
    "Charter Gulfstream, Global Express, Falcon, Challenger, Legacy, Learjet, and more — specs and amenities for ultra-long-range, super-midsize, and midsize private jets through Blackline.",
};

export default function PrivateJetsPage() {
  return <PrivateJetsCatalog />;
}
