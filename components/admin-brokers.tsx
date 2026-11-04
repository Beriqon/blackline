import {Handshake} from "lucide-react";
import styles from "@/app/admin/dashboard/dashboard.module.css";

export function AdminBrokers(){
 return <>
  <div className={styles.pageHeading}><div><p className={styles.eyebrow}>BLACKLINE / PARTNERS</p><h1>Your broker <em>network.</em></h1><p>A dedicated place for your partners and their listings.</p></div></div>
  <section className={styles.placeholder}>
   <Handshake size={34}/>
   <p className={styles.eyebrow}>IN PROGRESS · COMING LATER</p>
   <h2>The broker workspace is on its way.</h2>
   <p>This section is still in development and is not available yet. Broker registration, verification and listing approvals will become available in a future update.</p>
   <p>Once launched, this is where you will review broker applications, approve their listings and track related inquiries and commissions.</p>
  </section>
 </>;
}
