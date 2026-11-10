import {loadStripeMode} from './load-stripe-mode.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import ts from 'typescript';
import sharp from 'sharp';
const require=createRequire(import.meta.url);
function load(path,mocks={},globals={}){const exports={};const code=ts.transpileModule(fs.readFileSync(new URL('../'+path,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;vm.runInNewContext(code,{exports,require:id=>id.endsWith('/stripe-mode')?loadStripeMode((globals.process?.env??process.env)):id==='server-only'?{}:id in mocks?mocks[id]:require(id),Request,Response,File,FormData,Buffer,Uint8Array,Error,URL,process,console,...globals});return exports;}
const json={json:(data,init)=>Response.json(data,init)};
test('switching to Zelle expires card collection before creating a live transfer order',async()=>{
 const calls=[];const route=load('app/api/zelle/start/route.ts',{'next/server':{NextResponse:json},'@/lib/checkout-orders':{orderDatabase:async()=>{}},'@/lib/stripe-client':{getStripe:()=>({checkout:{sessions:{retrieve:async()=>({status:'open',payment_status:'unpaid',livemode:false,metadata:{integration:'blackline-test-v1'}}),expire:async()=>calls.push('expire')}}})},'@/lib/zelle-server':{sameOrigin:()=>true,zelleDatabase:async()=>{calls.push('reserve');return {id:'BL-ONE'};},grantZelleAccess:async()=>calls.push('cookie')}});
 const response=await route.POST(new Request('http://localhost/api/zelle/start',{method:'POST',body:JSON.stringify({sessionId:'cs_test_example'})}));assert.equal(response.status,200);assert.deepEqual(calls,['expire','reserve','cookie']);
});
test('a paid card session cannot also become a Zelle order',async()=>{
 let writes=0;const route=load('app/api/zelle/start/route.ts',{'next/server':{NextResponse:json},'@/lib/checkout-orders':{orderDatabase:async()=>{}},'@/lib/stripe-client':{getStripe:()=>({checkout:{sessions:{retrieve:async()=>({status:'complete',payment_status:'paid',livemode:false,metadata:{integration:'blackline-test-v1'}})}}})},'@/lib/zelle-server':{sameOrigin:()=>true,zelleDatabase:async()=>writes++}});
 assert.equal((await route.POST(new Request('http://localhost/api/zelle/start',{method:'POST',body:JSON.stringify({sessionId:'cs_test_example'})}))).status,409);assert.equal(writes,0);
});
function uploadRoute(access=true){let writes=[];return {writes,route:load('app/api/zelle/submit/route.ts',{'next/server':{NextResponse:json},'@/lib/zelle-server':{sameOrigin:()=>true,hasZelleAccess:async()=>access,zelleDatabase:async(...args)=>{writes.push(args);return {};}}})};}
function request(file){const form=new FormData();form.set('orderId','BL-ONE');if(file)form.set('screenshot',file);return new Request('http://localhost/api/zelle/submit',{method:'POST',body:form});}
test('proof submission requires order access and an actual screenshot',async()=>{
 for(const access of [false,true]){const f=uploadRoute(access);assert.equal((await f.route.POST(request())).status,access?400:403);assert.equal(f.writes.length,0);}
 const f=uploadRoute();assert.equal((await f.route.POST(request(new File(['not an image'],'proof.png',{type:'image/png'})))).status,400);assert.equal(f.writes.length,0);
});
test('valid screenshots are decoded, stripped and stored as bounded JPEG evidence',async()=>{
 const f=uploadRoute();const image=await sharp({create:{width:4,height:4,channels:3,background:'#c5ab7b'}}).png().toBuffer();
 assert.equal((await f.route.POST(request(new File([image],'proof.png',{type:'image/png'})))).status,200);assert.equal(f.writes.length,1);
 const [operation,payload]=f.writes[0];assert.equal(operation,'submit');assert.equal(payload.orderId,'BL-ONE');assert.equal((await sharp(Buffer.from(payload.imageBase64,'base64')).metadata()).format,'jpeg');
});
test('Zelle booking summaries keep unverified funds out of paid status and preserve quote lines',()=>{
 const {zelleOrderToAdmin}=load('lib/admin-checkout-orders.ts');const o={id:'BL-ONE',status:'payment_submitted',testMode:false,paymentMethod:'zelle',customerName:'Guest',customerEmail:'guest@example.com',customerPhone:'',knownTotalCents:10000,depositCents:3000,remainingCents:7000,lines:[{productId:'car',title:'Car',totalCents:10000},{productId:'villa',title:'Villa',totalCents:null}]};
 const booking=zelleOrderToAdmin({order:o,bookings:[]},[]);assert.equal(booking.status,'Pending');assert.equal(booking.testMode,undefined);assert.equal(booking.stripeOrder,undefined);assert.equal(booking.items[1].priceFollows,true);assert.equal(booking.zelleOrder.status,'payment_submitted');
});
test('activity inventory snapshots cover the Miami service day, including daylight-saving changes',async()=>{
 const product={id:'catalog:jetskis-jetcars:ski',service:'jetskis-jetcars',status:'visible',price:150,unit:'per hour',rates:'',name:'Jet ski'};
 const {quoteCheckout}=load('lib/checkout-quote.ts',{'./catalog-server':{publicProducts:async()=>[product]},'./bookings-store':{},'./bookings':{},'./yachts-data':{},'./checkout-pricing':require('../lib/checkout-pricing.ts'),'./booking-time':require('../lib/booking-time.ts')});
 const {order}=await quoteCheckout({items:[{id:'ski',href:'/services/jetskis-jetcars',quantity:1,experienceSelection:{date:'2027-03-14',hours:2,units:1}}]});
 const inventory=order.lines[0].inventory;assert.equal(inventory.resourceId,product.id);assert.equal(inventory.startIso,'2027-03-14T05:00:00.000Z');assert.equal(inventory.endIso,'2027-03-15T04:00:00.000Z');
});
test('customer access uses a signed secure cookie per order and rejects forged or cross-site requests',async()=>{
 const jar=new Map();let options;
 const api=load('lib/zelle-server.ts',{'next/headers':{cookies:async()=>({set:(name,value,settings)=>{jar.set(name,value);options=settings;},get:name=>jar.has(name)?{value:jar.get(name)}:undefined})},'./supabase-server':{}},{process:{env:{NODE_ENV:'production',BLACKLINE_BOOKING_TOKEN:'unit-test-signing-key'}}});
 await api.grantZelleAccess('BL-ONE');await api.grantZelleAccess('BL-TWO');
 assert.equal(await api.hasZelleAccess('BL-ONE'),true);assert.equal(await api.hasZelleAccess('BL-TWO'),true);assert.equal(options.httpOnly,true);assert.equal(options.secure,true);assert.equal(options.sameSite,'strict');
 jar.set('blackline_zelle_BL-ONE','forged');assert.equal(await api.hasZelleAccess('BL-ONE'),false);assert.equal(await api.hasZelleAccess('invalid/id'),false);
 assert.equal(api.sameOrigin(new Request('https://blacklineconcierge.group/api/zelle/start',{headers:{origin:'https://attacker.example'}})),false);
 assert.equal(api.sameOrigin(new Request('https://blacklineconcierge.group/api/zelle/start',{headers:{origin:'https://blacklineconcierge.group'}})),true);
});
