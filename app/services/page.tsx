import type { Metadata } from "next";
import Link from "next/link";

import { SERVICE_LINKS } from "@/lib/nav";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Services",
};

const CHAUFFEUR_HREF = "/services/chauffeur-services" as const;

const linkClass =
  "block rounded-sm border border-gold/15 bg-charcoal/40 px-5 py-4 text-sm font-medium text-cream/90 transition-colors hover:border-gold/35 hover:text-gold-secondary";

export default function ServicesPage() {
  const chauffeur = SERVICE_LINKS.find((s) => s.href === CHAUFFEUR_HREF);
  const otherServices = SERVICE_LINKS.filter((s) => s.href !== CHAUFFEUR_HREF);

  return (
    <div className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="text-center font-serif text-3xl tracking-tight text-cream sm:text-4xl">
        Services
      </h1>
      <p className="mx-auto mt-4 max-w-lg text-center text-sm text-cream/55">
        Explore each offering — every service has its own page with details.
      </p>
      <ul className="mt-12 grid gap-3 sm:grid-cols-2">
        {chauffeur ? (
          <li key={chauffeur.href} className="sm:col-span-2">
            <Link href={chauffeur.href} className={cn(linkClass, "text-center")}>
              {chauffeur.label}
            </Link>
          </li>
        ) : null}
        {otherServices.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className={linkClass}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
