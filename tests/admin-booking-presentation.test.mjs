import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {bookingPayment} from '../lib/admin-booking-summary.ts';
const api={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(new URL('../lib/admin-booking-presentation.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports:api,require:()=>({bookingPayment})});
const base={id:'BL-DESK',name:'Test guest',status:'Confirmed',items:[{price:100,product:'Car'}]};
test('the primary action sends unverified Zelle payments to bank review, not balance collection',()=>{
 const pending={...base,status:'Pending',zelleOrder:{status:'payment_submitted',knownTotalCents:10000,depositCents:3000}};
 assert.equal(api.bookingDeskAction(pending).label,'Review payment');assert.equal(api.bookingDeskAction(pending).section,'review');
 const balance={...base,zelleOrder:{status:'confirmed',knownTotalCents:10000,depositCents:3000},balancePayment:{status:'zelle_submitted'}};
 assert.equal(api.bookingDeskAction(balance).section,'balance');assert.equal(api.bookingDeskAction(balance).priority,0);
 const expired={...pending,zelleOrder:{...pending.zelleOrder,status:'expired',hasEvidence:true}};
 assert.equal(api.bookingDeskAction(expired).label,'Review payment');
});
test('balance collection appears only for confirmed online orders with a recorded balance',()=>{
 const deposit={...base,stripeOrder:{knownTotalCents:10000,paidCents:3000}};
 assert.equal(api.bookingDeskAction(deposit).label,'Request balance');assert.equal(api.bookingDeskAction(deposit).section,'balance');
 assert.equal(api.bookingDeskAction({...deposit,stripeOrder:{...deposit.stripeOrder,paidCents:10000}}).label,'View booking');
 assert.equal(api.bookingDeskAction(base).label,'View booking');
 assert.equal(api.bookingDeskAction({...deposit,status:'Cancelled'}).label,'View booking');
});
test('requests open quote details while already sent proposals are not shown as work to prepare',()=>{
 const pending={...base,quoteRequest:{status:'pending'}};
 assert.equal(api.bookingDeskAction(pending).label,'View request');assert.equal(api.bookingDeskAction(pending).hint,'Proposal to prepare');
 assert.equal(api.bookingDeskAction({...pending,quoteRequest:{status:'quoted'}}).hint,'Proposal sent');
 assert.equal(api.bookingDeskAction({...pending,quoteRequest:{status:'confirmed'}}).priority,4);
});
test('a paid order awaiting inventory review never requests another payment',()=>{
 const booking={...base,status:'Pending',stripeOrder:{requiresReview:true,knownTotalCents:10000,paidCents:3000}};
 assert.equal(bookingPayment(booking).paidCents,3000);
 assert.equal(bookingPayment(booking).outstandingCents,null);
 assert.equal(api.bookingDeskAction(booking).label,'Review booking');
 assert.equal(api.bookingDeskAction(booking).section,undefined);
});
