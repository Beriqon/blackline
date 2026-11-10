import {customerDirectory,matchesBooking,normalizeEmail,type AdminCustomer} from "./admin-customers";
import type {AdminBooking} from "./admin-demo-data";
import {customerIsDeleted,type TrashEntry} from "./admin-trash";

export const MARKETING_PREVIEW_LIMIT=500;

export type MarketingContact={id:string;name:string;email:string;status:string;source:string;services:string[];bookingCount:number;lastBooking:string;disabledReason:string};
export function marketingAudience(saved:AdminCustomer[],bookings:AdminBooking[],trash:TrashEntry[]):MarketingContact[]{
 const liveBookings=bookings.filter(b=>!b.testMode&&!b.id.startsWith("BL-DEMO"));
 return customerDirectory(saved,liveBookings).filter(c=>!c.testMode&&!customerIsDeleted(c,trash)).map(c=>{
  const history=liveBookings.filter(b=>!b.testMode&&(b.status==="Confirmed"||b.status==="Completed")&&!b.quoteRequest&&matchesBooking(c,b));
  const email=normalizeEmail(c.email);
  return {id:c.id,name:c.name,email,status:c.status,source:c.source,services:[...new Set(history.flatMap(b=>b.items.filter(i=>!i.priceFollows).map(i=>i.service)))],bookingCount:history.filter(b=>b.status==="Confirmed"||b.status==="Completed").length,lastBooking:history.flatMap(b=>b.items.map(i=>i.start)).filter(Boolean).sort().at(-1)??"",disabledReason:c.status==="Archived"?"Archived customer":!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)?"No valid email address":""};
 }).sort((a,b)=>a.name.localeCompare(b.name));
}
export function filterMarketingAudience(contacts:MarketingContact[],filters:{query:string;status:string;source:string;service:string;relationship:string}){
 return contacts.filter(c=>(filters.status==="all"||c.status===filters.status)&&(filters.source==="all"||c.source===filters.source)&&(filters.service==="all"||c.services.includes(filters.service))&&(filters.relationship==="all"||filters.relationship==="returning"&&c.bookingCount>=2||filters.relationship==="first"&&c.bookingCount===1||filters.relationship==="none"&&c.bookingCount===0)&&[c.name,c.email].join(" ").toLowerCase().includes(filters.query.trim().toLowerCase()));
}
export function selectedMarketingRecipients(contacts:MarketingContact[],ids:ReadonlySet<string>){
 const seen=new Set<string>();
 return contacts.filter(c=>{const email=normalizeEmail(c.email);if(c.disabledReason||!ids.has(c.id)||seen.has(email))return false;seen.add(email);return true;});
}
export function toggleMarketingGroup(current:ReadonlySet<string>,rows:MarketingContact[],select:boolean,limit=MARKETING_PREVIEW_LIMIT){
 const next=new Set(current);for(const c of rows){if(c.disabledReason)continue;if(select){if(next.has(c.id)||next.size<limit)next.add(c.id);}else next.delete(c.id);}return next;
}
export const SAMPLE_MARKETING_CONTACTS:MarketingContact[]=[
 {id:"sample-01",name:"Demo guest · Avery",email:"avery@example.com",status:"VIP",source:"Website",services:["yachts","private-chefs"],bookingCount:4,lastBooking:"2026-11-06T18:00",disabledReason:""},
 {id:"sample-02",name:"Demo guest · Jordan",email:"jordan@example.com",status:"Active",source:"WhatsApp",services:["exotic-cars"],bookingCount:1,lastBooking:"2026-10-28T10:00",disabledReason:""},
 {id:"sample-03",name:"Demo guest · Morgan",email:"morgan@example.com",status:"VIP",source:"Affiliate",services:["villas","yachts"],bookingCount:3,lastBooking:"2026-11-03T15:00",disabledReason:""},
 {id:"sample-04",name:"Demo guest · Riley",email:"riley@example.com",status:"Lead",source:"Instagram",services:[],bookingCount:0,lastBooking:"",disabledReason:""},
 {id:"sample-05",name:"Demo guest · Casey",email:"",status:"Active",source:"Website",services:["chauffeur-services"],bookingCount:1,lastBooking:"2026-11-01T09:00",disabledReason:"No valid email address"},
 {id:"sample-06",name:"Demo guest · Taylor",email:"taylor@example.com",status:"Archived",source:"WhatsApp",services:["yachts"],bookingCount:2,lastBooking:"2026-06-10T11:00",disabledReason:"Archived customer"},
 {id:"sample-07",name:"Demo guest · Quinn",email:"quinn@example.com",status:"Active",source:"Website",services:["private-chefs","yachts"],bookingCount:2,lastBooking:"2026-11-08T18:00",disabledReason:""},
];
