import type { ExoticCar } from "./exotic-cars-data";

export type ExoticSortMode =
  | "featured-first"
  | "price-asc"
  | "price-desc"
  | "name-asc"
  | "name-desc";

/** First dollar amount in `priceLine` (e.g. "$1,299 / day" → 1299). */
export function parseExoticPriceUsd(car: ExoticCar): number {
  const m = car.priceLine.match(/\$([\d,]+)/);
  if (!m) return 0;
  const n = parseInt(m[1].replace(/,/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
}

export function sortExoticCars(
  cars: ExoticCar[],
  mode: ExoticSortMode,
): ExoticCar[] {
  const copy = [...cars];
  if (mode === "featured-first") {
    copy.sort((a, b) => {
      const fa = a.featured ? 0 : 1;
      const fb = b.featured ? 0 : 1;
      if (fa !== fb) return fa - fb;
      return a.name.localeCompare(b.name, "en", { sensitivity: "base" });
    });
    return copy;
  }
  if (mode === "price-asc") {
    copy.sort((a, b) => {
      const pa = parseExoticPriceUsd(a);
      const pb = parseExoticPriceUsd(b);
      if (pa !== pb) return pa - pb;
      return a.name.localeCompare(b.name, "en", { sensitivity: "base" });
    });
    return copy;
  }
  if (mode === "price-desc") {
    copy.sort((a, b) => {
      const pa = parseExoticPriceUsd(a);
      const pb = parseExoticPriceUsd(b);
      if (pa !== pb) return pb - pa;
      return a.name.localeCompare(b.name, "en", { sensitivity: "base" });
    });
    return copy;
  }
  if (mode === "name-asc") {
    copy.sort((a, b) =>
      a.name.localeCompare(b.name, "en", { sensitivity: "base" }),
    );
    return copy;
  }
  copy.sort((a, b) =>
    b.name.localeCompare(a.name, "en", { sensitivity: "base" }),
  );
  return copy;
}
