"use client";

import { ChevronLeft, ChevronRight, Plane, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { ChauffeurServiceCrosslink } from "@/components/chauffeur-service-crosslink";
import { useLocale } from "@/components/locale-provider";
import { ScrollRevealItem } from "@/components/scroll-reveal-item";
import { SectionReveal } from "@/components/section-reveal";
import { CONTACT_TRIP_BUILDER_HREF } from "@/lib/contact-hrefs";
import {
  getLocalizedPrivateJets,
  getPrivateJetCategoryFilters,
} from "@/lib/i18n/private-jets-page";
import type { Translator } from "@/lib/i18n/translate";
import {
  type PrivateJet,
  type PrivateJetCategory,
} from "@/lib/private-jets-data";
import { whatsAppUrlWithText } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

const btnPrimary =
  "inline-flex min-h-11 items-center justify-center border border-gold/40 bg-gold px-8 py-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#0b0b0b] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-gold-secondary hover:bg-gold-secondary hover:shadow-[0_0_0_1px_rgba(224,195,138,0.4),0_14px_48px_rgba(198,164,108,0.2)] active:translate-y-0";

function JetImagePlaceholder({
  className,
  label,
}: {
  className?: string;
  label: string;
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center gap-2 border border-gold/12 bg-[#141414] text-center",
        className,
      )}
    >
      <Plane className="h-8 w-8 text-gold/22 sm:h-10 sm:w-10" aria-hidden />
      <span className="px-2 text-[0.65rem] font-medium uppercase tracking-[0.2em] text-cream/35">
        {label}
      </span>
    </div>
  );
}

function SpecCell({
  label,
  value,
  className,
}: {
  label: string;
  value: string | number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border border-gold/[0.09] bg-[#0c0c0c]/90 px-3 py-2.5 sm:px-4 sm:py-3",
        className,
      )}
    >
      <p className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-gold/65">
        {label}
      </p>
      <p className="mt-1 text-[0.875rem] leading-snug text-cream/88">{value}</p>
    </div>
  );
}

function JetCard({
  jet,
  onOpen,
  tapForSpecs,
  aircraftPhoto,
}: {
  jet: PrivateJet;
  onOpen: (j: PrivateJet) => void;
  tapForSpecs: string;
  aircraftPhoto: string;
}) {
  const cover = jet.galleryPaths?.[0];

  return (
    <button
      type="button"
      onClick={() => onOpen(jet)}
      className="group w-full text-left transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold/50"
    >
      <div className="relative aspect-[16/10] overflow-hidden border border-gold/12 bg-[#0b0b0b] transition-[border-color] duration-500 group-hover:border-gold/28">
        {cover ? (
          <Image
            src={cover}
            alt={jet.name}
            fill
            className="object-cover transition duration-500 ease-out group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <JetImagePlaceholder
            className="absolute inset-0 h-full w-full"
            label={aircraftPhoto}
          />
        )}
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#0b0b0b]/92 via-[#0b0b0b]/25 to-transparent opacity-95"
          aria-hidden
        />
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-gold/85">
            {jet.categoryLabel}
          </p>
          <p className="mt-1.5 font-serif text-base leading-snug tracking-tight text-cream sm:text-lg">
            {jet.name}
          </p>
          <p className="mt-2 text-[0.75rem] tabular-nums text-cream/55">
            {jet.passengers} · {jet.range}
          </p>
        </div>
      </div>
      <p className="mt-3 text-[0.7rem] font-medium uppercase tracking-[0.22em] text-cream/40">
        {tapForSpecs}
      </p>
    </button>
  );
}

