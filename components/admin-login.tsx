"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Eye, EyeOff, LockKeyhole, Mail, KeyRound } from "lucide-react";
import {supabaseBrowser} from "@/lib/supabase-browser";
import { useState } from "react";
import styles from "@/app/admin/admin.module.css";

export function AdminLogin(){
 const [showPassword,setShowPassword]=useState(false);
 const [message,setMessage]=useState(""); const [busy,setBusy]=useState(false);
 return <div className={styles.page}>
   <section className={styles.visual} aria-label="Blackline Concierge, Miami">
     <Image src="/home/miami-dusk.webp" alt="Miami skyline and a private yacht at dusk" fill priority sizes="(max-width:800px) 100vw, 55vw" className={styles.image}/>
     <div className={styles.shade}/>
     <Link href="/" className={styles.brand} aria-label="Blackline Concierge home"><span>BLACKLINE</span><small>CONCIERGE</small></Link>
     <span className={styles.visualIndex}>MIAMI, FLORIDA <i/> EST. FOR THE EXCEPTIONAL</span>
     <div className={styles.editorial}><p className={styles.eyebrow}><span/>THE ART OF EVERY DETAIL</p><h1>Exceptional<br/>experiences.<br/><em>Thoughtfully<br/>orchestrated.</em></h1><p>Behind every effortless moment,<br/>a world of considered details.</p></div>
     <div className={styles.visualFooter}><span>ONE CALL. EVERY DETAIL.</span><span>BLACKLINE / PRIVATE</span></div>
   </section>
   <section className={styles.login} aria-labelledby="login-title">
     <header className={styles.topline}><Link href="/"><ArrowLeft size={13}/>Back to website</Link><span>PRIVATE WORKSPACE <i/></span></header>
     <div className={styles.formWrap}>
       <div className={styles.accessMark}><LockKeyhole size={22} strokeWidth={1.2}/></div>
       <p className={styles.eyebrow}>BLACKLINE ADMINISTRATION</p>
       <h2 id="login-title">Welcome <em>back.</em></h2>
       <p className={styles.intro}>Your world of details, in one place.<br/>Sign in to your private workspace.</p>
       <form onSubmit={async e=>{e.preventDefault();setBusy(true);setMessage("");const form=new FormData(e.currentTarget);try{const {error}=await supabaseBrowser().auth.signInWithPassword({email:String(form.get("email")),password:String(form.get("password"))});if(error)throw error;sessionStorage.removeItem("blackline-readonly-preview");window.location.assign("/admin/dashboard");}catch(e){setMessage(e instanceof Error?e.message:"Sign-in failed.");}finally{setBusy(false);}}}>
         <label className={styles.field} htmlFor="admin-email"><span>Email address</span><div><Mail size={16} strokeWidth={1.4}/><input id="admin-email" name="email" type="email" placeholder="you@blacklineconcierge.com" autoComplete="username" required onChange={()=>setMessage("")}/></div></label>
         <label className={styles.field} htmlFor="admin-password"><span>Password</span><div><KeyRound size={16} strokeWidth={1.4}/><input id="admin-password" name="password" type={showPassword?"text":"password"} placeholder="Enter your password" autoComplete="current-password" required onChange={()=>setMessage("")}/><button type="button" className={styles.showPassword} aria-label={showPassword?"Hide password":"Show password"} aria-pressed={showPassword} onClick={()=>setShowPassword(v=>!v)}>{showPassword?<EyeOff size={17} strokeWidth={1.4}/>:<Eye size={17} strokeWidth={1.4}/>}</button></div></label>
         <div className={styles.formOptions}><span><span className={styles.smallLine}/>By invitation. For the team.</span><Link href="/admin/forgot-password">Forgot password?</Link></div>
         <button className={styles.submit} type="submit" disabled={busy}>Sign in to workspace<ArrowUpRight size={18} strokeWidth={1.5}/></button>
         <div className={styles.feedback} role="status" aria-live="polite">{message}</div>
       </form>
       <Link href="/admin/dashboard" className={styles.demoEntry}>Open workspace <ArrowUpRight size={14}/><span>SIGN-IN REQUIRED</span></Link>
       <Link href="/admin/activate" className={styles.demoEntry}>Activate your account<ArrowUpRight size={14}/></Link><div className={styles.restricted}><span/>Reserved for the Blackline team<span/></div>
     </div>
     <footer className={styles.loginFooter}><span>© {new Date().getFullYear()} BLACKLINE CONCIERGE</span><Link href="/privacy">Privacy policy<ArrowUpRight size={11}/></Link></footer>
   </section>
 </div>;
}
