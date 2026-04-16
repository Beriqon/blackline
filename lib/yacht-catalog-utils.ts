import type { Yacht, YachtRegion, YachtSizeBand, YachtPriceBand } from "./yachts-data";

export type YachtFeaturedFilter = "all" | "featured";

export type YachtSortMode =
  | "default"
  | "price-asc"
  | "price-desc"
  | "name-asc"
  | "name-desc";

export function yachtMatchesPriceBand(
  listingPriceUsd: number,
  band: YachtPriceBand,
): boolean {
  if (band === "all") return true;
  if (band === "under-4k") return listingPriceUsd < 4000;
  if (band === "3k-5k") return listingPriceUsd >= 3000 && listingPriceUsd < 5000;
  return listingPriceUsd >= 5000;
}

export function yachtMatchesSizeBand(
  lengthFt: number,
  band: YachtSizeBand,
): boolean {
  if (band === "all") return true;
  if (band === "under-50") return lengthFt < 50;
  if (band === "50-70") return lengthFt >= 50 && lengthFt < 70;
  if (band === "70-100") return lengthFt >= 70 && lengthFt < 100;
  return lengthFt >= 100;
}

export function filterYachtCatalog(
  items: readonly Yacht[],
  opts: {
    featured: YachtFeaturedFilter;
    price: YachtPriceBand;
    region: YachtRegion | "all";
    size: YachtSizeBand;
  },
): Yacht[] {
  return items.filter((y) => {
    if (opts.featured === "featured" && !y.featured) return false;
    if (!yachtMatchesPriceBand(y.listingPriceUsd, opts.price)) return false;
    if (opts.region !== "all" && y.region !== opts.region) return false;
    if (!yachtMatchesSizeBand(y.lengthFt, opts.size)) return false;
    return true;
  });
}

export function sortYachtCatalog(
  items: Yacht[],
  mode: YachtSortMode,
): Yacht[] {
  const copy = [...items];
  if (mode === "default") {
    copy.sort((a, b) => {
      const oa = a.catalogOrder;
      const ob = b.catalogOrder;
      if (typeof oa === "number" && typeof ob === "number" && oa !== ob) {
        return oa - ob;
      }
      const fa = a.featured ? 0 : 1;
      const fb = b.featured ? 0 : 1;
      if (fa !== fb) return fa - fb;
      return a.name.localeCompare(b.name, "en", { sensitivity: "base" });
    });
    return copy;
  }
  if (mode === "price-asc") {
    copy.sort((a, b) => a.listingPriceUsd - b.listingPriceUsd);
    return copy;
  }
  if (mode === "price-desc") {
    copy.sort((a, b) => b.listingPriceUsd - a.listingPriceUsd);
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

export { paginateSlice } from "./pagination";
