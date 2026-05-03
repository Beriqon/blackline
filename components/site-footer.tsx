import Link from "next/link";
import { Mail } from "lucide-react";

function InstagramGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function TikTokGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.65 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

const socialIconLinkClass =
  "inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-gold/20 text-cream/55 transition-colors hover:border-gold/45 hover:text-gold-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold/50";

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
          <div className="flex flex-row flex-wrap items-center gap-3 sm:gap-4">
            <a
              href="https://www.instagram.com/blackline_concierge/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram — @blackline_concierge"
              className={socialIconLinkClass}
            >
              <InstagramGlyph className="size-[1.15rem]" />
            </a>
            <a
              href="https://www.tiktok.com/@blacklineconcierge"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok — @blacklineconcierge"
              className={socialIconLinkClass}
            >
              <TikTokGlyph className="size-[1.05rem]" />
            </a>
            <a
              href="mailto:Blackline235@gmail.com"
              aria-label="Email Blackline235@gmail.com"
              className={socialIconLinkClass}
            >
              <Mail className="size-[1.15rem]" strokeWidth={1.75} aria-hidden />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
