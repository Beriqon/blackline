"use client";
import { ArrowDown, ArrowUpRight, Building2, Search, SlidersHorizontal, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, type FormEvent } from "react";
import { useLocale } from "@/components/locale-provider";
import { ScrollRevealItem } from "@/components/scroll-reveal-item";
import { localizeVilla } from "@/lib/i18n/villas-page";
import { paginateSlice } from "@/lib/pagination";
import { VILLAS, VILLA_NEIGHBORHOODS, formatVillaUsd, type Villa } from "@/lib/villas-data";
import styles from "@/app/services/villas/villas.module.css";

export function villaFactNumber(villa: Villa, label: string) {
  const value=villa.facts.find(f=>f.label===label)?.value;
  return value && /^\d/.test(value) ? Number.parseFloat(value) : 0;
}
function VillasCatalogInner() {
  const {locale,t}=useLocale(); const es=locale==="es";
  const router=useRouter(),pathname=usePathname(),params=useSearchParams();
  const q=params.get("q")??"",area=params.get("area")??"all",guests=Number(params.get("guests"))||0,beds=Number(params.get("beds"))||0,photosOnly=params.get("photos")==="1",sort=params.get("sort")??"recommended";
  const requestedPage=Math.max(1,Number.parseInt(params.get("page")??"1")||1);
  const active=Boolean(q||area!=="all"||guests||beds||photosOnly||sort!=="recommended");
  const filtered=useMemo(()=>{
    const query=q.toLocaleLowerCase().trim();
    const list=VILLAS.filter(v=>(area==="all"||v.neighborhood===area)&&(!query||`${v.name} ${v.neighborhood} ${v.subtitle}`.toLocaleLowerCase().includes(query))&&(!guests||villaFactNumber(v,"Max guests")>=guests)&&(!beds||villaFactNumber(v,"Bedrooms")>=beds)&&(!photosOnly||v.galleryImages.length>0));
    if(sort==="name")list.sort((a,b)=>a.name.localeCompare(b.name));
    if(sort==="price")list.sort((a,b)=>(a.nightlyRates?.weekdayUsd??Infinity)-(b.nightlyRates?.weekdayUsd??Infinity));
    if(sort==="bedrooms")list.sort((a,b)=>villaFactNumber(b,"Bedrooms")-villaFactNumber(a,"Bedrooms"));
    return list;
  },[q,area,guests,beds,photosOnly,sort]);
  const {slice,pageCount,safePage,total}=paginateSlice(filtered,requestedPage,12);
  function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();const form=new FormData(event.currentTarget),next=new URLSearchParams();for(const key of ["q","area","guests","beds","sort","photos"]){const value=String(form.get(key)??"").trim();if(value&&value!=="all"&&value!=="0"&&value!=="recommended")next.set(key,value);}router.replace(`${pathname}${next.size?"?"+next:""}`,{scroll:false});}
  function pageTo(page:number){const next=new URLSearchParams(params.toString());if(page>1)next.set("page",String(page));else next.delete("page");router.replace(`${pathname}${next.size?"?"+next:""}`,{scroll:false});document.getElementById("villas-properties")?.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"});}
  const heroVilla=VILLAS.find(v=>v.id==="aria")??VILLAS[0];
  return <div className={styles.page}>
    <section className={styles.hero} aria-labelledby="villas-title"><div className={`${styles.container} ${styles.heroGrid}`}><div><p className={styles.eyebrow}>{t("villasPage.eyebrow")}</p><h1 id="villas-title">{es?"Tu lugar":"Somewhere"}<br/><em>{es?"en Miami.":"entirely yours."}</em></h1><p className={styles.intro}>{es?"Villas frente al mar, casas con piscina y estancias privadas. Encuentra el espacio que encaje con tu grupo y tu Miami.":"Waterfront villas, poolside homes, and private stays. Find the space that fits your people and your Miami."}</p><a href="#villas-properties" className={styles.textLink}>{es?"Explorar las villas":"Explore the villas"}<ArrowDown size={15} aria-hidden/></a></div><div className={styles.heroPhoto}>{heroVilla?.galleryImages[0]&&<Image src={heroVilla.galleryImages[0]} alt={heroVilla.name} fill preload sizes="(max-width:700px) 100vw, 45vw" className={styles.cover}/>}<span>BLACKLINE / PRIVATE RESIDENCES</span></div></div></section>
    <section id="villas-properties" className={`${styles.container} ${styles.catalog}`} aria-labelledby="properties-title"><div className={styles.catalogHead}><div><p className={styles.eyebrow}>{es?"La colección":"The residence collection"}</p><h2 id="properties-title">{t("villasPage.propertiesHeadline")}</h2></div><p aria-live="polite">{total} {es?"estancias encontradas":"stays found"}</p></div>
    <form key={params.toString()} className={styles.filters} onSubmit={submit} aria-label={es?"Filtrar villas":"Filter villas"}>
      <div className={styles.search}><Search size={16} aria-hidden/><input name="q" defaultValue={q} placeholder={es?"Nombre o zona":"Villa name or area"} aria-label={es?"Buscar villas":"Search villas"}/><button type="submit">{es?"Buscar":"Search"}</button></div>
      <label>{t("villasPage.neighborhood")}<select name="area" defaultValue={area} onChange={e=>e.currentTarget.form?.requestSubmit()}><option value="all">{t("villasPage.allAreas")}</option>{VILLA_NEIGHBORHOODS.filter(n=>VILLAS.some(v=>v.neighborhood===n)).map(n=><option key={n} value={n}>{n} ({VILLAS.filter(v=>v.neighborhood===n).length})</option>)}</select></label>
      <label>{t("villasPage.facts.maxGuests")}<select name="guests" defaultValue={guests} onChange={e=>e.currentTarget.form?.requestSubmit()}><option value="0">{es?"Cualquier grupo":"Any group size"}</option>{[2,4,6,8,10,12,16,20].map(n=><option value={n} key={n}>{n}+ {es?"huéspedes":"guests"}</option>)}</select></label>
      <label>{t("villasPage.facts.bedrooms")}<select name="beds" defaultValue={beds} onChange={e=>e.currentTarget.form?.requestSubmit()}><option value="0">{es?"Cualquier tamaño":"Any size"}</option>{[1,2,3,4,5,6,8,10].map(n=><option value={n} key={n}>{n}+</option>)}</select></label>
      <label>{es?"Ordenar":"Sort by"}<select name="sort" defaultValue={sort} onChange={e=>e.currentTarget.form?.requestSubmit()}><option value="recommended">{es?"Orden de la colección":"Collection order"}</option><option value="name">{es?"Nombre A–Z":"Name A–Z"}</option><option value="price">{es?"Precio publicado: menor primero":"Published price: low first"}</option><option value="bedrooms">{es?"Más dormitorios":"Most bedrooms"}</option></select></label>
      <div className={styles.filterBottom}><span><SlidersHorizontal size={13} aria-hidden/>{es?"Afina tu estancia":"Refine your stay"}</span><label><input type="checkbox" name="photos" value="1" defaultChecked={photosOnly} onChange={e=>e.currentTarget.form?.requestSubmit()}/>{es?"Solo con fotos":"Only with photos"}</label>{active&&<button type="button" onClick={()=>router.replace(pathname,{scroll:false})}>{es?"Borrar filtros":"Clear filters"}<X size={13} aria-hidden/></button>}</div>
    </form>
    {sort==="price"&&<p className={styles.note}>{es?"Las propiedades sin precio publicado aparecen al final. El precio final se confirma al consultar.":"Stays without a published rate appear last. Final pricing is confirmed on inquiry."}</p>}
    {total===0?<div className={styles.empty}><Building2 size={30} aria-hidden/><h3>{es?"Probemos otra búsqueda":"Let’s try another search"}</h3><p>{es?"Ninguna estancia coincide con estos filtros. Prueba otra zona o reduce los requisitos.":"No stays match these filters. Try another area or relax your requirements."}</p><button type="button" onClick={()=>router.replace(pathname,{scroll:false})} className={styles.primaryButton}>{es?"Ver todas las villas":"Show all villas"}</button></div>:<div className={styles.villaGrid}>{slice.map((source,i)=>{const villa=localizeVilla(source,locale,t),cover=villa.galleryImages[0],bedrooms=villaFactNumber(source,"Bedrooms"),capacity=villaFactNumber(source,"Max guests");const query=params.toString();return <ScrollRevealItem key={villa.id} index={i%3}><Link id={`villa-${villa.id}`} href={`/services/villas/${villa.id}${query?"?"+query:""}`} className={styles.villaCard}><div className={styles.cardPhoto}>{cover?<Image src={cover} alt={t("villasPage.exteriorAlt",{name:villa.name})} fill sizes="(max-width:700px) 100vw, (max-width:1050px) 50vw, 33vw" className={styles.cover}/>:<div className={styles.placeholder}><Building2 size={32} aria-hidden/><span>{t("villasPage.photosComingSoon")}</span></div>}<span className={styles.areaTag}>{villa.neighborhood}</span>{villa.galleryImages.length>0&&<span className={styles.photoCount}>{villa.galleryImages.length} {es?"fotos":"photos"}</span>}<span className={styles.openIcon} aria-hidden><ArrowUpRight size={20}/></span></div><div className={styles.cardBody}><div className={styles.cardTitle}><h3>{villa.name}</h3><span>{villa.nightlyRates?t("villasPage.fromPerNight",{price:formatVillaUsd(villa.nightlyRates.weekdayUsd)}):es?"Consultar precio":"Price on inquiry"}</span></div><p>{villa.subtitle}</p><div className={styles.cardFacts}>{bedrooms>0&&<span>{bedrooms} {es?"dormitorios":"bedrooms"}</span>}{capacity>0&&<span>{capacity} {es?"huéspedes":"guests"}</span>}{!bedrooms&&!capacity&&<span>{villa.cardTagline}</span>}</div><span className={styles.cardLink}>{t("villasPage.openListing")}<ArrowUpRight size={14} aria-hidden/></span></div></Link></ScrollRevealItem>;})}</div>}
    {pageCount>1&&<nav className={styles.pagination} aria-label={t("villasPage.paginationAria")}><button disabled={safePage===1} onClick={()=>pageTo(safePage-1)}>{t("villasPage.prev")}</button>{Array.from({length:pageCount},(_,i)=>i+1).map(n=><button key={n} aria-current={n===safePage?"page":undefined} onClick={()=>pageTo(n)}>{n}</button>)}<button disabled={safePage===pageCount} onClick={()=>pageTo(safePage+1)}>{t("villasPage.next")}</button></nav>}
    </section>
  </div>;
}
export function VillasCatalog(){return <Suspense fallback={null}><VillasCatalogInner/></Suspense>;}
