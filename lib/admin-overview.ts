import type {AdminBooking} from "./admin-demo-data";
import {bookingPayment} from "./admin-booking-summary";
import {bookingDeskAction} from "./admin-booking-presentation";

export function overviewBookings(bookings:AdminBooking[],now:number){
 const records=bookings.filter(b=>!b.testMode);
 const active=records.filter(b=>b.status!=="Cancelled"&&b.status!=="Completed");
 const review=active.filter(b=>bookingDeskAction(b).priority===0);
 const quotes=active.filter(b=>b.quoteRequest?.status==="pending");
 const pending=active.filter(b=>b.status==="Pending"&&!b.quoteRequest);
 const outstanding=records.reduce((sum,b)=>sum+(bookingPayment(b).outstandingCents??0),0);
 const attention=active.map(booking=>{
  const action=bookingDeskAction(booking);
  if(action.priority<3)return {booking,...action};
  if(booking.status==="Pending"&&!booking.quoteRequest)return {booking,label:"Review request",hint:"Booking awaiting confirmation",section:undefined,priority:1};
  return null;
 }).filter((row):row is NonNullable<typeof row>=>row!==null).sort((a,b)=>a.priority-b.priority);
 const upcoming=active.filter(b=>!b.quoteRequest).flatMap(booking=>{
  const items=booking.items.filter(item=>Number.isFinite(Date.parse(item.start))&&Number.isFinite(Date.parse(item.end))&&Date.parse(item.end)>now).sort((a,b)=>Date.parse(a.start)-Date.parse(b.start));
  return items[0]?[{booking,item:items[0],ongoing:Date.parse(items[0].start)<=now}]:[];
 }).sort((a,b)=>Date.parse(a.item.start)-Date.parse(b.item.start));
 return {records,active,review,quotes,pending,outstanding,attention,upcoming};
}
