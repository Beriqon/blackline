"use client";
import { useEffect, useState } from "react";
import { PHOTOGRAPHER_SHOOT_SLIDES } from "@/lib/photographer-shoots-data";
import { ATV_CAROUSEL_SLIDES } from "@/lib/atv-gallery-data";
import { EXPERIENCE_MOMENTS } from "@/lib/experience-moments";
export type MomentPhoto={src:string;alt:string};
export const MOMENT_GALLERIES=[
 {id:"home",page:"Home",name:"Client moments",href:"/#client-moments",photos:PHOTOGRAPHER_SHOOT_SLIDES},
 {id:"atv",page:"ATV & UTV",name:"Off-road moments",href:"/services/atv#gallery",photos:ATV_CAROUSEL_SLIDES},
 {id:"experiences",page:"Experiences",name:"Experience moments",href:"/experiences#gallery-title",photos:EXPERIENCE_MOMENTS},
 {id:"packages",page:"Packages",name:"Photoshoot moments",href:"/packages#photo-video-addon",photos:PHOTOGRAPHER_SHOOT_SLIDES},
 {id:"photographer",page:"Photo & video shoots",name:"Past shoots",href:"/services/photographer#past-shoots",photos:PHOTOGRAPHER_SHOOT_SLIDES},
] as const;
export type MomentGalleryId=typeof MOMENT_GALLERIES[number]["id"];
const EVENT="blackline-moments-updated";
function database():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{const request=indexedDB.open("blackline-moment-photos",1);request.onupgradeneeded=()=>request.result.createObjectStore("galleries");request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});}
export async function readMomentPhotos(id:MomentGalleryId):Promise<MomentPhoto[]|undefined>{const db=await database();return new Promise((resolve,reject)=>{const tx=db.transaction("galleries","readonly"),r=tx.objectStore("galleries").get(id);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);tx.oncomplete=()=>db.close();tx.onabort=()=>{db.close();reject(tx.error);};});}
export async function saveMomentPhotos(id:MomentGalleryId,photos:MomentPhoto[]){const db=await database();await new Promise<void>((resolve,reject)=>{const tx=db.transaction("galleries","readwrite");tx.objectStore("galleries").put(photos,id);tx.oncomplete=()=>{db.close();resolve();};tx.onabort=tx.onerror=()=>{db.close();reject(tx.error);};});window.dispatchEvent(new Event(EVENT));const channel=new BroadcastChannel(EVENT);channel.postMessage(id);channel.close();}
export function useMomentPhotos(id:MomentGalleryId,defaults:readonly MomentPhoto[]){const [saved,setSaved]=useState<MomentPhoto[]|undefined>();useEffect(()=>{let alive=true;const load=()=>{readMomentPhotos(id).then(p=>{if(alive)setSaved(p);}).catch(()=>{});};load();window.addEventListener(EVENT,load);const channel=new BroadcastChannel(EVENT);channel.onmessage=load;return()=>{alive=false;window.removeEventListener(EVENT,load);channel.close();};},[id]);return saved??defaults;}
