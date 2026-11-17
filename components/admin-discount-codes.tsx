"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import styles from "@/app/admin/dashboard/dashboard.module.css";
import layout from "./admin-social-analytics.module.css";

type Code = { id: string; kind: "percent" | "fixed"; amount: number; expires_on: string | null; active: boolean };

export function AdminDiscountCodes() {
  const [codes, setCodes] = useState<Code[] | null>(null);
  const [kind, setKind] = useState<Code["kind"]>("percent");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let current = true;
    void supabaseBrowser().from("discount_codes").select("*").order("id").then(({ data, error }: { data: Code[] | null; error: unknown }) => {
      if (!current) return;
      if (error) setMessage("Discount codes could not be loaded.");
      else setCodes(data as Code[]);
    }, () => {
      if (current) setMessage("Discount codes could not be loaded.");
    });
    return () => { current = false; };
  }, []);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !codes) return;
    const form = event.currentTarget;
    const fields = new FormData(form);
    const id = String(fields.get("code")).trim().toUpperCase();
    const value = Number(fields.get("amount"));
    const amount = kind === "fixed" ? Math.round(value * 100) : value;
    setBusy(true);
    setMessage("");
    try {
      const { data, error } = await supabaseBrowser().from("discount_codes").insert({
        id, kind, amount, expires_on: fields.get("expiry") || null,
      }).select().single();
      if (error) {
        setMessage(error.code === "23505" ? "This code already exists." : "The code could not be saved.");
        return;
      }
      const code = data as Code;
      setCodes(previous => [...(previous ?? []), code].sort((a, b) => a.id.localeCompare(b.id)));
      form.reset();
      setKind("percent");
      setMessage(`${id} created.`);
    } catch {
      setMessage("The code could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  async function toggle(code: Code) {
    setBusy(true);
    setMessage("");
    try {
      const { data, error } = await supabaseBrowser().from("discount_codes")
        .update({ active: !code.active }).eq("id", code.id).select().single();
      if (error) throw error;
      setCodes(previous => previous?.map(row => row.id === code.id ? data as Code : row) ?? null);
      setMessage(`${code.id} ${code.active ? "disabled" : "enabled"}.`);
    } catch {
      setMessage("The change could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={layout.page}>
      <div className={styles.pageHeading}>
        <div><p className={styles.eyebrow}>BLACKLINE / MARKETING &amp; CONTENT</p><h1>Discount codes</h1><p>Create offers customers can apply to services priced online.</p></div>
      </div>
      <div className={layout.columns}>
        <section className={layout.card}>
          <div className={layout.heading}><h2>Create a code</h2></div>
          <form onSubmit={create}>
            <label className={styles.fullField}>Code<input name="code" placeholder="BLACKLINE10" pattern="[A-Za-z0-9][A-Za-z0-9_\-]{2,29}" maxLength={30} required /></label>
            <label className={styles.fullField}>Discount type<select value={kind} onChange={event => setKind(event.target.value as Code["kind"])}><option value="percent">Percentage</option><option value="fixed">Fixed amount (USD)</option></select></label>
            <label className={styles.fullField}>{kind === "percent" ? "Discount (%)" : "Discount (USD)"}<input key={kind} name="amount" type="number" min={kind === "percent" ? 1 : 0.01} max={kind === "percent" ? 99 : 500000} step={kind === "percent" ? 1 : 0.01} required /></label>
            <label className={styles.fullField}>Expires on (optional, Miami time)<input name="expiry" type="date" /></label>
            <button className={styles.primary} disabled={!codes || busy}><Plus size={16} />Create code</button>
          </form>
        </section>
        <section className={layout.card}>
          <div className={layout.heading}><h2>Saved codes</h2></div>
          {!codes && !message && <p>Loading discount codes…</p>}
          {codes?.length === 0 && <p>No discount codes yet.</p>}
          <ul className={layout.traffic}>
            {codes?.map(code => (
              <li className={layout.trafficLabel} key={code.id}>
                <div><strong>{code.id}</strong>
                  <p>{code.kind === "percent" ? `${code.amount}% off` : `$${(code.amount / 100).toFixed(2)} off`} · {code.active ? "Enabled" : "Disabled"}{code.expires_on && ` · Expires ${code.expires_on}`}</p>
                </div>
                <button type="button" className={styles.secondary} disabled={busy} onClick={() => void toggle(code)}>{code.active ? "Disable" : "Enable"}</button>
              </li>
            ))}
          </ul>
          <p role="status">{message}</p>
        </section>
      </div>
    </div>
  );
}
