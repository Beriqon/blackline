"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";
import styles from "./affiliate.module.css";

export function AffiliateApplication() {
  const [ready, setReady] = useState(false);
  const [messageUrl, setMessageUrl] = useState("");
  function prepare(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const message = ["Hi Blackline! I’d like to apply for the affiliate program.", ...[["Name", "name"], ["Email", "email"], ["Location", "location"], ["Social profile / website", "profile"], ["Audience size", "audience"], ["Services of interest", "services"], ["About my audience & partnership ideas", "vision"]].map(([label, key]) => `${label}: ${data.get(key) || "Not provided"}`)].join("\n\n");
    setMessageUrl(`https://wa.me/17866840345?text=${encodeURIComponent(message)}`);
    setReady(true);
  }
  return <form className={styles.form} onSubmit={prepare} onChange={()=>setReady(false)}>
    <div className={styles.formHeading}><span>YOUR AFFILIATE APPLICATION</span><span>01 — LET’S MEET</span></div>
    <h3>Introduce yourself.</h3><p>Complete your details, then send your application to our team on WhatsApp.</p>
    <div className={styles.fields}>
      <label>Full name *<input name="name" autoComplete="name" placeholder="Your full name" required maxLength={120}/></label>
      <label>Email address *<input name="email" type="email" autoComplete="email" placeholder="you@example.com" required maxLength={200}/></label>
      <label>Where are you based? *<input name="location" autoComplete="address-level2" placeholder="City, country" required maxLength={160}/></label>
      <label>Audience size<select name="audience" defaultValue=""><option value="">Select your reach</option><option>Under 5,000</option><option>5,000 – 25,000</option><option>25,000 – 100,000</option><option>100,000+</option><option>Private network / business</option></select></label>
      <label className={styles.full}>Social profile or website *<input name="profile" placeholder="Instagram handle, TikTok, or website" required maxLength={300}/></label>
      <label className={styles.full}>Which services would you love to share?<input name="services" placeholder="Yachts, villas, cars, nightlife…" maxLength={300}/></label>
      <label className={styles.full}>Tell us about your audience & ideas *<textarea name="vision" placeholder="Your community, your content, and why Blackline feels like a fit." required rows={4} maxLength={1800}/></label>
    </div>
    <label className={styles.consent}><input type="checkbox" required/><span>I agree to share these details with Blackline to discuss my application. I have read the <Link href="/privacy">Privacy Policy</Link>.</span></label>
    <button className={styles.primary} type="submit">Prepare my application <ArrowUpRight size={17}/></button>
    <p className={styles.formNote}>Your application is sent only when you send the message in WhatsApp.</p>
    {ready&&<div className={styles.ready} role="status"><strong>Your introduction is ready.</strong><p>Open WhatsApp, review your details, and send the message to Blackline.</p><a href={messageUrl} target="_blank" rel="noopener noreferrer" className={styles.textLink}>Continue to WhatsApp <ArrowUpRight size={16}/></a></div>}
  </form>;
}
