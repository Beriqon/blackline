"use client";
import { useEffect, useState } from "react";
export type CookieConsent={version:1;externalMedia:boolean;updatedAt:number};
const KEY="blackline-cookie-consent-v1";
export const CONSENT_EVENT="blackline-cookie-consent-changed";
export const OPEN_COOKIE_SETTINGS="blackline-open-cookie-settings";
export function readConsent():CookieConsent|null{try{const value=JSON.parse(localStorage.getItem(KEY)??"null");return value?.version===1&&typeof value.externalMedia==="boolean"&&Number.isFinite(value.updatedAt)&&Date.now()-value.updatedAt<180*86400000?value:null;}catch{return null;}}
export function saveConsent(externalMedia:boolean){const value:CookieConsent={version:1,externalMedia,updatedAt:Date.now()};localStorage.setItem(KEY,JSON.stringify(value));window.dispatchEvent(new Event(CONSENT_EVENT));}
export function useCookieConsent(){const [consent,setConsent]=useState<CookieConsent|null>(null),[ready,setReady]=useState(false);useEffect(()=>{const sync=()=>{setConsent(readConsent());setReady(true);};sync();window.addEventListener(CONSENT_EVENT,sync);window.addEventListener("storage",sync);return()=>{window.removeEventListener(CONSENT_EVENT,sync);window.removeEventListener("storage",sync);};},[]);return {consent,ready};}
