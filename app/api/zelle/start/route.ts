import {stripeMode,stripeIntegration,validStripeSessionId} from "@/lib/stripe-mode";
import {orderDatabase} from "@/lib/checkout-orders";
import {NextResponse} from "next/server";
import {getStripe} from "@/lib/stripe-client";
import {grantZelleAccess,sameOrigin,zelleDatabase} from "@/lib/zelle-server";
import type {ZelleOrder} from "@/lib/zelle-types";
export const runtime="nodejs";
export async function POST(request:Request){
 if(!sameOrigin(request))return NextResponse.json({error:"Invalid request origin."},{status:403});
 try{
  const {sessionId}=await request.json();if(typeof sessionId!=="string"||!validStripeSessionId(sessionId))return NextResponse.json({error:"Invalid checkout."},{status:400});
  const stripe=getStripe();if(!stripe)throw Error("Checkout is unavailable.");
  const session=await stripe.checkout.sessions.retrieve(sessionId);
  if(session.livemode!==(stripeMode()==="live")||session.metadata?.integration!==stripeIntegration()||session.status==="complete"||session.payment_status==="paid")return NextResponse.json({error:"This checkout cannot switch to Zelle. If you already paid, contact your concierge."},{status:409});
  // Stop card collection before opening a real bank-transfer order.
  if(session.status==="open")await stripe.checkout.sessions.expire(sessionId);
  const order=stripeMode()==="live"?await orderDatabase<ZelleOrder>("zelle",{sessionId}):await zelleDatabase<ZelleOrder>("create",{sessionId});
  await grantZelleAccess(order.id);
  return NextResponse.json({url:`/payment/zelle?order_id=${encodeURIComponent(order.id)}`},{headers:{"Cache-Control":"no-store"}});
 }catch{return NextResponse.json({error:"Could not reserve this selection for Zelle. It may already be booked. Refresh your selection or contact your concierge before transferring money."},{status:409});}
}
