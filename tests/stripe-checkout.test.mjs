import {loadStripeMode} from './load-stripe-mode.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import ts from 'typescript';
import Stripe from 'stripe';
import {depositCents,experienceTotalCents,findCartProduct} from '../lib/checkout-pricing.ts';

const require=createRequire(import.meta.url);
function load(path,mocks={},env={}){
 const source=ts.transpileModule(fs.readFileSync(new URL('../'+path,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
 const exports={};
 vm.runInNewContext(source,{exports,require:id=>id.endsWith('/stripe-mode')?loadStripeMode(env):id==='server-only'?{}:id in mocks?mocks[id]:id==='stripe'?{__esModule:true,default:Stripe}:require(id),process:{env},Request,Response,Error,console,Date,Set,URL});
 return exports;
}
const product={id:'catalog:jetskis-jetcars:ski',service:'jetskis-jetcars',status:'visible',price:150.25,unit:'per hour',rates:'$150.25 per hour',name:'Jet ski'};
const item={id:product.id,href:'/services/jetskis-jetcars',quantity:1,experienceSelection:{date:'2027-03-10',hours:3,units:2},priceHint:'$1',bookingQuote:{totalUsd:1}};

test('cart payment button sends the reviewed deposit to checkout',async()=>{
 const source=fs.readFileSync(new URL('../components/cart-drawer.tsx',import.meta.url),'utf8');
 const ast=ts.createSourceFile('cart-drawer.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 let callback;
 function visit(node){
  if(ts.isVariableDeclaration(node)&&node.name.getText(ast)==='startCheckout')callback=node.initializer.arguments[0].getText(ast);
  ts.forEachChild(node,visit);
 }
 visit(ast);assert.ok(callback);
 const reviewedItems=[{id:'car'},{id:'villa'}];let sent,redirect;
 const context={canPay:true,hasContactDetails:true,currentPrice:{depositCents:20970},payMode:'deposit',items:reviewedItems,addonsForRequest:{},customerName:'Test',customerEmail:'test@example.com',customerPhoneFull:'+12025550101',setCheckoutError:()=>{},setCheckoutLoading:()=>{},t:key=>key,window:{location:{set href(value){redirect=value;}}},fetch:async(url,request)=>{sent={url,body:JSON.parse(request.body)};return Response.json({url:'https://checkout.stripe.com/test'});}};
 const compiled=ts.transpileModule(`(${callback})`,{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText;
 const run=vm.runInNewContext(compiled,context);
 await run();assert.equal(sent.url,'/api/stripe/checkout');assert.equal(sent.body.expectedDepositCents,20970);
 assert.deepEqual(sent.body.items,reviewedItems);assert.equal(redirect,'https://checkout.stripe.com/test');
});

test('checkout creates embedded USD Elements sessions with dynamic methods and an internal redirect',async()=>{
 let params,attached;
 const order={id:'BL-embedded',depositCents:24000,customerEmail:'test@example.com',customerName:'Test',customerPhone:'+12025550101'};
 const stripe={checkout:{sessions:{create:async value=>{params=value;return {id:'cs_test_embedded',client_secret:'cs_test_embedded_secret_test',livemode:false};}}}};
 const {POST}=load('app/api/stripe/checkout/route.ts',{
  'next/server':{NextResponse:Response},
  '@/lib/stripe-client':{getStripe:()=>stripe,getBookingProduct:async()=> 'blackline_booking_test_v1',getAppBaseUrl:()=> 'http://localhost:3000'},
  '@/lib/checkout-quote':{quoteCheckout:async()=>({order,bookings:[]})},
  '@/lib/checkout-orders':{saveCheckoutOrder:async()=>{},orderDatabase:async(op,value)=>{attached={op,value};}},
 },{STRIPE_WEBHOOK_SECRET:'whsec_test',NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:'pk_test_example'});
 const body={...order,expectedDepositCents:24000};
 const response=await POST(new Request('http://localhost/api/stripe/checkout',{method:'POST',body:JSON.stringify(body)}));
 assert.equal(response.status,200);assert.equal((await response.json()).url,'/payment/checkout?session_id=cs_test_embedded');
 assert.equal(params.ui_mode,'elements');assert.equal(params.payment_method_types,undefined);assert.equal(params.adaptive_pricing.enabled,false);
 assert.deepEqual(Array.from(params.excluded_payment_method_types),['klarna']);assert.equal(params.wallet_options.link.display,'never');
 assert.equal(params.line_items[0].price_data.currency,'usd');assert.equal(params.line_items[0].price_data.unit_amount,24000);
 assert.equal(params.success_url,undefined);assert.match(params.return_url,/payment\/success\?session_id=/);assert.equal(attached.op,'attach');
});

test('full checkout charges the whole priced total and permits Klarna and Link',async()=>{
 let params;const order={id:'BL-full',paymentType:'full',knownTotalCents:100000,depositCents:30000,amountDueCents:100000,remainingCents:0,customerName:'Test',customerEmail:'test@example.com',customerPhone:'+12025550101'};
 const {POST}=load('app/api/stripe/checkout/route.ts',{'next/server':{NextResponse:Response},'@/lib/stripe-client':{getStripe:()=>({checkout:{sessions:{create:async value=>{params=value;return {id:'cs_test_full',client_secret:'cs_test_full_secret',livemode:false};}}}}),getBookingProduct:async()=> 'generic',getAppBaseUrl:()=> 'http://localhost:3000'},'@/lib/checkout-quote':{quoteCheckout:async()=>({order,bookings:[]})},'@/lib/checkout-orders':{saveCheckoutOrder:async()=>{},orderDatabase:async()=>{}}},{STRIPE_WEBHOOK_SECRET:'whsec_test',NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:'pk_test_example'});
 const response=await POST(new Request('http://localhost/api/stripe/checkout',{method:'POST',body:JSON.stringify({...order,expectedAmountCents:100000,expectedDepositCents:30000})}));
 assert.equal(response.status,200);assert.equal(params.line_items[0].price_data.unit_amount,100000);assert.equal(params.metadata.payment_type,'full');assert.equal(params.excluded_payment_method_types,undefined);assert.equal(params.wallet_options,undefined);
});

test('checkout refuses a changed reviewed amount before saving or charging',async()=>{
 let saved=false;
 const {POST}=load('app/api/stripe/checkout/route.ts',{
  'next/server':{NextResponse:Response},'@/lib/stripe-client':{getStripe:()=>({})},
  '@/lib/checkout-quote':{quoteCheckout:async()=>({order:{depositCents:24000},bookings:[]})},
  '@/lib/checkout-orders':{saveCheckoutOrder:async()=>{saved=true;}},
 },{STRIPE_WEBHOOK_SECRET:'whsec_test',NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:'pk_test_example'});
 const response=await POST(new Request('http://localhost/api/stripe/checkout',{method:'POST',body:JSON.stringify({customerName:'Test',customerEmail:'test@example.com',customerPhone:'+12025550101',expectedDepositCents:1})}));
 assert.equal(response.status,409);assert.equal(saved,false);
});

test('reserved test dates return an actionable conflict instead of a generic checkout failure',async()=>{
 let stripeCalls=0;
 const {POST}=load('app/api/stripe/checkout/route.ts',{
  'next/server':{NextResponse:Response},
  '@/lib/stripe-client':{getStripe:()=>({checkout:{sessions:{create:async()=>{stripeCalls++;}}}}),getBookingProduct:async()=> 'blackline_booking_test_v1'},
  '@/lib/checkout-quote':{quoteCheckout:async()=>({order:{depositCents:24000},bookings:[]})},
  '@/lib/checkout-orders':{saveCheckoutOrder:async()=>{throw new Error('This test booking slot is no longer available.');}},
 },{STRIPE_WEBHOOK_SECRET:'whsec_test',NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:'pk_test_example'});
 const response=await POST(new Request('http://localhost/api/stripe/checkout',{method:'POST',body:JSON.stringify({customerName:'Test',customerEmail:'test@example.com',customerPhone:'+12025550101',expectedDepositCents:24000})}));
 assert.equal(response.status,409);assert.match((await response.json()).error,/choose different dates/i);assert.equal(stripeCalls,0);
});

test('payment confirmation clears only matching cart selections and preserves new dates',()=>{
 function apply(items,paidKeys){
  let clear=false;const removed=[];
  const component=load('components/cart-after-payment.tsx',{'react':{useEffect:effect=>effect()},'@/components/cart-context':{useCart:()=>({items,clear:()=>{clear=true;},removeItem:key=>removed.push(key)})}});
  component.CartAfterPayment({paidKeys});return {clear,removed};
 }
 assert.deepEqual(apply([{key:'paid-car-date1'},{key:'paid-villa'}],['paid-car-date1','paid-villa']),{clear:true,removed:[]});
 assert.deepEqual(apply([{key:'paid-car-date1'},{key:'new-car-date2'}],['paid-car-date1']),{clear:false,removed:['paid-car-date1']});
 assert.deepEqual(apply([{key:'new-car-date2'}],['paid-car-date1']),{clear:false,removed:[]});
 assert.deepEqual(apply([],['paid-car-date1']),{clear:false,removed:[]});
});

test('embedded payment confirms with the server return URL and keeps errors on the form',async()=>{
 const source=fs.readFileSync(new URL('../components/stripe-payment-form.tsx',import.meta.url),'utf8');
 const ast=ts.createSourceFile('stripe-payment-form.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 let confirmSource;
 function visit(node){if(ts.isFunctionDeclaration(node)&&node.name?.text==='confirm')confirmSource=node.getText(ast);ts.forEachChild(node,visit);}
 visit(ast);assert.ok(confirmSource);
 let options,redirect,error,busy=false,result={type:'success'};
 const context={successUrl:undefined,state:{type:'success',checkout:{confirm:async args=>{options=args;return result;}}},busy:false,order:{stripeSessionId:'cs_test_confirm'},setBusy:value=>{busy=value;},setError:value=>{error=value;},genericError:'Please retry',window:{location:{assign:value=>{redirect=value;}}},encodeURIComponent};
 const compiled=ts.transpileModule(`(${confirmSource})`,{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText;
 const confirm=vm.runInNewContext(compiled,context);
 await confirm();assert.equal(options.returnUrl,undefined);assert.equal(options.redirect,'if_required');assert.equal(redirect,'/payment/success?session_id=cs_test_confirm');assert.equal(busy,false);
 redirect=undefined;result={type:'error',error:{message:'Your card was declined'}};
 await confirm();assert.equal(error,'Your card was declined');assert.equal(redirect,undefined);assert.equal(busy,false);
});

test('deposit uses cents, including fractional-dollar rounding',()=>{
 assert.equal(depositCents(80000),24000);assert.equal(depositCents(1001),300);
 assert.equal(depositCents(1005),302);assert.throws(()=>depositCents(NaN));assert.throws(()=>depositCents(-10));
});
test('hourly activities use database rates, hours and units; browser prices have no effect',()=>{
 assert.equal(experienceTotalCents(item,product),90150);
 assert.equal(experienceTotalCents({...item,priceHint:'$999999'},product),90150);
 for(const rates of ['From $150','Starting at $150','$150+ / hr','$150–200'])assert.equal(experienceTotalCents(item,{...product,rates}),null);
 assert.equal(experienceTotalCents(item,{...product,unit:'on request'}),null);
 assert.equal(experienceTotalCents(item,{...product,service:'villas'}),null);
 assert.throws(()=>experienceTotalCents({...item,experienceSelection:{...item.experienceSelection,hours:-1}},product));
 assert.throws(()=>experienceTotalCents({...item,experienceSelection:{...item.experienceSelection,units:1.5}},product));
});
test('hidden products and cross-service identities cannot supply prices',()=>{
 assert.equal(findCartProduct(item,[product]),product);
 assert.equal(findCartProduct(item,[{...product,status:'hidden'}]),undefined);
 assert.equal(findCartProduct({...item,href:'/services/villas'},[product]),undefined);
});
test('a mixed quote retains every line and charges only known database prices',async()=>{
 const car={id:'catalog:exotic-cars:car',service:'exotic-cars',status:'visible',name:'Car',price:500,unit:'per day'};
 const villa={id:'catalog:villas:villa',service:'villas',status:'visible',name:'Villa',price:0,unit:'on request'};
 const pricing={depositCents,experienceTotalCents,findCartProduct};
 const {quoteCheckout}=load('lib/checkout-quote.ts',{
  './booking-time':require('../lib/booking-time.ts'),
  './catalog-server':{publicProducts:async()=>[car,product,villa],publishedProduct:async()=>({})},
  './bookings-store':{prepareBookingRecord:async()=>({id:'bk_test',totalUsd:500})},
  './bookings':{computeBookingQuote:()=>({payableOnline:true,totalUsd:500,description:'One day'}),getExoticCarById:()=>({}),getExoticCarBookingModes:()=>['self-drive']},
  './yachts-data':{getYachtBySlug:()=>({})},'./checkout-pricing':pricing,
 });
 const body={customerName:'Test',customerEmail:'test@example.com',items:[{id:'car',href:'/services/exotic-cars/car',category:'exotic-car',quantity:1,bookingSelection:{category:'exotic-car',itemId:'car',rentalMode:'self-drive'},bookingQuote:{totalUsd:1}},item,{id:'villa',category:'other',href:'/services/villas/villa',quantity:1,bookingQuote:{totalUsd:999999}}],addons:{photoshoot:true}};
 const {order,bookings}=await quoteCheckout(body);
 assert.equal(order.lines.length,4);assert.equal(order.knownTotalCents,140150);assert.equal(order.depositCents,42045);assert.equal(order.remainingCents,98105);
 assert.equal(order.lines[2].totalCents,null);assert.equal(order.lines[2].status,'price_follows');assert.equal(bookings[0].orderId,order.id);
 assert.equal(bookings[0].paymentMode,'stripe');
 await assert.rejects(()=>quoteCheckout({...body,items:[...body.items,body.items[0]]}),/twice/);
});
test('live API keys are refused before Stripe requests can be made',()=>{
 for(const key of ['sk_live_example','rk_live_example','not-a-key',''])assert.equal(load('lib/stripe-client.ts',{}, {STRIPE_SECRET_KEY:key}).getStripe(),null);
 assert.ok(load('lib/stripe-client.ts',{}, {STRIPE_SECRET_KEY:'sk_test_example'}).getStripe());
});
test('one deterministic generic product is reused across payments',async()=>{
 const {getBookingProduct}=load('lib/stripe-client.ts');
 let created=0;const products=new Map();
 const stripe={products:{retrieve:async id=>{if(!products.has(id))throw new Stripe.errors.StripeInvalidRequestError({code:'resource_missing'});return products.get(id);},create:async args=>{created++;products.set(args.id,{...args,active:true});return args;}}};
 assert.equal(await getBookingProduct(stripe),'blackline_booking_test_v1');assert.equal(await getBookingProduct(stripe),'blackline_booking_test_v1');assert.equal(created,1);
});
test('webhook verifies real Stripe signatures, refuses live events, and retries failed persistence',async()=>{
 const secret='whsec_unit_test_only',stripe=new Stripe('sk_test_example');
 let handled=0,fail=false;
 const {POST}=load('app/api/stripe/webhook/route.ts',{
  '@/lib/balance-fulfillment':{fulfillBalanceSession:async()=>{}},
  '@/lib/balance-server':{balanceDatabase:async()=>{}},
  'next/server':{NextResponse:Response},'@/lib/stripe-client':{getStripe:()=>stripe},
  '@/lib/stripe-fulfillment':{fulfillTestSession:async()=>{handled++;if(fail)throw new Error('db unavailable');}},
  '@/lib/checkout-orders':{orderDatabase:async()=>{}},
 },{STRIPE_WEBHOOK_SECRET:secret});
 const send=async(livemode=false,signature=true)=>{
  const payload=JSON.stringify({id:'evt_test',type:'checkout.session.completed',livemode,data:{object:{id:'cs_test_example'}}});
  return POST(new Request('http://localhost/api/stripe/webhook',{method:'POST',body:payload,headers:signature?{'stripe-signature':stripe.webhooks.generateTestHeaderString({payload,secret})}:{}}));
 };
 assert.equal((await send(false,false)).status,400);assert.equal(handled,0);
 assert.equal((await send(true)).status,400);assert.equal(handled,0);
 assert.equal((await send()).status,200);assert.equal(handled,1);
 fail=true;assert.equal((await send()).status,500);
});
test('fulfillment checks payment state, mode, integration, order reference and amount',async()=>{
 const calls=[];
 const {fulfillTestSession}=load('lib/stripe-fulfillment.ts',{'./checkout-orders':{orderDatabase:async(operation,payload)=>{calls.push([operation,payload]);return {id:'BL-test'};}}});
 const session={id:'cs_test',livemode:false,payment_status:'paid',client_reference_id:'BL-test',metadata:{order_id:'BL-test',integration:'blackline-test-v1'},amount_total:24000,currency:'usd'};
 for(const change of [{livemode:true},{payment_status:'unpaid'},{metadata:{}}])await fulfillTestSession({...session,...change},'evt_test');
 assert.equal(calls.length,0);
 await assert.rejects(()=>fulfillTestSession({...session,client_reference_id:'other'},'evt_test'));
 await fulfillTestSession(session,'evt_test');assert.equal(calls[1][0],'paid');assert.equal(calls[1][1].amountCents,24000);
});
