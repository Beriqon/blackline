import test from 'node:test';
import assert from 'node:assert/strict';
import {bookingPayment,matchesPaymentFilter} from '../lib/admin-booking-summary.ts';
import {quoteToAdmin,combineBookingQuotes} from '../lib/admin-quote-bookings.ts';
import {agreedBookingValue} from '../lib/customer-insights.ts';
const base={id:'BL-order',name:'Avery',email:'guest@example.com',phone:'+12025550100',source:'Website',status:'Confirmed',items:[{product:'Car',service:'exotic-cars',productId:'car',price:1000,start:'2030-01-01',end:'2030-01-02'},{product:'Villa',service:'villas',productId:'villa',price:0,priceFollows:true,start:'',end:''}]};
const request={id:'qr-one',customerName:'Avery',customerEmail:'guest@example.com',createdAtIso:'2026-11-09T10:00:00Z',status:'pending',source:'whatsapp',message:'Phone: +1 202 555 0100\nRequest for a villa',items:[{id:'villa',title:'Villa',category:'villas'}]};
test('mixed deposits show paid and outstanding cents while retaining quotes under one order',()=>{
 const b={...base,stripeOrder:{knownTotalCents:100000,paidCents:30000,remainingCents:70000}};const p=bookingPayment(b);assert.equal(p.paidCents,30000);assert.equal(p.outstandingCents,70000);assert.equal(p.hasQuotes,true);assert.equal(p.quoteOnly,false);assert.equal(matchesPaymentFilter(b,'expected'),true);assert.equal(p.state,'deposit');
});
test('submitted Zelle full transfers remain wholly outstanding until bank confirmation',()=>{
 const b={...base,status:'Pending',zelleOrder:{status:'payment_submitted',knownTotalCents:100000,depositCents:30000,amountDueCents:100000,remainingCents:0}};const p=bookingPayment(b);assert.equal(p.method,'Zelle');assert.equal(p.paidCents,0);assert.equal(p.outstandingCents,100000);assert.equal(matchesPaymentFilter(b,'verification'),true);assert.equal(matchesPaymentFilter(b,'expected'),true);
 const paid={...b,status:'Confirmed',zelleOrder:{...b.zelleOrder,status:'confirmed'}};assert.equal(bookingPayment(paid).outstandingCents,0);assert.equal(matchesPaymentFilter(paid,'paid'),true);
});
test('standalone requests expose contact details and do not invent payable prices',()=>{
 const b=quoteToAdmin(request,[]);assert.equal(b.phone,'+1 202 555 0100');assert.equal(b.id,request.id);assert.equal(b.items[0].priceFollows,true);assert.equal(bookingPayment(b).quoteOnly,true);assert.equal(bookingPayment(b).outstandingCents,null);assert.equal(matchesPaymentFilter(b,'expected'),false);
});
test('only explicit matching order references group quotes with an existing order',()=>{
 const joined=combineBookingQuotes([base],[{...request,orderId:base.id}],[]);assert.equal(joined.length,1);assert.equal(joined[0].items.length,2);assert.equal(joined[0].linkedQuotes.length,1);
 assert.equal(combineBookingQuotes([base],[request],[]).length,2);
 assert.equal(combineBookingQuotes([base],[{...request,orderId:base.id,customerEmail:'someone-else@example.com'}],[]).length,2);
});
test('manual payments stay unknown when no amount was recorded; tests do not inflate live value',()=>{
 const p=bookingPayment(base);assert.equal(p.paidCents,null);assert.equal(p.outstandingCents,null);assert.equal(matchesPaymentFilter(base,'unrecorded'),true);assert.equal(agreedBookingValue([base,{...base,id:'test',testMode:true}]),1000);
});
