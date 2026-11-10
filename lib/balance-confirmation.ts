import 'server-only';
import type {BalanceRecord} from './balance-types';
import type {OrderConfirmation} from './order-confirmation-view';
import {publicProducts} from './catalog-server';
import {getStripe} from './stripe-client';
import {balanceAccess} from './balance-server';
import {fulfillBalanceSession} from './balance-fulfillment';
export async function loadBalance(id:string,token:string){
 let record=await balanceAccess(id,token);if(!record)return null;
 if(record.source==='stripe'&&record.sessionId&&record.status==='stripe_open'){
  try{const stripe=getStripe();const session=stripe?await stripe.checkout.sessions.retrieve(record.sessionId):null;if(session?.payment_status==='paid'){await fulfillBalanceSession(session,`return:${session.id}`);record=await balanceAccess(id,token);}}catch{/* Webhook retries remain authoritative. Never show unrecorded funds as paid. */}
 }
 return record;
}
export async function balanceConfirmation(record:BalanceRecord):Promise<OrderConfirmation>{
 const o=record.order;let pictures=Object.fromEntries(o.lines.map(l=>[l.productId,l.imageSrc??'']));
 try{const products=await publicProducts();pictures=Object.fromEntries(o.lines.map(l=>[l.productId,l.imageSrc||products.find(p=>p.id===l.productId)?.images.split('\n').find(Boolean)||'']));}catch{}
 const paid=o.amountPaidCents??o.amountDueCents??o.depositCents;
 return {order:{...o,testMode:o.testMode,status:'deposit_paid'},status:'confirmed',paidCents:paid,outstandingCents:Math.max(0,o.knownTotalCents-paid),paymentMethod:record.source==='stripe'?(o.testMode?'Stripe · test payment':'Stripe'):'Zelle · bank transfer',pictures,balancePayment:{status:record.status,amountCents:record.amountCents,submittedAtIso:record.submittedAtIso,reviewNote:record.reviewNote}};
}
