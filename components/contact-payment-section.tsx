"use client";

import { useEffect, useMemo, useState } from "react";

import { useCart } from "@/components/cart-context";
import { whatsAppUrlWithText } from "@/lib/whatsapp";
import {
  formatCartAddonsForMessage,
  formatCartLinesForMessage,
} from "@/lib/cart-types";
import type { CartCategory } from "@/lib/cart-types";
import { cn } from "@/lib/utils";

const DEPOSIT_PERCENT = 30;

const SERVICE_OPTIONS = [
  { value: "", label: "Select a category" },
  { value: "exotic-car", label: "Exotic car rental" },
  { value: "yacht", label: "Yacht charter" },
  { value: "private-jet", label: "Private aviation" },
  { value: "fishing", label: "Fishing charter" },
  { value: "jetski", label: "Jet ski session" },
  { value: "jetcar", label: "Jetcar session" },
  { value: "kayak", label: "Kayak rental" },
  { value: "paddleboard", label: "Paddle board (SUP)" },
  { value: "parasailing", label: "Parasailing" },
  { value: "security-unarmed", label: "Security (unarmed)" },
  { value: "security-armed", label: "Security (armed)" },
  { value: "chauffeur", label: "Chauffeur / transport" },
  { value: "package", label: "Custom package" },
  { value: "other", label: "Other" },
] as const;

