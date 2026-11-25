export const CHAUFFEUR_MINIMUM_HOURS = 4;
export const CHAUFFEUR_MINIMUM_MESSAGE = "Chauffeur bookings require a minimum of 4 hours.";
export const CHAUFFEUR_DURATION_HOURS = [CHAUFFEUR_MINIMUM_HOURS, 6, 8] as const;

export function chauffeurDurationHours(input = CHAUFFEUR_MINIMUM_HOURS): number {
 if (input < CHAUFFEUR_MINIMUM_HOURS) throw new Error(CHAUFFEUR_MINIMUM_MESSAGE);
 if (!Number.isInteger(input) || input > 12) throw new Error("Choose a valid chauffeur duration.");
 return input;
}
