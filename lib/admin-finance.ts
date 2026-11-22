import type Stripe from "stripe";
import type { AdminBooking } from "./admin-demo-data";

export type FinanceExpense = {
  id: string;
  description: string;
  category: string;
  amountCents: number;
  date: string;
};

// Existing Zelle orders for this customer were confirmed during testing.
const zelleTestCutoff = Date.parse("2026-11-22T20:58:14Z");

export function confirmedZellePayments(bookings: readonly AdminBooking[]) {
  const payments = new Map<string, { id: string; bookingId: string; created: number; label: string; amount: number }>();
  for (const booking of bookings) {
    const order = booking.zelleOrder;
    if (booking.testMode || order?.status !== "confirmed") continue;
    const customerName = (order.customerName ?? booking.name ?? "")
      .normalize("NFD").replace(/\p{M}/gu, "").trim().replace(/\s+/g, " ").toLowerCase();
    const createdAt = Date.parse(order.createdAtIso ?? booking.createdAtIso ?? "");
    if (customerName === "ruchan genc" && !(createdAt >= zelleTestCutoff)) continue;
    const initial = order.amountDueCents ?? (order.paymentType === "full" ? order.knownTotalCents : order.depositCents);
    const add = (id: string, date: string | undefined, amount: number, label: string) => {
      const created = Date.parse(date ?? "") / 1000;
      if (Number.isFinite(created) && Number.isSafeInteger(amount) && amount > 0) {
        payments.set(id, { id, bookingId: order.id, created, amount, label });
      }
    };
    add(order.id, order.reviewedAtIso, initial, order.paymentType === "full" ? "Zelle payment" : "Zelle deposit");
    for (const payment of order.paymentHistory ?? []) {
      if (payment.method === "Zelle") {
        add(payment.reference, payment.paidAtIso, payment.amountCents, "Zelle balance payment");
      }
    }
    const balance = booking.balancePayment;
    if (balance?.source === "zelle" && balance.status === "paid" && !payments.has(balance.id)) {
      add(balance.id, balance.paidAtIso, balance.amountCents, "Zelle balance payment");
    }
  }
  return [...payments.values()].sort((a, b) => b.created - a.created);
}

export const financePeriods = [
  { days: 30, label: "Last 30 days" },
  { days: 90, label: "Last 90 days" },
  { days: 183, label: "Last 183 days" },
  { days: 365, label: "Last 365 days" },
] as const;

export function financeRange(days: number, now = Date.now()) {
  const end = Math.ceil(now / 1000);
  const start = (Math.floor(now / 86_400_000) - days + 1) * 86_400;
  return { start, end };
}

const categoryLabels = {
  charge: "Payment",
  partial_capture_reversal: "Capture reversal",
  refund: "Refund",
  refund_failure: "Failed refund reversal",
  dispute: "Dispute",
  dispute_reversal: "Dispute reversal",
  fee: "Stripe fee",
  payout: "Payout",
  payout_reversal: "Payout reversal",
} as const;

type Activity = {
  id: string;
  created: number;
  label: string;
  amount: number;
  fee: number;
  net: number;
};

type StripeDay = { payments: number; net: number };

type CurrencyReport = {
  currency: string;
  payments: number;
  paymentCount: number;
  refunds: number;
  disputes: number;
  fees: number;
  netPayments: number;
  payouts: number;
  count: number;
  recent: Activity[];
  daily: Record<number, StripeDay>;
};

export type FinanceReport = {
  start: number;
  end: number;
  currencies: CurrencyReport[];
};

type BalanceEntry = Pick<Stripe.BalanceTransaction,
  "id" | "created" | "currency" | "reporting_category" | "amount" | "fee" | "net">;

export async function summarizeStripeActivity(entries: AsyncIterable<BalanceEntry>) {
  const reports = new Map<string, CurrencyReport>();
  for await (const entry of entries) {
    const category = entry.reporting_category as keyof typeof categoryLabels;
    if (!Object.hasOwn(categoryLabels, category)) continue;
    const { currency, amount, fee, net } = entry;
    let report = reports.get(currency);
    if (!report) {
      report = {
        currency, payments: 0, paymentCount: 0, refunds: 0, disputes: 0,
        fees: 0, netPayments: 0, payouts: 0, count: 0, recent: [], daily: {},
      };
      reports.set(currency, report);
    }

    if (category === "charge") report.paymentCount++;
    switch (category) {
      case "charge":
      case "partial_capture_reversal":
        report.payments += amount;
        break;
      case "refund":
      case "refund_failure":
        report.refunds -= amount;
        break;
      case "dispute":
      case "dispute_reversal":
        report.disputes -= amount;
        break;
      case "payout":
      case "payout_reversal":
        report.payouts -= amount;
        break;
    }

    if (category !== "payout" && category !== "payout_reversal") {
      report.fees += category === "fee" ? -net : fee;
      report.netPayments += net;
      const day = Math.floor(entry.created / 86_400) * 86_400;
      const daily = report.daily[day] ??= { payments: 0, net: 0 };
      if (category === "charge" || category === "partial_capture_reversal") daily.payments += amount;
      daily.net += net;
    }
    report.count++;
    // Stripe lists newest transactions first.
    if (report.recent.length < 50) {
      report.recent.push({ id: entry.id, created: entry.created, label: categoryLabels[category], amount, fee, net });
    }
  }
  return [...reports.values()].sort((a, b) => a.currency.localeCompare(b.currency));
}

export function financeTrend(
  range: { start: number; end: number },
  stripe: Record<number, StripeDay>,
  zelle: readonly { created: number; amount: number }[],
  expenses: readonly FinanceExpense[],
) {
  const interval = Math.ceil((range.end - range.start) / (6 * 86_400)) * 86_400;
  const series: { start: number; end: number; turnover: number; profit: number }[] = [];
  for (let start = range.start; start < range.end; start += interval) {
    series.push({ start, end: Math.min(start + interval, range.end), turnover: 0, profit: 0 });
  }
  const getBucket = (timestamp: number) => timestamp >= range.start && timestamp < range.end
    ? series[Math.floor((timestamp - range.start) / interval)]
    : undefined;

  for (const [timestamp, totals] of Object.entries(stripe)) {
    const bucket = getBucket(Number(timestamp));
    if (!bucket) continue;
    bucket.turnover += totals.payments;
    bucket.profit += totals.net;
  }
  for (const payment of zelle) {
    const bucket = getBucket(payment.created);
    if (!bucket) continue;
    bucket.turnover += payment.amount;
    bucket.profit += payment.amount;
  }
  for (const expense of expenses) {
    const bucket = getBucket(Date.parse(expense.date) / 1000);
    if (bucket) bucket.profit -= expense.amountCents;
  }
  return series;
}

export function estimateProfitTax(profit: number, ratePercent: number) {
  return Math.round(Math.max(0, profit) * ratePercent / 100);
}
