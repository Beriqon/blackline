"use client";

import { useLocale } from "@/components/locale-provider";
import {
  LOCALE_LABELS,
  LOCALE_SHORT,
  LOCALES,
} from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

export function LanguageToggleMobile({ onSelect }: { onSelect?: () => void }) {
  const { locale, setLocale, isPending, t } = useLocale();

  return (
    <div className="mb-2 border-b border-gold/10 pb-3 sm:hidden">
      <p className="px-3 pb-2 text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-cream/45">
        {t("common.selectLanguage")}
      </p>
      <div className="flex flex-wrap gap-2 px-3">
        {LOCALES.map((code) => {
          const active = code === locale;
          return (
            <button
              key={code}
              type="button"
              disabled={isPending}
              onClick={() => {
                setLocale(code);
                onSelect?.();
              }}
              className={cn(
                "inline-flex items-center gap-2 border px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition-colors",
                active
                  ? "border-gold/45 bg-gold/10 text-gold-secondary"
                  : "border-gold/15 text-cream/75 hover:border-gold/30 hover:text-gold-secondary",
              )}
            >
              <span>{LOCALE_SHORT[code]}</span>
              <span className="normal-case tracking-normal text-cream/50">
                {LOCALE_LABELS[code]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
