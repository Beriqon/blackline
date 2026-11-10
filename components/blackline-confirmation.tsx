"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CalendarDays, Check, CheckCheck, ChevronRight, CircleHelp, Clock3, Copy, Download, FileCheck2, Headphones, LoaderCircle, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { CartAfterPayment } from "./cart-after-payment";
import { confirmationDate, confirmationLineAmounts, confirmationMoney as money, type OrderConfirmation } from "@/lib/order-confirmation-view";
import css from "./blackline-confirmation.module.css";

export function BlacklineConfirmation({ confirmation,pdfUrl }: { confirmation: OrderConfirmation | null;pdfUrl?:string }) {
  const router = useRouter();
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const order = confirmation?.order;
  const confirmed = confirmation?.status === "confirmed";
  const received = (confirmation?.paidCents ?? 0) > 0;
  const processing = confirmation?.status === "processing";
  const needsReview=confirmation?.status==="review";
  const zelle=confirmation?.zelle;
  const balancePending=confirmation?.balancePayment?.status==="zelle_submitted";
  const zellePending=zelle?.status==="payment_submitted"||balancePending;
  const zelleReleased=zelle?.status==="expired"||zelle?.status==="rejected";
  const holdDate=zelle?new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit",timeZone:"America/New_York",timeZoneName:"short"}).format(new Date(zelle.holdUntilIso)):"";
  const lines = order && confirmation ? confirmationLineAmounts(order, confirmation.paidCents) : [];
  const hasQuotes = lines.some(line => line.totalCents === null);
  useEffect(() => {
    if (!processing&&!zellePending) return;
    let checks = 0;
    const timer = setInterval(() => { router.refresh(); if (++checks >= 12) clearInterval(timer); }, zellePending?30000:2500);
    return () => clearInterval(timer);
  }, [processing, zellePending, router]);
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2500);
    return () => clearTimeout(timer);
  }, [copied]);

  async function download() {
    if (!order || (!pdfUrl&&!zelle&&!order.stripeSessionId) || downloading) return;
    setDownloading(true); setDownloadError(null);
    try {
      const response = await fetch(pdfUrl??(zelle?`/api/zelle/confirmation?order_id=${encodeURIComponent(order.id)}`:`/api/orders/confirmation?session_id=${encodeURIComponent(order.stripeSessionId!)}`), { cache: "no-store" });
      if (!response.ok || !response.headers.get("content-type")?.includes("application/pdf")) throw new Error("Download failed");
      const url = URL.createObjectURL(await response.blob());
      const anchor = document.createElement("a");
      anchor.href = url; anchor.download = `Blackline-${order.id}.pdf`;
      document.body.append(anchor); anchor.click(); anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch { setDownloadError("Your PDF couldn’t be downloaded. Please try again or contact your concierge."); }
    finally { setDownloading(false); }
  }

  return <div className={css.page}>
    {(confirmed||zellePending) && order && <CartAfterPayment paidKeys={order.lines.flatMap(line => line.cartKey ? [line.cartKey] : [])} />}
    <header className={css.header}><Link href="/" className={css.brand} aria-label="Blackline home"><Image src="/logo/blacklinelogotransparant.png" alt="" width={42} height={42} /><span>BLACKLINE<small>CONCIERGE</small></span></Link><Link href="/contact" className={css.headerContact}><Headphones size={15} />Your concierge<ChevronRight size={13} /></Link></header>
    <div className={css.container}>
      <nav className={css.steps} aria-label="Order progress"><span><Check size={12} />Your selection</span><b /><span><Check size={12} />Payment</span><b /><span aria-current="step" className={css.active}><span>03</span>Confirmation</span></nav>
      <section className={css.hero} aria-labelledby="confirmation-heading">
        <div className={css.seal}>{confirmed ? <CheckCheck size={28} strokeWidth={1.3} /> : <Clock3 size={27} strokeWidth={1.3} />}</div>
        <p className={css.eyebrow}>{confirmed ? "CONSIDER IT TAKEN CARE OF" : received ? "YOU’RE ONE STEP CLOSER" : "YOUR BLACKLINE EXPERIENCE"}</p>
        <h1 id="confirmation-heading">{zellePending?<>Thank you.<br/><em>Your Miami is taking shape.</em></>:zelleReleased?<>Your order.<br/><em>Let’s review the next step.</em></>:confirmed ? <>Thank you.<br /><em>We’ll take it from here.</em></> : received ? <>Payment received.<br /><em>The details are coming together.</em></> : <>Let’s check<br /><em>your confirmation.</em></>}</h1>
        <p>{needsReview?"Your payment has been received, but the selected availability needs a concierge review. Please contact us with your order number. Do not send another payment.":zellePending?"Your Zelle payment screenshot has been received securely. Your concierge will check the bank account before marking this payment as received. There is no need to send another payment.":zelleReleased?"Your availability hold has been released. If you sent a payment, contact your concierge with your order number before sending any additional money.":confirmed ? confirmation.outstandingCents===0?"Your payment has been received. Your priced experiences are now paid in full. Keep your confirmation and enjoy every detail of your Miami experience.":"Your payment is received. Your concierge is here for every detail of your Miami experience, from this moment to the last." : received ? "Your payment has been received. We’re finalizing your booking confirmation. There’s no need to pay again." : confirmation?.status === "expired" ? "This payment session has expired. Contact your concierge if you need help with your selection." : "We haven’t confirmed your payment yet. You can check again or speak with your concierge before making another payment."}</p>
        {order && <div className={css.statusRow}><span className={css.status} data-confirmed={confirmed}>{confirmed ? <Check size={12} /> : <Clock3 size={12} />}{needsReview?"Payment received — concierge review needed":zellePending?"Payment submitted — awaiting verification":zelleReleased?zelle?.status==="rejected"?"Payment rejected — hold released":"Hold expired — contact your concierge":confirmed ? confirmation.outstandingCents===0?"Paid in full":"Deposit received" : received ? "Finalizing confirmation" : "Payment not confirmed"}</span>{order.testMode && <span className={css.testBadge}>Test booking · no real charge</span>}</div>}
        {zellePending&&zelle&&<p className={css.holdNote}><ShieldCheck size={15}/> Your selected availability is held for up to 72 hours · until {holdDate}.</p>}{zelle?.reviewNote&&<p className={css.holdNote}>Concierge note: {zelle.reviewNote}</p>}
        {order && <div className={css.heroActions}><button type="button" onClick={() => { void download(); }} disabled={downloading}>{downloading ? <LoaderCircle size={14} className={css.spinner} /> : <Download size={14} />}{downloading ? "Preparing your PDF…" : "Download your PDF"}</button><a href="#booking-details">View booking details<ChevronRight size={13} /></a></div>}
        {downloadError && <p role="alert" className={css.error}>{downloadError}</p>}
      </section>

      {!confirmation || !order ? <div className={css.unavailable}><CircleHelp size={25} /><h2>We couldn’t load this confirmation.</h2><p>Your payment details are safe. Please check again or contact your concierge if you have already paid.</p><button type="button" onClick={() => router.refresh()} className={css.primary}>Check again<ArrowRight size={15} /></button><Link href="/contact">Contact your concierge</Link></div> : <>
        <section id="booking-details" className={css.orderStrip} aria-label="Booking details"><div className={css.orderNumber}><span>ORDER NUMBER</span><div><strong>{order.id}</strong><button type="button" aria-label={copied ? "Order number copied" : "Copy order number"} onClick={async () => { try { await navigator.clipboard.writeText(order.id); setCopied(true); } catch { setCopied(false); } }}>{copied ? <Check size={14} /> : <Copy size={14} />}</button></div>{copied && <small role="status">Copied</small>}</div><div><span>{zelle&&!confirmed?"ORDER CREATED":"BOOKED ON"}</span><strong>{confirmationDate(order.createdAtIso)}</strong></div><div><span>PREPARED FOR</span><strong>{order.customerName}</strong></div></section>
        <div className={css.layout}>
          <div className={css.experiences}>
            <div className={css.sectionHeading}><div><p className={css.eyebrow}>YOUR MIAMI, THOUGHTFULLY ARRANGED</p><h2>Your selected experiences.</h2></div><span>{lines.length.toString().padStart(2, "0")}</span></div>
            <ul className={css.productList}>{lines.map((line, index) => <li key={`${line.productId}:${index}`} className={css.product}>
              <div className={css.photo}>{confirmation.pictures[line.productId] ? <Image src={confirmation.pictures[line.productId]} alt={line.title} fill sizes="(max-width: 600px) 100vw, 230px" /> : <Sparkles size={30} strokeWidth={1} />}<span>{(index + 1).toString().padStart(2, "0")}</span></div>
              <div className={css.productBody}><div className={css.productTitle}><h3>{line.title}</h3><span className={css.productStatus} data-quote={line.totalCents === null}>{line.totalCents === null ? <><Clock3 size={11} />Price follows</> : confirmed ? <><Check size={11} />Confirmed</> : <><Clock3 size={11} />Pending</>}</span></div><p className={css.description}><CalendarDays size={13} />{line.description || "Your concierge will coordinate the details with you."}</p>
                {line.totalCents === null ? <p className={css.quoteProduct}>No payment taken for this service. Its price and availability will be confirmed in a separate proposal for your approval.</p> : <dl className={css.productAmounts}><div><dt>Service price</dt><dd>{money(line.totalCents)}</dd></div><div><dt>{zelle?"Verified paid":"Paid"}</dt><dd className={css.gold}>{money(line.paidCents!)}</dd></div><div><dt>Remaining</dt><dd>{money(line.remainingCents!)}</dd></div></dl>}
              </div>
            </li>)}</ul>
            {hasQuotes && <div className={css.quoteNotice}><CircleHelp size={19} /><div><strong>A few details to confirm.</strong><p>Services marked “price follows” are not included in the totals. Your concierge will share their price and availability separately. You approve the proposal before anything is added.</p></div></div>}
            <section className={css.nextSteps} aria-labelledby="next-heading"><p className={css.eyebrow}>WHAT HAPPENS NEXT</p><h2 id="next-heading">From here, it’s personal.</h2><ol><li><span>01</span><div><h3>Keep your confirmation</h3><p>Download your PDF and keep your order number handy.</p></div></li><li><span>02</span><div><h3>{zellePending?"We verify your transfer":"We coordinate the details"}</h3><p>{zellePending?"Our team checks the actual bank transaction. Your screenshot helps us match it to your order.":"Your concierge will help with arrival, timing and any requests still to be agreed."}</p></div></li><li><span>03</span><div><h3>Enjoy your Miami</h3><p>Your concierge confirms the final details and any outstanding balance before your experience.</p></div></li></ol></section>
          </div>
          <aside className={css.summary} aria-labelledby="payment-summary-heading"><div className={css.summaryHeading}><ShieldCheck size={21} /><p className={css.eyebrow}>CLEAR AT EVERY STEP</p></div><h2 id="payment-summary-heading">Your payment, at a glance.</h2><p className={css.summaryIntro}>All amounts in USD.</p><dl className={css.totals}><div><dt>Priced services</dt><dd>{money(order.knownTotalCents)}</dd></div><div><dt>{confirmation.balancePayment?"Remaining balance requested":order.paymentType==="full"?"Full payment requested · 100%":"Deposit requested · 30%"}</dt><dd>{money(confirmation.balancePayment?.amountCents??order.amountDueCents??order.depositCents)}</dd></div></dl>{zellePending&&<div className={css.submitted}><span>Submitted for verification</span><strong>{money(confirmation.balancePayment?.amountCents??order.amountDueCents??order.depositCents)}</strong><p>This amount is not yet counted as paid.</p></div>}<div className={css.paid}><div><span>{zelle||balancePending?"Verified paid":"Total paid"}</span><small>{zellePending?"Awaiting bank verification":received ? "Payment received" : "Awaiting payment"}</small></div><strong>{money(confirmation.paidCents)}</strong></div><div className={css.remaining}><span>{needsReview?"Unconfirmed priced balance":zellePending?"Outstanding until verified":"Remaining balance"}</span><strong>{money(confirmation.outstandingCents)}</strong></div><p className={css.balanceHint}>{needsReview?"Your concierge will review your booking before any further payment is requested.":balancePending?"Your confirmed reservation stays in place. Once this remaining payment is verified, your priced balance will be $0.00.":received ? confirmation.outstandingCents===0?"Your priced services are paid in full.":"Your concierge will confirm the balance due date before your experience." : zellePending?`Once your ${order.paymentType==="full"?"full payment":"deposit"} is verified, the remaining priced balance will be ${money(order.remainingCents)}.`:"This includes all priced services until your payment has been confirmed."}</p>{!!order.paymentHistory?.length&&<dl className={css.totals}><div><dt>Initial payment</dt><dd>{money(confirmation.paidCents-order.paymentHistory.reduce((sum,p)=>sum+p.amountCents,0))}</dd></div>{order.paymentHistory.map(p=><div key={p.reference}><dt>Balance received · {confirmationDate(p.paidAtIso)}</dt><dd>{money(p.amountCents)}</dd></div>)}</dl>}{hasQuotes && <p className={css.exclusion}>Price-on-request services are excluded.</p>}{confirmation.paymentMethod && <div className={css.paymentMethod}><CreditCardIcon /><span>{confirmation.paymentMethod}</span></div>}
            <button type="button" onClick={() => { void download(); }} disabled={downloading} className={css.primary}>{downloading ? <LoaderCircle size={16} className={css.spinner} /> : <Download size={16} />}<span>{downloading ? "Preparing your PDF…" : confirmed ? "Download confirmation" : "Download order summary"}</span><ArrowRight size={15} /></button><p className={css.downloadHint}><FileCheck2 size={12} />Your selection and payment details, in one PDF.</p>{downloadError && <p role="alert" className={css.error}>{downloadError}</p>}{(processing||zelle||balancePending) && <button className={css.refresh} type="button" onClick={() => router.refresh()}><Clock3 size={12} />Check confirmation status</button>}
            <div className={css.concierge}><Headphones size={24} /><div><strong>One call. Every detail.</strong><p>Your dedicated concierge is here.</p><Link href="/contact">Speak to your concierge<ArrowRight size={12} /></Link></div></div>
          </aside>
        </div>
        <div className={css.closing}><span>MIAMI, ON YOUR TERMS.</span><Link href="/">Back to Blackline<ArrowRight size={15} /></Link></div>
      </>}
      <footer className={css.footer}><span>© {new Date().getFullYear()} BLACKLINE CONCIERGE</span><div><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><span><LockKeyhole size={11} />Secure payment</span></div></footer>
    </div>
  </div>;
}

function CreditCardIcon() { return <FileCheck2 size={13} />; }