function JetDetailGallery({
  jetName,
  paths,
  t,
}: {
  jetName: string;
  paths: readonly string[];
  t: Translator;
}) {
  const galleryLen = paths.length;
  const [photoIndex, setPhotoIndex] = useState(0);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useLayoutEffect(() => {
    const el = thumbRefs.current[photoIndex];
    el?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [photoIndex]);

  const goPrev = useCallback(() => {
    setPhotoIndex((i) => (i <= 0 ? galleryLen - 1 : i - 1));
  }, [galleryLen]);

  const goNext = useCallback(() => {
    setPhotoIndex((i) => (i >= galleryLen - 1 ? 0 : i + 1));
  }, [galleryLen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPrev, goNext]);

  return (
    <>
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#0b0b0b] sm:aspect-[16/9] lg:aspect-[16/10]">
        <Image
          src={paths[photoIndex]}
          alt={t("privateJetsPage.photoOf", {
            name: jetName,
            current: String(photoIndex + 1),
            total: String(galleryLen),
          })}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 55vw"
          priority={photoIndex === 0}
        />
        <span className="pointer-events-none absolute right-3 top-3 z-[1] border border-gold/25 bg-[#0b0b0b]/75 px-2.5 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-cream/85 backdrop-blur-sm">
          {photoIndex + 1} / {galleryLen}
        </span>
        {galleryLen > 1 ? (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-2 top-1/2 z-[1] flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-gold/20 bg-[#0b0b0b]/80 text-cream/90 backdrop-blur-sm transition-colors hover:border-gold/40"
              aria-label={t("privateJetsPage.previousPhoto")}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-2 top-1/2 z-[1] flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-gold/20 bg-[#0b0b0b]/80 text-cream/90 backdrop-blur-sm transition-colors hover:border-gold/40"
              aria-label={t("privateJetsPage.nextPhoto")}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        ) : null}
      </div>
      {galleryLen > 1 ? (
        <div className="flex gap-2 overflow-x-auto border-t border-gold/10 py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {paths.map((src, i) => (
            <button
              key={src}
              ref={(node) => {
                thumbRefs.current[i] = node;
              }}
              type="button"
              onClick={() => setPhotoIndex(i)}
              className={cn(
                "relative h-14 w-24 shrink-0 overflow-hidden border transition-colors sm:h-16 sm:w-28",
                i === photoIndex
                  ? "border-gold/45"
                  : "border-gold/12 hover:border-gold/25",
              )}
              aria-label={t("privateJetsPage.showPhoto", { n: String(i + 1) })}
              aria-current={i === photoIndex}
            >
              <Image
                src={src}
                alt=""
                fill
                className="object-cover"
                sizes="112px"
              />
            </button>
          ))}
        </div>
      ) : null}
    </>
  );
}

