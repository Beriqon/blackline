"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";

const defaultClassName =
  "inline-flex items-center gap-2 text-[0.7rem] font-medium uppercase tracking-[0.22em] text-gold/85 transition-colors hover:text-gold-secondary";

function YachtChartersBackLinkInner({ className }: { className?: string }) {
  const searchParams = useSearchParams();
  const href = useMemo(() => {
    const p = searchParams.get("page");
    if (!p) return "/services/yachts";
    const n = parseInt(p, 10);
    if (!Number.isFinite(n) || n < 2) return "/services/yachts";
    return `/services/yachts?page=${n}`;
  }, [searchParams]);

  return (
    <Link href={href} className={className ?? defaultClassName}>
      <ChevronLeft className="h-4 w-4" aria-hidden />
      Yacht charters
    </Link>
  );
}

function YachtChartersBackLinkFallback({ className }: { className?: string }) {
  return (
    <Link href="/services/yachts" className={className ?? defaultClassName}>
      <ChevronLeft className="h-4 w-4" aria-hidden />
      Yacht charters
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
