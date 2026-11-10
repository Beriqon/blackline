import {stripeMode,stripeIntegration} from "./stripe-mode";
import 'server-only';
import type Stripe from 'stripe';
import {balanceDatabase} from './balance-server';
export async function fulfillBalanceSession(session:Stripe.Checkout.Session,eventId:string){
 if(session.livemode!==(stripeMode()==="live")||session.metadata?.integration!==stripeIntegration(true)||session.payment_status!=='paid')return;
 const record=await balanceDatabase('get',{sessionId:session.id});
 if(!record||record.source!=='stripe'||record.order.testMode!==(stripeMode()==="test")||record.id!==session.metadata.balance_id||record.orderId!==session.metadata.order_id||session.client_reference_id!==record.orderId||session.currency!=='usd'||session.amount_total!==record.amountCents)throw Error('Balance payment mismatch.');
 await balanceDatabase('paid',{sessionId:session.id,amountCents:session.amount_total,currency:session.currency,eventId});
}
