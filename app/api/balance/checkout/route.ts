import {stripeMode,stripeIntegration,stripePublishableKeyValid} from "@/lib/stripe-mode";
import {balanceAccess,balanceDatabase,balancePath} from '@/lib/balance-server';
import {getStripe,getBookingProduct,getAppBaseUrl} from '@/lib/stripe-client';
import {sameOrigin} from '@/lib/zelle-server';
import {fulfillBalanceSession} from '@/lib/balance-fulfillment';
export const runtime='nodejs';
export async function POST(request:Request){
 if(!sameOrigin(request))return Response.json({error:'Invalid request origin.'},{status:403});
 try{
 const body=await request.json();if(typeof body.id!=='string'||typeof body.token!=='string')return Response.json({error:'Invalid payment link.'},{status:403});
 let record=await balanceAccess(body.id,body.token);if(!record)return Response.json({error:'Invalid payment link.'},{status:404});
 if(record.status==='paid')return Response.json({paid:true});
 if(new Date(record.expiresAtIso).getTime()<=Date.now())return Response.json({error:'This link has expired. Ask your concierge for an updated link.'},{status:410});
 const stripe=getStripe();if(!stripe||!process.env.STRIPE_WEBHOOK_SECRET||!stripePublishableKeyValid()||record.source!=='stripe'||record.order.testMode!==(stripeMode()==="test"))return Response.json({error:'Payment is unavailable for this order in the current environment.'},{status:503});
 let session=record.sessionId?await stripe.checkout.sessions.retrieve(record.sessionId):null;
 if(session?.payment_status==='paid'){await fulfillBalanceSession(session,`return:${session.id}`);return Response.json({paid:true});}
 if(session?.status==='expired'){await balanceDatabase('expire',{sessionId:session.id});record=await balanceAccess(body.id,body.token);session=null;}
 if(!record)throw Error('Payment unavailable');
 if(!session){
 const product=await getBookingProduct(stripe);
 session=await stripe.checkout.sessions.create({mode:'payment',ui_mode:'elements',adaptive_pricing:{enabled:false},client_reference_id:record.orderId,customer_email:record.order.customerEmail,expires_at:Math.floor(Date.now()/1000)+30*60,
 // Paying the entire outstanding balance is eligible for Klarna.
 line_items:[{quantity:1,price_data:{currency:'usd',unit_amount:record.amountCents,product}}],
 metadata:{integration:stripeIntegration(true),balance_id:record.id,order_id:record.orderId,payment_type:'balance'},payment_intent_data:{description:`Remaining balance · ${record.orderId}`,metadata:{order_id:record.orderId,balance_id:record.id}},return_url:getAppBaseUrl()+balancePath(record.id)},
 {idempotencyKey:`balance:${record.id}:${record.attempt}`});
 await balanceDatabase('attach',{id:record.id,newSessionId:session.id});
 }
 if(session.livemode!==(stripeMode()==="live")||!session.client_secret||session.amount_total!==record.amountCents||session.currency!=='usd'||session.metadata?.balance_id!==record.id)throw Error('Invalid payment session');
 return Response.json({clientSecret:session.client_secret,sessionId:session.id},{headers:{'Cache-Control':'no-store'}});
 }catch{return Response.json({error:'Could not start your balance payment. Please try again or contact your concierge.'},{status:409});}
}
