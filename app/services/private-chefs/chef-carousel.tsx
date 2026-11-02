"use client";

import { Children, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import styles from "./chefs.module.css";

export function ChefCarousel({ children, label, previousLabel, nextLabel, caption, variant }: {
  children: ReactNode; label: string; previousLabel: string; nextLabel: string; caption: string; variant: "chefs" | "food";
}) {
  const items = Children.toArray(children);
  const track = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: number; x: number; left: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState({ index: 0, end: false });
  const finish = () => { drag.current = null; setDragging(false); };
  function move(direction: number) {
    const el = track.current;
    if (!el) return;
    const step = (el.firstElementChild as HTMLElement | null)?.offsetWidth ?? el.clientWidth;
    el.scrollBy({ left: direction * (step + 22), behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }
  return <div className={styles.carousel}>
    <div ref={track} className={styles.track} data-variant={variant} data-dragging={dragging} role="region" aria-roledescription="carousel" aria-label={label} tabIndex={0}
      onKeyDown={event => { if (event.target !== event.currentTarget) return; if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); move(event.key === "ArrowLeft" ? -1 : 1); } }}
      onScroll={event => { const el = event.currentTarget; const step = (el.firstElementChild as HTMLElement | null)?.offsetWidth ?? 1; setPosition({ index: Math.min(items.length - 1, Math.round(el.scrollLeft / (step + 22))), end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 3 }); }}
      onPointerDown={event => { if (event.pointerType !== "mouse" || event.button !== 0 || (event.target as HTMLElement).closest("a, button")) return; drag.current = { id: event.pointerId, x: event.clientX, left: event.currentTarget.scrollLeft }; event.currentTarget.setPointerCapture(event.pointerId); setDragging(true); }}
      onPointerMove={event => { const start = drag.current; if (start?.id === event.pointerId) event.currentTarget.scrollLeft = start.left - (event.clientX - start.x); }}
      onPointerUp={finish} onPointerCancel={finish} onLostPointerCapture={finish}>
      {items.map((item, i) => <div className={styles.slide} role="group" aria-roledescription="slide" aria-label={`${i + 1} / ${items.length}`} key={i}>{item}</div>)}
    </div>
    <div className={styles.controls}><span>{caption}</span><div><span className={styles.counter}>{String(position.index + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</span><button type="button" aria-label={previousLabel} disabled={position.index === 0} onClick={() => move(-1)}><ArrowLeft size={18} aria-hidden /></button><button type="button" aria-label={nextLabel} disabled={position.end || items.length < 2} onClick={() => move(1)}><ArrowRight size={18} aria-hidden /></button></div></div>
  </div>;
}
