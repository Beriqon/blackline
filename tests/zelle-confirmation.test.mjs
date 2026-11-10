import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {zelleConfirmation} from '../lib/zelle-confirmation-view.ts';
const order={id:'BL-ZELLE',status:'payment_submitted',testMode:false,paymentType:'full',amountDueCents:10000,knownTotalCents:10000,depositCents:3000,remainingCents:0,holdUntilIso:'2030-01-01T10:00:00Z',lines:[{productId:'car',title:'Car',totalCents:10000,imageSrc:'/car.jpg'},{productId:'villa',title:'Villa',totalCents:null}],customerName:'Test Guest'};
function load(path,mocks){const exports={};const source=ts.transpileModule(fs.readFileSync(new URL('../'+path,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;vm.runInNewContext(source,{exports,require:id=>id==='server-only'?{}:mocks[id],Request,Response,Uint8Array,URL});return exports;}
test('submitted Zelle screenshots never count as paid money, including full transfers',()=>{
 const view=zelleConfirmation(order,{car:'/car.jpg'});assert.equal(view.paidCents,0);assert.equal(view.outstandingCents,10000);assert.equal(view.zelle.status,'payment_submitted');assert.equal(view.order.testMode,false);assert.equal(view.order.remainingCents,0);assert.equal(view.pictures.car,'/car.jpg');assert.equal(view.order.lines[1].totalCents,null);
});
test('verified full payments and deposits have the correct remaining amount',()=>{
 const full=zelleConfirmation({...order,status:'confirmed'},{});assert.equal(full.paidCents,10000);assert.equal(full.outstandingCents,0);assert.equal(full.status,'confirmed');
 const deposit=zelleConfirmation({...order,status:'confirmed',paymentType:'deposit',amountDueCents:3000,remainingCents:7000},{});assert.equal(deposit.paidCents,3000);assert.equal(deposit.outstandingCents,7000);
 for(const status of ['rejected','expired']){const result=zelleConfirmation({...order,status},{});assert.equal(result.status,'expired');assert.equal(result.paidCents,0);}
});
test('another visitor cannot load a Zelle confirmation or trigger database reads',async()=>{
 let reads=0;const api=load('lib/zelle-confirmation.ts',{'./zelle-server':{hasZelleAccess:async()=>false,zelleDatabase:async()=>{reads++;}},'./catalog-server':{},'./zelle-confirmation-view':{zelleConfirmation}});assert.equal(await api.getZelleConfirmation(order.id),null);assert.equal(reads,0);
});
test('Zelle PDF downloads authorize the order and use private no-store attachment responses',async()=>{
 let available=false,generated=0;const route=load('app/api/zelle/confirmation/route.ts',{'@/lib/zelle-confirmation':{getZelleConfirmation:async()=>available?zelleConfirmation(order,{}):null},'@/lib/order-confirmation-pdf':{createOrderConfirmationPdf:async()=>{generated++;return new Uint8Array([37,80,68,70]);}}});
 assert.equal((await route.GET(new Request('http://localhost/api/zelle/confirmation?order_id=BL-ZELLE'))).status,404);assert.equal(generated,0);available=true;
 const result=await route.GET(new Request('http://localhost/api/zelle/confirmation?order_id=BL-ZELLE'));assert.equal(result.status,200);assert.equal(result.headers.get('Content-Type'),'application/pdf');assert.match(result.headers.get('Cache-Control'),/private, no-store/);assert.match(result.headers.get('Content-Disposition'),/attachment/);
});
