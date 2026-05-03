"use client";

import { Building2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { ChauffeurServiceCrosslink } from "@/components/chauffeur-service-crosslink";
import { ScrollRevealItem } from "@/components/scroll-reveal-item";
import { SectionReveal } from "@/components/section-reveal";
import { CONTACT_TRIP_BUILDER_HREF } from "@/lib/contact-hrefs";
import { paginateSlice } from "@/lib/pagination";
import {
  VILLA_NEIGHBORHOODS,
  VILLAS,
  type Villa,
  type VillaNeighborhood,
} from "@/lib/villas-data";
import { cn } from "@/lib/utils";

const VILLAS_CATALOG_PAGE_SIZE = 12;

const FEATURED_VILLA_IDS = new Set([
  "emerald",
  "fendi",
  "granada",
  "bodrum",
  "casa-blu",
  "mariola",
  "perla",
]);

function ImagePlaceholder({
  className,
  label,
}: {
  className?: string;
  label?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center gap-2 border border-gold/12 bg-[#141414] text-center",
        className,
      )}
    >
      <Building2 className="h-8 w-8 text-gold/22 sm:h-10 sm:w-10" aria-hidden />
      {label ? (
        <span className="px-2 text-[0.65rem] font-medium uppercase tracking-[0.2em] text-cream/35">
          {label}
        </span>
      ) : null}
    </div>
  );
}

