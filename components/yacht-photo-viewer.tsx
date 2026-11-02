"use client";
import Image from "next/image";
import { Expand, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/components/locale-provider";
import styles from "@/app/services/yachts/yachts.module.css";
export function YachtPhotoViewer({ src, index, count, onPrevious, onNext }: {
    src: string;
    index: number;
    count: number;
    onPrevious: () => void;
    onNext: () => void;
}) {
    const dialog = useRef<HTMLDialogElement>(null);
    const [open, setOpen] = useState(false);
    const { locale } = useLocale();
    const es = locale === "es";
    useEffect(() => { if (!open)
        return; const previous = document.body.style.overflow; document.body.style.overflow = "hidden"; return () => { document.body.style.overflow = previous; }; }, [open]);
    return <><button type="button" className={styles.expandPhoto} aria-label={es ? "Ampliar foto" : "Expand photo"} onClick={() => { dialog.current?.showModal(); setOpen(true); }}><Expand size={16}/></button><dialog ref={dialog} className={styles.photoDialog} aria-label={es ? "Galería del yate" : "Yacht photo gallery"} onClose={() => setOpen(false)} onClick={e => { if (e.target === e.currentTarget)
        e.currentTarget.close(); }}>{open && <><div className={styles.viewerImage}><Image src={src} alt={(es ? "Foto " : "Yacht photo ") + (index + 1)} fill sizes="100vw" className="object-contain"/></div><p className={styles.viewerCount}>{index + 1} / {count}</p><button autoFocus type="button" className={styles.viewerClose} aria-label={es ? "Cerrar galería" : "Close gallery"} onClick={() => dialog.current?.close()}><X /></button><button type="button" className={styles.viewerPrev} aria-label={es ? "Foto anterior" : "Previous full-screen photo"} onClick={onPrevious}><ChevronLeft /></button><button type="button" className={styles.viewerNext} aria-label={es ? "Foto siguiente" : "Next full-screen photo"} onClick={onNext}><ChevronRight /></button></>}</dialog></>;
}
