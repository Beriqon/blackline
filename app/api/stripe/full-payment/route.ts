import {stripeMode,stripeIntegration,validStripeSessionId} from "@/lib/stripe-mode";
import {randomUUID} from "node:crypto";
import {NextResponse} from "next/server";
import {getStripe,getBookingProduct,getAppBaseUrl} from "@/lib/stripe-client";
import {orderDatabase,type CheckoutOrder} from "@/lib/checkout-orders";
import {publicDatabase} from "@/lib/supabase-server";
import {sameOrigin} from "@/lib/zelle-server";
export const runtime="nodejs";
export async function POST(request:Request){
 if(!sameOrigin(request))return NextResponse.json({error:"Invalid request origin."},{status:403});
 let nextOrder:CheckoutOrder|undefined;let sessionId:string|undefined;
 const stripe=getStripe();if(!stripe)return NextResponse.json({error:"Checkout is unavailable."},{status:503});
 try{
  const body=await request.json();if(typeof body.sessionId!=="string"||!validStripeSessionId(body.sessionId))return NextResponse.json({error:"Invalid checkout."},{status:400});
  const old=await stripe.checkout.sessions.retrieve(body.sessionId);
  if(old.livemode!==(stripeMode()==="live")||old.metadata?.integration!==stripeIntegration()||old.status==="complete"||old.payment_status==="paid")return NextResponse.json({error:"This payment cannot be changed. Contact your concierge if you have already paid."},{status:409});
  if(old.status==="open")await stripe.checkout.sessions.expire(old.id);
  if(stripeMode()==="live")nextOrder=await orderDatabase<CheckoutOrder>("upgrade",{sessionId:old.id,orderId:`BL-${randomUUID().toUpperCase()}`});
  else{const {data,error}=await publicDatabase().rpc("blackline_full_checkout",{token:process.env.BLACKLINE_BOOKING_TOKEN,payload:{sessionId:old.id,orderId:`BL-${randomUUID().toUpperCase()}`}});if(error)throw Error(error.message);nextOrder=data as CheckoutOrder;}
  if(nextOrder.stripeSessionId)return NextResponse.json({url:`/payment/checkout?session_id=${encodeURIComponent(nextOrder.stripeSessionId)}`});
  const product=await getBookingProduct(stripe);
  const session=await stripe.checkout.sessions.create({mode:"payment",ui_mode:"elements",adaptive_pricing:{enabled:false},customer_email:nextOrder.customerEmail,client_reference_id:nextOrder.id,expires_at:Math.floor(Date.now()/1000)+1800,line_items:[{quantity:1,price_data:{currency:"usd",unit_amount:nextOrder.knownTotalCents,product}}],metadata:{order_id:nextOrder.id,payment_type:"full",integration:stripeIntegration(),payment_policy:"full-klarna-v1"},payment_intent_data:{description:`Full payment · ${nextOrder.id}`,metadata:{order_id:nextOrder.id}},return_url:`${getAppBaseUrl()}/payment/success?session_id={CHECKOUT_SESSION_ID}`},{idempotencyKey:`checkout:${nextOrder.id}`});
  sessionId=session.id;if(session.livemode!==(stripeMode()==="live")||!session.client_secret)throw Error("Invalid checkout.");
  await orderDatabase("attach",{orderId:nextOrder.id,sessionId});
  return NextResponse.json({url:`/payment/checkout?session_id=${encodeURIComponent(sessionId)}`});
 }catch{
  try{if(sessionId)await stripe.checkout.sessions.expire(sessionId);if(nextOrder&&!nextOrder.stripeSessionId)await orderDatabase("abort",{orderId:nextOrder.id});}catch{}
  return NextResponse.json({error:"Could not switch to full payment. Return to your selection to check availability and try again. If you already paid, contact your concierge before paying again."},{status:409});
 }
}
