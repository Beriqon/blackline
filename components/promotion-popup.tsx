"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { DEFAULT_PROMOTION, DEFAULT_PROMOTION_IMAGE, PROMOTION_EVENT, PROMOTION_STORAGE_KEY, readPromotion, type PromotionSettings } from "@/lib/promotion-settings";
import { useCookieConsent } from "@/lib/cookie-consent";
import styles from "./promotion-popup.module.css";

export function PromotionContent({settings,preview=false,onClose}:{settings:PromotionSettings;preview?:boolean;onClose?:()=>void}){
 return <div className={`${styles.content} ${preview?styles.preview:""}`}><div className={styles.visual}><Image src={settings.image||DEFAULT_PROMOTION_IMAGE} unoptimized={!!settings.image} alt={settings.image?"Blackline seasonal offer":"Miami skyline and a private yacht at sunset"} fill sizes="(max-width:650px) 100vw, 370px" className={styles.image}/><div className={styles.shade}/><span className={styles.brand}>BLACKLINE<small>CONCIERGE</small></span><div className={styles.photoCaption}><span>MIAMI, FLORIDA</span><p>Moments worth<br/><em>making yours.</em></p></div></div><div className={styles.copy}><div className={styles.topline}><span>BLACKLINE PRIVILEGES</span>{!preview&&<button type="button" autoFocus className={styles.close} aria-label="Close special offer" onClick={onClose}><X size={19}/></button>}</div><p className={styles.eyebrow}>AN INVITATION TO THE EXCEPTIONAL</p><h2 id={preview?undefined:"promotion-title"}>{settings.title}</h2><p className={styles.message} id={preview?undefined:"promotion-message"}>{settings.message}</p>{preview?<span className={styles.primary}>Discover our services<ArrowUpRight size={16}/></span>:<Link href="/services" onClick={onClose} className={styles.primary}>Discover our services<ArrowUpRight size={16}/></Link>}{preview?<span className={styles.continue}>Continue to website</span>:<button type="button" onClick={onClose} className={styles.continue}>Continue to website</button>}<span className={styles.signature}>ONE CALL. EVERY DETAIL.</span></div></div>;
}
export function PromotionPopup(){
 const [settings,setSettings]=useState<PromotionSettings>(DEFAULT_PROMOTION),[dismissed,setDismissed]=useState(false);
 const dialog=useRef<HTMLDialogElement>(null);
 const {consent}=useCookieConsent();
 useEffect(()=>{const sync=()=>setSettings(readPromotion());const storage=(event:StorageEvent)=>{if(event.key===PROMOTION_STORAGE_KEY||event.key===null)sync();};sync();window.addEventListener(PROMOTION_EVENT,sync);window.addEventListener("storage",storage);return()=>{window.removeEventListener(PROMOTION_EVENT,sync);window.removeEventListener("storage",storage);};},[]);
 const visible=!!consent&&settings.enabled&&!dismissed&&!!settings.title.trim()&&!!settings.message.trim();
 useEffect(()=>{const el=dialog.current;if(!el)return;if(!visible){if(el.open)el.close();return;}if(!el.open)el.showModal();const previous=document.body.style.overflow;document.body.style.overflow="hidden";return()=>{document.body.style.overflow=previous;if(el.open)el.close();};},[visible]);
 return <dialog ref={dialog} className={styles.dialog} aria-labelledby="promotion-title" aria-describedby="promotion-message" onCancel={e=>{e.preventDefault();setDismissed(true);}} onClick={e=>{if(e.target===e.currentTarget)setDismissed(true);}}><PromotionContent settings={settings} onClose={()=>setDismissed(true)}/></dialog>;
}
