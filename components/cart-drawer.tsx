"use client";

import Link from "next/link";
import { Loader2, ShoppingBag, Trash2, X, ArrowLeft, ArrowRight, ArrowUpRight, CalendarDays, Check, ChevronRight, LockKeyhole, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";
import { useCallback, useMemo, useState, useEffect, useRef, useContext } from "react";

import { useCart } from "@/components/cart-context";
import { useTranslations } from "@/components/locale-provider";
import type { CartAddonsState, CartCategory, CartLine } from "@/lib/cart-types";
import {
  formatCartLinesForMessage,
} from "@/lib/cart-types";
import type { Translator } from "@/lib/i18n/translate";
import { CONTACT_TRIP_BUILDER_HREF } from "@/lib/contact-hrefs";
import css from "./cart-drawer.module.css";
import {CatalogContext} from "./catalog-provider";
import {cartNeedsQuote,internationalCartPhone} from "@/lib/cart-summary";
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

function formatCartAddonsLocalized(
  addons: CartAddonsState,
  t: Translator,
): string {
  const parts: string[] = [];
  if (addons.femaleHosts) {
    const n = Math.min(8, Math.max(1, Math.floor(addons.femaleHostsCount) || 1));
    parts.push(
      t("cart.addonSummary.femaleHostsYes", {
        n,
        hostLabel:
          n === 1
            ? t("cart.addonSummary.host")
            : t("cart.addonSummary.hosts"),
      }),
    );
  } else {
    parts.push(t("cart.addonSummary.femaleHostsNo"));
  }
  parts.push(
    t("cart.addonSummary.photoshoot", {
      value: addons.photoshoot
        ? t("cart.addonSummary.yes")
        : t("cart.addonSummary.no"),
    }),
  );
  parts.push(
    t("cart.addonSummary.securityArmed", {
      value: addons.securityArmed
        ? t("cart.addonSummary.yes")
        : t("cart.addonSummary.no"),
    }),
  );
  parts.push(
    t("cart.addonSummary.securityUnarmed", {
      value: addons.securityUnarmed
        ? t("cart.addonSummary.yes")
        : t("cart.addonSummary.no"),
    }),
  );
  return parts.join("\n");
}

export function CartDrawer() {
  const t = useTranslations();
  const {
    items,
    addons,
    patchAddons,
    open,
    setOpen,
    removeItem,
  } = useCart();

  const catalog=useContext(CatalogContext);
  const [step,setStep]=useState<"selection"|"details">("selection");
  const dialog=useRef<HTMLDialogElement>(null),scrollArea=useRef<HTMLDivElement>(null),nameInput=useRef<HTMLInputElement>(null);
  useEffect(()=>{
    if(!open)return;
    const previous=document.body.style.overflow;
    document.body.style.overflow="hidden";
    if(dialog.current&&!dialog.current.open)dialog.current.showModal();
    return()=>{document.body.style.overflow=previous;};
  },[open]);
  useEffect(()=>{
    if(!open)return;
    const frame=requestAnimationFrame(()=>{scrollArea.current?.scrollTo({top:0});if(step==="details")nameInput.current?.focus({preventScroll:true});});
    return()=>cancelAnimationFrame(frame);
  },[step,open]);
  const [payMode, setPayMode] = useState<"full" | "deposit">("deposit");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhoneCountryCode, setCustomerPhoneCountryCode] = useState("+1");
  const [customerPhone, setCustomerPhone] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [quoteRequestLoading, setQuoteRequestLoading] = useState(false);

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

  const customerPhoneFull=useMemo(()=>internationalCartPhone(customerPhoneCountryCode,customerPhone),[customerPhone,customerPhoneCountryCode]);

  const hasContactDetails =
    customerName.trim().length > 0 &&
    customerEmail.trim().length > 0 &&
    customerPhoneFull.length > 0;

  const canPay =
    !cartNeedsQuote(items,addonsForRequest) &&
    checkoutEligibleItems.length > 0 &&
    checkoutEligibleItems.length === items.length &&
    hasContactDetails &&
    chargeToday !== null &&
    chargeToday >= MIN_CHARGE_USD;

  const needsQuoteWhatsApp =
    cartNeedsQuote(items,addonsForRequest);

  const startCheckout = useCallback(async () => {
    if (!canPay) {
      setCheckoutError(
        hasContactDetails
          ? t("cart.errors.onlyPayableOnline")
          : t("cart.errors.contactRequiredCheckout"),
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
        setCheckoutError(res.status===503?t("cart.errors.checkoutFailed"):data.error ?? t("cart.errors.checkoutFailed"));
        return;
      }
      if (data.url) window.location.href = data.url;
      else setCheckoutError(t("cart.errors.noRedirect"));
    } catch {
      setCheckoutError(t("cart.errors.networkError"));
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
    t,
  ]);

  const startQuoteWhatsApp = useCallback(async () => {
    if (items.length === 0) return;
    if (!hasContactDetails) {
      setCheckoutError(t("cart.errors.contactRequiredQuote"));
      return;
    }

    const message = [
      t("cart.whatsapp.greeting"),
      "",
      `${t("cart.whatsapp.requestedFromSite")}\n${formatCartLinesForMessage(items)}`,
      items.length > 0
        ? `${t("cart.whatsapp.addonsLabel")}\n${formatCartAddonsLocalized(addonsForRequest, t)}`
        : "",
      customerName.trim()
        ? `${t("cart.whatsapp.nameLabel")} ${customerName.trim()}`
        : "",
      customerEmail.trim()
        ? `${t("cart.whatsapp.emailLabel")} ${customerEmail.trim()}`
        : "",
      customerPhoneFull
        ? `${t("cart.whatsapp.phoneLabel")} ${customerPhoneFull}`
        : "",
      "",
      t("cart.whatsapp.closing"),
    ]
      .filter(Boolean)
      .join("\n");

    const href = whatsAppUrlWithText(message);

    setQuoteRequestLoading(true);
    setCheckoutError(null);
    try {
      const response=await fetch("/api/quote-requests/create", {
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
      if(!response.ok)throw new Error("Quote request failed");
      setOpen(false);
      setStep("selection");
      window.location.assign(href);
    } catch {
      setCheckoutError(t("cart.ux.quoteFailed"));
    } finally {
      setQuoteRequestLoading(false);

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
    t,
  ]);

  const busy=checkoutLoading||quoteRequestLoading;
  const selectedExtras=Number(addonsForRequest.securityArmed)+Number(addonsForRequest.securityUnarmed)+Number(addons.femaleHosts)+Number(addons.photoshoot);
  const closeCart=()=>{setOpen(false);setStep("selection");setCheckoutError(null);};
  const showDetails=()=>{setCheckoutError(null);setStep("details");};
  const money=(n:number)=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:2}).format(n);
  const thumbnail=(line:CartLine)=>{
    const service=line.category==="exotic-car"?(line.href.includes("/chauffeur-services/")?"chauffeur-services":"exotic-cars"):line.category==="yacht"?"yachts":line.category==="private-jet"?"private-jets":line.category;
    const product=catalog.find(p=>(p.service===service&&(p.id===line.id||p.id.endsWith(":"+line.id)))||p.name===line.title);
    return product?.images.split("\n").find(Boolean);
  };
  if(!open)return null;
  return <dialog ref={dialog} className={css.drawer} aria-labelledby="cart-title" onCancel={closeCart} onClose={closeCart} onClick={e=>{if(e.target===e.currentTarget)closeCart();}}>
   <div className={css.shell}>
    <header className={css.header}><div><p className={css.eyebrow}>{t("cart.ux.eyebrow")}</p><h2 id="cart-title">{t(step==="selection"?"cart.yourSelection":"cart.ux.detailsStep")}<span>{t("cart.ux.experienceCount",{n:items.length})}</span></h2></div><button type="button" onClick={closeCart} className={css.close} aria-label={t("cart.closeCart")}><X size={21}/></button></header>
    {items.length>0&&<nav className={css.steps} aria-label={t("cart.ux.reviewLabel")}><button type="button" aria-current={step==="selection"?"step":undefined} onClick={()=>{setStep("selection");setCheckoutError(null);}}><span>{step==="details"?<Check size={13}/>:"01"}</span>{t("cart.ux.selectionStep")}</button><ChevronRight size={14}/><button type="button" aria-current={step==="details"?"step":undefined} onClick={showDetails}><span>02</span>{t("cart.ux.detailsStep")}</button></nav>}
    <div className={css.body} ref={scrollArea}>
     {items.length===0?<div className={css.empty}><div className={css.emptyIcon}><ShoppingBag size={34} strokeWidth={1}/></div><p className={css.eyebrow}>BLACKLINE / MIAMI</p><h3>{t("cart.ux.emptyTitle")}</h3><p>{t("cart.ux.emptyHint")}</p><Link href="/services" className={css.primary} onClick={closeCart}>{t("cart.ux.browse")}<ArrowUpRight size={16}/></Link><div className={css.emptyCategories}><Link href="/services/yachts" onClick={closeCart}>{t("cart.categories.yacht")}</Link><Link href="/services/exotic-cars" onClick={closeCart}>{t("cart.categories.exoticCar")}</Link><Link href="/services/private-jets" onClick={closeCart}>{t("cart.categories.privateJet")}</Link></div></div>:step==="selection"?<>
      <p className={css.intro}>{t("cart.ux.selectionHint")}</p>
      <ul className={css.items}>{items.map(line=>{const image=thumbnail(line),online=checkoutEligibleItems.some(item=>item.key===line.key);return <li key={line.key} className={css.item}>
       <Link href={line.href} onClick={closeCart} className={css.photo} tabIndex={-1} aria-hidden="true">{image?<img src={image} alt=""/>:<ShoppingBag size={24} strokeWidth={1}/>}</Link>
       <div className={css.itemContent}><p className={css.category}>{labelForCategory(line.category,t)}</p><Link href={line.href} onClick={closeCart} className={css.itemTitle}>{line.title}</Link>{line.subtitle&&<p className={css.itemSubtitle}>{line.subtitle}</p>}
        <p className={css.price}>{online?money(line.bookingQuote!.totalUsd):line.priceHint||t("cart.ux.onRequest")}</p>
        {line.bookingQuote?.description&&<p className={css.dates}><CalendarDays size={13}/>{line.bookingQuote.description}</p>}
        <span className={css.itemStatus} data-online={online}>{online?<Check size={11}/>:<MessageCircle size={11}/>} {t(online?"cart.ux.ready":"cart.ux.quote")}</span>
        <div className={css.itemActions}><Link href={line.href} onClick={closeCart}>{t(line.bookingSelection?"cart.ux.editDates":"cart.ux.viewDetails")}<ArrowUpRight size={12}/></Link><button type="button" aria-label={t("cart.ux.removeItem",{title:line.title})} onClick={()=>removeItem(line.key)}><Trash2 size={12}/>{t("cart.ux.removeText")}</button></div>
       </div>
      </li>;})}</ul>
      <details className={css.addons}><summary><span><Sparkles size={18}/><span><strong>{t("cart.ux.extras")}</strong><small>{t("cart.ux.extrasHint")}</small></span></span><span className={css.extrasCount}>{selectedExtras>0?t("cart.ux.selectedExtras",{n:selectedExtras}):"+"}</span></summary><div className={css.addonBody}>
       {!hasSecurityItems&&<><label className={css.addon}><input type="checkbox" checked={addonsForRequest.securityArmed} onChange={e=>patchAddons({securityArmed:e.target.checked})}/><span><strong>{t("cart.armedSecurity")}</strong><small>{t("cart.rateSuffix",{rate:armedRateCard.hourlyRateUsd,hours:armedRateCard.minimumHours,minTotal:formatUsdNoCents(armedRateCard.minimumTotalUsd)})}</small></span></label><label className={css.addon}><input type="checkbox" checked={addonsForRequest.securityUnarmed} onChange={e=>patchAddons({securityUnarmed:e.target.checked})}/><span><strong>{t("cart.unarmedSecurity")}</strong><small>{t("cart.rateSuffix",{rate:unarmedRateCard.hourlyRateUsd,hours:unarmedRateCard.minimumHours,minTotal:formatUsdNoCents(unarmedRateCard.minimumTotalUsd)})}</small></span></label></>}
       <label className={css.addon}><input type="checkbox" checked={addons.femaleHosts} onChange={e=>patchAddons({femaleHosts:e.target.checked})}/><span><strong>{t("cart.femaleHosts")}</strong><small>{t("cart.ux.onRequest")}</small></span></label>
       {addons.femaleHosts&&<label className={css.headcount}>{t("cart.headcount")}<input type="number" min={1} max={8} value={addons.femaleHostsCount} onChange={e=>patchAddons({femaleHostsCount:Math.min(8,Math.max(1,parseInt(e.target.value)||1))})}/></label>}
       <label className={css.addon}><input type="checkbox" checked={addons.photoshoot} onChange={e=>patchAddons({photoshoot:e.target.checked})}/><span><strong>{t("cart.photoshoot")}</strong><small>{t("cart.ux.onRequest")}</small></span></label>
       {(addonsForRequest.securityArmed||addonsForRequest.securityUnarmed)&&<p className={css.hint}>{t("cart.ux.securityNote")}</p>}
      </div></details>
      {needsQuoteWhatsApp&&<div className={css.notice}><MessageCircle size={18}/><p>{t(checkoutBaseTotal>0?"cart.ux.mixedNote":"cart.ux.requestNote")}</p></div>}
      <button type="button" className={css.continueShopping} onClick={closeCart}><ArrowLeft size={14}/>{t("cart.ux.continueBrowsing")}</button>
     </>:<>
      <div className={css.detailsIntro}><h3>{t("cart.ux.contactHeading")}</h3><p>{t("cart.ux.contactHint")}</p></div>
      <form id="cart-checkout-form" onSubmit={e=>{e.preventDefault();if(busy)return;if(!/^\+\d{7,15}$/.test(customerPhoneFull)){setCheckoutError(t("cart.ux.phoneError"));return;}void(needsQuoteWhatsApp?startQuoteWhatsApp():startCheckout());}} className={css.form}>
       <label htmlFor="cart-customer-name">{t("cart.name")}<input ref={nameInput} id="cart-customer-name" type="text" autoComplete="name" required maxLength={150} value={customerName} onChange={e=>setCustomerName(e.target.value)} placeholder={t("cart.ux.namePlaceholder")}/></label>
       <label htmlFor="cart-customer-email">{t("cart.email")}<input id="cart-customer-email" type="email" autoComplete="email" required maxLength={254} value={customerEmail} onChange={e=>setCustomerEmail(e.target.value)} placeholder={t("cart.ux.emailPlaceholder")}/></label>
       <div><label htmlFor="cart-customer-phone">{t("cart.phone")}</label><div className={css.phone}><select id="cart-customer-phone-country-code" aria-label={t("cart.ux.countryCode")} autoComplete="tel-country-code" value={customerPhoneCountryCode} onChange={e=>setCustomerPhoneCountryCode(e.target.value)}>{PHONE_COUNTRY_CODES.map(option=><option key={option.code} value={option.code}>{option.label}</option>)}</select><input id="cart-customer-phone" type="tel" inputMode="tel" autoComplete="tel-national" required maxLength={30} value={customerPhone} onChange={e=>setCustomerPhone(e.target.value)} placeholder={t("cart.ux.phonePlaceholder")}/></div></div>
       {!needsQuoteWhatsApp&&<fieldset className={css.payment}><legend>{t("cart.ux.paymentHeading")}</legend>{(["deposit","full"] as const).map(mode=><label key={mode} data-selected={payMode===mode}><input type="radio" name="cart-payment-mode" value={mode} checked={payMode===mode} onChange={()=>setPayMode(mode)}/><span><strong>{t(mode==="deposit"?"cart.payDeposit":"cart.payFull",{pct:DEPOSIT_PCT})}</strong><small>{t(mode==="deposit"?"cart.ux.depositHint":"cart.ux.fullHint")}</small></span><b>{money(mode==="deposit"?Math.round(checkoutTotal*30)/100:checkoutTotal)}</b></label>)}</fieldset>}
      </form>
      <div className={css.notice}>{needsQuoteWhatsApp?<MessageCircle size={19}/>:<ShieldCheck size={19}/>}<p>{t(needsQuoteWhatsApp?"cart.ux.whatsappNote":"cart.ux.secureNote")}</p></div>
      <details className={css.review}><summary>{t("cart.ux.reviewLabel")}<span>{items.length}</span></summary><ul>{items.map(line=><li key={line.key}><span>{line.title}</span><small>{line.bookingQuote?.payableOnline?money(line.bookingQuote.totalUsd):t("cart.ux.onRequest")}</small></li>)}</ul>{selectedExtras>0&&<p className={css.hint}>{formatCartAddonsLocalized(addonsForRequest,t)}</p>}</details>
      <button type="button" className={css.continueShopping} onClick={()=>{setStep("selection");setCheckoutError(null);}}><ArrowLeft size={14}/>{t("cart.ux.back")}</button>
     </>}
    </div>
    <footer className={css.footer}>
     {items.length>0?<>
      {needsQuoteWhatsApp?<><div className={css.total}><span>{t("cart.ux.finalQuote")}</span><strong className={css.quoteTotal}>{t("cart.ux.quoteTotal")}</strong></div>{checkoutTotal>0&&<div className={css.subtotal}><span>{t("cart.ux.pricedSubtotal")}</span><span>{money(checkoutTotal)}</span></div>}</>:<><div className={css.total}><span>{t("cart.ux.total")}</span><strong>{money(checkoutTotal)}</strong></div>{step==="details"&&<><div className={css.subtotal}><span>{t("cart.ux.dueToday")}</span><strong>{money(chargeToday??0)}</strong></div>{payMode==="deposit"&&<div className={css.subtotal}><span>{t("cart.ux.remaining")}</span><span>{money(checkoutTotal-(chargeToday??0))}</span></div>}</>}{step==="details"&&payMode==="deposit"&&<p className={css.smallPrint}>{t("cart.ux.balanceNote")}</p>}</>}
      {checkoutError&&<div className={css.error} role="alert"><strong>{t("cart.ux.errorHeading")}</strong><p>{checkoutError}</p></div>}
      {!needsQuoteWhatsApp&&step==="details"&&(chargeToday??0)<MIN_CHARGE_USD&&<p className={css.error}>{t("cart.ux.minimum")}</p>}
      {step==="selection"?<button key="cart-continue" type="button" className={css.primary} onClick={e=>{e.preventDefault();showDetails();}}>{t("cart.ux.continue")}<ArrowRight size={17}/></button>:<button key="cart-submit" type="submit" form="cart-checkout-form" className={css.primary} disabled={busy||(!needsQuoteWhatsApp&&(chargeToday??0)<MIN_CHARGE_USD)}>{busy?<Loader2 size={17} className="animate-spin"/>:needsQuoteWhatsApp?<MessageCircle size={17}/>:<LockKeyhole size={16}/>} {t(needsQuoteWhatsApp?"cart.ux.whatsapp":"cart.ux.payNow")}<ArrowRight size={16}/></button>}
      <div className={css.footerMeta}><span><ShieldCheck size={12}/>{t("cart.ux.savedNote")}</span><Link href={CONTACT_TRIP_BUILDER_HREF} onClick={closeCart}>{t("cart.ux.contactSupport")}</Link></div>
     </>:<p className={css.emptyFooter}>{t("cart.ux.savedNote")}</p>}
    </footer>
   </div>
  </dialog>;
}

function labelForCategory(c: CartCategory, t: Translator): string {
  switch (c) {
    case "exotic-car":
      return t("cart.categories.exoticCar");
    case "yacht":
      return t("cart.categories.yacht");
    case "private-jet":
      return t("cart.categories.privateJet");
    case "fishing":
      return t("cart.categories.fishing");
    case "jetski":
      return t("cart.categories.jetski");
    case "jetcar":
      return t("cart.categories.jetcar");
    case "kayak":
      return t("cart.categories.kayak");
    case "paddleboard":
      return t("cart.categories.paddleboard");
    case "parasailing":
      return t("cart.categories.parasailing");
    case "security-armed":
      return t("cart.categories.securityArmed");
    case "security-unarmed":
      return t("cart.categories.securityUnarmed");
    case "atv":
      return t("cart.categories.atv");
    case "utv":
      return t("cart.categories.utv");
    case "other":
      return t("cart.categories.other");
    default: {
      const _x: never = c;
      return _x;
    }
  }
}
