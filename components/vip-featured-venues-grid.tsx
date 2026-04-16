"use client";

import { VipVenueCard } from "@/components/vip-venue-card";
import { ScrollRevealItem } from "@/components/scroll-reveal-item";
import type { FeaturedVenue } from "@/lib/vip-nightlife-data";

export function VipFeaturedVenuesGrid({
  venues,
}: {
  venues: readonly FeaturedVenue[];
}) {
  return (
    <ul
      className="mt-10 grid list-none gap-4 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3 lg:gap-5"
      role="list"
    >
      {venues.map((v, index) => (
        <li key={v.name}>
          <ScrollRevealItem index={index}>
            <VipVenueCard venue={v} />
          </ScrollRevealItem>
        </li>
      ))}
    </ul>
  );
}