function VillaCard({ villa }: { villa: Villa }) {
  const cover = villa.galleryImages[0];
  const isFeatured = FEATURED_VILLA_IDS.has(villa.id);
  return (
    <Link
      href={`/services/villas/${villa.id}`}
      className="group block w-full text-left transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold/50"
    >
      <div
        className={cn(
          "relative aspect-[16/10] overflow-hidden border bg-[#0b0b0b] transition-[border-color,box-shadow] duration-500",
          isFeatured
            ? "border-gold/45 shadow-[0_0_0_1px_rgba(198,164,108,0.22),0_12px_40px_rgba(0,0,0,0.45)] group-hover:border-gold/60 group-hover:shadow-[0_0_0_1px_rgba(224,195,138,0.35),0_16px_48px_rgba(198,164,108,0.12)]"
            : "border-gold/12 group-hover:border-gold/28",
        )}
      >
        {isFeatured ? (
          <>
            <div
              className="pointer-events-none absolute inset-x-0 top-0 z-[3] h-1 bg-gradient-to-r from-transparent via-gold/90 to-transparent"
              aria-hidden
            />
            <div className="absolute left-3 top-3 z-[3] sm:left-4 sm:top-4">
              <span className="inline-flex items-center justify-center rounded-sm border border-gold/55 bg-[#0b0b0b]/92 px-2.5 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-gold shadow-[0_4px_20px_rgba(0,0,0,0.5)] backdrop-blur-sm sm:px-3 sm:py-2 sm:text-[0.65rem]">
                Featured
              </span>
            </div>
          </>
        ) : null}
        {cover ? (
          <Image
            src={cover}
            alt={`${villa.name} — exterior`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <ImagePlaceholder
            className="absolute inset-0 h-full w-full"
            label="Photo placeholder"
          />
        )}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[min(42%,9.5rem)] bg-gradient-to-t from-[#070707]/92 via-[#0b0b0b]/45 to-transparent"
          aria-hidden
        />
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
          <p className="font-serif text-base leading-snug tracking-tight text-cream [text-shadow:0_1px_2px_rgba(0,0,0,1),0_2px_16px_rgba(0,0,0,0.88),0_0_1px_rgba(0,0,0,1)] sm:text-lg">
            {villa.name}
          </p>
          <p className="mt-1 text-[0.72rem] font-semibold uppercase leading-snug tracking-[0.2em] text-cream [text-shadow:0_1px_2px_rgba(0,0,0,1),0_2px_14px_rgba(0,0,0,0.9)]">
            {villa.subtitle}
          </p>
          <p className="mt-2 font-serif text-[1.05rem] tabular-nums text-gold-secondary [text-shadow:0_1px_2px_rgba(0,0,0,1),0_2px_14px_rgba(0,0,0,0.92),0_0_18px_rgba(0,0,0,0.5)] sm:text-[1.125rem]">
            {villa.cardTagline}
          </p>
        </div>
      </div>
      <p className="mt-3 text-[0.7rem] font-medium uppercase tracking-[0.22em] text-cream/40">
        Open full listing
      </p>
    </Link>
  );
}

type NeighborhoodFilter = "all" | VillaNeighborhood;

function VillaCatalogPagination({
  page,
  pageCount,
  total,
  pageSize,
  onPage,
}: {
  page: number;
  pageCount: number;
  total: number;
  pageSize: number;
  onPage: (p: number) => void;
}) {
  if (pageCount <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <nav
      className="mt-12 flex flex-col items-center gap-5 border-t border-gold/10 pt-10 sm:flex-row sm:justify-between"
      aria-label="Villa catalog pages"
    >
      <p className="text-[0.72rem] tabular-nums text-cream/42">
        Showing{" "}
        <span className="text-cream/55">
          {from}–{to}
        </span>{" "}
        of <span className="text-cream/55">{total}</span> properties
      </p>
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          className={cn(
            "min-h-9 min-w-[4.5rem] border px-3 text-[0.62rem] font-semibold uppercase tracking-[0.14em] transition-colors disabled:cursor-not-allowed disabled:opacity-35 sm:min-h-10 sm:text-[0.65rem]",
            page <= 1
              ? "border-gold/10 text-cream/30"
              : "border-gold/18 text-cream/65 hover:border-gold/32 hover:text-cream",
          )}
        >
          Prev
        </button>
        {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPage(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              "flex h-9 min-w-9 items-center justify-center border text-[0.7rem] font-semibold tabular-nums transition-colors sm:h-10 sm:min-w-10 sm:text-[0.75rem]",
              p === page
                ? "border-gold/45 bg-gold/[0.08] text-gold-secondary"
                : "border-gold/12 text-cream/55 hover:border-gold/25 hover:text-cream/80",
            )}
          >
            {p}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onPage(page + 1)}
          disabled={page >= pageCount}
          className={cn(
            "min-h-9 min-w-[4.5rem] border px-3 text-[0.62rem] font-semibold uppercase tracking-[0.14em] transition-colors disabled:cursor-not-allowed disabled:opacity-35 sm:min-h-10 sm:text-[0.65rem]",
            page >= pageCount
              ? "border-gold/10 text-cream/30"
              : "border-gold/18 text-cream/65 hover:border-gold/32 hover:text-cream",
          )}
        >
          Next
        </button>
      </div>
    </nav>
  );
}

function VillasCatalogInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [neighborhoodFilter, setNeighborhoodFilter] =
    useState<NeighborhoodFilter>("all");

  const requestedPage = useMemo(() => {
    const raw = searchParams.get("page");
    const n = parseInt(raw || "1", 10);
    return Number.isFinite(n) && n >= 1 ? n : 1;
  }, [searchParams]);

  const countsByNeighborhood = useMemo(() => {
    const m = new Map<VillaNeighborhood, number>();
    for (const n of VILLA_NEIGHBORHOODS) m.set(n, 0);
    for (const v of VILLAS) {
      m.set(v.neighborhood, (m.get(v.neighborhood) ?? 0) + 1);
    }
    return m;
  }, []);

  const visibleVillas = useMemo(() => {
    if (neighborhoodFilter === "all") return [...VILLAS];
    return VILLAS.filter((v) => v.neighborhood === neighborhoodFilter);
  }, [neighborhoodFilter]);

  const { slice, pageCount, safePage, total } = useMemo(
    () =>
      paginateSlice(visibleVillas, requestedPage, VILLAS_CATALOG_PAGE_SIZE),
    [visibleVillas, requestedPage],
  );

  const prevNeighborhood = useRef<NeighborhoodFilter | null>(null);
  useEffect(() => {
    const cur = neighborhoodFilter;
    const prev = prevNeighborhood.current;
    if (prev === null) {
      prevNeighborhood.current = cur;
      return;
    }
    if (prev === cur) return;
    prevNeighborhood.current = cur;
    router.replace(pathname, { scroll: false });
  }, [neighborhoodFilter, pathname, router]);

  useEffect(() => {
    if (safePage === requestedPage) return;
    router.replace(
      safePage > 1 ? `${pathname}?page=${safePage}` : pathname,
      { scroll: false },
    );
  }, [safePage, requestedPage, pathname, router]);

  const prevCatalogPageRef = useRef<number | null>(null);
  useEffect(() => {
    if (prevCatalogPageRef.current === null) {
      prevCatalogPageRef.current = requestedPage;
      return;
    }
    if (prevCatalogPageRef.current === requestedPage) return;
    prevCatalogPageRef.current = requestedPage;
    document.getElementById("villas-properties")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [requestedPage]);

  const goToCatalogPage = useCallback(
    (p: number) => {
      router.replace(p > 1 ? `${pathname}?page=${p}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router],
  );

  const filterChipClass = (active: boolean) =>
    cn(
      "inline-flex items-center gap-1 rounded-sm border px-3 py-2 text-left text-[0.7rem] font-medium uppercase tracking-[0.14em] transition-colors sm:px-3.5 sm:py-2.5 sm:tracking-[0.16em]",
      active
        ? "border-gold/55 bg-gold/[0.12] text-gold-secondary"
        : "border-gold/15 bg-[#141414]/80 text-cream/55 hover:border-gold/28 hover:text-cream/75",
    );

  return (
    <>
      <SectionReveal className="relative overflow-hidden border-b border-gold/10 bg-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(198,164,108,0.06),transparent)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-10">
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.48em] text-gold/90">
            Residences
          </p>
          <div className="mt-4 h-px w-14 bg-gold/30" aria-hidden />
          <h1 className="mt-6 max-w-3xl font-serif text-[2.1rem] leading-[1.12] tracking-tight text-cream sm:text-4xl md:text-[2.65rem]">
            Villas &amp; stays
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-cream/58 sm:text-[0.9375rem]">
            Curated Miami-area residences — scale, amenities, and policies
            summarized per property so you can shortlist before you inquire.
          </p>
          <ChauffeurServiceCrosslink variant="villa" />
        </div>
      </SectionReveal>

      <div className="section-gradient-divider" aria-hidden />

      <SectionReveal
        id="villas-properties"
        className="scroll-mt-[calc(4rem+0.75rem)] border-b border-gold/10 bg-charcoal py-14 sm:scroll-mt-[calc(4.25rem+0.75rem)] sm:py-16 lg:py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <h2 className="font-serif text-xl tracking-tight text-cream sm:text-2xl">
            Properties
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-cream/52">
            Nightly rates and minimum stays are quoted to your dates — the
            figures below describe layout and standout features only.
          </p>

          {VILLAS.length > 0 ? (
            <div
              className="mt-8"
              role="group"
              aria-label="Filter properties by neighborhood"
            >
              <p className="text-[0.62rem] font-medium uppercase tracking-[0.32em] text-gold/70">
                Neighborhood
              </p>
              <div className="mt-3 sm:hidden">
                <label
                  htmlFor="neighborhood-filter-mobile"
                  className="sr-only"
                >
                  Select neighborhood
                </label>
                <select
                  id="neighborhood-filter-mobile"
                  value={neighborhoodFilter}
                  onChange={(event) =>
                    setNeighborhoodFilter(event.target.value as NeighborhoodFilter)
                  }
                  className="w-full border border-gold/20 bg-[#141414] px-3 py-3 text-[0.75rem] font-medium uppercase tracking-[0.14em] text-cream/80 outline-none transition-colors focus:border-gold/55"
                >
                  <option value="all">All areas ({VILLAS.length})</option>
                  {VILLA_NEIGHBORHOODS.map((n) => {
                    const count = countsByNeighborhood.get(n) ?? 0;
                    return (
                      <option key={n} value={n}>
                        {n}
                        {count > 0 ? ` (${count})` : ""}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="mt-3 hidden flex-wrap gap-2 sm:flex sm:gap-2.5">
                <button
                  type="button"
                  onClick={() => setNeighborhoodFilter("all")}
                  className={filterChipClass(neighborhoodFilter === "all")}
                  aria-pressed={neighborhoodFilter === "all"}
                >
                  All areas
                  <span className="tabular-nums text-cream/35">
                    ({VILLAS.length})
                  </span>
                </button>
                {VILLA_NEIGHBORHOODS.map((n) => {
                  const count = countsByNeighborhood.get(n) ?? 0;
                  const active = neighborhoodFilter === n;
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setNeighborhoodFilter(n)}
                      className={filterChipClass(active)}
                      aria-pressed={active}
                    >
                      {n}
                      {count > 0 ? (
                        <span className="tabular-nums text-cream/35">
                          ({count})
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {VILLAS.length === 0 ? (
            <p className="mt-10 max-w-xl text-sm leading-relaxed text-cream/48">
              Our property directory is being updated with new residences, full
              details, and photography. Check back soon — or reach out via{" "}
              <Link
                href={CONTACT_TRIP_BUILDER_HREF}
                className="font-medium text-gold-secondary/95 underline decoration-gold/25 underline-offset-4 transition-colors hover:text-gold hover:decoration-gold/45"
              >
                Contact
              </Link>{" "}
              to discuss what you need in the meantime.
            </p>
          ) : visibleVillas.length === 0 ? (
            <p className="mt-10 text-sm leading-relaxed text-cream/48">
              No properties listed in this area yet. Choose another neighborhood
              or view all areas.
            </p>
          ) : (
            <>
              <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
                {slice.map((villa, index) => (
                  <ScrollRevealItem key={villa.id} index={index}>
                    <div id={`villa-${villa.id}`}>
                      <VillaCard villa={villa} />
                    </div>
                  </ScrollRevealItem>
                ))}
              </div>
              <VillaCatalogPagination
                page={safePage}
                pageCount={pageCount}
                total={total}
                pageSize={VILLAS_CATALOG_PAGE_SIZE}
                onPage={goToCatalogPage}
              />
            </>
          )}
        </div>
      </SectionReveal>
    </>
  );
}

export function VillasCatalog() {
  return (
    <Suspense fallback={null}>
      <VillasCatalogInner />
    </Suspense>
  );
}
