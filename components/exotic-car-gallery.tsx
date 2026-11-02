"use client";
import Image from "next/image";
import { Car, ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/components/locale-provider";
import { exoticPhotos } from "@/lib/exotic-presentation";
import { exoticGalleryCoverStyle } from "@/lib/exotic-catalog-utils";
import type { ExoticCar } from "@/lib/exotic-cars-data";
import styles from "@/app/services/exotic-cars/cars.module.css";
export function ExoticCarGallery({ car }: {
    car: ExoticCar;
}) {
    const { t, locale } = useLocale();
    const es = locale === "es";
    const photos = exoticPhotos(car), [index, setIndex] = useState(0), [open, setOpen] = useState(false);
    const dialog = useRef<HTMLDialogElement>(null), strip = useRef<HTMLDivElement>(null), touch = useRef<{
        x: number;
        y: number;
    } | null>(null);
    const previous = () => setIndex(i => (i + photos.length - 1) % photos.length);
    const next = () => setIndex(i => (i + 1) % photos.length);
    useEffect(() => { const el = strip.current, thumb = el?.children[index] as HTMLElement | undefined; if (el && thumb)
        el.scrollTo({ left: Math.max(0, thumb.offsetLeft - (el.clientWidth - thumb.clientWidth) / 2), behavior: "smooth" }); }, [index]);
    useEffect(() => { if (!open)
        return; const prior = document.body.style.overflow; document.body.style.overflow = "hidden"; return () => { document.body.style.overflow = prior; }; }, [open]);
    const swipe = { onTouchStart: (e: React.TouchEvent) => { touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }, onTouchEnd: (e: React.TouchEvent) => { if (!touch.current || photos.length < 2)
            return; const dx = e.changedTouches[0].clientX - touch.current.x, dy = e.changedTouches[0].clientY - touch.current.y; touch.current = null; if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
            if (dx < 0)
                next();
            else
                previous();
        } } };
    if (!photos.length)
        return <div className={styles.galleryPlaceholder}><Car size={50}/><h2>{t("exoticCarsPage.photosComingSoon")}</h2><p>{es ? "Consulta las últimas fotos antes de confirmar." : "Ask our team for the latest photos before confirming."}</p></div>;
    return <div className={styles.gallery}><div className={styles.mainPhoto} {...swipe} tabIndex={0} aria-label={es ? "Galería del vehículo" : "Vehicle photo gallery"} onKeyDown={e => { if (e.target !== e.currentTarget)
        return; if (e.key === "ArrowLeft") {
        e.preventDefault();
        previous();
    } if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
    } }}><Image key={photos[index]} src={photos[index]} alt={car.name + " — " + (es ? "foto " : "photo ") + (index + 1)} fill sizes="(max-width:800px) 100vw, 62vw" priority style={exoticGalleryCoverStyle(car, index)} className={styles.mainImage}/><button className={styles.expand} aria-label={t("exoticCarsPage.viewImageLarger")} onClick={() => { dialog.current?.showModal(); setOpen(true); }}><Expand size={17}/></button><span className={styles.galleryCount}>{index + 1} / {photos.length}</span>{photos.length > 1 && <><button className={styles.galleryPrev} aria-label={t("exoticCarsPage.previousPhoto")} onClick={previous}><ChevronLeft size={20}/></button><button className={styles.galleryNext} aria-label={t("exoticCarsPage.nextPhoto")} onClick={next}><ChevronRight size={20}/></button></>}</div><div className={styles.galleryFooter}><span>{es ? "Una mirada más cercana" : "A closer look"}</span><span>{photos.length} {es ? "fotos originales" : "original photos"}</span></div>{photos.length > 1 && <div ref={strip} className={styles.thumbnails}>{photos.map((src, i) => <button key={src + String(i)} aria-label={t("exoticCarsPage.showPhoto", { n: i + 1 })} aria-current={i === index} onClick={() => setIndex(i)}><Image src={src} alt="" fill sizes="110px" style={exoticGalleryCoverStyle(car, i)} className="object-cover"/></button>)}</div>}<dialog ref={dialog} className={styles.photoDialog} aria-label={es ? "Fotos del vehículo" : "Vehicle photo gallery"} onClose={() => setOpen(false)} onKeyDown={e => { if (e.key === "ArrowLeft") {
        e.preventDefault();
        previous();
    } if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
    } }} {...swipe}>{open && <><div className={styles.fullPhoto}><Image src={photos[index]} alt={car.name + " — " + (index + 1)} fill sizes="100vw" className="object-contain"/></div><p className={styles.fullCount}>{car.name} · {index + 1} / {photos.length}</p><button autoFocus className={styles.fullClose} aria-label={t("exoticCarsPage.closeEnlargedView")} onClick={() => dialog.current?.close()}><X /></button>{photos.length > 1 && <><button className={styles.galleryPrev} aria-label={t("exoticCarsPage.previousPhoto")} onClick={previous}><ChevronLeft /></button><button className={styles.galleryNext} aria-label={t("exoticCarsPage.nextPhoto")} onClick={next}><ChevronRight /></button></>}</>}</dialog></div>;
}
