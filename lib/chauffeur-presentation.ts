import { chauffeurQuoteRateLine, type ChauffeurFleetEntry } from "@/lib/chauffeur-fleet-data";
export function chauffeurHourlyPrice(car: ChauffeurFleetEntry): number | null {
    const match = chauffeurQuoteRateLine(car).match(/\$([\d,]+)/);
    return match ? Number(match[1].replaceAll(",", "")) : null;
}
export function displayChauffeurRate(car: ChauffeurFleetEntry, es = false): string {
    const line = chauffeurQuoteRateLine(car);
    return /XXX|request/i.test(line) ? (es ? "Bajo consulta" : "On request") : es ? line.replace(/\/ hour|\/ hr/g, "/ hora") : line;
}
export const CHAUFFEUR_FILTER_KEYS = ["page", "q", "brand", "budget", "seats", "sort", "featured", "photos"] as const;
