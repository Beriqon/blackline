"use client";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { loadRows } from "@/lib/workspace-store";
import styles from "@/app/admin/dashboard/dashboard.module.css";
import {isLocalDashboardPreview} from "@/lib/dashboard-preview";
export function AdminAccess({ children }: { children: ReactNode }) {
  const [state, setState] = useState("Checking your workspace access…");
  const [allowed, setAllowed] = useState(false);
  const [preview,setPreview]=useState(false);
  useEffect(() => {
    let alive = true;
    async function check() {
      try {
        if(process.env.NODE_ENV==="development"&&["localhost","127.0.0.1"].includes(window.location.hostname)&&new URLSearchParams(window.location.search).get("preview")==="1")sessionStorage.setItem("blackline-readonly-preview","1");
        if(isLocalDashboardPreview()){if(alive){setPreview(true);setAllowed(true);}return;}
        const db = supabaseBrowser(); const { data: { user }, error } = await db.auth.getUser();
        if (error || !user) throw new Error("Sign in to access the management workspace.");
        const { data, error: memberError } = await db.from("admin_members").select("email").eq("email", user.email?.toLowerCase() ?? "").maybeSingle();
        if (memberError || !data) throw new Error("This account does not have administrator access.");
        await Promise.all([loadRows("affiliates"), loadRows("customers")]);
        if (alive) setAllowed(true);
      } catch (e) { if (alive) { setAllowed(false); setState(e instanceof Error ? e.message : "Could not open your workspace."); } }
    }
    void check(); const { data: { subscription } } = supabaseBrowser().auth.onAuthStateChange((event: string) => { if (event === "SIGNED_OUT") { setAllowed(false); setState("You have signed out."); } });
    return () => { alive = false; subscription.unsubscribe(); };
  }, []);
  return allowed ? preview ? <><p role="status" style={{position:"fixed",bottom:12,right:16,zIndex:100,background:"#c5ab7b",color:"#171717",padding:"12px 18px",fontSize:12,maxWidth:"calc(100vw - 32px)"}}>Alleen-lezen voorbeeld · boekingen zijn voorbeelden · wijzigen kan na inloggen</p><fieldset disabled style={{border:0,padding:0,margin:0,minWidth:0}}>{children}</fieldset></> : children : <section className={styles.placeholder}><h1>Blackline workspace</h1><p role="status">{state}</p><Link className={styles.primary} href="/admin">Sign in</Link></section>;
}
