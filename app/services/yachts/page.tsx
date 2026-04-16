import type { Metadata } from "next";

import { YachtsCatalog } from "@/components/yachts-catalog";

export const metadata: Metadata = {
  title: "Yacht charters",
  description:
    "Motor yacht day charters in Miami — browse vessels, duration-based rates, and inclusions. Optional female hosts add-on (partner agency) available; request a tailored quote through Blackline.",
};

export default function YachtsPage() {
  return <YachtsCatalog />;
}
