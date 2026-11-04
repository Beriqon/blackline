import test from 'node:test';
import assert from 'node:assert/strict';
import {bookingHistoryByYear,bookingStart,agreedBookingValue,customerContactLinks} from '../lib/customer-insights.ts';
const booking=(id,start,status='Confirmed',price=100)=>({id,status,items:[{start,end:start,price,product:'Example service'}]});
test('repeat bookings stay visible within the same year and across earlier years',()=>{
 const groups=bookingHistoryByYear([booking('older','2025-06-01T12:00:00'),booking('first','2026-01-01T12:00:00'),booking('repeat','2026-10-01T12:00:00'),booking('pending','2026-11-01T12:00:00','Pending'),booking('cancelled','2026-04-01T12:00:00','Cancelled')]);
 assert.deepEqual(groups.map(g=>g.year),['2026','2025']);
 assert.deepEqual(groups[0].bookings.map(b=>b.id),['pending','repeat','cancelled','first']);
 assert.equal(groups[0].value,200);
});
test('a multi-service booking uses its earliest service date and counts value once',()=>{
 const item=booking('multi','2027-01-01T12:00:00');item.items.push({start:'2026-12-31T12:00:00',price:250,product:'Transfer'});
 assert.equal(new Date(bookingStart(item)).getFullYear(),2026);
 assert.equal(bookingHistoryByYear([item])[0].year,'2026');assert.equal(agreedBookingValue([item]),350);
});
test('missing dates do not crash history or hide the booking',()=>{
 const undated=booking('undated','invalid');const empty={id:'empty',status:'Pending',items:[]};
 const groups=bookingHistoryByYear([undated,booking('valid','2026-06-01T12:00:00'),empty]);
 assert.deepEqual(groups.map(g=>g.year),['2026','Date not set']);assert.equal(groups[1].bookings.length,2);
});
test('phone links address the customer directly and normalize international formatting',()=>{
 const links=customerContactLinks('+31 (6) 1234-5678','guest@example.com');
 assert.equal(links.whatsapp,'https://wa.me/31612345678');assert.equal(links.call,'tel:+31612345678');assert.match(links.email,/^mailto:guest%40example.com/);
 assert.equal(customerContactLinks('0031 6 12345678','').whatsapp,links.whatsapp);
 assert.equal(customerContactLinks('0612345678','').whatsapp,null);
 assert.equal(customerContactLinks('0612345678','').call,'tel:0612345678');
 for(const number of ['','123','+1234567890123456','+31 javascript:alert(1)']){assert.equal(customerContactLinks(number,'').whatsapp,null);assert.equal(customerContactLinks(number,'').call,null);}
});
