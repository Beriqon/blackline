import Link from "next/link";
import { Phone } from "lucide-react";
import { CartHeaderButton } from "@/components/cart-header-button";
import { LanguageToggle } from "@/components/language-toggle";
import { MobileNav } from "@/components/mobile-nav";
import { ServicesNavDropdown } from "@/components/services-nav-dropdown";
import { SiteHeaderShell } from "@/components/site-header-shell";
import { getI18n } from "@/lib/i18n/server";
import { getMainNavLinks } from "@/lib/i18n/nav";

const PHONE_DISPLAY = "(786) 684-0345";
const PHONE_TEL = "+17866840345";

const linkClass =
  "text-sm font-medium text-cream/85 transition-colors hover:text-gold-secondary";

export async function SiteHeader() {
  const { t } = await getI18n();
  const navAfterServices = getMainNavLinks(t);

  return (
    <SiteHeaderShell>
      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:h-[4.25rem] sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group flex flex-col leading-none"
          aria-label={t("common.homeAria")}
        >
          <span className="font-serif text-lg tracking-[0.22em] text-cream sm:text-xl">
            BLACKLINE
          </span>
          <span className="text-[0.65rem] font-medium uppercase tracking-[0.42em] text-gold/90">
            Concierge
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          <ServicesNavDropdown />
          {navAfterServices.map((item) => (
            <Link key={item.href} href={item.href} className={linkClass}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-1 items-center justify-end gap-2 md:flex-none sm:gap-3">
          <LanguageToggle />
          <CartHeaderButton />
          <MobileNav />
          <a
            href={`tel:${PHONE_TEL}`}
            data-header-control
            className="inline-flex items-center gap-1.5 border border-gold/25 bg-charcoal/80 px-3 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-cream transition-colors hover:border-gold/40 hover:text-gold-secondary sm:px-4 sm:text-xs"
          >
            <Phone className="size-3.5 shrink-0 sm:size-4" aria-hidden />
            <span className="hidden sm:inline">{PHONE_DISPLAY}</span>
            <span className="sm:hidden">{t("common.call")}</span>
          </a>
        </div>
      </div>
    </SiteHeaderShell>
  );
}


