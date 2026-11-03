"use client";

import { useMomentPhotos } from "@/lib/moment-galleries";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRef, useState } from "react";
import styles from "./atv.module.css";

export function RideGallery({photos: initialPhotos,label,previousLabel,nextLabel}:{photos:readonly {src:string;alt:string}[];label:string;previousLabel:string;nextLabel:string}) {
  const photos=useMomentPhotos("atv",initialPhotos);
  const track=useRef<HTMLDivElement>(null);
  const drag=useRef<{id:number;x:number;left:number}|null>(null);
  const [dragging,setDragging]=useState(false);
  const finish=()=>{drag.current=null;setDragging(false);};
  function move(direction:number) {
    const element=track.current;
    if(element) element.scrollBy({left:direction*element.clientWidth*.8,behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"});
  }
  return <div className={styles.shootGallery}>
    <div ref={track} className={styles.shootTrack} data-dragging={dragging} role="region" aria-roledescription="carousel" aria-label={label} tabIndex={0}
      onPointerDown={event=>{if(event.pointerType!=="mouse"||event.button!==0)return;const element=event.currentTarget;drag.current={id:event.pointerId,x:event.clientX,left:element.scrollLeft};element.setPointerCapture(event.pointerId);setDragging(true);}}
      onPointerMove={event=>{const start=drag.current;if(!start||start.id!==event.pointerId)return;event.currentTarget.scrollLeft=start.left-(event.clientX-start.x);}}
      onPointerUp={finish} onPointerCancel={finish} onLostPointerCapture={finish}>
      {photos.map((photo,i)=><div key={photo.src} className={styles.shootPhoto}><Image src={photo.src} alt={photo.alt} fill draggable={false} sizes="(max-width: 600px) 75vw, (max-width: 900px) 45vw, 28vw" className={styles.cover}/><span aria-hidden>{String(i+1).padStart(2,"0")}</span></div>)}
    </div>
    <div className={styles.shootControls}><span>BLACKLINE / OFF-ROAD MOMENTS</span><div><button type="button" aria-label={previousLabel} onClick={()=>move(-1)}><ArrowLeft size={18} aria-hidden/></button><button type="button" aria-label={nextLabel} onClick={()=>move(1)}><ArrowRight size={18} aria-hidden/></button></div></div>
  </div>;
}

