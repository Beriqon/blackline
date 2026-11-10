"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronDown, CreditCard, Headphones, LockKeyhole, ShieldCheck, Sparkles, CircleHelp } from "lucide-react";
import type { CheckoutOrder } from "@/lib/checkout-orders";
import { StripePaymentForm } from "./stripe-payment-form";
import css from "./blackline-checkout.module.css";

type Props = {
  sessionId: string | null;
  order: CheckoutOrder | null; clientSecret: string | null; publishableKey: string | null;
  methods: string[]; expiresAt: number | null; pictures: Record<string, string>;
  locale: "en" | "es"; issue: "missing" | "expired" | "unavailable" | null;
};

export function BlacklineCheckout({ sessionId, order, clientSecret, publishableKey, methods, expiresAt, pictures, locale, issue }: Props) {
  const es = locale === "es";
  const full=order?.paymentType==="full";
  const due=order?.amountDueCents??order?.depositCents??0;
  const [switching,setSwitching]=useState(false),[switchError,setSwitchError]=useState("");
  const switchFull=async()=>{if(switching)return;setSwitching(true);setSwitchError("");try{const response=await fetch("/api/stripe/full-payment",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sessionId})});const result=await response.json();if(!response.ok)throw Error(result.error);window.location.assign(result.url);}catch(e){setSwitchError(e instanceof Error?e.message:"Could not switch payment plan.");setSwitching(false);}};
  const [startingZelle,setStartingZelle]=useState(false);
  const [zelleError,setZelleError]=useState("");
  const startZelle=async()=>{if(startingZelle)return;setStartingZelle(true);setZelleError("");try{const response=await fetch("/api/zelle/start",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sessionId})});const result=await response.json();if(!response.ok)throw Error(result.error);window.location.assign(result.url);}catch(e){setZelleError(e instanceof Error?e.message:"Zelle checkout is unavailable.");setStartingZelle(false);}};
  const [method, setMethod] = useState<"stripe" | "zelle">("stripe");
  const [expired, setExpired] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [summaryExpanded, setSummaryExpanded] = useState(false);
  useEffect(() => {
    if (!expiresAt) return;
    const update = () => setExpired(Date.now() >= expiresAt * 1000);
    update();
    const timer = setInterval(update, 10000);
    return () => clearInterval(timer);
  }, [expiresAt]);
  const money = useMemo(() => new Intl.NumberFormat(es ? "es-US" : "en-US", { style: "currency", currency: "USD" }), [es]);
  const usd = (cents: number) => money.format(cents / 100);
  const quoteLines = order?.lines.filter(line => line.totalCents === null) ?? [];
  const blocked = issue || expired;
  const available = [...new Set(methods.filter(type=>full||!["klarna","link"].includes(type)).map(type => ({ card: es ? "Tarjetas" : "Cards", link: "Link", cashapp: "Cash App Pay", amazon_pay: "Amazon Pay", klarna: "Klarna", afterpay_clearpay: "Afterpay", paypal: "PayPal", us_bank_account: "US bank account", affirm: "Affirm" }[type] ?? type.replaceAll("_", " "))))];

  return <div className={css.page}>
    <header className={css.header}>
      <Link href="/" className={css.brand} aria-label="Blackline home"><Image src="/logo/blacklinelogotransparant.png" alt="" width={42} height={42} /><span>BLACKLINE<small>CONCIERGE</small></span></Link>
      <div className={css.headerSecurity}><LockKeyhole size={13} /><span>{es ? "PAGO SEGURO" : "SECURE CHECKOUT"}</span></div>
    </header>
    <div className={css.container}>
      <nav className={css.steps} aria-label={es ? "Progreso del pedido" : "Checkout progress"}>
        <span><i><Check size={12} /></i>{es ? "Tu selección" : "Your selection"}</span><b /><span className={css.activeStep} aria-current="step"><i>02</i>{es ? "Pago seguro" : "Secure payment"}</span><b /><span><i>03</i>{es ? "Confirmación" : "Confirmation"}</span>
      </nav>
      <div className={css.intro}><div><p className={css.eyebrow}>THE BLACKLINE EXPERIENCE</p><h1>{es ? "El último detalle." : "The final detail."}</h1><p>{es ? "Tu próxima experiencia empieza aquí. Confirma tu anticipo y nosotros nos encargamos del resto." : "Your next experience starts here. Choose a deposit or full payment. We’ll take care of the rest."}</p></div><span className={css.testBadge}><span />{method==="zelle"?"Zelle · real bank transfer":order?.testMode?(es ? "Modo de prueba" : "Stripe test mode"):(es?"Pago seguro":"Secure payment")}</span></div>

      {blocked ? <div className={css.empty} role="status"><CircleHelp size={30} /><h2>{issue === "missing" ? (es ? "Empecemos con tu selección." : "Let’s start with your selection.") : blocked === "expired" || expired ? (es ? "Tu sesión ha caducado." : "Your checkout session has expired.") : (es ? "El pago no está disponible por el momento." : "Checkout is temporarily unavailable.")}</h2><p>{es ? "Vuelve a tu selección para comprobar la disponibilidad y abrir un nuevo pago seguro. Si ya has pagado, contacta con tu concierge antes de volver a pagar." : "Return to your selection to check availability and open a fresh checkout. If you have already paid, contact your concierge before trying again."}</p><Link className={css.payButton} href="/services">{es ? "Explorar experiencias" : "Explore experiences"}<ArrowRight size={16} /></Link><Link href="/contact">{es ? "Contactar con tu concierge" : "Contact your concierge"}</Link></div> : <div className={css.layout}>
        <div className={css.main}>
          <section className={css.section} aria-labelledby="payment-method-heading">
            <div className={css.sectionHeading}><span className={css.number}>01</span><div><h2 id="payment-method-heading">{es ? "A tu manera." : "Make it yours."}</h2><p>{es ? "Elige cómo quieres pagar tu anticipo." : "Choose how you’d like to pay."}</p></div></div>
            <div className={css.methodChoices} role="radiogroup" aria-label={es ? "Método de pago" : "Payment method"}>
              <button type="button" role="radio" aria-checked={method === "stripe"} className={css.methodChoice} data-selected={method === "stripe"} onClick={() => setMethod("stripe")}><CreditCard size={22} /><span><strong>{es ? "Tarjeta y monederos" : "Card & digital wallets"}</strong><small>{es ? "Pago online seguro" : "Secure online payment"}</small></span><i>{method === "stripe" && <Check size={11} />}</i></button>
              <button type="button" role="radio" aria-checked={method === "zelle"} className={css.methodChoice} data-selected={method === "zelle"} onClick={() => setMethod("zelle")}><span className={css.zelleMark}>Z</span><span><strong>Zelle<em>Bank transfer</em></strong><small>{es ? "Directamente desde tu banco" : "Directly from your bank"}</small></span><i>{method === "zelle" && <Check size={11} />}</i></button>
            </div>
          </section>
          {method === "stripe" ? <section className={css.section} aria-labelledby="payment-details-heading">
            <div className={css.sectionHeading}><span className={css.number}>02</span><div><h2 id="payment-details-heading">{es ? "Detalles del pago" : "Payment details"}</h2><p>{es ? "Tus datos de pago se procesan de forma segura con Stripe." : "Your payment details are securely handled by Stripe."}</p></div><LockKeyhole size={17} className={css.sectionLock} /></div>
            {clientSecret && publishableKey && order && <StripePaymentForm key={clientSecret} clientSecret={clientSecret} publishableKey={publishableKey} order={order} locale={locale} />}
            {full?<div className={css.previewNote}><ShieldCheck size={18}/><p>Full payment selected. Klarna is available for the full priced total when you qualify. Klarna sets your installment terms; your Blackline balance for priced services will be $0 after payment.</p></div>:<div className={css.previewNote}><CreditCard size={18}/><div><strong>Want to pay with Klarna?</strong><p>Klarna is available only when paying the full priced amount. It cannot be used for a 30% deposit.</p><button className={css.textButton} type="button" disabled={switching} onClick={()=>void switchFull()}>{switching?"Updating payment…":"Switch to full payment to use Klarna"}<ArrowRight size={14}/></button>{switchError&&<p role="alert">{switchError}</p>}</div></div>}
            {available.length > 0 && <div className={css.accepted}><span>{es ? "Opciones para este pago" : "Options for this payment"}</span><div>{available.map(label => <span key={label}>{label}</span>)}</div></div>}
            <p className={css.walletHint}>{es ? "Los monederos compatibles aparecen automáticamente según tu dispositivo y navegador." : "Eligible wallets appear automatically for your device and browser."}</p>
          </section> : <section className={`${css.section} ${css.zellePanel}`} aria-labelledby="zelle-heading">
            <div className={css.zelleIntro}><span className={css.zelleMark}>Z</span><div><p className={css.eyebrow}>{es ? "TRANSFERENCIA BANCARIA" : "BANK-TO-BANK PAYMENT"}</p><h2 id="zelle-heading">{es ? "Paga con Zelle." : "Pay with Zelle."}</h2></div></div>
            <p>{es ? "Envía tu anticipo desde la app de tu banco directamente a Blackline. Esta opción no pasa por Stripe." : "Send your payment from your banking app directly to Blackline. This option does not use Stripe."}</p>
            <dl className={css.zelleDetails}><div><dt>{full?"Full payment amount":"Deposit amount"}</dt><dd>{usd(due)}</dd></div><div><dt>Order number / payment memo</dt><dd className={css.orderReference}>{order?.id}</dd></div></dl>
            <div className={css.previewNote}><ShieldCheck size={18}/><p>Zelle is a bank transfer, separate from card payments. Reserve your selection below to see the recipient details. Then send your payment and upload a screenshot. Our team will verify receipt in the bank account before confirming your booking.</p></div>
            <p>After you submit your screenshot, availability is held for up to 72 hours during bank verification. An unconfirmed hold expires automatically. Services with “Price follows” are excluded.</p>
            {zelleError&&<p role="alert">{zelleError}</p>}
            <button type="button" className={css.payButton} disabled={startingZelle} onClick={()=>void startZelle()}><LockKeyhole size={15}/>{startingZelle?"Reserving your selection…":"Continue with Zelle · view transfer details"}</button>
            <button type="button" className={css.textButton} onClick={() => setMethod("stripe")}>{es ? "Pagar con tarjeta o monedero" : "Pay by card or digital wallet"}<ArrowRight size={14} /></button>
          </section>}
          <div className={css.reassurance}><ShieldCheck size={23} /><div><strong>{es ? "Tu tranquilidad, primero." : "Your peace of mind, first."}</strong><p>{es ? "Un anticipo del 30%. Un equipo dedicado a cada detalle de tu experiencia." : "Your choice of deposit or full payment. A dedicated team behind every detail of your experience."}</p></div></div>
          <Link href="/services" className={css.back}><ArrowLeft size={14} />{es ? "Volver a las experiencias" : "Back to experiences"}</Link>
        </div>

        {order && <aside className={css.summary} data-expanded={summaryExpanded} aria-label={es ? "Resumen del pedido" : "Order summary"}><button type="button" className={css.mobileSummaryToggle} aria-expanded={summaryExpanded} onClick={() => setSummaryExpanded(!summaryExpanded)}><span>{es ? "Resumen del pedido" : "Order summary"}<small>{order.lines.length} {es ? "servicios" : "experiences"}</small></span><ChevronDown size={17} style={{ transform: summaryExpanded ? "rotate(180deg)" : undefined }} /></button><div className={css.summaryDetails} data-expanded={summaryExpanded}><div className={css.summaryTop}><p className={css.eyebrow}>{es ? "TU EXPERIENCIA" : "YOUR EXPERIENCE"}</p><h2 id="order-summary-heading">{es ? "Una selección excepcional." : "An exceptional selection."}</h2><p>{order.lines.length} {es ? "servicios seleccionados" : order.lines.length === 1 ? "experience selected" : "experiences selected"}</p></div>
          <ul className={css.orderLines}>{order.lines.map((line, index) => <li key={`${line.productId}:${index}`}><div className={css.linePicture}>{pictures[line.productId] ? <Image src={pictures[line.productId]} alt="" fill sizes="68px" /> : <Sparkles size={21} />}</div><div className={css.lineInfo}><h3>{line.title}</h3>{line.description && <p>{line.description}</p>}{line.totalCents === null ? <span className={css.quoteBadge}>{es ? "Precio pendiente" : "Price follows"}</span> : <strong>{usd(line.totalCents)}</strong>}</div></li>)}</ul>
          {quoteLines.length > 0 && <div className={css.quoteNote}><CircleHelp size={16} /><p>{es ? "Los servicios con precio pendiente no están incluidos en estos importes. Recibirás una propuesta para aprobarlos por separado." : "Services marked “price follows” are excluded from these amounts. You’ll receive a separate proposal for approval."}</p></div>}
          <dl className={css.totals}><div><dt>{es ? "Servicios con precio" : "Priced services"}</dt><dd>{usd(order.knownTotalCents)}</dd></div><div><dt>{es ? "Saldo restante · 70%" : "Remaining balance"}</dt><dd>{usd(order.remainingCents)}</dd></div></dl>
          </div><div className={css.dueNow}><div><span>{es ? "A pagar hoy" : "Due today"}</span><small>{full?(es?"Pago completo":"Full payment · 100%"):es ? "Anticipo del 30%" : "30% deposit"}</small></div><strong>{usd(due)}<small>USD</small></strong></div>
          {quoteLines.length > 0 && <p className={css.mobileQuoteNote}>{es ? "Los servicios con precio pendiente no están incluidos." : "Price-on-request services are not included."}</p>}
          <p className={css.balanceNote}>{full?"Your priced services will be paid in full. Price-on-request services are excluded.":es ? "Tu concierge confirmará cuándo abonar el saldo antes de tu experiencia." : "Your concierge will confirm when the remaining balance is due before your experience."}</p>
          <button type="button" className={css.contactToggle} aria-expanded={showContact} onClick={() => setShowContact(!showContact)}><span>{es ? "Datos de contacto" : "Contact details"}</span><ChevronDown size={15} style={{ transform: showContact ? "rotate(180deg)" : undefined }} /></button>
          {showContact && <div className={css.contactDetails}><p>{order.customerName}</p><p>{order.customerEmail}</p><p>{order.customerPhone}</p></div>}
          <div className={css.concierge}><Headphones size={21} /><div><strong>{es ? "Siempre a tu lado." : "A concierge, by your side."}</strong><Link href="/contact">{es ? "¿Una pregunta? Hablemos." : "A question? Let’s talk."}<ArrowRight size={12} /></Link></div></div>
        </aside>}
      </div>}
      <footer className={css.footer}><span>© {new Date().getFullYear()} BLACKLINE CONCIERGE</span><div><Link href="/privacy">{es ? "Privacidad" : "Privacy"}</Link><Link href="/terms">{es ? "Condiciones" : "Terms"}</Link><span><LockKeyhole size={11} />{es ? "Pago seguro" : "Secure payment"}</span></div></footer>
    </div>
  </div>;
}
