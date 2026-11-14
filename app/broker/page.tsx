import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Handshake } from "lucide-react";
import { BrokerLoginForm } from "./broker-login-form";
import styles from "../admin/admin.module.css";

export const metadata: Metadata = {
  title: "Broker portal",
  description: "Blackline Concierge’s broker portal.",
  robots: { index: false, follow: false },
};

export default function BrokerPage() {
  return (
    <div className={styles.page}>
      <section className={styles.visual} aria-label="Blackline Concierge">
        <Image src="/home/miami-dusk.webp" alt="" fill preload sizes="(max-width: 800px) 100vw, 52vw" className={styles.image} />
        <div className={styles.shade} />
        <Link href="/" className={styles.brand} aria-label="Blackline Concierge home">
          <span>BLACKLINE</span>
          <small>CONCIERGE</small>
        </Link>
        <div className={styles.editorial}>
          <h1>Broker <em>portal.</em></h1>
          <p>Your workspace for managing listings with Blackline Concierge.</p>
        </div>
      </section>

      <section className={styles.login} aria-labelledby="broker-login-title">
        <header className={styles.topline}>
          <Link href="/"><ArrowLeft size={13} />Back to website</Link>
        </header>
        <div className={styles.formWrap}>
          <div className={styles.accessMark}><Handshake size={22} strokeWidth={1.2} aria-hidden="true" /></div>
          <BrokerLoginForm />
          <p className={styles.formOptions}><Link href="/broker/dashboard">Explore dashboard demo <ArrowUpRight size={12} className="inline" /></Link></p>
          <p className={styles.formOptions}><Link href="/broker/register">Create a broker account <ArrowUpRight size={12} className="inline" /></Link></p>
        </div>
        <footer className={styles.loginFooter}>
          <span>BLACKLINE CONCIERGE</span>
          <Link href="/privacy">Privacy policy<ArrowUpRight size={11} /></Link>
        </footer>
      </section>
    </div>
  );
}
