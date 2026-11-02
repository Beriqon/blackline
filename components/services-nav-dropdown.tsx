"use client";

import Link from "next/link";
import { ArrowUpRight, ChevronDown, Car, Ship, Waves, Compass, Plane, House, ChefHat, Sparkles, Camera, Shield } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "@/components/locale-provider";
import { getServiceLinks } from "@/lib/i18n/nav";
import { cn } from "@/lib/utils";
import styles from "./services-nav-dropdown.module.css";

const icons=[Car,Car,Ship,Waves,Compass,Plane,House,ChefHat,Sparkles,Camera,Shield];

export function ServicesNavDropdown(){
 const t=useTranslations(),pathname=usePathname();
 const links=useMemo(()=>getServiceLinks(t),[t]);
 const [open,setOpen]=useState(false);
 const root=useRef<HTMLDivElement>(null),trigger=useRef<HTMLAnchorElement>(null);
 useEffect(()=>setOpen(false),[pathname]);
 useEffect(()=>{if(!open)return;const key=(e:KeyboardEvent)=>{if(e.key==="Escape"){trigger.current?.focus();setOpen(false);}};const outside=(e:PointerEvent)=>{if(!root.current?.contains(e.target as Node))setOpen(false);};window.addEventListener("keydown",key);window.addEventListener("pointerdown",outside);return()=>{window.removeEventListener("keydown",key);window.removeEventListener("pointerdown",outside);};},[open]);
 return <div ref={root} className={styles.root} onMouseEnter={()=>setOpen(true)} onMouseLeave={()=>setOpen(false)} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node|null))setOpen(false);}}>
 <Link ref={trigger} href="/services" className={styles.trigger} aria-expanded={open} aria-controls="desktop-service-navigation" onKeyDown={e=>{if(e.key==="ArrowDown"){e.preventDefault();setOpen(true);requestAnimationFrame(()=>root.current?.querySelector<HTMLAnchorElement>('[data-service-link]')?.focus());}}} onFocus={()=>setOpen(true)}>{t("common.services")}<ChevronDown size={13} className={open?styles.rotated:undefined}/></Link>
 <div id="desktop-service-navigation" className={cn(styles.dropdown,open&&styles.open)} inert={!open}>
 <div className={styles.panel}><div className={styles.heading}><span>BLACKLINE <i>/</i> {t("common.services")}</span><Link href="/services" onClick={()=>setOpen(false)} aria-label={t("common.services")}><ArrowUpRight size={17}/></Link></div>
 <nav className={styles.grid} aria-label={t("common.services")}>{links.map((item,index)=>{const Icon=icons[index];return <Link data-service-link key={item.href} href={item.href} className={styles.item} aria-current={pathname===item.href?"page":undefined} onClick={()=>setOpen(false)}><span className={styles.icon}><Icon size={17} strokeWidth={1.35}/></span><span>{item.label}</span><ArrowUpRight className={styles.arrow} size={14}/></Link>;})}</nav>
 <div className={styles.foot}><span>MIAMI & SOUTH FLORIDA</span><span>BLACKLINE CONCIERGE</span></div></div></div></div>;
}
