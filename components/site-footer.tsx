import Link from "next/link";
import { ExternalLink } from "lucide-react";

const footerLinks = [
  { href: "/services", label: "Services" },
  { href: "/packages", label: "Packages" },
  { href: "/experiences", label: "Experiences" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-gold/10 bg-charcoal">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="font-serif text-xl tracking-[0.15em] text-cream">
              BLACKLINE
            </p>
            <p className="mt-1 text-[0.65rem] uppercase tracking-[0.45em] text-gold">
              Concierge
            </p>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-cream/58">
              Miami luxury concierge — yachts, jets, exotics, villas,
              and VIP access. One team, one call.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-10 gap-y-4 text-sm">
            {footerLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-cream/60 transition-colors hover:text-gold-secondary"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="mt-16 flex flex-col gap-4 border-t border-gold/10 pt-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs tracking-wide text-cream/42">
              © {new Date().getFullYear()} Blackline Concierge. Miami, Florida.
            </p>
          </div>
          <a
            href="https://www.instagram.com/blackline_concierge/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs text-cream/50 transition-colors hover:text-gold-secondary"
          >
            <ExternalLink className="size-4" aria-hidden />
            @blackline_concierge
          </a>
        </div>
      </div>
    </footer>
  );
}
