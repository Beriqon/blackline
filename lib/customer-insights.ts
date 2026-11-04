import type {AdminBooking} from "./admin-demo-data";

export function bookingStart(booking:AdminBooking):number|null{
 const dates=booking.items.map(item=>Date.parse(item.start)).filter(Number.isFinite);
 return dates.length?Math.min(...dates):null;
}
export function agreedBookingValue(bookings:AdminBooking[]){
 return bookings.filter(b=>b.status==="Confirmed"||b.status==="Completed").reduce((sum,b)=>sum+b.items.reduce((n,item)=>n+(Number.isFinite(item.price)?item.price:0),0),0);
}
export function bookingHistoryByYear(bookings:AdminBooking[]){
 const groups=new Map<string,AdminBooking[]>();
 for(const booking of [...bookings].sort((a,b)=>(bookingStart(b)??-Infinity)-(bookingStart(a)??-Infinity))){
  const start=bookingStart(booking),year=start===null?"Date not set":String(new Date(start).getFullYear());
  groups.set(year,[...(groups.get(year)??[]),booking]);
 }
 return Array.from(groups,([year,bookings])=>({year,bookings,value:agreedBookingValue(bookings)}));
}
export function customerContactLinks(phone:string,email:string){
 const digits=phone.replace(/\D/g,"").replace(/^00/,"");
 const valid=/^\+?[\d\s().-]+$/.test(phone.trim())&&digits.length>=7&&digits.length<=15;
 const international=valid&&/^(\+|00)/.test(phone.trim())&&!digits.startsWith("0");
 return {
  call:valid?`tel:${international?"+":""}${digits}`:null,
  whatsapp:international?`https://wa.me/${digits}`:null,
  email:email.trim()?`mailto:${encodeURIComponent(email.trim())}?subject=${encodeURIComponent("Your Blackline experience")}`:null,
 };
}
