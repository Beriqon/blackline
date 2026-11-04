"use client";
import {loadRows,saveRow,uploadPhoto} from "./workspace-store";
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
export async function readMomentPhotos(id:MomentGalleryId):Promise<MomentPhoto[]|undefined>{
 await loadRows<MomentPhoto[]>("photo_galleries");
 const {supabaseBrowser}=await import("./supabase-browser");
 const {data,error}=await supabaseBrowser().from("photo_galleries").select("data").eq("id",id).maybeSingle();
 if(error)throw new Error(error.message);return data?.data as MomentPhoto[]|undefined;
}
export async function saveMomentPhotos(id:MomentGalleryId,photos:MomentPhoto[]){const next=[];for(const photo of photos)next.push({...photo,src:await uploadPhoto(photo.src)});await saveRow("photo_galleries",id,next);window.dispatchEvent(new Event(EVENT));}
export function useMomentPhotos(id:MomentGalleryId,defaults:readonly MomentPhoto[]){const [saved,setSaved]=useState<MomentPhoto[]|undefined>();useEffect(()=>{let alive=true;const load=()=>{readMomentPhotos(id).then(p=>{if(alive)setSaved(p);}).catch(()=>{});};load();window.addEventListener(EVENT,load);const refresh=()=>{if(!document.hidden)load();};window.addEventListener("focus",refresh);return()=>{alive=false;window.removeEventListener(EVENT,load);window.removeEventListener("focus",refresh);};},[id]);return saved??defaults;}