function JetDetailDialog({
  jet,
  onClose,
  t,
  aircraftPhoto,
}: {
  jet: PrivateJet | null;
  onClose: () => void;
  t: Translator;
  aircraftPhoto: string;
}) {
  const titleId = useId();

  useEffect(() => {
    if (!jet) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [jet]);

  useEffect(() => {
    if (!jet) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [jet, onClose]);

  if (!jet) return null;

  const wa = whatsAppUrlWithText(
    t("privateJetsPage.whatsappInquiry", { name: jet.name }),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-[#0b0b0b]/82 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label={t("privateJetsPage.close")}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[min(92vh,900px)] w-full max-w-5xl flex-col overflow-hidden border border-gold/18 bg-[#0a0a0a] shadow-[0_32px_120px_rgba(0,0,0,0.75)] sm:mx-4 sm:rounded-sm"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gold/12 px-4 py-3 sm:px-6 sm:py-4">
          <div className="min-w-0 pr-4">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.32em] text-gold/80">
              {jet.categoryLabel}
            </p>
            <h2
              id={titleId}
              className="mt-1 font-serif text-lg leading-snug tracking-tight text-cream sm:text-xl"
            >
              {jet.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center border border-gold/15 text-cream/70 transition-colors hover:border-gold/35 hover:text-gold-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold/50"
            aria-label={t("privateJetsPage.closeDetails")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
          <div className="shrink-0 border-b border-gold/12 lg:flex-[1.05] lg:min-w-0 lg:border-b-0 lg:border-r">
            {jet.galleryPaths && jet.galleryPaths.length > 0 ? (
              <JetDetailGallery
                key={jet.id}
                jetName={jet.name}
                paths={jet.galleryPaths}
                t={t}
              />
            ) : (
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#0b0b0b] sm:aspect-[16/9] lg:aspect-[16/10]">
                <JetImagePlaceholder
                  className="absolute inset-0 h-full w-full"
                  label={aircraftPhoto}
                />
              </div>
            )}
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain p-5 sm:p-7">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.38em] text-gold/90">
              {t("privateJetsPage.specifications")}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-2.5">
              <SpecCell
                label={t("privateJetsPage.passengers")}
                value={jet.passengers}
              />
              <SpecCell
                label={t("privateJetsPage.beds")}
                value={jet.beds === 0 ? "—" : String(jet.beds)}
              />
              <SpecCell label={t("privateJetsPage.range")} value={jet.range} />
              <SpecCell
                label={t("privateJetsPage.cruisingSpeed")}
                value={jet.cruisingSpeed}
              />
              <SpecCell
                label={t("privateJetsPage.baggage")}
                value={jet.baggage}
              />
              <SpecCell
                label={t("privateJetsPage.interiorWidth")}
                value={jet.interiorWidth}
              />
              <SpecCell
                label={t("privateJetsPage.interiorHeight")}
                value={jet.interiorHeight}
                className="col-span-2"
              />
            </div>

            <p className="mt-8 text-[0.62rem] font-medium uppercase tracking-[0.32em] text-gold/70">
              {t("privateJetsPage.overview")}
            </p>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-cream/72">
              {jet.overview}
            </p>

            <p className="mt-8 text-[0.62rem] font-medium uppercase tracking-[0.32em] text-gold/70">
              {t("privateJetsPage.keyAmenities")}
            </p>
            <ul className="mt-4 space-y-2.5" role="list">
              {jet.amenities.map((a) => (
                <li
                  key={a}
                  className="flex gap-3 text-[0.9rem] leading-snug text-cream/78"
                >
                  <span
                    className="mt-[0.4em] h-1 w-1 shrink-0 rounded-full bg-gold/45"
                    aria-hidden
                  />
                  {a}
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-col gap-3 border-t border-gold/10 pt-8 sm:flex-row sm:flex-wrap">
              <Link
                href={CONTACT_TRIP_BUILDER_HREF}
                className={cn(btnPrimary, "w-full sm:w-auto")}
              >
                {t("privateJetsPage.requestAircraft")}
              </Link>
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 w-full items-center justify-center border border-gold/30 bg-transparent px-8 py-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-gold transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-gold/55 hover:text-gold-secondary sm:w-auto"
              >
                {t("common.whatsapp")}
              </a>
            </div>
            <p className="mt-4 text-[0.7rem] leading-relaxed text-cream/38">
              {t("privateJetsPage.availabilityNote")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PrivateJetsCatalog() {
  const { locale, t } = useLocale();
  const [filter, setFilter] = useState<"all" | PrivateJetCategory>("all");
  const [selected, setSelected] = useState<PrivateJet | null>(null);

  const jets = useMemo(
    () => getLocalizedPrivateJets(locale, t),
    [locale, t],
  );
  const categoryFilters = useMemo(
    () => getPrivateJetCategoryFilters(t),
    [t],
  );

  const visible = useMemo(() => {
    if (filter === "all") return jets;
    return jets.filter((j) => j.category === filter);
  }, [filter, jets]);

  const selectedLocalized = useMemo(() => {
    if (!selected) return null;
    return jets.find((j) => j.id === selected.id) ?? selected;
  }, [selected, jets]);

  return (
    <>
      <SectionReveal className="relative overflow-hidden border-b border-gold/10 bg-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(198,164,108,0.06),transparent)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-10">
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.48em] text-gold/90">
            {t("privateJetsPage.eyebrow")}
          </p>
          <div className="mt-4 h-px w-14 bg-gold/30" aria-hidden />
          <h1 className="mt-6 max-w-3xl font-serif text-[2.1rem] leading-[1.12] tracking-tight text-cream sm:text-4xl md:text-[2.65rem]">
            {t("nav.privateJets")}
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-cream/58 sm:text-[0.9375rem]">
            {t("privateJetsPage.heroBody")}
          </p>
          <ChauffeurServiceCrosslink variant="jet" />
        </div>
      </SectionReveal>

      <div className="section-gradient-divider" aria-hidden />

      <SectionReveal className="border-b border-gold/10 bg-charcoal py-14 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-serif text-xl tracking-tight text-cream sm:text-2xl">
                {t("privateJetsPage.availableHeadline")}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-cream/52">
                {t("privateJetsPage.availableBody")}
              </p>
            </div>
          </div>

          <div
            className="mt-8 flex flex-wrap gap-2"
            role="tablist"
            aria-label={t("privateJetsPage.filterAria")}
          >
            {categoryFilters.map((f) => {
              const isActive = filter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() =>
                    setFilter(
                      f.id === "all" ? "all" : (f.id as PrivateJetCategory),
                    )
                  }
                  className={cn(
                    "border px-4 py-2.5 text-[0.65rem] font-semibold uppercase tracking-[0.22em] transition-colors",
                    isActive
                      ? "border-gold/45 bg-gold/[0.12] text-gold-secondary"
                      : "border-gold/15 bg-[#0a0a0a] text-cream/55 hover:border-gold/30 hover:text-cream/75",
                  )}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
            {visible.map((jet, index) => (
              <ScrollRevealItem key={jet.id} index={index}>
                <JetCard
                  jet={jet}
                  onOpen={setSelected}
                  tapForSpecs={t("privateJetsPage.tapForSpecs")}
                  aircraftPhoto={t("privateJetsPage.aircraftPhoto")}
                />
              </ScrollRevealItem>
            ))}
          </div>

          {visible.length === 0 ? (
            <p className="mt-10 text-sm text-cream/45">
              {t("privateJetsPage.noAircraft")}
            </p>
          ) : null}
        </div>
      </SectionReveal>

      <JetDetailDialog
        jet={selectedLocalized}
        onClose={() => setSelected(null)}
        t={t}
        aircraftPhoto={t("privateJetsPage.aircraftPhoto")}
      />
    </>
  );
}
