import {AdminBalancePayment} from "./admin-balance-payment";
import type {AdminBooking} from "@/lib/admin-demo-data";
import {confirmationMoney} from "@/lib/order-confirmation-view";
import styles from "@/app/admin/dashboard/dashboard.module.css";
import css from "./admin-bookings.module.css";

export function AdminStripeBooking({booking,onClose,onUpdated}:{booking:AdminBooking;onClose:()=>void;onUpdated?:()=>void}){
 const payment=booking.stripeOrder!;
 return <><div className={styles.dialogBody}>
  <span className={css.testBadge}>{booking.testMode?"STRIPE TEST · NO REAL MONEY":"STRIPE · LIVE PAYMENT"}</span>{payment.requiresReview&&<p className={styles.error}>Payment received — booking needs manual review. {payment.reviewReason} Do not request another payment until this is resolved.</p>}
  <p className={css.reference}>{booking.id}</p>
  <p className={styles.formHint}>{payment.remainingCents===0?"Full payment confirmed.":"30% deposit confirmed."} Services marked “Price follows” still require a proposal and guest approval.</p>
  <dl className={css.details}>{[["Guest",booking.name],["Email",booking.email],["Phone",booking.phone||"Not provided"],["Payment status",payment.remainingCents===0?"Paid in full":"Deposit received"],["Order created",new Date(payment.createdAtIso).toLocaleString("en-US")],["Payment confirmed",payment.paidAtIso?new Date(payment.paidAtIso).toLocaleString("en-US"):"Confirmed"]].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
  <h3>Experiences in this order</h3>
  {booking.items.map((item,index)=><article key={index} className={css.orderItem}>{item.imageSrc&&<img src={item.imageSrc} alt=""/>}<div><strong>{item.product}</strong><p>{item.description}</p>{item.start&&<p>{new Date(item.start).toLocaleString("en-US")} — {new Date(item.end).toLocaleString("en-US")}</p>}<strong>{item.priceFollows?"Price follows":confirmationMoney(Math.round(item.price*100))}</strong>{item.priceFollows&&<p>Not included in the deposit or outstanding balance. Awaiting proposal.</p>}</div></article>)}
  <dl className={css.paymentSummary}>{[["Known-priced services",payment.knownTotalCents],["Total payments received",payment.paidCents],["Remaining for priced services",payment.remainingCents]].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{confirmationMoney(Number(value))}</dd></div>)}</dl>
  {!payment.requiresReview&&<AdminBalancePayment booking={booking} onUpdated={onUpdated}/>}
  <p className={styles.formHint}>This is a read-only payment record. Viewing it does not charge the customer, issue a refund or change availability. Test orders are labeled and excluded from live booking value.</p>
 </div><div className={styles.dialogActions}><button type="button" className={styles.secondary} onClick={onClose}>Close</button></div></>;
}
