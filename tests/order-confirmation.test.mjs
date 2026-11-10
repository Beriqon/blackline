import {loadStripeMode} from './load-stripe-mode.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import ts from 'typescript';
import {confirmationLineAmounts,confirmationMoney,confirmationDate} from '../lib/order-confirmation-view.ts';

const require=createRequire(import.meta.url);
function load(path,mocks={},globals={}){
 const source=ts.transpileModule(fs.readFileSync(new URL('../'+path,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
 const exports={};vm.runInNewContext(source,{exports,require:id=>id.endsWith('/stripe-mode')?loadStripeMode((globals.process?.env??process.env)):id==='server-only'?{}:id in mocks?mocks[id]:require(id),process,Request,Response,Error,Date,Set,Buffer,URL,AbortSignal,console,...globals});return exports;
}
const order={id:'BL-confirmation',testMode:true,status:'deposit_paid',customerName:'Avery Test',customerEmail:'test@example.com',createdAtIso:'2026-11-08T21:00:00Z',knownTotalCents:3015,depositCents:905,remainingCents:2110,bookingIds:[],lines:[{productId:'car',title:'Car',totalCents:1005},{productId:'yacht',title:'Yacht',totalCents:1005},{productId:'activity',title:'Activity',totalCents:1005},{productId:'villa',title:'Villa',totalCents:null}]};

test('line payments add up exactly to the actual payment, excluding quote-only services',()=>{
 const lines=confirmationLineAmounts(order,905);
 assert.deepEqual(lines.map(l=>l.paidCents),[302,302,301,null]);
 assert.equal(lines.reduce((sum,l)=>sum+(l.paidCents??0),0),905);
 assert.equal(lines.reduce((sum,l)=>sum+(l.remainingCents??0),0),2110);
 assert.equal(lines[3].remainingCents,null);
 const unpaid=confirmationLineAmounts(order,0);assert.equal(unpaid[0].paidCents,0);assert.equal(unpaid[0].remainingCents,1005);
 assert.throws(()=>confirmationLineAmounts(order,99999));assert.throws(()=>confirmationLineAmounts(order,-1));
});
test('confirmation amounts and dates are readable without losing cents',()=>{
 assert.equal(confirmationMoney(905),'$9.05');assert.equal(confirmationDate(order.createdAtIso),'November 8, 2026');assert.equal(confirmationDate('invalid'),'Date unavailable');
});
test('a full payment is confirmed at the full amount with no outstanding priced balance',async()=>{
 const full={...order,paymentType:'full',amountDueCents:3015,remainingCents:0};
 const api=load('lib/order-confirmation.ts',{'./stripe-client':{getStripe:()=>({checkout:{sessions:{retrieve:async()=>({id:'cs_test_full',livemode:false,payment_status:'paid',metadata:{integration:'blackline-test-v1',order_id:full.id},client_reference_id:full.id,currency:'usd',amount_total:3015})}}})},'./checkout-orders':{orderDatabase:async()=>full},'./stripe-fulfillment':{},'./catalog-server':{publicProducts:async()=>[]}});
 const result=await api.getOrderConfirmation('cs_test_full');assert.equal(result.status,'confirmed');assert.equal(result.paidCents,3015);assert.equal(result.outstandingCents,0);assert.equal(confirmationLineAmounts(full,3015)[3].paidCents,null);
});
function confirmationFixture({payment='paid',status='pending',amount=905,fulfillmentFails=false,live=false}={}){
 let saved={...order,status};let fulfilled=0;
 const session={id:'cs_test_confirmation',livemode:live,payment_status:payment,metadata:{integration:'blackline-test-v1',order_id:order.id},client_reference_id:order.id,currency:'usd',amount_total:amount,payment_intent:{payment_method:{type:'card',card:{brand:'visa',last4:'4242'}}}};
 const api=load('lib/order-confirmation.ts',{
  './stripe-client':{getStripe:()=>({checkout:{sessions:{retrieve:async()=>session}}})},
  './checkout-orders':{orderDatabase:async()=>saved},
  './stripe-fulfillment':{fulfillTestSession:async()=>{fulfilled++;if(fulfillmentFails)throw Error('temporary database error');saved={...saved,status:'deposit_paid'};}},
  './catalog-server':{publicProducts:async()=>[]},
 });
 return {api,fulfilled:()=>fulfilled};
}
test('a verified Stripe payment reconciles a delayed webhook before confirming the booking',async()=>{
 const f=confirmationFixture();const result=await f.api.getOrderConfirmation('cs_test_confirmation');
 assert.equal(result.status,'confirmed');assert.equal(result.paidCents,905);assert.equal(result.outstandingCents,2110);assert.equal(result.paymentMethod,'VISA ending 4242');assert.equal(f.fulfilled(),1);
});
test('payment received and booking confirmation are distinguished when persistence is delayed',async()=>{
 const f=confirmationFixture({fulfillmentFails:true});const result=await f.api.getOrderConfirmation('cs_test_confirmation');
 assert.equal(result.status,'processing');assert.equal(result.paidCents,905);
});
test('an unpaid session never gets a paid confirmation or triggers fulfillment',async()=>{
 const f=confirmationFixture({payment:'unpaid'});const result=await f.api.getOrderConfirmation('cs_test_confirmation');
 assert.equal(result.status,'awaiting_payment');assert.equal(result.paidCents,0);assert.equal(result.outstandingCents,3015);assert.equal(f.fulfilled(),0);
});
test('live, mismatched, and malformed sessions cannot expose an order confirmation',async()=>{
 for(const config of [{live:true},{amount:1}]){const f=confirmationFixture(config);assert.equal(await f.api.getOrderConfirmation('cs_test_confirmation'),null);assert.equal(f.fulfilled(),0);}
 assert.equal(await confirmationFixture().api.getOrderConfirmation('BL-guessed-order-number'),null);
});
test('PDF downloads require a validated session and have private download headers',async()=>{
 const {GET}=load('app/api/orders/confirmation/route.ts',{
  '@/lib/order-confirmation':{getOrderConfirmation:async id=>id==='cs_test_valid'?{order}:null},
  '@/lib/order-confirmation-pdf':{createOrderConfirmationPdf:async()=>new TextEncoder().encode('%PDF-1.7 test')},
 });
 assert.equal((await GET(new Request('http://localhost/api/orders/confirmation?session_id=BL-guessed'))).status,404);
 assert.equal((await GET(new Request('http://localhost/api/orders/confirmation?session_id=cs_test_unknown'))).status,404);
 const pdf=await GET(new Request('http://localhost/api/orders/confirmation?session_id=cs_test_valid'));
 assert.equal(pdf.status,200);assert.equal(pdf.headers.get('content-type'),'application/pdf');assert.match(pdf.headers.get('content-disposition'),/^attachment;/);assert.match(pdf.headers.get('cache-control'),/private, no-store/);assert.equal(pdf.headers.get('x-content-type-options'),'nosniff');
});

test('PDF image loading rejects private URLs, credential URLs, and path traversal',async()=>{
 let requests=0,reads=0;
 const {confirmationImage}=load('lib/confirmation-image.ts',{
  './stripe-client':{getAppBaseUrl:()=> 'http://localhost:3000'},
  'node:fs/promises':{realpath:async()=>{reads++;return 'C:/public';},readFile:async()=>{reads++;throw Error('should not read');}},
 },{fetch:async()=>{requests++;throw Error('should not fetch');}});
 for(const source of ['http://127.0.0.1/private','https://169.254.169.254/metadata','https://images.unsplash.com.evil.test/photo','https://images.unsplash.com@evil.test/photo','https://user:pass@images.unsplash.com/photo','/../.env.local','/..%2f.env.local','/..%5c.env.local','//evil.test/photo','/%2fevil.test/photo','/%09/evil.test/photo'])assert.equal(await confirmationImage(source),null);
 assert.equal(requests,0);assert.equal(reads,0);
});
test('PDF local photos are fetched from the configured static origin without filesystem reads',async()=>{
 const png=await require('sharp')({create:{width:2,height:2,channels:3,background:'#c6a46c'}}).png().toBuffer();let requested;
 const api=load('lib/confirmation-image.ts',{'./stripe-client':{getAppBaseUrl:()=> 'https://www.blacklineconcierge.group'},'node:fs/promises':{realpath:()=>{throw Error('Must not trace public assets');},readFile:()=>{throw Error('Must not bundle photos');}}},{fetch:async(url,options)=>{requested={url:String(url),options};return new Response(png,{headers:{'Content-Type':'image/png'}});}});
 const image=await api.confirmationImage('/images/cars/example.png');assert.ok(image?.length>0);assert.equal(image[0],0xff);assert.equal(image[1],0xd8);assert.equal(requested.url,'https://www.blacklineconcierge.group/images/cars/example.png');assert.equal(requested.options.redirect,'error');
});
test('unavailable or oversized photos do not stop PDF generation',async()=>{
 const factory=fetch=>load('lib/confirmation-image.ts',{'./stripe-client':{getAppBaseUrl:()=> 'https://www.blacklineconcierge.group'}},{fetch});
 assert.equal(await factory(async()=>new Response('missing',{status:404})).confirmationImage('/images/missing.jpg'),null);
 assert.equal(await factory(async()=>new Response(new Uint8Array(7*1024*1024),{headers:{'Content-Type':'image/jpeg'}})).confirmationImage('/images/large.jpg'),null);
});
