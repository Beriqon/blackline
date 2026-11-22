import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const source = ts.transpileModule(readFileSync(new URL("../lib/admin-finance.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const finance = {};
vm.runInNewContext(source, { exports: finance });

test("Stripe totals reconcile refunds, reversals, fees and payouts by settlement currency", async () => {
  const rows = [
    ["charge", 10000, 300],
    ["refund", -2000, 0],
    ["refund_failure", 500, 0],
    ["dispute", -1000, 150],
    ["dispute_reversal", 1000, -150],
    ["fee", -100, 0],
    ["payout", -7500, 0],
    ["payout_reversal", 500, 0],
    ["topup", 1000, 0],
    ["charge", 700, 40, "eur"],
  ].map(([reporting_category, amount, fee, currency = "usd"], i) => ({
    id: String(i), created: 100 - i, reporting_category, amount, fee, net: amount - fee, currency,
  }));
  const [eur, usd] = await finance.summarizeStripeActivity(rows);
  assert.equal(eur.netPayments, 660);
  assert.equal(usd.payments, 10000);
  assert.equal(usd.refunds, 1500);
  assert.equal(usd.disputes, 0);
  assert.equal(usd.fees, 400);
  assert.equal(usd.netPayments, 8100);
  assert.equal(usd.payouts, 7000);
  assert.equal(usd.count, 8);
  assert.equal(usd.daily[0].payments, usd.payments);
  assert.equal(usd.daily[0].net, usd.netPayments);
});

test("the trend reconciles turnover and profit across date boundaries and estimates tax on positive profit", () => {
  const start = Date.parse("2026-11-01") / 1000;
  const later = start + 5 * 86_400;
  const end = start + 6 * 86_400;
  const trend = finance.financeTrend({ start, end }, { [start]: { payments: 10000, net: 8700 } },
    [{ created: later, amount: 5000 }, { created: end, amount: 10000 }],
    [{ date: "2026-11-06", amountCents: 7000 }]);
  assert.equal(trend[0].turnover, 10000);
  assert.equal(trend[0].profit, 8700);
  assert.equal(trend[5].turnover, 5000);
  assert.equal(trend[5].profit, -2000);
  assert.equal(finance.estimateProfitTax(6700, 25), 1675);
  assert.equal(finance.estimateProfitTax(-2000, 25), 0);
});

test("Zelle reports the original verified payment and deduplicates paid balances", () => {
  const reviewedAtIso = "2026-11-02T12:00:00Z";
  const paidAtIso = "2026-11-04T12:00:00Z";
  const order = {
    id: "confirmed", status: "confirmed", depositCents: 2500, amountPaidCents: 10000,
    reviewedAtIso, paymentHistory: [{ reference: "balance", method: "Zelle", amountCents: 7500, paidAtIso }],
  };
  const payments = finance.confirmedZellePayments([
    { zelleOrder: order, balancePayment: { id: "balance", source: "zelle", status: "paid", amountCents: 7500, paidAtIso } },
    { zelleOrder: { ...order, id: "submitted", status: "payment_submitted" } },
    { zelleOrder: { ...order, id: "test" }, testMode: true },
    { zelleOrder: { id: "full", status: "confirmed", paymentType: "full", knownTotalCents: 12000, reviewedAtIso } },
  ]);
  assert.equal(payments.length, 3);
  assert.equal(payments[0].amount, 7500);
  assert.equal(payments[0].bookingId, "confirmed");
  assert.equal(payments.find(row => row.id === "confirmed").amount, 2500);
  assert.equal(payments.find(row => row.id === "full").amount, 12000);
});

test("historical Ruchan Genc test orders stay excluded even if a balance is confirmed later", () => {
  const confirmed = {
    status: "confirmed",
    depositCents: 912500,
    reviewedAtIso: "2026-11-23T12:00:00Z",
  };
  const payments = finance.confirmedZellePayments([
    { zelleOrder: { ...confirmed, id: "historical-test", customerName: "Ruchan Genç", createdAtIso: "2026-11-21T12:00:00Z" },
      balancePayment: { id: "later-balance", source: "zelle", status: "paid", amountCents: 10000, paidAtIso: confirmed.reviewedAtIso } },
    { zelleOrder: { ...confirmed, id: "new-order", customerName: "Ruchan Genc", createdAtIso: "2026-11-23T10:00:00Z" } },
    { zelleOrder: { ...confirmed, id: "other-customer", customerName: "Other Customer", createdAtIso: "2026-11-21T12:00:00Z" } },
  ]);
  assert.equal(payments.length, 2);
  assert.ok(payments.some(payment => payment.bookingId === "new-order"));
  assert.ok(payments.some(payment => payment.bookingId === "other-customer"));
});
