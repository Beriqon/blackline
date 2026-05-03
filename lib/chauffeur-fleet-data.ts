import {
  EXOTIC_CARS_DAILY,
  EXOTIC_CARS_HOURLY_GROUPS,
  type ExoticCar,
} from "./exotic-cars-data";

/** Same merge as the chauffeur services page — hourly fleet plus daily dual-rental vehicles. */
export type ChauffeurFleetEntry = ExoticCar & {
  source: "hourly" | "daily";
};

const FEATURED_CHAUFFEUR_IDS = [
  "exclusive-sprinter-chauffeur",
  "maybach-van-tiffany-blue",
  "maybach-van-royal-blue",
  "maybach-van-white",
  "mercedes-maybach-gls-600-unit-c",
  "rolls-royce-cullinan-black-unit-a",
] as const;

const featuredIdOrder = new Map<string, number>(
  FEATURED_CHAUFFEUR_IDS.map((id, index) => [id, index]),
);

export const FEATURED_CHAUFFEUR_ID_SET = new Set<string>([
  ...FEATURED_CHAUFFEUR_IDS,
]);

function buildChauffeurFleet(): ChauffeurFleetEntry[] {
  return [
    ...EXOTIC_CARS_HOURLY_GROUPS.flatMap((group) =>
      group.cars.map((car) => ({ ...car, source: "hourly" as const })),
    ),
    ...EXOTIC_CARS_DAILY.filter((car) => car.dualRentalOnCard).map((car) => ({
      ...car,
      source: "daily" as const,
    })),
  ];
}

/** Sorted fleet for chauffeur catalog and custom package builder — single source of truth. */
export const CHAUFFEUR_FLEET_SORTED: readonly ChauffeurFleetEntry[] =
  buildChauffeurFleet().sort((a, b) => {
    const aFeatured = featuredIdOrder.get(a.id);
    const bFeatured = featuredIdOrder.get(b.id);
    if (aFeatured != null && bFeatured != null) return aFeatured - bFeatured;
    if (aFeatured != null) return -1;
    if (bFeatured != null) return 1;
    return a.name.localeCompare(b.name, "en", { sensitivity: "base" });
  });

export function chauffeurQuoteRateLine(car: ChauffeurFleetEntry): string {
  return car.source === "hourly"
    ? car.priceLine
    : car.chauffeurPriceLine ?? "Rate on request";
}
