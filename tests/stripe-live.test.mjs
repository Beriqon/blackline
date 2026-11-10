import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {createRequire} from 'node:module';
import {loadStripeMode} from './load-stripe-mode.mjs';
const require=createRequire(import.meta.url);
const live={STRIPE_MODE:'live',STRIPE_LIVE_ENABLED:'true',NEXT_PUBLIC_APP_URL:'https://www.blacklineconcierge.group',NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:'pk_live_synthetic',STRIPE_SECRET_KEY:'sk_live_synthetic',STRIPE_WEBHOOK_SECRET:'whsec_synthetic'};
function load(path,mocks={},env=live){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(new URL('../'+path,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,{exports,require:id=>id.endsWith('/stripe-mode')?loadStripeMode(env):id==='server-only'?{}:id in mocks?mocks[id]:require(id),process:{env},URL,Request,Response,Error,Date,console,Set});return exports;}
test('live requires explicit opt-in, matching publishable key, production domain and environment',()=>{
 assert.equal(loadStripeMode(live).liveStripeEnabled(),true);
 for(const change of [{STRIPE_LIVE_ENABLED:undefined},{NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:'pk_test_synthetic'},{NEXT_PUBLIC_APP_URL:'http://www.blacklineconcierge.group'},{NEXT_PUBLIC_APP_URL:'https://localhost'},{NEXT_PUBLIC_APP_URL:'https://127.0.0.1'},{NEXT_PUBLIC_APP_URL:'https://example.com/path'},{NEXT_PUBLIC_APP_URL:'https://example.com?redirect=1'},{VERCEL_ENV:'preview'},{STRIPE_MODE:'typo'}])assert.equal(loadStripeMode({...live,...change}).liveStripeEnabled(),false);
 assert.equal(loadStripeMode({}).stripeMode(),'test');assert.equal(loadStripeMode(live).validStripeSessionId('cs_test_abc'),false);
});
test('live secrets are refused unless the entire live gate is satisfied',()=>{
 const module=env=>load('lib/stripe-client.ts',{},env);
 assert.equal(module({...live,STRIPE_LIVE_ENABLED:'false'}).getStripe(),null);
 assert.equal(module({...live,STRIPE_SECRET_KEY:'sk_test_synthetic'}).getStripe(),null);
 assert.equal(module({STRIPE_SECRET_KEY:'sk_live_synthetic'}).getStripe(),null);
 assert.ok(module(live).getStripe()); // Constructs the SDK only; no network calls.
});
test('live checkout uses live metadata and retains server-side inventory identifiers',async()=>{
 let params,attached;const order={id:'BL-LIVE-SYNTHETIC',testMode:false,customerEmail:'test@example.com',depositCents:3000,amountDueCents:3000,paymentType:'deposit',bookingIds:[]};
 const stripe={checkout:{sessions:{create:async p=>{params=p;return {id:'cs_live_synthetic',livemode:true,client_secret:'synthetic_secret'};}}}};
 const api=load('app/api/stripe/checkout/route.ts',{'next/server':{NextResponse:Response},'@/lib/stripe-client':{getStripe:()=>stripe,getBookingProduct:async()=> 'generic_live',getAppBaseUrl:()=>live.NEXT_PUBLIC_APP_URL},'@/lib/checkout-quote':{quoteCheckout:async()=>({order,bookings:[]})},'@/lib/checkout-orders':{saveCheckoutOrder:async()=>({...order,bookingIds:['live-activity-hold']}),orderDatabase:async(op,p)=>{attached={op,p};}}});
 const response=await api.POST(new Request('https://www.blacklineconcierge.group/api/stripe/checkout',{method:'POST',body:JSON.stringify({customerName:'Synthetic',customerEmail:'test@example.com',customerPhone:'+12025550100',expectedAmountCents:3000})}));
 assert.equal(response.status,200);assert.equal(params.metadata.integration,'blackline-live-v1');assert.equal(params.line_items[0].price_data.unit_amount,3000);assert.equal(order.bookingIds[0],'live-activity-hold');assert.equal(attached.p.sessionId,'cs_live_synthetic');assert.deepEqual([...params.excluded_payment_method_types],['klarna']);
});
test('live fulfillment rejects cross-environment sessions and validates references',async()=>{
 const calls=[];const api=load('lib/stripe-fulfillment.ts',{'./checkout-orders':{orderDatabase:async(op,p)=>{calls.push({op,p});return {id:'BL-LIVE',testMode:false};}}});
 const s={id:'cs_live_unit',livemode:true,payment_status:'paid',client_reference_id:'BL-LIVE',amount_total:3000,currency:'usd',metadata:{integration:'blackline-live-v1',order_id:'BL-LIVE'}};
 await api.fulfillTestSession({...s,livemode:false},'evt_wrong_mode');assert.equal(calls.length,0);
 await api.fulfillTestSession(s,'evt_live_mock');assert.equal(calls.at(-1).op,'paid');assert.equal(calls.at(-1).p.amountCents,3000);
 await assert.rejects(()=>api.fulfillTestSession({...s,client_reference_id:'OTHER'},'evt_bad'));
});
test('live order repository selects the live RPC while test mode keeps the old RPC',async()=>{
 for(const [env,expected] of [[live,'blackline_checkout_live'],[{},'blackline_checkout_order']]){let called;const api=load('lib/checkout-orders.ts',{'./supabase-server':{publicDatabase:()=>({rpc:async(name)=>{called=name;return {data:{}};}})}},{...env,BLACKLINE_BOOKING_TOKEN:'synthetic'});await api.orderDatabase('get',{sessionId:'synthetic'});assert.equal(called,expected);}
});
test('live receipts use cumulative confirmed payments and expose inventory-review cases honestly',async()=>{
 const order={id:'BL-LIVE',testMode:false,status:'deposit_paid',knownTotalCents:10000,depositCents:3000,amountDueCents:3000,amountPaidCents:10000,remainingCents:0,lines:[]};
 const api=load('lib/order-confirmation.ts',{'./stripe-client':{getStripe:()=>({checkout:{sessions:{retrieve:async()=>({id:'cs_live_receipt',livemode:true,payment_status:'paid',client_reference_id:order.id,metadata:{integration:'blackline-live-v1',order_id:order.id},currency:'usd',amount_total:3000})}}})},'./checkout-orders':{orderDatabase:async()=>order},'./stripe-fulfillment':{},'./catalog-server':{publicProducts:async()=>[]}});
 const receipt=await api.getOrderConfirmation('cs_live_receipt');assert.equal(receipt.status,'confirmed');assert.equal(receipt.paidCents,10000);assert.equal(receipt.outstandingCents,0);assert.equal(receipt.order.testMode,false);
 order.status='payment_review';order.amountPaidCents=3000;order.remainingCents=7000;
 const review=await api.getOrderConfirmation('cs_live_receipt');assert.equal(review.status,'review');assert.equal(review.paidCents,3000);assert.equal(review.outstandingCents,7000);
 assert.equal(await api.getOrderConfirmation('cs_test_other'),null);
});
test('live balance webhooks cannot settle a test parent or charge an invented amount',async()=>{
 let paid=0;const record={id:'balance-live',source:'stripe',orderId:'BL-LIVE',amountCents:7000,order:{testMode:false}};
 const api=load('lib/balance-fulfillment.ts',{'./balance-server':{balanceDatabase:async(op)=>{if(op==='paid')paid++;return record;}}});
 const s={id:'cs_live_balance',livemode:true,payment_status:'paid',client_reference_id:'BL-LIVE',metadata:{integration:'blackline-balance-live-v1',order_id:'BL-LIVE',balance_id:record.id},currency:'usd',amount_total:7000};
 await api.fulfillBalanceSession(s,'evt_live_balance');assert.equal(paid,1);
 await assert.rejects(()=>api.fulfillBalanceSession({...s,amount_total:1},'evt_bad'));record.order.testMode=true;await assert.rejects(()=>api.fulfillBalanceSession(s,'evt_cross_environment'));assert.equal(paid,1);
});
