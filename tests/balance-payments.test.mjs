import {loadStripeMode} from './load-stripe-mode.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import ts from 'typescript';
const require=createRequire(import.meta.url);
function load(path,mocks={},env={}){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(new URL('../'+path,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,require:id=>id.endsWith('/stripe-mode')?loadStripeMode(env):id==='server-only'?{}:id in mocks?mocks[id]:require(id),process:{env},Buffer,Request,Response,Date,Error,console,URL});return exports;}
const record={id:'00000000-0000-4000-8000-000000000001',source:'stripe',orderId:'BL-TEST',amountCents:7000,status:'open',attempt:1,expiresAtIso:'2099-01-01T00:00:00Z',order:{id:'BL-TEST',testMode:true,customerEmail:'test@example.com',knownTotalCents:10000,depositCents:3000,remainingCents:7000}};
test('balance links reject guessed or forged tokens before reading private orders',async()=>{
 let reads=0;const api=load('lib/balance-server.ts',{'./supabase-server':{publicDatabase:()=>({rpc:async()=>{reads++;return {data:record};}})}},{BLACKLINE_BOOKING_TOKEN:'unit-test-only-secret'});
 assert.equal(await api.balanceAccess(record.id,'0'.repeat(64)),null);assert.equal(reads,0);
 const signature=api.balanceSignature(record.id);assert.equal(api.validBalanceAccess(record.id,signature),true);assert.equal((await api.balanceAccess(record.id,signature)).id,record.id);assert.equal(reads,1);
 assert.equal(api.validBalanceAccess('another-order',signature),false);
});
test('balance fulfillment checks integration, environment, exact amount, currency and order',async()=>{
 const calls=[];const api=load('lib/balance-fulfillment.ts',{'./balance-server':{balanceDatabase:async(op,payload)=>{calls.push({op,payload});return record;}}});
 const session={id:'cs_test_balance',livemode:false,payment_status:'paid',currency:'usd',amount_total:7000,client_reference_id:'BL-TEST',metadata:{integration:'blackline-balance-test-v1',balance_id:record.id,order_id:'BL-TEST'}};
 await api.fulfillBalanceSession({...session,livemode:true},'evt_live');assert.equal(calls.length,0);
 await api.fulfillBalanceSession({...session,payment_status:'unpaid'},'evt_unpaid');assert.equal(calls.length,0);
 await assert.rejects(()=>api.fulfillBalanceSession({...session,amount_total:1},'evt_wrong'));assert.equal(calls.filter(c=>c.op==='paid').length,0);
 await api.fulfillBalanceSession(session,'evt_valid');assert.equal(calls.at(-1).op,'paid');assert.equal(calls.at(-1).payload.amountCents,7000);
});
test('balance checkout uses the server balance and reuses a single session across requests',async()=>{
 let saved={...record},created=0,params;const session={id:'cs_test_balance',livemode:false,client_secret:'test_secret',amount_total:7000,currency:'usd',status:'open',metadata:{balance_id:record.id}};
 const api=load('app/api/balance/checkout/route.ts',{
 '@/lib/zelle-server':{sameOrigin:()=>true},'@/lib/balance-fulfillment':{fulfillBalanceSession:async()=>{}},
 '@/lib/balance-server':{balanceAccess:async()=>saved,balancePath:()=>'/payment/balance?signed-link',balanceDatabase:async(op,p)=>{if(op==='attach')saved={...saved,sessionId:p.newSessionId,status:'stripe_open'};}},
 '@/lib/stripe-client':{getStripe:()=>({checkout:{sessions:{create:async p=>{created++;params=p;return session;},retrieve:async()=>session}}}),getBookingProduct:async()=> 'generic',getAppBaseUrl:()=> 'http://localhost:3000'},
 },{STRIPE_WEBHOOK_SECRET:'test',NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:'pk_test_example'});
 const request=()=>new Request('http://localhost:3000/api/balance/checkout',{method:'POST',body:JSON.stringify({id:record.id,token:'signed',amountCents:1})});
 assert.equal((await api.POST(request())).status,200);assert.equal((await api.POST(request())).status,200);assert.equal(created,1);assert.equal(params.line_items[0].price_data.unit_amount,7000);assert.equal(params.client_reference_id,'BL-TEST');
 saved={...saved,status:'paid'};assert.equal((await (await api.POST(request())).json()).paid,true);assert.equal(created,1);
});
test('admin balance creation cannot be performed without administrator access',async()=>{
 let writes=0;const api=load('app/api/admin/balance/route.ts',{'node:crypto':{randomUUID:()=>record.id},'@/lib/supabase-server':{requireAdmin:async()=>false},'@/lib/zelle-server':{sameOrigin:()=>true},'@/lib/balance-server':{balanceDatabase:async()=>{writes++;},balancePath:()=>''},'@/lib/stripe-client':{getAppBaseUrl:()=>''}});
 assert.equal((await api.POST(new Request('http://localhost/api/admin/balance',{method:'POST',body:'{}'}))).status,403);assert.equal(writes,0);
});
