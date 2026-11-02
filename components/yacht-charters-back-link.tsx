"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";

import { useLocale } from "@/components/locale-provider";

const defaultClassName =
  "inline-flex items-center gap-2 text-[0.7rem] font-medium uppercase tracking-[0.22em] text-gold/85 transition-colors hover:text-gold-secondary";

function YachtChartersBackLinkInner({ className }: { className?: string }) {
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const href = useMemo(() => {
    const params = new URLSearchParams();
    for (const key of ["page", "q", "region", "size", "budget", "guests", "sort", "featured"]) {
      const value = searchParams.get(key); if (value) params.set(key, value);
    }
    return "/services/yachts" + (params.size ? "?" + params : "") + "#yacht-collection";
  }, [searchParams]);

  return (
    <Link href={href} className={className ?? defaultClassName}>
      <ChevronLeft className="h-4 w-4" aria-hidden />
      {t("yachtsPage.backToCharters")}
    </Link>
  );
}

function YachtChartersBackLinkFallback({ className }: { className?: string }) {
  const { t } = useLocale();
  return (
    <Link href="/services/yachts" className={className ?? defaultClassName}>
      <ChevronLeft className="h-4 w-4" aria-hidden />
      {t("yachtsPage.backToCharters")}
    </Link>
  );
}

/** Back to fleet list; preserves catalog page when opened via `?page=` on the product URL. */
export function YachtChartersBackLink({
  className,
}: {
  className?: string;
}) {
  return (
    <Suspense fallback={<YachtChartersBackLinkFallback className={className} />}>
      <YachtChartersBackLinkInner className={className} />
    </Suspense>
  );
}
