"use client";
import type { Translator } from "@/lib/i18n/translate";
import { cn } from "@/lib/utils";
export function ExoticCatalogPagination({ page, pageCount, total, pageSize, onPage, t, }: {
    page: number;
    pageCount: number;
    total: number;
    pageSize: number;
    onPage: (p: number) => void;
    t: Translator;
}) {
    if (pageCount <= 1)
        return null;
    const from = (page - 1) * pageSize + 1;
    const to = Math.min(page * pageSize, total);
    return (<nav className="mt-12 flex flex-col items-center gap-5 border-t border-gold/10 pt-10 sm:flex-row sm:justify-between" aria-label={t("exoticCarsPage.paginationAria")}>
      <p className="text-[0.72rem] tabular-nums text-cream/42">
        {t("exoticCarsPage.showingRange", { from, to, total })}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
        <button type="button" onClick={() => onPage(page - 1)} disabled={page <= 1} className={cn("min-h-9 min-w-[4.5rem] border px-3 text-[0.62rem] font-semibold uppercase tracking-[0.14em] transition-colors disabled:cursor-not-allowed disabled:opacity-35 sm:min-h-10 sm:text-[0.65rem]", page <= 1
            ? "border-gold/10 text-cream/30"
            : "border-gold/18 text-cream/65 hover:border-gold/32 hover:text-cream")}>
          {t("exoticCarsPage.prev")}
        </button>
        {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (<button key={p} type="button" onClick={() => onPage(p)} aria-current={p === page ? "page" : undefined} className={cn("flex h-9 min-w-9 items-center justify-center border text-[0.7rem] font-semibold tabular-nums transition-colors sm:h-10 sm:min-w-10 sm:text-[0.75rem]", p === page
                ? "border-gold/45 bg-gold/[0.08] text-gold-secondary"
                : "border-gold/12 text-cream/55 hover:border-gold/25 hover:text-cream/80")}>
            {p}
          </button>))}
        <button type="button" onClick={() => onPage(page + 1)} disabled={page >= pageCount} className={cn("min-h-9 min-w-[4.5rem] border px-3 text-[0.62rem] font-semibold uppercase tracking-[0.14em] transition-colors disabled:cursor-not-allowed disabled:opacity-35 sm:min-h-10 sm:text-[0.65rem]", page >= pageCount
            ? "border-gold/10 text-cream/30"
            : "border-gold/18 text-cream/65 hover:border-gold/32 hover:text-cream")}>
          {t("exoticCarsPage.next")}
        </button>
      </div>
    </nav>);
}
