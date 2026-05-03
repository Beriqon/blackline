"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { SERVICE_LINKS } from "@/lib/nav";
import { cn } from "@/lib/utils";

const linkClass =
  "text-sm font-medium text-cream/85 transition-colors hover:text-gold-secondary";

export function ServicesNavDropdown() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={handleBlur}
    >
      <Link
        href="/services"
        className={cn(
          "inline-flex items-center gap-1 rounded-sm outline-none ring-gold/35 focus-visible:ring-2",
          linkClass,
        )}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        Services
        <ChevronDown
          className={cn(
            "size-3.5 opacity-55 transition-transform duration-200",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </Link>
      <div
        className={cn(
          "absolute left-0 top-full z-50 pt-1 transition-[opacity,visibility] duration-150",
          open
            ? "visible opacity-100"
            : "pointer-events-none invisible opacity-0",
        )}
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
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
