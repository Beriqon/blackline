import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function load(path,mocks={}){
 const source=ts.transpileModule(fs.readFileSync(new URL('../'+path,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const exports={};vm.runInNewContext(source,{exports,require:id=>{if(id in mocks)return mocks[id];throw Error('Unexpected runtime dependency: '+id);},Error});return exports;
}
const {checkoutOrderToAdmin}=load('lib/admin-checkout-orders.ts');
const chauffeurDuration=load('lib/chauffeur-duration.ts');
const order={id:'BL-test',testMode:true,status:'deposit_paid',customerName:'Test guest',customerEmail:'test@example.com',customerPhone:'',createdAtIso:'2026-11-09T10:00:00Z',knownTotalCents:199900,depositCents:59970,remainingCents:139930,lines:[{productId:'catalog:exotic-cars:car',title:'Car',description:'One day',totalCents:199900},{productId:'catalog:villas:villa',title:'Villa',description:'Stay to be arranged',totalCents:null}]};
test('one paid order contains every service and exact paid/outstanding cents',()=>{
 const booking=checkoutOrderToAdmin({order,bookings:[{id:'reservation',itemId:'car',category:'exotic-car',startIso:'2030-01-01T10:00:00Z',endIso:'2030-01-02T10:00:00Z'}]},[]);
 assert.equal(booking.id,order.id);assert.equal(booking.items.length,2);assert.equal(booking.testMode,true);
 assert.equal(booking.items[0].start,'2030-01-01T10:00:00Z');assert.equal(booking.items[0].price,1999);
 assert.equal(booking.items[1].priceFollows,true);assert.equal(booking.items[1].price,0);assert.equal(booking.items[1].start,'');
 assert.equal(booking.stripeOrder.paidCents,59970);assert.equal(booking.stripeOrder.remainingCents,139930);
 assert.equal(checkoutOrderToAdmin({order,bookings:[]},[]).id,booking.id);
});
test('unpaid and expired orders cannot become confirmed bookings',()=>{
 for(const change of [{status:'pending'},{status:'expired'}])assert.throws(()=>checkoutOrderToAdmin({order:{...order,...change},bookings:[]},[]));
});
test('different selections of the same product retain their individual dates',()=>{
 const o={...order,lines:[order.lines[0],order.lines[0]]};
 const bookings=[{id:'a',category:'exotic-car',itemId:'car',startIso:'2030-01-01',endIso:'2030-01-02'},{id:'b',category:'exotic-car',itemId:'car',startIso:'2030-02-01',endIso:'2030-02-02'}];
 const result=checkoutOrderToAdmin({order:o,bookings},[]);
 assert.equal(result.items[0].start,'2030-01-01');assert.equal(result.items[1].start,'2030-02-01');assert.equal(bookings.length,2);
});
test('paid Stripe records cannot be edited or deleted through the manual-booking repository',async()=>{
 let writes=0;const repo=load('lib/admin-booking-repository.ts',{'./workspace-store':{saveRow:()=>{writes++;},removeRow:()=>{writes++;}},'./chauffeur-duration':chauffeurDuration});
 const booking=checkoutOrderToAdmin({order,bookings:[]},[]);
 await assert.rejects(()=>repo.saveAdminBooking(booking),/read-only/);await assert.rejects(()=>repo.deleteAdminBooking(booking),/cannot be deleted/);assert.equal(writes,0);
});

test('new manual chauffeur bookings require four hours while historical and other services remain editable',async()=>{
 const item={service:"chauffeur-services",product:"Sprinter",start:"2027-01-01T10:00:00Z",end:"2027-01-01T12:00:00Z"};
 const historical={id:"old",items:[item]};
 const written=[];
 const repo=load('lib/admin-booking-repository.ts',{'./workspace-store':{cachedRows:()=>[historical],saveRow:(_table,_id,booking)=>written.push(booking)},'./chauffeur-duration':chauffeurDuration});
 await assert.rejects(repo.saveAdminBooking({id:"new",items:[item]}),/minimum of 4 hours/);
 await assert.rejects(repo.saveAdminBooking({...historical,items:[{...item,end:"2027-01-01T13:00:00Z"}]}),/minimum of 4 hours/);
 await repo.saveAdminBooking({...historical,notes:"Corrected notes"});
 await repo.saveAdminBooking({id:"four",items:[{...item,end:"2027-01-01T14:00:00Z"}]});
 await repo.saveAdminBooking({id:"other",items:[{...item,service:"yachts"}]});
 assert.deepEqual(written.map(booking=>booking.id),["old","four","other"]);
});

test('chauffeur quote and availability enforce the same four-hour minimum',()=>{
 const car={id:"sprinter",name:"Sprinter",section:"hourly",priceLine:"$200 / hour"};
 const booking=load('lib/bookings.ts',{
  './chauffeur-duration':chauffeurDuration,
  './booking-time':{bookingDateTime:(date,time)=>new Date(`${date}T${time}:00Z`)},
  '@/lib/yacht-fleet-pricing':{},
  '@/lib/exotic-cars-data':{ALL_EXOTIC_CARS:[car]},
  '@/lib/yachts-data':{},
 });
 assert.deepEqual(Array.from(booking.getExoticCarBookingConfig(car).chauffeurDurationHours),[4,6,8]);
 const selection={category:"exotic-car",itemId:car.id,rentalMode:"chauffeur",startDate:"2027-01-01",startTime:"10:00"};
 for(const durationHours of [2,3]){
  assert.throws(()=>booking.computeBookingQuote({...selection,durationHours},car),/minimum of 4 hours/);
  assert.throws(()=>booking.selectionToRange({...selection,durationHours},car),/minimum of 4 hours/);
 }
 assert.equal(booking.computeBookingQuote({...selection,durationHours:4},car).totalUsd,800);
 assert.equal(booking.selectionToRange({...selection,durationHours:4},car).endIso,"2027-01-01T14:00:00.000Z");
});

test("live orders stay separate from test metrics",()=>{const b=checkoutOrderToAdmin({order:{...order,testMode:false},bookings:[]},[]);assert.equal(b.testMode,undefined);assert.equal(b.status,"Confirmed");assert.equal(b.stripeOrder.paidCents,59970);});
