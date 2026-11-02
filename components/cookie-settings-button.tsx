"use client";
import { OPEN_COOKIE_SETTINGS } from "@/lib/cookie-consent";
export function CookieSettingsButton(){return <button type="button" onClick={()=>window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS))}>Cookie settings</button>;}
