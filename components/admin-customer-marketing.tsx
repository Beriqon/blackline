"use client";

import {useEffect, useState} from "react";
import styles from "@/app/admin/dashboard/dashboard.module.css";
import css from "./admin-customers.module.css";

type Status = "unknown" | "subscribed" | "unsubscribed";

async function updateSubscription(email: string, action: "subscription" | "subscribe", signal?: AbortSignal): Promise<Status> {
 const response = await fetch("/api/admin/email-marketing", {
  method: "POST",
  headers: {"Content-Type": "application/json"},
  body: JSON.stringify({action, email, confirmed: action === "subscribe"}),
  signal,
 });
 const result = await response.json().catch(() => null);
 if (!response.ok || !result) throw new Error(result?.error ?? "Could not check the marketing subscription.");
 return result.status;
}

export function AdminCustomerMarketing({email, checkoutOptIn = false}: {email: string; checkoutOptIn?: boolean}) {
 const [status, setStatus] = useState<Status|null>(null);
 const [confirmed, setConfirmed] = useState(false);
 const [busy, setBusy] = useState(false);
 const [error, setError] = useState("");

 useEffect(() => {
  const controller = new AbortController();
  void updateSubscription(email, "subscription", controller.signal)
   .then(status => status === "unknown" && checkoutOptIn && !controller.signal.aborted
    ? updateSubscription(email, "subscribe", controller.signal)
    : status)
   .then(setStatus)
   .catch(error => {if (!controller.signal.aborted) setError(error.message);});
  return () => controller.abort();
 }, [email, checkoutOptIn]);

 async function subscribe() {
  if (!confirmed || busy || status === "unsubscribed") return;
  setBusy(true);
  setError("");
  try { setStatus(await updateSubscription(email, "subscribe")); }
  catch (error) { setError(error instanceof Error ? error.message : "Could not save marketing consent."); }
  finally { setBusy(false); }
 }

 return <section className={css.note} aria-label="Email marketing">
  <h3>Email marketing</h3>
  {status === "subscribed" && <p role="status">Subscribed for {email}. You can select this customer in a campaign.</p>}
  {status === "unsubscribed" && <p role="status">This address has unsubscribed from marketing emails.</p>}
  {status === "unknown" && <>
   <label><input type="checkbox" checked={confirmed} disabled={busy} onChange={event => setConfirmed(event.target.checked)}/> This customer agreed to receive marketing emails at {email}.</label>
   <p><button type="button" className={styles.secondary} disabled={!confirmed||busy} onClick={() => void subscribe()}>{busy ? "Saving consent…" : "Save marketing consent"}</button></p>
  </>}
  {status === null && !error && <p role="status">Checking marketing subscription…</p>}
  {error && <p className={styles.error} role="alert">{error}</p>}
 </section>;
}

export function ExistingCustomerMarketing({emails}: {emails: string[]}) {
 const [confirmed, setConfirmed] = useState(false);
 const [busy, setBusy] = useState(false);
 const [message, setMessage] = useState("");

 async function sync() {
  if (busy || !confirmed || !emails.length) return;
  setBusy(true);
  const totals = {subscribed:0, unsubscribed:0, failed:0};
  try {
   for (let index = 0; index < emails.length; index += 10) {
    setMessage(`Syncing customers (${index}/${emails.length})…`);
    const response = await fetch("/api/admin/email-marketing", {
     method:"POST", headers:{"Content-Type":"application/json"},
     body:JSON.stringify({action:"sync-existing", emails:emails.slice(index,index+10), confirmed:true}),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error ?? "Could not sync marketing consent.");
    totals.subscribed += result.subscribed;
    totals.unsubscribed += result.unsubscribed;
    totals.failed += result.failed;
   }
   setMessage(`${totals.subscribed} subscribed · ${totals.unsubscribed} previously unsubscribed · ${totals.failed} failed.`);
   setConfirmed(false);
  } catch (error) {
   setMessage(`${totals.subscribed} subscribed so far. ${error instanceof Error ? error.message : "Could not finish synchronization."}`);
  } finally {setBusy(false);}
 }

 return <details className={css.note}>
  <summary>Sync existing marketing consent</summary>
  <p>Use this once for customers who already agreed to receive marketing emails. This includes all {emails.length} eligible addresses in the directory.</p>
  <label><input type="checkbox" checked={confirmed} disabled={busy} onChange={event => setConfirmed(event.target.checked)}/> I confirm these customers already opted in.</label>
  <p><button type="button" className={styles.secondary} disabled={!confirmed||busy||!emails.length} onClick={() => void sync()}>Sync existing customers</button></p>
  {message && <p role="status">{message}</p>}
 </details>;
}
