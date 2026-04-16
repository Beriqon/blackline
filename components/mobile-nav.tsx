"use client";

import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { SERVICE_LINKS } from "@/lib/nav";

const mainLinks = [
  { href: "/packages", label: "Packages" },
  { href: "/experiences", label: "Experiences" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  const close = () => {
    setOpen(false);
    setServicesOpen(false);
  };

  return (
    <div className="md:hidden">
      <button
        type="button"
        className="rounded-sm p-2 text-cream hover:bg-gold/5 hover:text-gold-secondary"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-label={open ? "Close menu" : "Open menu"}
      >
        {open ? <X className="size-6" /> : <Menu className="size-6" />}
      </button>
      <div
        id="mobile-nav-panel"
        className={cn(
          "absolute left-0 right-0 top-full border-b border-gold/10 bg-[#0b0b0b]/98 backdrop-blur-md transition-[visibility,opacity] duration-200",
          open ? "visible opacity-100" : "invisible opacity-0 pointer-events-none",
        )}
      >
        <nav className="flex flex-col gap-1 px-4 py-4" aria-label="Mobile">
          <div className="flex flex-col">
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-sm px-3 py-3 text-left text-base font-medium text-cream/90 hover:bg-gold/5 hover:text-gold-secondary"
              onClick={() => setServicesOpen((s) => !s)}
              aria-expanded={servicesOpen}
              aria-controls="mobile-services-subnav"
            >
              Services
              <ChevronDown
                className={cn(
                  "size-4 shrink-0 opacity-70 transition-transform",
                  servicesOpen && "rotate-180",
                )}
                aria-hidden
              />
            </button>
            <div
              id="mobile-services-subnav"
              inert={servicesOpen ? undefined : true}
              className={cn(
                "flex flex-col gap-1 overflow-hidden border-l border-gold/15 pl-3 transition-[max-height] duration-200",
                servicesOpen ? "max-h-96 pb-1" : "max-h-0",
              )}
            >
              <Link
                href="/services"
                className="rounded-sm px-3 py-2 text-sm text-cream/75 hover:bg-gold/5 hover:text-gold-secondary"
                onClick={close}
              >
                All services
              </Link>
              {SERVICE_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-sm px-3 py-2 text-sm text-cream/75 hover:bg-gold/5 hover:text-gold-secondary"
                  onClick={close}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {mainLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-sm px-3 py-3 text-base font-medium text-cream/90 hover:bg-gold/5 hover:text-gold-secondary"
              onClick={close}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
