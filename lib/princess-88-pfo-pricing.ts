import { TRINITY_TAX_RATE, formatUsd } from "./trinity-pricing";

/** Florida-style charter add-ons for 88 Princess PFO — tax on charter; gratuity on charter. */
export const PRINCESS_88_PFO_DURATIONS = [
  { id: "4h", label: "4 hours", hours: 4, baseUsd: 5_500 },
  { id: "6h", label: "6 hours", hours: 6, baseUsd: 6_500 },
  { id: "8h", label: "8 hours", hours: 8, baseUsd: 7_500 },
] as const;

export const PRINCESS_88_PFO_GRATUITY_PCTS = [15, 18, 20, 22] as const;
export type Princess88PfoGratuityPct =
  (typeof PRINCESS_88_PFO_GRATUITY_PCTS)[number];

export function computePrincess88PfoTotals(
  baseUsd: number,
  gratuityPct: Princess88PfoGratuityPct,
) {
  const taxUsd = Math.round(baseUsd * TRINITY_TAX_RATE);
  const gratuityUsd = Math.round((baseUsd * gratuityPct) / 100);
  const totalUsd = baseUsd + taxUsd + gratuityUsd;
  return { taxUsd, gratuityUsd, totalUsd };
}

export { formatUsd };
