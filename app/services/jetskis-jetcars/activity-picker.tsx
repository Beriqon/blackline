"use client";
import Image from "next/image";
import { ArrowDown, ArrowUpRight, ChevronDown } from "lucide-react";
import { useState } from "react";
import { getWaterOverviewCards } from "@/lib/i18n/water-activities-page";
import type { Translator } from "@/lib/i18n/translate";
import type { Locale } from "@/lib/i18n/config";
import type { WaterActivityTab } from "@/lib/water-activities-tabs";
import en from "./content.en.json";
import es from "./content.es.json";
import styles from "./water.module.css";

export function ActivityPicker({active,onSelect,t,locale}:{active:WaterActivityTab;onSelect:(tab:WaterActivityTab)=>void;t:Translator;locale:Locale}) {
 const [expanded,setExpanded]=useState(false);
 const copy=locale==="es"?es:en;
 const cards=getWaterOverviewCards(t,locale);
 const selected=cards.find(card=>card.tab===active);
 const open=active==="overview"||expanded;
 function choose(tab:WaterActivityTab){onSelect(tab);setExpanded(false);document.getElementById("water-explorer")?.scrollIntoView({block:"start",behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"});}
 return <section id="water-explorer" className={styles.explorer} aria-labelledby="water-explorer-title"><div className={styles.container}>
  {selected&&<div className={styles.selection}><div className={styles.selectionImage}><Image src={selected.image} alt="" fill sizes="70px" className={styles.cover}/></div><div><p className={styles.eyebrow}>{copy.selected}</p><h2 id={!open?"water-explorer-title":undefined}>{selected.title}</h2></div><button type="button" onClick={()=>setExpanded(!expanded)} aria-expanded={open} aria-controls="activity-choices">{open?copy.close:copy.change}<ChevronDown size={16} aria-hidden/></button></div>}
  <div id="activity-choices" hidden={!open}>
   <div className={styles.sectionHead}><div><p className={styles.eyebrow}>{copy.exploreEyebrow}</p><h2 id={open?"water-explorer-title":undefined} className={styles.heading}>{copy.explore1}<br/><em>{copy.explore2}</em></h2></div><p>{copy.exploreBody}</p></div>
   <div className={styles.activityGrid}>{cards.map((card,i)=><button key={card.id} type="button" onClick={()=>choose(card.tab)} className={styles.activityCard} aria-pressed={card.tab===active}><div className={styles.activityImage}><Image src={card.image} alt={card.imageAlt} fill sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 33vw" className={styles.cover}/><span>0{i+1}</span></div><div className={styles.cardTitle}><h3>{card.title}</h3><ArrowUpRight size={20} aria-hidden/></div><p>{card.description}</p>{card.priceLabel&&<span className={styles.cardPrice}>{card.priceLabel}</span>}<span className={styles.cardCta}>{copy.details}<ArrowDown size={13} aria-hidden/></span></button>)}</div>
  </div>
 </div></section>;
}
