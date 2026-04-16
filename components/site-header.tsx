import Link from "next/link";
import { ChevronDown, Phone } from "lucide-react";
import { CartHeaderButton } from "@/components/cart-header-button";
import { cn } from "@/lib/utils";
import { MobileNav } from "@/components/mobile-nav";
import { SERVICE_LINKS } from "@/lib/nav";

const navAfterServices = [
  { href: "/packages", label: "Packages" },
  { href: "/experiences", label: "Experiences" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

const PHONE_DISPLAY = "(786) 684-0345";
const PHONE_TEL = "+17866840345";

const linkClass =
  "text-sm font-medium text-cream/85 transition-colors hover:text-gold-secondary";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-gold/10 bg-[#0b0b0b]/92 backdrop-blur-md">
      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:h-[4.25rem] sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group flex flex-col leading-none"
          aria-label="Blackline Concierge home"
        >
          <span className="font-serif text-lg tracking-[0.22em] text-cream sm:text-xl">
            BLACKLINE
          </span>
          <span className="text-[0.65rem] font-medium uppercase tracking-[0.42em] text-gold/90">
            Concierge
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          <div className="group relative">
            <Link
              href="/services"
              className={cn(
                "inline-flex items-center gap-1 rounded-sm",
                linkClass,
              )}
            >
              Services
              <ChevronDown
                className="size-3.5 opacity-55 transition-transform duration-200 group-hover:rotate-180"
                aria-hidden
              />
            </Link>
            <div
              className="absolute left-0 top-full z-50 pt-1 opacity-0 invisible transition-[opacity,visibility] duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
              role="presentation"
            >
              <div
                className="min-w-[13.5rem] rounded-sm border border-gold/15 bg-[#141414] py-2 shadow-lg shadow-black/40"
                role="menu"
                aria-label="Services"
              >
                {SERVICE_LINKS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    role="menuitem"
                    className="block px-4 py-2.5 text-sm text-cream/85 transition-colors hover:bg-gold/5 hover:text-gold-secondary"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {navAfterServices.map((item) => (
            <Link key={item.href} href={item.href} className={linkClass}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-1 items-center justify-end gap-2 md:flex-none sm:gap-3">
          <CartHeaderButton />
          <MobileNav />
          <a
            href={`tel:${PHONE_TEL}`}
            className="inline-flex items-center gap-1.5 border border-gold/25 bg-charcoal/80 px-3 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-cream transition-colors hover:border-gold/40 hover:text-gold-secondary sm:px-4 sm:text-xs"
          >
            <Phone className="size-3.5 shrink-0 sm:size-4" aria-hidden />
            <span className="hidden sm:inline">{PHONE_DISPLAY}</span>
            <span className="sm:hidden">Call</span>
          </a>
        </div>
      </div>
    </header>
  );
}
