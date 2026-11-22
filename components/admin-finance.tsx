"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { CalendarDays, ChartNoAxesCombined, Plus, ReceiptText, RefreshCw, Wallet, X } from "lucide-react";
import type { AdminBooking } from "@/lib/admin-demo-data";
import type { TrashEntry } from "@/lib/admin-trash";
import { confirmedZellePayments, estimateProfitTax, financePeriods, financeRange, financeTrend, type FinanceExpense, type FinanceReport } from "@/lib/admin-finance";
import { loadRows, saveRow } from "@/lib/workspace-store";
import styles from "@/app/admin/dashboard/dashboard.module.css";
import css from "./admin-finance.module.css";

const table = "finance_expenses";
const dateKey = (seconds: number) => new Date(seconds * 1000).toISOString().slice(0, 10);
const dateLabel = (date: string) => new Intl.DateTimeFormat("en-US", {
  month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
}).format(new Date(date));
const today = () => dateKey(Date.now() / 1000);
const blankExpense = () => ({ description: "", category: "", amount: "", date: today() });

function money(amount: number, currency = "usd") {
  const format = new Intl.NumberFormat("en-US", { style: "currency", currency });
  const digits = ["isk", "ugx"].includes(currency) ? 2 : format.resolvedOptions().maximumFractionDigits ?? 2;
  return format.format(amount / 10 ** digits);
}

type Props = {
  bookings: AdminBooking[];
  bookingsReady: boolean;
  bookingsError: string;
  preview: boolean;
  onRefreshBookings: () => Promise<void>;
  trashEntries: TrashEntry[];
  onOpenBooking: (booking: AdminBooking) => void;
};

