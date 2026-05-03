import Link from "next/link";

const COPY = {
  villa:
    "Chauffeur service is available on request — airport or hotel pickup, timed transfers to your villa, and rides to the marina when you step aboard a yacht.",
  yacht:
    "Add chauffeur service so you are picked up on schedule, driven to the marina for embarkation, and returned after your charter.",
  jet: "Ground legs can match your flight — chauffeur pickup from home, hotel, or the FBO, then onward to your villa, yacht, or meetings.",
} as const;

export type ChauffeurServiceCrosslinkVariant = keyof typeof COPY;

export function ChauffeurServiceCrosslink({
  variant,
  className = "mt-4 max-w-2xl text-sm leading-relaxed text-cream/52 sm:text-[0.9375rem]",
}: {
  variant: ChauffeurServiceCrosslinkVariant;
  className?: string;
}) {
  return (
    <p className={className}>
      {COPY[variant]}{" "}
      <Link
        href="/services/chauffeur-services"
        className="font-medium text-gold/88 underline decoration-gold/22 underline-offset-[0.2em] transition-colors hover:text-gold-secondary hover:decoration-gold-secondary/45"
      >
        Chauffeur services
      </Link>
      .
    </p>
  );
}
