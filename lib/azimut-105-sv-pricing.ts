import { TRINITY_TAX_RATE, formatUsd } from "./trinity-pricing";

/** Florida-style charter add-ons for 105 Azimut SV — tax on charter; gratuity on charter. */
export const AZIMUT_105_SV_DURATIONS = [
  { id: "4h", label: "4 hours", hours: 4, baseUsd: 7_500 },
  { id: "6h", label: "6 hours", hours: 6, baseUsd: 9_850 },
  { id: "8h", label: "8 hours", hours: 8, baseUsd: 11_000 },
] as const;

export const AZIMUT_105_SV_GRATUITY_PCTS = [15, 18, 20, 22] as const;
export type Azimut105SvGratuityPct = (typeof AZIMUT_105_SV_GRATUITY_PCTS)[number];

export function computeAzimut105SvTotals(
  baseUsd: number,
  gratuityPct: Azimut105SvGratuityPct,
) {
  const taxUsd = Math.round(baseUsd * TRINITY_TAX_RATE);
  const gratuityUsd = Math.round((baseUsd * gratuityPct) / 100);
  const totalUsd = baseUsd + taxUsd + gratuityUsd;
  return { taxUsd, gratuityUsd, totalUsd };
}

export { formatUsd };
