import type { Metadata } from "next";
import Link from "next/link";
import { SERVICE_LINKS } from "@/lib/nav";

export const metadata: Metadata = {
  title: "Services",
};

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="text-center font-serif text-3xl tracking-tight text-cream sm:text-4xl">
        Services
      </h1>
      <p className="mx-auto mt-4 max-w-lg text-center text-sm text-cream/55">
        Explore each offering — every service has its own page with details.
      </p>
      <ul className="mt-12 grid gap-3 sm:grid-cols-2">
        {SERVICE_LINKS.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="block rounded-sm border border-gold/15 bg-charcoal/40 px-5 py-4 text-sm font-medium text-cream/90 transition-colors hover:border-gold/35 hover:text-gold-secondary"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
