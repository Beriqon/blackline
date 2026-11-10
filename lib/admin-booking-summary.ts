import type {AdminBooking} from "./admin-demo-data";
export function bookingPayment(b:AdminBooking){
 const hasQuotes=!!b.quoteRequest||!!b.linkedQuotes?.length||b.items.some(i=>i.priceFollows);
 const totalCents=b.stripeOrder?.knownTotalCents??b.zelleOrder?.knownTotalCents??Math.round(b.items.reduce((n,i)=>n+(i.priceFollows?0:i.price),0)*100);
 const released=b.status==="Cancelled";
 const method=b.zelleOrder?"Zelle":b.stripeOrder?"Stripe":b.quoteRequest?"Quote request":b.recordPayment?.method??"Manual";
 const paidCents=b.zelleOrder?(b.zelleOrder.status==="confirmed"?(b.zelleOrder.amountPaidCents??b.zelleOrder.amountDueCents??b.zelleOrder.depositCents):0):b.stripeOrder?.paidCents??b.recordPayment?.paidCents??null;
 const outstandingCents=b.quoteRequest||released||b.stripeOrder?.requiresReview?null:paidCents===null?null:Math.max(0,totalCents-paidCents);
 const verification=b.zelleOrder?.status==="payment_submitted"||b.balancePayment?.status==="zelle_submitted";
 const state=b.stripeOrder?.requiresReview?"review":b.quoteRequest?"quote":verification?"verification":released?"released":paidCents===null?"unrecorded":outstandingCents===0?"paid":paidCents>0?"deposit":"unpaid";
 const label={review:"Payment received — booking needs review",quote:"Quote requested",verification:"Zelle — awaiting bank verification",released:"Cancelled / hold released",unrecorded:"Payment not recorded",paid:"Paid in full",deposit:"Deposit paid — balance due",unpaid:b.zelleOrder?"Zelle — awaiting transfer":"Awaiting payment"}[state];
 return {method,totalCents,paidCents,outstandingCents,hasQuotes,quoteOnly:!!b.quoteRequest||b.items.every(i=>i.priceFollows),verification,state,label};
}
export function matchesPaymentFilter(b:AdminBooking,filter:string){
 const p=bookingPayment(b);
 return filter==="all"||filter==="expected"&&(p.outstandingCents??0)>0||filter==="verification"&&p.verification||filter===p.state;
}
