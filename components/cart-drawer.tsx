"use client";

import Link from "next/link";
import { Loader2, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { useCart } from "@/components/cart-context";
import type { CartCategory } from "@/lib/cart-types";
import {
  formatCartAddonsForMessage,
  formatCartLinesForMessage,
  isSingleUnitInventory,
} from "@/lib/cart-types";
import { cn } from "@/lib/utils";
import { whatsAppUrlWithText } from "@/lib/whatsapp";
import { SECURITY_GUARD_RATE_CARDS } from "@/lib/security-guards-data";
import { computeSecurityGuardsAddonTotalUsd } from "@/lib/security-guards-pricing";

const DEPOSIT_PCT = 30;
const MIN_CHARGE_USD = 50;

const armedRateCard = SECURITY_GUARD_RATE_CARDS.find((c) => c.id === "armed")!;
const unarmedRateCard = SECURITY_GUARD_RATE_CARDS.find(
  (c) => c.id === "unarmed",
)!;

const PHONE_COUNTRY_CODES = [
  { code: "+1", label: "United States / Canada (+1)" },
  { code: "+31", label: "Netherlands (+31)" },
  { code: "+44", label: "United Kingdom (+44)" },
  { code: "+32", label: "Belgium (+32)" },
  { code: "+33", label: "France (+33)" },
  { code: "+49", label: "Germany (+49)" },
  { code: "+34", label: "Spain (+34)" },
  { code: "+39", label: "Italy (+39)" },
  { code: "+41", label: "Switzerland (+41)" },
  { code: "+43", label: "Austria (+43)" },
  { code: "+45", label: "Denmark (+45)" },
  { code: "+46", label: "Sweden (+46)" },
  { code: "+47", label: "Norway (+47)" },
  { code: "+353", label: "Ireland (+353)" },
  { code: "+351", label: "Portugal (+351)" },
  { code: "+48", label: "Poland (+48)" },
  { code: "+30", label: "Greece (+30)" },
  { code: "+90", label: "Turkey (+90)" },
  { code: "+971", label: "United Arab Emirates (+971)" },
  { code: "+966", label: "Saudi Arabia (+966)" },
  { code: "+974", label: "Qatar (+974)" },
  { code: "+965", label: "Kuwait (+965)" },
  { code: "+20", label: "Egypt (+20)" },
  { code: "+27", label: "South Africa (+27)" },
  { code: "+91", label: "India (+91)" },
  { code: "+92", label: "Pakistan (+92)" },
  { code: "+81", label: "Japan (+81)" },
  { code: "+82", label: "South Korea (+82)" },
  { code: "+86", label: "China (+86)" },
  { code: "+852", label: "Hong Kong (+852)" },
  { code: "+65", label: "Singapore (+65)" },
  { code: "+60", label: "Malaysia (+60)" },
  { code: "+66", label: "Thailand (+66)" },
  { code: "+62", label: "Indonesia (+62)" },
  { code: "+63", label: "Philippines (+63)" },
  { code: "+61", label: "Australia (+61)" },
  { code: "+64", label: "New Zealand (+64)" },
  { code: "+52", label: "Mexico (+52)" },
  { code: "+55", label: "Brazil (+55)" },
  { code: "+54", label: "Argentina (+54)" },
  { code: "+57", label: "Colombia (+57)" },
  { code: "+56", label: "Chile (+56)" },
  { code: "+58", label: "Venezuela (+58)" },
] as const;

function formatUsdNoCents(n: number): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function CartDrawer() {
  const {
    items,
    addons,
    patchAddons,
    open,
    setOpen,
    removeItem,
    decrementItem,
    addItem,
    clear,
  } = useCart();

  const [payMode, setPayMode] = useState<"full" | "deposit">("deposit");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhoneCountryCode, setCustomerPhoneCountryCode] = useState("+1");
  const [customerPhone, setCustomerPhone] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [quoteRequestLoading, setQuoteRequestLoading] = useState(false);

  const unsupportedItems = useMemo(
    () =>
      items.filter(
        (item) =>
          (item.category === "exotic-car" || item.category === "yacht") &&
          (!item.bookingSelection || !item.bookingQuote?.payableOnline),
      ),
    [items],
  );

  const nonBookableItems = useMemo(
    () =>
      items.filter(
        (item) => item.category !== "exotic-car" && item.category !== "yacht",
      ),
    [items],
  );

  const checkoutEligibleItems = useMemo(
    () =>
      items.filter(
        (item) =>
          (item.category === "exotic-car" || item.category === "yacht") &&
          item.bookingSelection &&
          item.bookingQuote?.payableOnline,
      ),
    [items],
  );

  const hasSecurityItems = useMemo(
    () =>
      items.some(
        (item) =>
          item.category === "security-armed" ||
          item.category === "security-unarmed",
      ),
    [items],
  );

  // When the user already selected security guards as line items, we hide
  // the "security guard add-on" toggles to avoid duplicate/confusing options.
  const addonsForRequest = useMemo(
    () =>
      hasSecurityItems
        ? { ...addons, securityArmed: false, securityUnarmed: false }
        : addons,
    [addons, hasSecurityItems],
  );

  const checkoutBaseTotal = useMemo(
    () =>
      checkoutEligibleItems.reduce(
        (sum, item) => sum + (item.bookingQuote?.totalUsd ?? 0),
        0,
      ),
    [checkoutEligibleItems],
  );

  const addonsTotalUsd = useMemo(
    () => computeSecurityGuardsAddonTotalUsd(addonsForRequest),
    [addonsForRequest],
  );

  const checkoutTotal = useMemo(
    () => checkoutBaseTotal + addonsTotalUsd,
    [checkoutBaseTotal, addonsTotalUsd],
  );

  const chargeToday = useMemo(() => {
    if (checkoutTotal <= 0) return null;
    if (payMode === "full") return Math.round(checkoutTotal * 100) / 100;
    return Math.round(checkoutTotal * (DEPOSIT_PCT / 100) * 100) / 100;
  }, [checkoutTotal, payMode]);

  const customerPhoneFull = useMemo(() => {
    const phone = customerPhone.trim();
    if (!phone) return "";
    return `${customerPhoneCountryCode} ${phone}`;
  }, [customerPhone, customerPhoneCountryCode]);

  const hasContactDetails =
    customerName.trim().length > 0 &&
    customerEmail.trim().length > 0 &&
    customerPhoneFull.length > 0;

  const canPay =
    checkoutEligibleItems.length > 0 &&
    checkoutEligibleItems.length === items.length &&
    hasContactDetails &&
    chargeToday !== null &&
    chargeToday >= MIN_CHARGE_USD;

  const needsQuoteWhatsApp =
    unsupportedItems.length > 0 || nonBookableItems.length > 0;

  const startCheckout = useCallback(async () => {
    if (!canPay) {
      setCheckoutError(
        hasContactDetails
          ? "Only fully configured yacht and car bookings with published online rates can be paid here."
          : "Enter your name, email, and phone number before checkout.",
      );
      return;
    }
    setCheckoutError(null);
    setCheckoutLoading(true);
    try {
      const body = {
        paymentType: payMode,
        items: checkoutEligibleItems,
        addons: addonsForRequest,
        customerName,
        customerEmail,
        customerPhone: customerPhoneFull,
      };
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) {
        setCheckoutError(data.error ?? "Checkout failed.");
        return;
      }
      if (data.url) window.location.href = data.url;
      else setCheckoutError("No redirect URL returned.");
    } catch {
      setCheckoutError("Network error. Try again.");
    } finally {
      setCheckoutLoading(false);
    }
  }, [
    addonsForRequest,
    canPay,
    checkoutEligibleItems,
    customerEmail,
    customerName,
    customerPhoneFull,
    hasContactDetails,
    payMode,
  ]);

  const startQuoteWhatsApp = useCallback(async () => {
    if (items.length === 0) return;
    if (!hasContactDetails) {
      setCheckoutError("Enter your name, email, and phone number first.");
      return;
    }

    const message = [
      "Hi Blackline - I'd like a quote on these options:",
      "",
      `Requested from site:\n${formatCartLinesForMessage(items)}`,
      items.length > 0
        ? `Add-ons:\n${formatCartAddonsForMessage(addonsForRequest)}`
        : "",
      customerName.trim() ? `Name: ${customerName.trim()}` : "",
      customerEmail.trim() ? `Email: ${customerEmail.trim()}` : "",
      customerPhoneFull ? `Phone: ${customerPhoneFull}` : "",
      payMode === "full"
        ? "Pay preference: Full payment"
        : `Pay preference: Deposit (${DEPOSIT_PCT}%)`,
      "",
      "Please confirm availability and next steps. Thanks!",
    ]
      .filter(Boolean)
      .join("\n");

    const href = whatsAppUrlWithText(message);

    setQuoteRequestLoading(true);
    setCheckoutError(null);
    try {
      await fetch("/api/quote-requests/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "whatsapp",
          message,
          summary: "Quote request (selection)",
          customerName,
          customerEmail,
        }),
      });
    } catch {
      setCheckoutError(
        "Could not create a quote request record - opening WhatsApp anyway.",
      );
    } finally {
      setQuoteRequestLoading(false);
      window.open(href, "_blank", "noopener,noreferrer");
      setOpen(false);
    }
  }, [
    addonsForRequest,
    customerEmail,
    customerName,
    customerPhoneFull,
    hasContactDetails,
    items,
    payMode,
    setOpen,
  ]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <button
        type="button"
        className="absolute inset-0 bg-[#0b0b0b]/65 backdrop-blur-[2px]"
        aria-label="Close cart"
        onClick={() => setOpen(false)}
      />
      <aside
        className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-gold/20 bg-[#161616] shadow-[-12px_0_48px_rgba(0,0,0,0.42)]"
        aria-label="Selection cart"
      >
        <div className="flex items-center justify-between border-b border-gold/18 bg-[#1b1b1b] px-4 py-4 sm:px-5">
          <div className="flex items-center gap-2">
            <ShoppingBag className="size-5 text-gold/80" aria-hidden />
            <h2 className="font-serif text-lg tracking-tight text-cream">
              Your selection
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex h-10 w-10 items-center justify-center border border-gold/20 bg-white/[0.03] text-cream/80 transition-colors hover:border-gold/40 hover:bg-gold/10 hover:text-gold-secondary"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="px-4 py-4 sm:px-5">
          {items.length === 0 ? (
            <p className="text-sm leading-relaxed text-cream/65">
              Nothing selected yet. Browse services and tap &quot;Add to
              selection&quot; to build your request.
            </p>
          ) : (
            <ul className="space-y-3" role="list">
              {items.map((line) => (
                <li
                  key={line.key}
                  className="border border-gold/18 bg-[#202020] p-3 sm:p-4"
                >
                  <div className="flex gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-gold/90">
                        {labelForCategory(line.category)}
                      </p>
                      <p className="mt-1 font-serif text-[0.95rem] leading-snug text-cream">
                        {line.title}
                      </p>
                      {line.subtitle ? (
                        <p className="mt-0.5 text-[0.75rem] text-cream/68">
                          {line.subtitle}
                        </p>
                      ) : null}
                      {line.priceHint ? (
                        <p className="mt-1 text-[0.72rem] tabular-nums text-cream/62">
                          {line.priceHint}
                        </p>
                      ) : null}
                      {line.bookingQuote?.description ? (
                        <p className="mt-1 text-[0.72rem] leading-relaxed text-cream/62">
                          {line.bookingQuote.description}
                        </p>
                      ) : null}
                      <Link
                        href={line.href}
                        className="mt-2 inline-block text-[0.68rem] font-medium uppercase tracking-[0.14em] text-gold-secondary underline-offset-4 hover:underline"
                        onClick={() => setOpen(false)}
                      >
                        View listing
                      </Link>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      {isSingleUnitInventory(line.category) ? (
                        <p className="max-w-[7rem] text-right text-[0.62rem] leading-snug text-cream/58">
                          One line item
                        </p>
                      ) : (
                        <div className="flex items-center gap-1 border border-gold/18 bg-[#181818]">
                          <button
                            type="button"
                            className="flex h-8 w-8 items-center justify-center text-cream/80 hover:bg-gold/10 hover:text-gold-secondary"
                            aria-label="Decrease quantity"
                            onClick={() => decrementItem(line.key)}
                          >
                            <Minus className="size-3.5" />
                          </button>
                          <span className="min-w-[1.25rem] text-center text-xs tabular-nums text-cream/90">
                            {line.quantity}
                          </span>
                          <button
                            type="button"
                            className="flex h-8 w-8 items-center justify-center text-cream/80 hover:bg-gold/10 hover:text-gold-secondary"
                            aria-label="Increase quantity"
                            onClick={() =>
                              addItem({
                                category: line.category,
                                id: line.id,
                                title: line.title,
                                subtitle: line.subtitle,
                                priceHint: line.priceHint,
                                href: line.href,
                              })
                            }
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeItem(line.key)}
                        className="text-cream/60 transition-colors hover:text-cream/90"
                        aria-label="Remove"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {items.length > 0 ? (
            <div className="mt-6 border border-gold/18 bg-[#202020] p-4">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.32em] text-gold/90">
                Add-ons (whole request)
              </p>
              <p className="mt-2 text-[0.72rem] leading-relaxed text-cream/62">
                Applies to your itinerary — not tied to only yachts. Final scope
                is confirmed by the team.
              </p>
              {!hasSecurityItems ? (
                <>
                  <label className="mt-4 flex cursor-pointer items-start gap-3 border border-gold/16 bg-[#262626] p-3">
                    <input
                      type="checkbox"
                      className="mt-1 size-4 shrink-0 border-gold/30"
                      checked={addonsForRequest.securityArmed}
                      onChange={(e) =>
                        patchAddons({ securityArmed: e.target.checked })
                      }
                    />
                    <span className="text-[0.8125rem] leading-snug text-cream/88">
                      Security (armed) guard add-on
                      <span className="ml-2 text-[0.65rem] text-cream/62">
                        {`$${armedRateCard.hourlyRateUsd}/hr · ${armedRateCard.minimumHours}h min ($${formatUsdNoCents(armedRateCard.minimumTotalUsd)})`}
                      </span>
                    </span>
                  </label>
                  <label className="mt-3 flex cursor-pointer items-start gap-3 border border-gold/16 bg-[#262626] p-3">
                    <input
                      type="checkbox"
                      className="mt-1 size-4 shrink-0 border-gold/30"
                      checked={addonsForRequest.securityUnarmed}
                      onChange={(e) =>
                        patchAddons({ securityUnarmed: e.target.checked })
                      }
                    />
                    <span className="text-[0.8125rem] leading-snug text-cream/88">
                      Security (unarmed) guard add-on
                      <span className="ml-2 text-[0.65rem] text-cream/62">
                        {`$${unarmedRateCard.hourlyRateUsd}/hr · ${unarmedRateCard.minimumHours}h min ($${formatUsdNoCents(unarmedRateCard.minimumTotalUsd)})`}
                      </span>
                    </span>
                  </label>
                </>
              ) : null}
              <label className="mt-4 flex cursor-pointer items-start gap-3 border border-gold/16 bg-[#262626] p-3">
                <input
                  type="checkbox"
                  className="mt-1 size-4 shrink-0 border-gold/30"
                  checked={addons.femaleHosts}
                  onChange={(e) =>
                    patchAddons({ femaleHosts: e.target.checked })
                  }
                />
                <span className="text-[0.8125rem] leading-snug text-cream/88">
                  Female hostess(es) — hospitality / yacht-style hosting
                </span>
              </label>
              {addons.femaleHosts ? (
                <div className="mt-3 pl-1">
                  <label
                    htmlFor="addon-host-count"
                    className="text-[0.6rem] font-medium uppercase tracking-[0.24em] text-gold/65"
                  >
                    Headcount
                  </label>
                  <input
                    id="addon-host-count"
                    type="number"
                    min={1}
                    max={8}
                    value={addons.femaleHostsCount}
                    onChange={(e) => {
                      const n = Number.parseInt(e.target.value, 10);
                      patchAddons({
                        femaleHostsCount: Number.isFinite(n)
                          ? Math.min(8, Math.max(1, n))
                          : 1,
                      });
                    }}
                    className="mt-1.5 w-full max-w-[6rem] border border-gold/18 bg-[#1b1b1b] px-2 py-1.5 text-sm text-cream"
                  />
                </div>
              ) : null}
              <label className="mt-3 flex cursor-pointer items-start gap-3 border border-gold/16 bg-[#262626] p-3">
                <input
                  type="checkbox"
                  className="mt-1 size-4 shrink-0 border-gold/30"
                  checked={addons.photoshoot}
                  onChange={(e) =>
                    patchAddons({ photoshoot: e.target.checked })
                  }
                />
                <span className="text-[0.8125rem] leading-snug text-cream/88">
                  Photo / video shoot add-on (content session)
                </span>
              </label>
              <p className="mt-3 text-[0.65rem] leading-relaxed text-cream/58">
                Summary: {formatCartAddonsForMessage(addonsForRequest)}
              </p>
            </div>
          ) : null}
        </div>

        <div className="border-t border-gold/18 bg-[#1b1b1b] p-4 sm:p-5">
          {items.length > 0 ? (
            <div className="mb-4 space-y-3">
              <div>
                <p className="text-[0.6rem] font-medium uppercase tracking-[0.24em] text-gold/80">
                  Checkout total
                </p>
                <p className="mt-1.5 font-serif text-xl text-gold-secondary">
                  ${checkoutTotal.toLocaleString("en-US")}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="cart-customer-name"
                    className="text-[0.6rem] font-medium uppercase tracking-[0.24em] text-gold/65"
                  >
                    Name
                  </label>
                  <input
                    id="cart-customer-name"
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="mt-1.5 w-full border border-gold/18 bg-[#262626] px-3 py-2 text-sm text-cream"
                  />
                </div>
                <div>
                  <label
                    htmlFor="cart-customer-email"
                    className="text-[0.6rem] font-medium uppercase tracking-[0.24em] text-gold/65"
                  >
                    Email
                  </label>
                  <input
                    id="cart-customer-email"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="mt-1.5 w-full border border-gold/18 bg-[#262626] px-3 py-2 text-sm text-cream"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label
                    htmlFor="cart-customer-phone"
                    className="text-[0.6rem] font-medium uppercase tracking-[0.24em] text-gold/65"
                  >
                    Phone number
                  </label>
                  <div className="mt-1.5 flex gap-2">
                    <select
                      id="cart-customer-phone-country-code"
                      value={customerPhoneCountryCode}
                      onChange={(e) => setCustomerPhoneCountryCode(e.target.value)}
                      className="w-[48%] border border-gold/18 bg-[#262626] px-3 py-2 text-sm text-cream"
                    >
                      {PHONE_COUNTRY_CODES.map((option) => (
                        <option key={option.code} value={option.code}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <input
                      id="cart-customer-phone"
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="6 12345678"
                      className="w-[52%] border border-gold/18 bg-[#262626] px-3 py-2 text-sm text-cream placeholder:text-cream/35"
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setPayMode("deposit")}
                  className={cn(
                    "border px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.14em] transition-colors",
                    payMode === "deposit"
                      ? "border-gold/45 bg-gold/12 text-cream"
                      : "border-gold/18 bg-white/[0.03] text-cream/72 hover:border-gold/32",
                  )}
                >
                  {DEPOSIT_PCT}% deposit
                </button>
                <button
                  type="button"
                  onClick={() => setPayMode("full")}
                  className={cn(
                    "border px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.14em] transition-colors",
                    payMode === "full"
                      ? "border-gold/45 bg-gold/12 text-cream"
                      : "border-gold/18 bg-white/[0.03] text-cream/72 hover:border-gold/32",
                  )}
                >
                  Pay full amount
                </button>
              </div>
              {chargeToday !== null ? (
                <p className="text-[0.75rem] text-cream/80">
                  Charged today:{" "}
                  <span className="font-semibold text-gold">
                    ${chargeToday.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                  {payMode === "deposit" ? (
                    <span className="text-cream/60">
                      {" "}
                      ({DEPOSIT_PCT}% of $
                      {checkoutTotal.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                      )
                    </span>
                  ) : null}
                </p>
              ) : null}
              {nonBookableItems.length > 0 ? (
                <p className="text-[0.72rem] leading-relaxed text-cream/62">
                  This cart also contains selection-only items that are not wired
                  for online payment yet. Keep those for inquiry, or remove them to
                  pay online for cars/yachts only.
                </p>
              ) : null}
              {unsupportedItems.length > 0 ? (
                <p className="text-[0.72rem] leading-relaxed text-cream/62">
                  Some selected car or yacht bookings still need a custom quote or
                  a complete date/time selection before payment can start.
                </p>
              ) : null}
              {checkoutError ? (
                <p className="text-[0.7rem] text-red-300/90">{checkoutError}</p>
              ) : null}
            </div>
          ) : null}
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => void startCheckout()}
              disabled={!canPay || checkoutLoading}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 border border-gold/40 bg-gold px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#0b0b0b] transition-all hover:bg-gold-secondary disabled:cursor-not-allowed disabled:opacity-40"
            >
              {checkoutLoading ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : null}
              Pay with card
            </button>
            <button
              type="button"
              onClick={() => clear()}
              disabled={items.length === 0}
              className="inline-flex min-h-11 flex-1 items-center justify-center border border-gold/24 bg-white/[0.03] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-cream/88 transition-colors hover:border-gold/40 hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-35"
            >
              Clear all
            </button>
          </div>
          <p className="mt-3 text-[0.65rem] leading-relaxed text-cream/58">
            Secure checkout via Stripe. Cars and yachts with a configured booking
            window now use live pricing and availability. Other services can stay
            in your selection for inquiry. Your selection is saved in this browser
            until you clear it.{" "}
            {needsQuoteWhatsApp ? (
              <button
                type="button"
                disabled={quoteRequestLoading}
                onClick={() => void startQuoteWhatsApp()}
                className="text-gold/70 underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
              >
                {quoteRequestLoading
                  ? "Requesting quote..."
                  : "Request quote on WhatsApp"}
              </button>
            ) : (
              <Link
                href="/contact"
                className="text-gold/70 underline-offset-2 hover:underline"
                onClick={() => setOpen(false)}
              >
                Contact us first
              </Link>
            )}
            .
          </p>
        </div>
      </aside>
    </div>
  );
}

function labelForCategory(c: CartCategory): string {
  switch (c) {
    case "exotic-car":
      return "Exotic car";
    case "yacht":
      return "Yacht";
    case "private-jet":
      return "Private jet";
    case "fishing":
      return "Fishing";
    case "jetski":
      return "Jet ski";
    case "jetcar":
      return "Jetcar";
    case "security-armed":
      return "Security (armed)";
    case "security-unarmed":
      return "Security (unarmed)";
    case "other":
      return "Item";
    default: {
      const _x: never = c;
      return _x;
    }
  }
}
