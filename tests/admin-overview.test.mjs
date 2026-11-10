import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const cache=new Map();
function load(name){
 if(cache.has(name))return cache.get(name);
 const source=ts.transpileModule(fs.readFileSync(new URL(`../lib/${name}.ts`,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const api={};cache.set(name,api);vm.runInNewContext(source,{exports:api,require:path=>load(path.replace('./',''))});return api;
}
const {overviewBookings}=load('admin-overview');
const now=Date.parse('2026-11-10T12:00:00Z');
const item=(start,end)=>({product:'Experience',price:1000,start,end,service:'yachts'});
const booking=(id,extra={})=>({id,name:'Guest',status:'Confirmed',items:[item('2026-11-11T10:00:00Z','2026-11-11T14:00:00Z')],...extra});

test('test orders and cancelled bookings do not become operational actions or upcoming experiences',()=>{
 const result=overviewBookings([booking('test',{testMode:true,status:'Pending'}),booking('cancelled',{status:'Cancelled'}),booking('completed',{status:'Completed'}),booking('live')],now);
 assert.equal(result.records.length,3);assert.equal(result.active.length,1);assert.equal(result.upcoming.length,1);assert.equal(result.upcoming[0].booking.id,'live');
});
test('upcoming selects the next unfinished service within multi-service bookings and excludes undated records',()=>{
 const result=overviewBookings([booking('multi',{items:[item('2026-01-01T10:00:00Z','2026-01-01T14:00:00Z'),item('2026-11-12T10:00:00Z','2026-11-12T14:00:00Z')]}),booking('ongoing',{items:[item('2026-11-10T10:00:00Z','2026-11-10T14:00:00Z')]}),booking('undated',{items:[item('','')]}),booking('quote',{quoteRequest:{status:'pending'}})],now);
 assert.equal(result.upcoming.length,2);assert.equal(result.upcoming[0].booking.id,'ongoing');assert.equal(result.upcoming[0].ongoing,true);assert.equal(result.upcoming[1].item.start,'2026-11-12T10:00:00Z');
});
test('payment reviews precede proposals and balance actions, with unknown payments excluded from known balance',()=>{
 const records=[booking('unknown'),booking('balance',{recordPayment:{method:'Manual',paidCents:25000},stripeOrder:{knownTotalCents:100000,paidCents:25000}}),booking('quote',{status:'Pending',quoteRequest:{status:'pending'}}),booking('review',{stripeOrder:{requiresReview:true,knownTotalCents:100000,paidCents:100000}}),booking('manual',{status:'Pending'})];
 const result=overviewBookings(records,now);
 assert.equal(result.outstanding,75000);assert.equal(result.attention[0].booking.id,'review');assert.equal(result.review.length,1);assert.equal(result.quotes.length,1);assert.equal(result.attention.length,4);
 assert.equal(result.attention.some(a=>a.booking.id==='unknown'),false);
});
