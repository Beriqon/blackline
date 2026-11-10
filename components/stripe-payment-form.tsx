"use client";

import { useMemo, useState } from "react";
import { loadStripe, type Appearance, type StripeExpressCheckoutElementConfirmEvent } from "@stripe/stripe-js";
import { CheckoutElementsProvider, ExpressCheckoutElement, PaymentElement, useCheckoutElements } from "@stripe/react-stripe-js/checkout";
import { ArrowRight, LoaderCircle, LockKeyhole, ShieldCheck } from "lucide-react";
import type { CheckoutOrder } from "@/lib/checkout-orders";
import css from "./blackline-checkout.module.css";

const appearance: Appearance = {
  theme: "night",
  variables: {
    colorPrimary: "#c6a46c", colorBackground: "#141414", colorText: "#f5f1e8",
    colorTextSecondary: "#a5a096", colorDanger: "#f39a94",
    fontFamily: "Arial, sans-serif", fontSizeBase: "15px",
    borderRadius: "4px", spacingUnit: "5px",
  },
  rules: {
    ".Input": { border: "1px solid #36332e", boxShadow: "none", padding: "14px 12px" },
    ".Input:focus": { border: "1px solid #c6a46c", boxShadow: "0 0 0 2px #c6a46c20" },
    ".Label": { color: "#c9c4ba", fontSize: "13px", marginBottom: "9px" },
    ".Tab": { border: "1px solid #36332e", boxShadow: "none" },
    ".Tab--selected": { border: "1px solid #c6a46c", backgroundColor: "#201c16" },
    ".AccordionItem": { border: "1px solid #36332e", boxShadow: "none" },
  },
};

type Props = { clientSecret: string; publishableKey: string; order: CheckoutOrder; locale: "en" | "es"; successUrl?:string };

export function StripePaymentForm({ clientSecret, publishableKey, order, locale,successUrl }: Props) {
  const stripe = useMemo(() => loadStripe(publishableKey, { locale }), [publishableKey, locale]);
  const options = useMemo(() => ({ clientSecret, elementsOptions: { appearance, loader: "auto" as const }, adaptivePricing: { allowed: false } }), [clientSecret]);
  return <CheckoutElementsProvider stripe={stripe} options={options}><PaymentFields order={order} locale={locale} successUrl={successUrl}/></CheckoutElementsProvider>;
}

function PaymentFields({ order, locale,successUrl }: Pick<Props, "order" | "locale" | "successUrl">) {
  const state = useCheckoutElements();
  const es = locale === "es";
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [walletsAvailable, setWalletsAvailable] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const due = new Intl.NumberFormat(es ? "es-US" : "en-US", { style: "currency", currency: "USD" }).format((order.amountDueCents??order.depositCents) / 100);
  const genericError = es ? "No se ha podido completar el pago. Comprueba tus datos e inténtalo de nuevo." : "We couldn’t complete your payment. Check your details and try again.";

  async function confirm(event?: StripeExpressCheckoutElementConfirmEvent) {
    if (state.type !== "success" || busy) return;
    setBusy(true); setError(null);
    try {
      const result = await state.checkout.confirm({
        redirect: "if_required",
        ...(event ? { expressCheckoutConfirmEvent: event } : {}),
      });
      if (result.type === "error") setError(result.error.message || genericError);
      else window.location.assign(successUrl??`/payment/success?session_id=${encodeURIComponent(order.stripeSessionId!)}`);
    } catch { setError(genericError); }
    finally { setBusy(false); }
  }

  if (state.type === "loading") return <div className={css.loading} role="status"><LoaderCircle size={22} className={css.spinner} /><p>{es ? "Preparando tu pago seguro…" : "Preparing your secure payment…"}</p></div>;
  if (state.type === "error" || loadFailed) return <div className={css.formError} role="alert"><p>{es ? "No se ha podido cargar el formulario de pago. Actualiza la página para volver a intentarlo." : "The payment form couldn’t load. Refresh the page to try again."}</p><button className={css.textButton} type="button" onClick={() => window.location.reload()}>{es ? "Volver a cargar" : "Reload payment form"}<ArrowRight size={14} /></button></div>;
  // A different Stripe total must never be silently confirmed against the saved order.
  if (state.checkout.currency.toLowerCase() !== "usd" || state.checkout.total.total.minorUnitsAmount !== (order.amountDueCents??order.depositCents)) return <p className={css.formError} role="alert">{es ? "El importe del pago ha cambiado. Contacta con tu concierge antes de pagar." : "The payment amount has changed. Please contact your concierge before paying."}</p>;

  return <form onSubmit={event => { event.preventDefault(); void confirm(); }} aria-busy={busy}>
    <div className={css.wallets} data-available={walletsAvailable}>
      <ExpressCheckoutElement options={{buttonHeight:48,buttonTheme:{applePay:"white"},buttonType:{applePay:"buy"},layout:{maxColumns:2,maxRows:2},paymentMethodOrder:["apple_pay","google_pay","link","amazon_pay","klarna"],paymentMethods:{link:order.paymentType==="full"?"auto":"never",klarna:order.paymentType==="full"?"auto":"never"}}} onReady={event => setWalletsAvailable(Object.values(event.availablePaymentMethods ?? {}).some(Boolean))} onConfirm={event => { void confirm(event); }} />
      {walletsAvailable && <div className={css.orDivider}><span />{es ? "o elige otra opción" : "or choose another way"}<span /></div>}
    </div>
    <div className={css.paymentFields}>
      {!ready && <p className={css.loadingInline} role="status">{es ? "Cargando opciones de pago…" : "Loading your payment options…"}</p>}
      <PaymentElement options={{ layout: { type: "accordion", radios: "always", spacedAccordionItems: true }, paymentMethodOrder: order.paymentType==="full"?["klarna","card","link","cashapp","amazon_pay","afterpay_clearpay","affirm"]:["card","cashapp","amazon_pay","afterpay_clearpay","affirm"] }} onReady={() => setReady(true)} onLoadError={() => setLoadFailed(true)} />
    </div>
    {error && <p className={css.formError} role="alert">{error}</p>}
    <p className={css.paymentConsent}>{es ? "Al pagar, aceptas nuestras " : "By paying, you agree to our "}<a href="/terms" target="_blank" rel="noreferrer">{es ? "condiciones" : "terms"}</a>{es ? ". Tu anticipo solo cubre los servicios con precio confirmado." : ". Your payment covers priced services only."}</p>
    <button type="submit" className={css.payButton} disabled={busy || !ready || !state.checkout.canConfirm}>{busy ? <LoaderCircle size={17} className={css.spinner} /> : <LockKeyhole size={15} />}<span>{busy ? (es ? "Procesando…" : "Processing…") : (es ? `${order.paymentType==="full"?"Pagar total":"Pagar anticipo"} de ${due}` : `Pay ${due}${order.paymentType==="full"?" in full":" deposit"}`)}</span>{!busy && <ArrowRight size={17} />}</button>
    <p className={css.encrypted}><ShieldCheck size={13} />{es ? "Pago cifrado y seguro con Stripe" : "Encrypted and secured by Stripe"}</p>
  </form>;
}
