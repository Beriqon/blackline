import { TRINITY_TAX_RATE, formatUsd } from "./trinity-pricing";

/** Florida-style charter add-ons for 88 Azimut 2023 — tax on charter; gratuity on charter. */
export const AZIMUT_88_DURATIONS = [
  { id: "4h", label: "4 hours", hours: 4, baseUsd: 9_000 },
  { id: "6h", label: "6 hours", hours: 6, baseUsd: 10_500 },
  { id: "8h", label: "8 hours", hours: 8, baseUsd: 12_500 },
] as const;

export const AZIMUT_88_GRATUITY_PCTS = [14, 18, 20, 22] as const;
export type Azimut88GratuityPct = (typeof AZIMUT_88_GRATUITY_PCTS)[number];

export function computeAzimut88Totals(
  baseUsd: number,
  gratuityPct: Azimut88GratuityPct,
) {
  const taxUsd = Math.round(baseUsd * TRINITY_TAX_RATE);
  const gratuityUsd = Math.round((baseUsd * gratuityPct) / 100);
  const totalUsd = baseUsd + taxUsd + gratuityUsd;
  return { taxUsd, gratuityUsd, totalUsd };
}

export { formatUsd };
