import {
  TRINITY_TAX_RATE,
  formatUsd,
  type TrinityGratuityPct,
} from "./trinity-pricing";

/** Florida-style charter add-ons for 116 Pershing GTX — tax on charter; gratuity on charter. */
export const PERSHING_GTX_DURATIONS = [
  { id: "4h", label: "4 hours", hours: 4, baseUsd: 17_000 },
  { id: "6h", label: "6 hours", hours: 6, baseUsd: 19_000 },
  { id: "8h", label: "8 hours", hours: 8, baseUsd: 21_000 },
] as const;

export const PERSHING_GTX_GRATUITY_PCTS = [15, 18, 20, 22] as const;
export type PershingGtxGratuityPct = TrinityGratuityPct;

export function computePershingGtxTotals(
  baseUsd: number,
  gratuityPct: PershingGtxGratuityPct,
) {
  const taxUsd = Math.round(baseUsd * TRINITY_TAX_RATE);
  const gratuityUsd = Math.round((baseUsd * gratuityPct) / 100);
  const totalUsd = baseUsd + taxUsd + gratuityUsd;
  return { taxUsd, gratuityUsd, totalUsd };
}

export { formatUsd };
