"use client";

import { ChevronDown, Globe } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { useLocale } from "@/components/locale-provider";
import {
  LOCALE_LABELS,
  LOCALE_SHORT,
  LOCALES,
} from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

export function LanguageToggle() {
  const { locale, setLocale, isPending, t } = useLocale();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close();
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [open, close]);

  return (
    <div ref={rootRef} className="relative hidden sm:block">
      <button
        type="button"
        data-header-control
        onClick={() => setOpen((o) => !o)}
        disabled={isPending}
        className={cn(
          "inline-flex h-10 items-center gap-1.5 border border-gold/22 bg-charcoal/80 px-2.5 text-cream transition-colors hover:border-gold/40 hover:text-gold-secondary sm:h-11 sm:px-3",
          isPending && "opacity-60",
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("common.selectLanguage")}
      >
        <Globe className="size-3.5 shrink-0 opacity-80" aria-hidden />
        <span className="text-[0.65rem] font-semibold uppercase tracking-[0.14em]">
          {LOCALE_SHORT[locale]}
        </span>
        <ChevronDown
          className={cn(
            "size-3 opacity-60 transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      <div
        role="listbox"
        aria-label={t("common.selectLanguage")}
        className={cn(
          "absolute right-0 top-full z-50 mt-1 min-w-[9.5rem] border border-gold/15 bg-[#141414] py-1 shadow-lg shadow-black/40 transition-[opacity,visibility]",
          open
            ? "visible opacity-100"
            : "pointer-events-none invisible opacity-0",
        )}
      >
        {LOCALES.map((code) => {
          const active = code === locale;
          return (
            <button
              key={code}
              type="button"
              role="option"
              aria-selected={active}
              disabled={isPending}
              onClick={() => {
                setLocale(code);
                close();
              }}
              className={cn(
                "flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm transition-colors",
                active
                  ? "bg-gold/10 text-gold-secondary"
                  : "text-cream/85 hover:bg-gold/5 hover:text-gold-secondary",
              )}
            >
              <span>{LOCALE_LABELS[code]}</span>
              <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-cream/45">
                {LOCALE_SHORT[code]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
