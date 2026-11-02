"use client";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { VipVenueCard } from "@/components/vip-venue-card";
import type { FeaturedVenue } from "@/lib/vip-nightlife-data";
import { whatsAppUrlWithText } from "@/lib/whatsapp";
import styles from "./nightlife.module.css";

type Category="all"|"nightlife"|"beach"|"dining";
export function VenueDirectory({venues,labels,requestLabel,requestIntro,emptyLabel,resultsLabel}:{venues:readonly (FeaturedVenue&{category:string})[];labels:Record<Category,string>;requestLabel:string;requestIntro:string;emptyLabel:string;resultsLabel:string}) {
 const [filter,setFilter]=useState<Category>("all");
 const visible=venues.filter(venue=>filter==="all"||venue.category===filter);
 return <div className={styles.directory}>
  <div className={styles.filters} role="group" aria-label={labels.all}>{(Object.keys(labels) as Category[]).map(key=><button type="button" key={key} aria-pressed={filter===key} onClick={()=>setFilter(key)}>{labels[key]}<span>{key==="all"?venues.length:venues.filter(v=>v.category===key).length}</span></button>)}</div>
  <p className={styles.results} role="status">{visible.length} {resultsLabel}</p>
  <div className={styles.venueGrid}>{visible.map(venue=><div key={venue.name} className={styles.venueItem}><VipVenueCard venue={venue}/><a className={styles.venueRequest} href={whatsAppUrlWithText(`${requestIntro} ${venue.name}.`)} target="_blank" rel="noopener noreferrer" aria-label={`${requestLabel} — ${venue.name}`}>{requestLabel}<ArrowUpRight size={14} aria-hidden/></a></div>)}</div>
  {!visible.length&&<p>{emptyLabel}</p>}
 </div>;
}
