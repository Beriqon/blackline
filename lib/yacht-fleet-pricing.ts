import {
  TRINITY_TAX_RATE,
  formatUsd,
} from "./trinity-pricing";
import type { Yacht } from "./yachts-data";

export const FLEET_GRATUITY_PCTS = [15, 18, 20, 22] as const;
export type FleetGratuityPct = (typeof FLEET_GRATUITY_PCTS)[number];

export function parseUsdFromTierAmount(amount: string): number {
  const m = amount.replace(/,/g, "").match(/\$?\s*([\d.]+)/);
  if (!m) return 0;
  return Math.round(parseFloat(m[1]));
}

export function computeFleetTotals(
  baseUsd: number,
  gratuityPct: FleetGratuityPct,
) {
  const taxUsd = Math.round(baseUsd * TRINITY_TAX_RATE);
  const gratuityUsd = Math.round((baseUsd * gratuityPct) / 100);
  const totalUsd = baseUsd + taxUsd + gratuityUsd;
  return { taxUsd, gratuityUsd, totalUsd };
}

export type FleetDurationOption = {
  id: string;
  label: string;
  baseUsd: number;
};

/** Build calculator duration pills from catalog price tiers. */
export function durationOptionsFromYacht(y: Yacht): FleetDurationOption[] {
  return y.priceTiers.map((t, i) => ({
    id: `d${i}`,
    label: t.durationLabel,
    baseUsd: parseUsdFromTierAmount(t.amount),
  }));
}

export { formatUsd };
