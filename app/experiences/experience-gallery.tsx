"use client";

import { useMomentPhotos } from "@/lib/moment-galleries";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRef } from "react";
import styles from "./experiences.module.css";

export function ExperienceGallery({photos: initialPhotos, previousLabel, nextLabel, label }: {
  photos: readonly { src: string; alt: string }[];
  previousLabel: string; nextLabel: string; label: string;
}) {
  const photos=useMomentPhotos("experiences",initialPhotos);
  const track = useRef<HTMLDivElement>(null);
  function move(direction: number) {
    const element = track.current;
    if (!element) return;
    element.scrollBy({ left: direction * element.clientWidth * .8, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }
  return <div>
    <div ref={track} className={styles.galleryTrack} role="region" aria-label={label} tabIndex={0}>
      {photos.map((photo,i)=><div className={styles.galleryPhoto} key={photo.src}><Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 600px) 75vw, (max-width: 900px) 45vw, 28vw" className={styles.cover}/><span aria-hidden>{String(i+1).padStart(2,"0")}</span></div>)}
    </div>
    <div className={styles.galleryControls}><span>{String(photos.length).padStart(2,"0")} / MIAMI</span><div><button type="button" aria-label={previousLabel} onClick={()=>move(-1)}><ArrowLeft size={18} aria-hidden/></button><button type="button" aria-label={nextLabel} onClick={()=>move(1)}><ArrowRight size={18} aria-hidden/></button></div></div>
  </div>;
}
