import { TRINITY_TAX_RATE, formatUsd } from "./trinity-pricing";

/** Florida-style charter add-ons for 90 Pershing Refit 2025 — tax on charter; gratuity on charter. */
export const PERSHING_90_REFIT_DURATIONS = [
  { id: "4h", label: "4 hours", hours: 4, baseUsd: 6_000 },
  { id: "6h", label: "6 hours", hours: 6, baseUsd: 8_000 },
  { id: "8h", label: "8 hours", hours: 8, baseUsd: 10_000 },
] as const;

export const PERSHING_90_REFIT_GRATUITY_PCTS = [15, 18, 20, 22] as const;
export type Pershing90RefitGratuityPct =
  (typeof PERSHING_90_REFIT_GRATUITY_PCTS)[number];

export function computePershing90RefitTotals(
  baseUsd: number,
  gratuityPct: Pershing90RefitGratuityPct,
) {
  const taxUsd = Math.round(baseUsd * TRINITY_TAX_RATE);
  const gratuityUsd = Math.round((baseUsd * gratuityPct) / 100);
  const totalUsd = baseUsd + taxUsd + gratuityUsd;
  return { taxUsd, gratuityUsd, totalUsd };
}

export { formatUsd };