export function AdminFinance({ bookings, bookingsReady, bookingsError, preview, onRefreshBookings, trashEntries, onOpenBooking }: Props) {
  const [days, setDays] = useState(30);
  const [revision, setRevision] = useState(0);
  const [report, setReport] = useState<{ key: string; data?: FinanceReport; error?: string }>();
  const [expenses, setExpenses] = useState<{ revision: number; rows?: FinanceExpense[]; error?: string }>();
  const [draft, setDraft] = useState(blankExpense);
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [taxRate, setTaxRate] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const reportKey = `${days}:${revision}`;

  useEffect(() => {
    if (preview) return;
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch(`/api/admin/finance?days=${days}`, {
          cache: "no-store", signal: controller.signal,
        });
        const body = await response.json();
        if (!response.ok) throw new Error(body.error ?? "Stripe activity could not be loaded.");
        if (!controller.signal.aborted) setReport({ key: reportKey, data: body });
      } catch (error) {
        if (!controller.signal.aborted) {
          setReport({ key: reportKey, error: error instanceof Error ? error.message : "Stripe activity could not be loaded." });
        }
      }
    }
    void load();
    return () => controller.abort();
  }, [days, preview, reportKey]);

  useEffect(() => {
    if (preview) return;
    let active = true;
    loadRows<FinanceExpense>(table).then(
      rows => { if (active) setExpenses({ revision, rows }); },
      () => { if (active) setExpenses({ revision, error: "Saved expenses could not be loaded." }); },
    );
    return () => { active = false; };
  }, [preview, revision]);

  const stripe = report?.key === reportKey ? report : undefined;
  const expenseState = expenses?.revision === revision ? expenses : undefined;
  const { start, end } = stripe?.data ?? financeRange(days);
  const startDate = dateKey(start), endDate = dateKey(end - 1);
  const zelleReady = bookingsReady && !bookingsError;
  const zelle = zelleReady ? confirmedZellePayments(bookings).filter(payment => payment.created >= start && payment.created < end) : [];
  const expensesInPeriod = expenseState?.rows?.filter(expense => expense.date >= startDate && expense.date <= endDate)
    .sort((a, b) => b.date.localeCompare(a.date));
  const zelleTotal = zelle.reduce((sum, payment) => sum + payment.amount, 0);
  const expenseTotal = expensesInPeriod?.reduce((sum, expense) => sum + expense.amountCents, 0) ?? 0;
  const usd = stripe?.data?.currencies.find(row => row.currency === "usd");
  const hasRevenue = !!stripe?.data && zelleReady;
  const hasProfit = hasRevenue && !!expensesInPeriod;
  const turnover = (usd?.payments ?? 0) + zelleTotal;
  const profit = (usd?.netPayments ?? 0) + zelleTotal - expenseTotal;
  const rate = Number(taxRate);
  const tax = hasProfit && taxRate !== "" && Number.isFinite(rate) && rate >= 0 && rate <= 100
    ? estimateProfitTax(profit, rate) : null;
  const paymentCount = (usd?.paymentCount ?? 0) + zelle.length;
  const trend = hasProfit ? financeTrend({ start, end }, usd?.daily ?? {}, zelle, expensesInPeriod ?? []) : [];
  const chartMax = Math.max(1, ...trend.flatMap(point => [Math.abs(point.turnover), Math.abs(point.profit)]));
  const expenseCategories = new Map<string, number>();
  for (const expense of expensesInPeriod ?? []) {
    expenseCategories.set(expense.category, (expenseCategories.get(expense.category) ?? 0) + expense.amountCents);
  }

  async function addExpense(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (preview || saving || !expenseState?.rows) return;
    const amountCents = Math.round(Number(draft.amount) * 100);
    if (!draft.description.trim() || !draft.category.trim() || !Number.isSafeInteger(amountCents) ||
      amountCents < 1 || amountCents > 99_999_999_999 || !draft.date || draft.date > today()) {
      setSaveError("Enter a description, category, valid expense date and positive USD amount.");
      return;
    }
    const expense = {
      id: crypto.randomUUID(), description: draft.description.trim(), category: draft.category.trim(),
      amountCents, date: draft.date,
    };
    setSaving(true);
    setSaveError("");
    try {
      await saveRow(table, expense.id, expense);
      setExpenses(current => current?.rows ? { ...current, rows: [...current.rows, expense] } : current);
      setNotice(expense.date < startDate ? "Expense saved outside the selected period." : "Expense saved.");
      dialog.current?.close();
    } catch {
      setSaveError("The expense could not be saved. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return <div className={css.finance}>
    <div className={styles.pageHeading}>
      <div>
        <p className={styles.eyebrow}>BLACKLINE / FINANCIAL OVERVIEW</p>
        <h1>Financial overview</h1>
        <p>Stripe activity, confirmed Zelle payments and recorded expenses.</p>
      </div>
      {!preview && <button className={styles.primary} disabled={!expenseState?.rows}
        onClick={() => { setDraft(blankExpense()); setSaveError(""); setNotice(""); dialog.current?.showModal(); }}>
        <Plus size={16}/>Add expense
      </button>}
    </div>
    {preview ? <p className={styles.empty}>Sign in as an administrator to view financial activity and record expenses.</p> : <>
      <div className={css.toolbar}>
        <div><CalendarDays size={16}/><span>{dateLabel(startDate)} – {dateLabel(endDate)}</span><small>UTC</small></div>
        <div className={css.periods} role="group" aria-label="Financial reporting period">
          {financePeriods.map(period => <button key={period.days} aria-pressed={days === period.days}
            onClick={() => setDays(period.days)}>{period.label}</button>)}
          <button type="button" disabled={saving} onClick={() => {
            setRevision(value => value + 1);
            void onRefreshBookings();
          }}><RefreshCw size={14}/> Refresh</button>
        </div>
      </div>
      <div className={css.kpis}>
        <article className={css.kpi}>
          <div><span>Total turnover</span><Wallet size={17}/></div>
          <strong>{hasRevenue ? money(turnover) : "—"}</strong>
          <p>USD payments before refunds, disputes and fees</p>
        </article>
        <article className={css.kpi}>
          <div><span>Recorded expenses</span><ReceiptText size={17}/></div>
          <strong>{expensesInPeriod ? money(expenseTotal) : "—"}</strong>
          <p>{expensesInPeriod ? `${expensesInPeriod.length} expenses · Stripe fees shown separately` : "Expense data pending or unavailable"}</p>
        </article>
        <article className={css.kpi}>
          <div><span>Profit before tax</span><ChartNoAxesCombined size={17}/></div>
          <strong>{hasProfit ? money(profit) : "—"}</strong>
          <p>{hasProfit && turnover > 0 ? `${(profit / turnover * 100).toFixed(1)}% margin · cash basis` : "After refunds, disputes, fees and recorded expenses"}</p>
        </article>
        <article className={`${css.kpi} ${css.netKpi}`}>
          <div><span>Estimated profit after tax</span><Wallet size={17}/></div>
          <strong>{tax !== null ? money(profit - tax) : "—"}</strong>
          <p>{tax !== null ? `${money(tax)} estimated tax at ${rate}%` : "Enter an estimated tax rate below"}</p>
        </article>
      </div>
      <div className={css.overviewGrid}>
        <section className={css.panel}>
          <div className={css.panelHeader}><h2>Financial trend</h2></div>
          {hasProfit ? <div className={css.trend}>
            {trend.map(point => <div className={css.trendPeriod} key={point.start}>
              <p>{dateLabel(dateKey(point.start))} – {dateLabel(dateKey(point.end - 1))}</p>
              {([["Turnover", point.turnover], ["Profit before tax", point.profit]] as const).map(([label, amount]) =>
                <div key={label} className={css.trendMetric} data-metric={label} data-negative={amount < 0}>
                  <span>{label}</span><strong>{money(amount)}</strong>
                  <div className={css.trendTrack} aria-hidden="true"><i style={{ width: `${Math.abs(amount) / chartMax * 100}%` }}/></div>
                </div>)}
            </div>)}
          </div> : <p className={styles.empty}>The trend appears when Stripe, Zelle and expense data are available.</p>}
        </section>
        <section className={`${css.panel} ${css.breakdown} ${css.profitBreakdown}`}>
          <div className={css.panelHeader}><h2>Revenue to profit</h2></div>
          <dl>
            <div><dt>Gross Stripe payments · USD</dt><dd>{stripe?.data ? money(usd?.payments ?? 0) : "—"}</dd></div>
            <div><dt>Verified Zelle ({zelleReady ? zelle.length : "—"})</dt><dd>{zelleReady ? money(zelleTotal) : "—"}</dd></div>
            <div><dt>Refunds after reversals</dt><dd>{stripe?.data ? money(usd?.refunds ?? 0) : "—"}</dd></div>
            <div><dt>Disputes after reversals</dt><dd>{stripe?.data ? money(usd?.disputes ?? 0) : "—"}</dd></div>
            <div><dt>Stripe fees</dt><dd>{stripe?.data ? money(usd?.fees ?? 0) : "—"}</dd></div>
            <div><dt>Recorded expenses</dt><dd>{expensesInPeriod ? money(expenseTotal) : "—"}</dd></div>
            <div className={css.subtotal}><dt>Profit before tax</dt><dd>{hasProfit ? money(profit) : "—"}</dd></div>
            <div><dt><label htmlFor="finance-tax-rate">Estimated tax rate</label></dt>
              <dd className={css.taxInput}><input id="finance-tax-rate" type="number" min="0" max="100" step="any"
                inputMode="decimal" value={taxRate} onChange={event => setTaxRate(event.target.value)} aria-describedby="finance-tax-note"/><span>%</span></dd></div>
            <div><dt>Estimated tax</dt><dd>{tax !== null ? money(tax) : "—"}</dd></div>
            <div className={css.finalTotal}><dt>Estimated profit after tax</dt><dd>{tax !== null ? money(profit - tax) : "—"}</dd></div>
          </dl>
          <p id="finance-tax-note" className={css.note}>Enter a rate from 0 to 100%. The estimate applies your rate to positive profit for the selected period. USD totals cover received payments and recorded expenses.</p>
        </section>
      </div>
      <section className={`${css.panel} ${css.breakdown} ${css.profitBreakdown}`}>
        <div className={css.panelHeader}><h2>Payment and expense statistics</h2></div>
        <dl>
          <div><dt>Payments received · USD</dt><dd>{hasRevenue ? paymentCount : "—"}</dd></div>
          <div><dt>Average payment</dt><dd>{hasRevenue && paymentCount > 0 ? money(Math.round(turnover / paymentCount)) : "—"}</dd></div>
          <div><dt>Stripe share of turnover</dt><dd>{hasRevenue && turnover > 0 ? `${((usd?.payments ?? 0) / turnover * 100).toFixed(1)}%` : "—"}</dd></div>
          <div><dt>Zelle share of turnover</dt><dd>{hasRevenue && turnover > 0 ? `${(zelleTotal / turnover * 100).toFixed(1)}%` : "—"}</dd></div>
        </dl>
        {expenseCategories.size > 0 && <>
          <div className={css.panelHeader}><h3>Recorded expenses by category</h3></div>
          <dl>{[...expenseCategories].sort((a, b) => b[1] - a[1]).map(([category, amount]) =>
            <div key={category}><dt>{category}</dt><dd>{money(amount)}</dd></div>)}</dl>
        </>}
      </section>
      <section className={css.panel}>
        <div className={css.panelHeader}><h2>Stripe activity</h2></div>
        {!stripe && <p className={styles.empty} role="status">Loading Stripe activity…</p>}
        {stripe?.error && <p className={styles.empty} role="alert">{stripe.error}</p>}
        {stripe?.data?.currencies.length === 0 && <p className={styles.empty}>No Stripe activity in this period.</p>}
        {stripe?.data?.currencies.map(row => <div key={row.currency} className={css.breakdown}>
          <div className={css.panelHeader}><h3>{row.currency.toUpperCase()}</h3></div>
          <dl>
            <div><dt>Gross payments ({row.paymentCount})</dt><dd>{money(row.payments, row.currency)}</dd></div>
            <div><dt>Refunds after reversals</dt><dd>{money(row.refunds, row.currency)}</dd></div>
            <div><dt>Disputes after reversals</dt><dd>{money(row.disputes, row.currency)}</dd></div>
            <div><dt>Stripe fees</dt><dd>{money(row.fees, row.currency)}</dd></div>
            <div className={css.subtotal}><dt>Net Stripe payments</dt><dd>{money(row.netPayments, row.currency)}</dd></div>
            <div><dt>Bank payouts after reversals</dt><dd>{money(row.payouts, row.currency)}</dd></div>
          </dl>
          <div className={styles.tableScroll}><table className={css.ledger}>
            <thead><tr><th>Date</th><th>Activity</th><th>Gross</th><th>Fees</th><th>Balance impact</th></tr></thead>
            <tbody>{row.recent.map(entry => <tr key={entry.id}>
              <td>{dateLabel(dateKey(entry.created))}</td><td>{entry.label}</td>
              <td>{money(entry.amount, row.currency)}</td><td>{money(entry.fee, row.currency)}</td><td>{money(entry.net, row.currency)}</td>
            </tr>)}</tbody>
          </table></div>
          <p className={css.caption}>Showing {row.recent.length} of {row.count} entries. Amounts use the Stripe settlement currency.</p>
        </div>)}
      </section>
      <section className={css.panel}>
        <div className={css.panelHeader}><h2>Verified Zelle payments</h2></div>
        {bookingsError ? <p className={styles.empty} role="alert">Zelle bookings could not be loaded. Try refreshing.</p>
          : !bookingsReady ? <p className={styles.empty} role="status">Loading Zelle bookings…</p>
          : zelle.length === 0 ? <p className={styles.empty}>No verified Zelle payments in this period.</p>
          : <div className={styles.tableScroll}><table className={css.ledger}>
            <thead><tr><th>Verified date</th><th>Payment</th><th>Booking</th><th>Amount</th></tr></thead>
            <tbody>{zelle.map(payment => {
              const booking = bookings.find(row => row.id === payment.bookingId);
              const trash = trashEntries.find(entry => entry.kind === "booking" && entry.recordId === payment.bookingId);
              return <tr key={payment.id}>
                <td>{dateLabel(dateKey(payment.created))}</td>
                <td>{payment.label}{payment.id !== payment.bookingId && <small>{payment.id}</small>}</td>
                <td>
                  {booking && !trash?.permanentlyDeletedAt
                    ? <button type="button" className={styles.customerButton} onClick={() => onOpenBooking(booking)}>{booking.name}</button>
                    : booking?.name}
                  <small>{payment.bookingId}</small>
                  {trash && <small>{trash.permanentlyDeletedAt ? "Removed from Bookings" : "In Bookings Trash"}</small>}
                </td>
                <td>{money(payment.amount)}</td>
              </tr>;
            })}</tbody>
          </table></div>}
      </section>
      <section className={css.panel}>
        <div className={css.panelHeader}><h2>Recorded expenses</h2></div>
        {expenseState?.error ? <p className={styles.empty} role="alert">{expenseState.error}</p>
          : !expensesInPeriod ? <p className={styles.empty} role="status">Loading expenses…</p>
          : expensesInPeriod.length === 0 ? <p className={styles.empty}>No recorded expenses in this period.</p>
          : <div className={styles.tableScroll}><table className={css.ledger}>
            <thead><tr><th>Expense date</th><th>Description</th><th>Category</th><th>Amount</th></tr></thead>
            <tbody>{expensesInPeriod.map(expense => <tr key={expense.id}><td>{dateLabel(expense.date)}</td>
              <td>{expense.description}</td><td>{expense.category}</td><td>{money(expense.amountCents)}</td></tr>)}</tbody>
          </table></div>}
      </section>
      {notice && <p className={css.notice} role="status">{notice}</p>}
      <dialog ref={dialog} className={styles.dialog} aria-labelledby="finance-expense-title"
        onCancel={event => { if (saving) event.preventDefault(); }}>
        <div className={styles.dialogHeader}>
          <h2 id="finance-expense-title">Add expense</h2>
          <button type="button" disabled={saving} aria-label="Close expense form" onClick={() => dialog.current?.close()}><X size={20}/></button>
        </div>
        <form onSubmit={addExpense}>
          <div className={styles.dialogBody}>
            <div className={styles.formGrid}>
              <label>Description<input required maxLength={160} value={draft.description} onChange={event => setDraft({ ...draft, description: event.target.value })}/></label>
              <label>Category<input required maxLength={60} value={draft.category} onChange={event => setDraft({ ...draft, category: event.target.value })}/></label>
              <label>Amount (USD)<input required type="number" min="0.01" max="999999999.99" step="0.01" value={draft.amount} onChange={event => setDraft({ ...draft, amount: event.target.value })}/></label>
              <label>Expense date<input required type="date" max={today()} value={draft.date} onChange={event => setDraft({ ...draft, date: event.target.value })}/></label>
            </div>
            {saveError && <p className={styles.error} role="alert">{saveError}</p>}
          </div>
          <div className={styles.dialogActions}>
            <button type="button" className={styles.secondary} disabled={saving} onClick={() => dialog.current?.close()}>Cancel</button>
            <button type="submit" className={styles.primary} disabled={saving}>{saving ? "Saving…" : "Save expense"}</button>
          </div>
        </form>
      </dialog>
    </>}
  </div>;
}