function formatUsd(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

const CATEGORY_TO_SERVICE: Partial<Record<CartCategory, string>> = {
  "exotic-car": "exotic-car",
  yacht: "yacht",
  "private-jet": "private-jet",
  fishing: "fishing",
  jetski: "jetski",
  jetcar: "jetcar",
  kayak: "kayak",
  paddleboard: "paddleboard",
  parasailing: "parasailing",
  "security-armed": "security-armed",
  "security-unarmed": "security-unarmed",
  other: "other",
};

export function ContactPaymentSection() {
  const { items, addons } = useCart();
  const [paymentType, setPaymentType] = useState<"full" | "deposit">("deposit");
  const [serviceCategory, setServiceCategory] = useState("");
  const [quoteTotal, setQuoteTotal] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (items.length === 0) return;
    if (items.length > 1) {
      setServiceCategory("package");
      return;
    }
    setServiceCategory((prev) => {
      if (prev) return prev;
      const mapped = CATEGORY_TO_SERVICE[items[0]!.category];
      return mapped ?? prev;
    });
  }, [items]);

  const parsedTotal = useMemo(() => {
    const n = Number.parseFloat(quoteTotal.replace(/,/g, ""));
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [quoteTotal]);

  const payToday = useMemo(() => {
    if (parsedTotal === null) return null;
    if (paymentType === "full") return parsedTotal;
    return Math.round(parsedTotal * (DEPOSIT_PERCENT / 100) * 100) / 100;
  }, [parsedTotal, paymentType]);

  const summaryText = useMemo(() => {
    const cartBlock =
      items.length > 0
        ? `Requested from site:\n${formatCartLinesForMessage(items)}\n`
        : "";
    const addonsBlock =
      items.length > 0
        ? `Add-ons:\n${formatCartAddonsForMessage(addons)}\n`
        : "";
    const lines = [
      "Hi Blackline — I'd like to proceed with payment details:",
      "",
      cartBlock,
      addonsBlock,
      `Payment preference: ${paymentType === "full" ? "Full payment" : `Deposit (${DEPOSIT_PERCENT}%)`}`,
      serviceCategory
        ? `Service: ${SERVICE_OPTIONS.find((o) => o.value === serviceCategory)?.label ?? serviceCategory}`
        : "Service: (not specified)",
      parsedTotal !== null
        ? `Quoted total: ${formatUsd(parsedTotal)}`
        : "Quoted total: (please confirm)",
      payToday !== null ? `Amount to charge today: ${formatUsd(payToday)}` : "",
      name.trim() ? `Name: ${name.trim()}` : "",
      email.trim() ? `Email: ${email.trim()}` : "",
      notes.trim() ? `Notes: ${notes.trim()}` : "",
      "",
      "(Online checkout — Stripe — will be confirmed on your side; sending this so you have the numbers.)",
    ];
    return lines.filter(Boolean).join("\n");
  }, [
    items,
    addons,
    paymentType,
    serviceCategory,
    parsedTotal,
    payToday,
    name,
    email,
    notes,
  ]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const canContinue =
    parsedTotal !== null &&
    parsedTotal >= 50 &&
    (serviceCategory !== "" || items.length > 0);

  return (
    <>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-xl text-center lg:mx-0 lg:max-w-2xl lg:text-left">
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.5em] text-gold/90">
            Reserve &amp; pay
          </p>
          <div className="mx-auto mt-4 h-px w-14 bg-gold/30 lg:mx-0" aria-hidden />
          <h2 className="mt-5 font-serif text-2xl tracking-tight text-cream sm:text-3xl">
            Full payment or deposit
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-cream/58">
            Choose how you&apos;d like to pay online once your quote is confirmed.
            Secure checkout will run through Stripe — we&apos;re wiring that up
            next. For now you can review your numbers here and send them to the
            team in one tap.
          </p>
        </div>

        <div className="relative mt-10 border border-gold/12 bg-[#0a0a0a]/90 p-6 shadow-[inset_0_1px_0_0_rgba(198,164,108,0.06),0_24px_64px_-24px_rgba(0,0,0,0.65)] sm:p-10">
          <div
            className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-gold/35 to-transparent sm:inset-x-10"
            aria-hidden
          />

          <div className="grid gap-8 lg:grid-cols-[1fr_minmax(0,240px)] lg:gap-10">
            <div className="space-y-6">
              {items.length > 0 ? (
                <div className="border border-gold/18 bg-[#080808] p-4 sm:p-5">
                  <p className="text-[0.62rem] font-medium uppercase tracking-[0.38em] text-gold/75">
                    Your selection
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-[0.8125rem] leading-relaxed text-cream/72">
                    {formatCartLinesForMessage(items)}
                  </p>
                  <p className="mt-3 text-[0.68rem] leading-relaxed text-cream/42">
                    Manage items from the bag icon in the header, or add more from
                    fleet pages before you pay.
                  </p>
                </div>
              ) : null}
              <fieldset>
                <legend className="text-[0.62rem] font-medium uppercase tracking-[0.38em] text-gold/75">
                  Payment type
                </legend>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setPaymentType("deposit")}
                    className={cn(
                      "border px-4 py-3 text-left transition-colors duration-200",
                      paymentType === "deposit"
                        ? "border-gold/50 bg-gold/10"
                        : "border-gold/15 bg-transparent hover:border-gold/28",
                    )}
                  >
                    <span className="block font-serif text-[0.95rem] text-cream">
                      Deposit ({DEPOSIT_PERCENT}%)
                    </span>
                    <span className="mt-1 block text-[0.75rem] leading-relaxed text-cream/48">
                      Hold the booking with a partial payment today.
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentType("full")}
                    className={cn(
                      "border px-4 py-3 text-left transition-colors duration-200",
                      paymentType === "full"
                        ? "border-gold/50 bg-gold/10"
                        : "border-gold/15 bg-transparent hover:border-gold/28",
                    )}
                  >
                    <span className="block font-serif text-[0.95rem] text-cream">
                      Full payment
                    </span>
                    <span className="mt-1 block text-[0.75rem] leading-relaxed text-cream/48">
                      Pay the full quoted amount in one transaction.
                    </span>
                  </button>
                </div>
              </fieldset>

              <div>
                <label
                  htmlFor="pay-service"
                  className="text-[0.62rem] font-medium uppercase tracking-[0.38em] text-gold/75"
                >
                  Service
                </label>
                <select
                  id="pay-service"
                  value={serviceCategory}
                  onChange={(e) => setServiceCategory(e.target.value)}
                  className="mt-2 w-full border border-gold/15 bg-[#0b0b0b] px-3 py-2.5 text-sm text-cream outline-none transition-colors focus:border-gold/40"
                >
                  {SERVICE_OPTIONS.map((opt) => (
                    <option key={opt.value || "empty"} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="pay-total"
                  className="text-[0.62rem] font-medium uppercase tracking-[0.38em] text-gold/75"
                >
                  Quoted total (USD)
                </label>
                <input
                  id="pay-total"
                  type="text"
                  inputMode="decimal"
                  placeholder="e.g. 4500"
                  value={quoteTotal}
                  onChange={(e) => setQuoteTotal(e.target.value)}
                  className="mt-2 w-full border border-gold/15 bg-[#0b0b0b] px-3 py-2.5 text-sm text-cream outline-none transition-colors placeholder:text-cream/30 focus:border-gold/40"
                />
                <p className="mt-1.5 text-[0.72rem] text-cream/42">
                  Use the total from your quote. Minimum for online checkout will
                  be $50 once Stripe is live.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="pay-name"
                    className="text-[0.62rem] font-medium uppercase tracking-[0.38em] text-gold/75"
                  >
                    Name (optional)
                  </label>
                  <input
                    id="pay-name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-2 w-full border border-gold/15 bg-[#0b0b0b] px-3 py-2.5 text-sm text-cream outline-none transition-colors focus:border-gold/40"
                  />
                </div>
                <div>
                  <label
                    htmlFor="pay-email"
                    className="text-[0.62rem] font-medium uppercase tracking-[0.38em] text-gold/75"
                  >
                    Email (optional)
                  </label>
                  <input
                    id="pay-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-2 w-full border border-gold/15 bg-[#0b0b0b] px-3 py-2.5 text-sm text-cream outline-none transition-colors focus:border-gold/40"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="pay-notes"
                  className="text-[0.62rem] font-medium uppercase tracking-[0.38em] text-gold/75"
                >
                  Reference (optional)
                </label>
                <textarea
                  id="pay-notes"
                  rows={3}
                  placeholder="Dates, vehicle name, yacht, etc."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-2 w-full resize-y border border-gold/15 bg-[#0b0b0b] px-3 py-2.5 text-sm text-cream outline-none transition-colors placeholder:text-cream/30 focus:border-gold/40"
                />
              </div>
            </div>

            <aside className="flex flex-col justify-between border border-gold/12 bg-[#080808] p-5 sm:p-6">
              <div>
                <p className="text-[0.62rem] font-medium uppercase tracking-[0.38em] text-gold/75">
                  Today&apos;s charge
                </p>
                <p className="mt-3 font-serif text-2xl tracking-tight text-cream sm:text-[1.75rem]">
                  {payToday !== null ? formatUsd(payToday) : "—"}
                </p>
                {parsedTotal !== null && paymentType === "deposit" ? (
                  <p className="mt-2 text-[0.75rem] leading-relaxed text-cream/45">
                    {DEPOSIT_PERCENT}% of {formatUsd(parsedTotal)}. Remainder per
                    your quote.
                  </p>
                ) : parsedTotal !== null && paymentType === "full" ? (
                  <p className="mt-2 text-[0.75rem] leading-relaxed text-cream/45">
                    Full quoted amount.
                  </p>
                ) : (
                  <p className="mt-2 text-[0.75rem] leading-relaxed text-cream/45">
                    Enter a quoted total and pick a service to see the amount.
                  </p>
                )}
              </div>
              <div className="mt-8 space-y-3 lg:mt-10">
                <button
                  type="button"
                  disabled={!canContinue}
                  onClick={() => setModalOpen(true)}
                  className={cn(
                    "inline-flex min-h-12 w-full items-center justify-center border px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.18em] transition-all duration-300 ease-out",
                    canContinue
                      ? "border-gold/40 bg-gold text-[#0b0b0b] hover:-translate-y-0.5 hover:border-gold-secondary hover:bg-gold-secondary hover:shadow-[0_0_0_1px_rgba(224,195,138,0.4),0_14px_48px_rgba(198,164,108,0.2)] active:translate-y-0"
                      : "cursor-not-allowed border-gold/15 bg-gold/10 text-cream/35",
                  )}
                >
                  Continue to secure payment
                </button>
                <p className="text-center text-[0.65rem] leading-relaxed text-cream/38 lg:text-left">
                  Stripe checkout will plug in here. Until then, the next step
                  shares this summary with the team.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {modalOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-[#0b0b0b]/85 p-4 sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pay-modal-title"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="max-h-[min(90vh,640px)] w-full max-w-lg overflow-y-auto border border-gold/15 bg-[#101010] p-6 shadow-[0_24px_80px_-20px_rgba(0,0,0,0.85)] sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              id="pay-modal-title"
              className="font-serif text-xl tracking-tight text-cream sm:text-2xl"
            >
              Almost there
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-cream/58">
              Secure card payment will open in a Stripe checkout window once
              we&apos;ve connected your account. You can still send this summary
              to Blackline on WhatsApp so nothing waits on tech.
            </p>
            <div className="mt-5 rounded-sm border border-gold/12 bg-[#0a0a0a] p-4">
              <pre className="max-h-40 overflow-y-auto whitespace-pre-wrap font-sans text-[0.72rem] leading-relaxed text-cream/65">
                {summaryText}
              </pre>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href={whatsAppUrlWithText(summaryText)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 flex-1 items-center justify-center border border-gold/40 bg-gold px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-[0.16em] text-[#0b0b0b] transition-all hover:bg-gold-secondary"
              >
                Send via WhatsApp
              </a>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex min-h-11 flex-1 items-center justify-center border border-gold/25 bg-transparent px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-cream transition-colors hover:border-gold/45 hover:text-gold-secondary"
              >
                {copied ? "Copied" : "Copy summary"}
              </button>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="inline-flex min-h-11 w-full items-center justify-center border border-gold/15 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-cream/75 transition-colors hover:border-gold/30 sm:w-auto sm:flex-none"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
