"use client";

import { ArrowDown, ArrowUpRight, ChevronLeft, ChevronRight, Plane, X } from "lucide-react";
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
import styles from "@/app/services/private-jets/jets.module.css";

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

  return <button type="button" onClick={() => onOpen(jet)} className={styles.jetCard}>
    <div className={styles.cardPhoto}>{cover ? <Image src={cover} alt={jet.name} fill sizes="(max-width: 700px) 100vw, 50vw" className={styles.cover}/> : <JetImagePlaceholder className="absolute inset-0" label={aircraftPhoto}/>}
      <span className={styles.categoryTag}>{jet.categoryLabel}</span><span className={styles.openIcon} aria-hidden><ArrowUpRight size={21}/></span>
    </div>
    <div className={styles.cardBody}><h3>{jet.name}</h3><div className={styles.cardSpecs}><span>{jet.passengers}</span><span>{jet.range}</span><span>{jet.cruisingSpeed}</span></div><p>{tapForSpecs}<ArrowUpRight size={14} aria-hidden/></p></div>
  </button>;
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
  const swipe = useRef<{ id: number; x: number; y: number } | null>(null);

  useLayoutEffect(() => {
    const el = thumbRefs.current[photoIndex];
    el?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
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
      <div className={styles.detailPhoto}
        onPointerDown={event => { if ((event.target as HTMLElement).closest("button") || event.button !== 0) return; swipe.current = { id: event.pointerId, x: event.clientX, y: event.clientY }; event.currentTarget.setPointerCapture(event.pointerId); }}
        onPointerUp={event => { const start = swipe.current; swipe.current = null; if (!start || start.id !== event.pointerId) return; const dx = event.clientX - start.x; if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(event.clientY - start.y)) { if (dx < 0) goNext(); else goPrev(); } }}
        onPointerCancel={() => { swipe.current = null; }} onLostPointerCapture={() => { swipe.current = null; }}>
        <Image
          src={paths[photoIndex]}
          alt={t("privateJetsPage.photoOf", {
            name: jetName,
            current: String(photoIndex + 1),
            total: String(galleryLen),
          })}
          fill
          className={styles.detailImage}
          draggable={false}
          sizes="(max-width: 800px) 100vw, 65vw"
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

function JetDetailDialog({ jet, onClose, t, aircraftPhoto }: { jet: PrivateJet | null; onClose: () => void; t: Translator; aircraftPhoto: string }) {
  const titleId = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = dialog.current;
    if (!jet || !el) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    el.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { el.close(); document.body.style.overflow = previous; previousFocus?.focus({ preventScroll: true }); };
  }, [jet?.id]);
  if (!jet) return null;
  const wa = whatsAppUrlWithText(t("privateJetsPage.whatsappInquiry", { name: jet.name }));
  const specs = [
    ["passengers", jet.passengers], ["range", jet.range], ["cruisingSpeed", jet.cruisingSpeed],
    ["beds", jet.beds === 0 ? "—" : String(jet.beds)], ["baggage", jet.baggage],
    ["interiorWidth", jet.interiorWidth], ["interiorHeight", jet.interiorHeight],
  ];
  return <dialog ref={dialog} className={styles.detailDialog} aria-labelledby={titleId}
    onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className={styles.dialogShell}>
      <header className={styles.detailHeader}><div><p className={styles.eyebrow}>{jet.categoryLabel} / BLACKLINE</p><h2 id={titleId}>{jet.name}</h2></div><button type="button" onClick={onClose} className={styles.closeDetail} aria-label={t("privateJetsPage.closeDetails")}><X size={21} aria-hidden/></button></header>
      <div className={styles.detailScroll}>
        <div className={styles.detailLayout}>
          <div className={styles.detailMain}>
            <div className={styles.detailGallery}>{jet.galleryPaths?.length ? <JetDetailGallery key={jet.id} jetName={jet.name} paths={jet.galleryPaths} t={t}/> : <JetImagePlaceholder className="aspect-[16/10] w-full" label={aircraftPhoto}/>}</div>
            <section className={styles.overviewSection}><p className={styles.eyebrow}>{t("privateJetsPage.overview")}</p><h3>{jet.name}</h3><p>{jet.overview}</p></section>
            <section className={styles.amenitiesSection}><h3>{t("privateJetsPage.keyAmenities")}</h3><ul>{jet.amenities.map(a=><li key={a}>{a}</li>)}</ul></section>
          </div>
          <aside className={styles.detailAside} aria-label={t("privateJetsPage.specifications")}>
            <p className={styles.eyebrow}>{t("privateJetsPage.specifications")}</p>
            <div className={styles.keySpecs}><div><span>{t("privateJetsPage.passengers")}</span><strong>{jet.passengers}</strong></div><div><span>{t("privateJetsPage.range")}</span><strong>{jet.range}</strong></div></div>
            <dl className={styles.specList}>{specs.slice(2).map(([key,value])=><div key={key}><dt>{t("privateJetsPage."+key)}</dt><dd>{value}</dd></div>)}</dl>
            <div className={styles.detailInquiry}><Link href={CONTACT_TRIP_BUILDER_HREF} className={styles.primaryButton}>{t("privateJetsPage.requestAircraft")}<ArrowUpRight size={16} aria-hidden/></Link><a href={wa} target="_blank" rel="noopener noreferrer" className={styles.whatsappButton}>{t("common.whatsapp")}<ArrowUpRight size={16} aria-hidden/></a><p>{t("privateJetsPage.availabilityNote")}</p></div>
          </aside>
        </div>
      </div>
      <footer className={styles.detailFooter}><span>{jet.name}<small>{jet.passengers} · {jet.range}</small></span><Link href={CONTACT_TRIP_BUILDER_HREF} className={styles.primaryButton}>{t("privateJetsPage.requestAircraft")}<ArrowUpRight size={16} aria-hidden/></Link></footer>
    </div>
  </dialog>;
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
    <div className={styles.page}>
      <section className={styles.hero} aria-labelledby="jets-title"><div className={styles.container+" "+styles.heroGrid}>
        <div><p className={styles.eyebrow}>{t("privateJetsPage.eyebrow")}</p><h1 id="jets-title">{locale === "es" ? "Tu viaje." : "Your journey."}<br/><em>{locale === "es" ? "A otra altura." : "Elevated."}</em></h1><p className={styles.intro}>{locale === "es" ? "Explora nuestra selección de jets privados. Compara cabinas, pasajeros y autonomía, y consulta tu ruta con tu concierge." : "Explore our private jet collection. Compare cabins, passenger capacity, and range, then plan your route with your concierge."}</p><div className={styles.heroActions}><a href="#jet-collection" className={styles.primaryButton}>{locale === "es" ? "Ver los jets" : "Explore the jets"}<ArrowDown size={16} aria-hidden/></a><Link href={CONTACT_TRIP_BUILDER_HREF} className={styles.textLink}>{locale === "es" ? "Planifica tu vuelo" : "Plan your flight"}<ArrowUpRight size={15} aria-hidden/></Link></div></div>
        <div className={styles.heroPhoto}><Image src="/privatejets/globalexpress/globalexpress.webp" alt="Global Express" fill preload sizes="(max-width: 700px) 100vw, 45vw" className={styles.cover}/><span>BLACKLINE / PRIVATE AVIATION</span></div>
      </div></section>
      <section id="jet-collection" className={styles.collection} aria-labelledby="fleet-title"><div className={styles.container}>
        <div className={styles.collectionHead}><div><p className={styles.eyebrow}>{locale === "es" ? "La colección" : "The aircraft collection"}</p><h2 id="fleet-title">{t("privateJetsPage.availableHeadline")}</h2></div><span className={styles.fleetCount} aria-live="polite">{String(visible.length).padStart(2,"0")} / {String(jets.length).padStart(2,"0")} {locale === "es" ? "JETS" : "AIRCRAFT"}</span></div>
        <div className={styles.filters} role="group" aria-label={t("privateJetsPage.filterAria")}>{categoryFilters.map(f => <button key={f.id} type="button" aria-pressed={filter === f.id} onClick={() => setFilter(f.id === "all" ? "all" : f.id as PrivateJetCategory)}>{f.label}<span>{f.id === "all" ? jets.length : jets.filter(j=>j.category===f.id).length}</span></button>)}</div>
        <div className={styles.jetGrid}>{visible.map((jet,index)=><ScrollRevealItem key={jet.id} index={index % 2}><JetCard jet={jet} onOpen={setSelected} tapForSpecs={t("privateJetsPage.tapForSpecs")} aircraftPhoto={t("privateJetsPage.aircraftPhoto")}/></ScrollRevealItem>)}</div>
        {visible.length === 0 && <p className={styles.note}>{t("privateJetsPage.noAircraft")}</p>}
        <p className={styles.note}>{t("privateJetsPage.availabilityNote")}</p>
      </div></section>
      <SectionReveal className={styles.closing}><div className={styles.container+" "+styles.closingGrid}><div><p className={styles.eyebrow}>{locale === "es" ? "De puerta a destino" : "From your door to your destination"}</p><h2>{locale === "es" ? "Cada detalle, coordinado." : "Every detail, connected."}</h2></div><div><ChauffeurServiceCrosslink variant="jet" className={styles.closingBody}/><Link href={CONTACT_TRIP_BUILDER_HREF} className={styles.textLink}>{locale === "es" ? "Planifica tu vuelo" : "Plan your flight"}<ArrowUpRight size={15} aria-hidden/></Link></div></div></SectionReveal>

      <JetDetailDialog
        jet={selectedLocalized}
        onClose={() => setSelected(null)}
        t={t}
        aircraftPhoto={t("privateJetsPage.aircraftPhoto")}
      />
    </div>
  );
}
