"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import { useInView, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "@/components/locale-provider";
import { SectionReveal } from "@/components/section-reveal";
import { PHOTOGRAPHER_SHOOT_SLIDES } from "@/lib/photographer-shoots-data";
import styles from "@/app/home.module.css";

export function HomeClientMoments() {
  const t = useTranslations();
  const reducedMotion = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const inView = useInView(trackRef, { amount: 0.2 });
  const [playing, setPlaying] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [focused, setFocused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(0);
  const [atEnd, setAtEnd] = useState(false);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{ pointerId: number; startX: number; scrollLeft: number } | null>(null);
  const images = PHOTOGRAPHER_SHOOT_SLIDES;

  const updatePosition = useCallback(() => {
    const track = trackRef.current;
    const card = track?.firstElementChild as HTMLElement | null;
    if (!track || !card) return;
    const max = track.scrollWidth - track.clientWidth;
    const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
    setProgress(max > 0 ? Math.min(1, Math.max(0, track.scrollLeft / max)) : 0);
    setActive(Math.min(images.length - 1, Math.round(track.scrollLeft / (card.offsetWidth + gap))));
    setAtEnd(max <= 0 || track.scrollLeft >= max - 2);
  }, [images.length]);

  const move = useCallback((direction: number, loop = false) => {
    const track = trackRef.current;
    const card = track?.firstElementChild as HTMLElement | null;
    if (!track || !card) return;
    const max = track.scrollWidth - track.clientWidth;
    const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
    const next = loop && track.scrollLeft >= max - 2
      ? 0
      : track.scrollLeft + direction * (card.offsetWidth + gap);
    track.scrollTo({ left: next, behavior: reducedMotion ? "instant" : "smooth" });
  }, [reducedMotion]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const observer = new ResizeObserver(updatePosition);
    observer.observe(track);
    return () => observer.disconnect();
  }, [updatePosition]);

  useEffect(() => {
    if (!playing || hovering || focused || reducedMotion || !inView) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) move(1, true);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [playing, hovering, focused, reducedMotion, inView, move]);

  return (
    <SectionReveal id="client-moments" className={`${styles.section} ${styles.moments}`} aria-labelledby="client-moments-title">
      <div className={`${styles.container} ${styles.sectionHeading}`}>
        <div>
          <p className={styles.eyebrow}>{t("home.clientMoments")}</p>
          <h2 id="client-moments-title" className={styles.heading}>{t("homeUpgrade.moments.line1")}<br /><em>{t("homeUpgrade.moments.line2")}</em></h2>
        </div>
        <div className={styles.headingAside}>
          <p>{t("homeUpgrade.moments.body")}</p>
          <span className={styles.momentsSignature}>THE BLACKLINE JOURNAL — MIAMI, FL</span>
        </div>
      </div>

      <div role="region" aria-roledescription="carousel" aria-label={t("homeUpgrade.moments.gallery")} onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)} onFocusCapture={() => setFocused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
        <div
          ref={trackRef}
          id="client-moments-track"
          className={styles.momentsTrack}
          data-dragging={dragging || undefined}
          onScroll={updatePosition}
          tabIndex={0}
          aria-label={t("homeUpgrade.moments.gallery")}
          onPointerDown={(event) => {
            setPlaying(false);
            // Touch keeps native scrolling, momentum, and vertical page gestures.
            if (event.pointerType === "touch" || event.button !== 0 || !event.isPrimary) return;
            const track = event.currentTarget;
            dragRef.current = { pointerId: event.pointerId, startX: event.clientX, scrollLeft: track.scrollLeft };
            track.setPointerCapture(event.pointerId);
            track.focus({ preventScroll: true });
            setDragging(true);
          }}
          onPointerMove={(event) => {
            const drag = dragRef.current;
            if (!drag || drag.pointerId !== event.pointerId) return;
            event.currentTarget.scrollLeft = drag.scrollLeft - (event.clientX - drag.startX);
          }}
          onPointerUp={(event) => {
            if (dragRef.current?.pointerId !== event.pointerId) return;
            dragRef.current = null;
            setDragging(false);
            if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
          }}
          onPointerCancel={() => { dragRef.current = null; setDragging(false); }}
          onLostPointerCapture={() => { dragRef.current = null; setDragging(false); }}
          onDragStart={(event) => event.preventDefault()}
          onKeyDown={(event) => {
            if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
              event.preventDefault();
              setPlaying(false);
              move(event.key === "ArrowRight" ? 1 : -1);
            }
          }}
        >
          {images.map((image, index) => (
            <figure key={image.src} className={styles.momentCard} role="group" aria-roledescription="slide" aria-label={`${index + 1} / ${images.length}`}>
              <div className={styles.momentPhoto}>
                <Image src={image.src} alt={image.alt} draggable={false} fill sizes="(max-width: 700px) 78vw, (max-width: 1100px) 38vw, 360px" className={styles.cover} />
                <span className={styles.momentFrameNumber} aria-hidden>{String(index + 1).padStart(2, "0")}</span>
              </div>
              <figcaption><span>BLACKLINE MOMENTS</span><span>MIAMI, FL</span></figcaption>
            </figure>
          ))}
        </div>
        <div className={`${styles.container} ${styles.momentsFooter}`}>
          <div className={styles.momentsCounter}><span>{String(active + 1).padStart(2, "0")}</span><span>/ {String(images.length).padStart(2, "0")}</span></div>
          <div className={styles.momentsProgress} aria-hidden><span style={{ transform: `translateX(${progress * 300}%)` }} /></div>
          <div className={styles.momentsControls}>
            {!reducedMotion && <button type="button" onClick={() => { setPlaying(!playing); setFocused(false); }} aria-label={t(playing ? "homeUpgrade.moments.pause" : "homeUpgrade.moments.play")} aria-pressed={playing} aria-controls="client-moments-track">{playing ? <Pause size={15} aria-hidden /> : <Play size={15} aria-hidden />}</button>}
            <button type="button" onClick={() => move(-1)} disabled={active === 0 && progress === 0} aria-label={t("homeUpgrade.moments.previous")} aria-controls="client-moments-track"><ArrowLeft size={18} aria-hidden /></button>
            <button type="button" onClick={() => move(1)} disabled={atEnd} aria-label={t("homeUpgrade.moments.next")} aria-controls="client-moments-track"><ArrowRight size={18} aria-hidden /></button>
          </div>
        </div>
      </div>
    </SectionReveal>
  );
}
