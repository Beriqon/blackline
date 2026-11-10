import {cachedRows,saveRows} from "./workspace-store";
import type { AdminBooking } from "./admin-demo-data";

export const CUSTOMER_KEY = "blackline-customers-v1";
export const CUSTOMER_STATUSES = ["Lead", "Active", "VIP", "Archived"] as const;
export type AdminCustomer = {
  id: string; name: string; email: string; phone: string; company: string;
  source: AdminBooking["source"]; status: typeof CUSTOMER_STATUSES[number];
  preferences: string; notes: string; followUp: string; lastContact: string;
  bookingIds: string[]; testMode?:true; emails?:string[];phones?:string[];sourceCustomerIds?:string[];containsTestBookings?:boolean;
};
export const normalizeEmail = (value: string) => value.trim().toLowerCase();
export const normalizePhone = (value: string) => value.replace(/\D/g, "").replace(/^00/, "");
export function blankCustomer(): AdminCustomer {
  return { id: crypto.randomUUID(), name: "", email: "", phone: "", company: "", source: "WhatsApp", status: "Lead", preferences: "", notes: "", followUp: "", lastContact: "", bookingIds: [] };
}
export function readCustomers(): AdminCustomer[] {return cachedRows<AdminCustomer>("customers");}
export async function saveCustomers(customers:AdminCustomer[]) {await saveRows("customers",customers);}
type Identity={email:string;phone:string;emails?:string[];phones?:string[]};
const emails=(c:Identity)=>[c.email,...(c.emails??[])].map(normalizeEmail).filter(Boolean);
const phones=(c:Identity)=>[c.phone,...(c.phones??[])].map(normalizePhone).filter(p=>p.length>=7&&p.length<=15);
function samePerson(a:Identity,b:Identity){return emails(a).some(e=>emails(b).includes(e))||phones(a).some(p=>phones(b).includes(p));}
export function matchesBooking(customer: AdminCustomer, booking: AdminBooking) {
 return customer.bookingIds.includes(booking.id)||samePerson(customer,booking);
}
const joinText=(values:string[])=>[...new Set(values.flatMap(v=>(v??"").split("\n\n")).filter(Boolean))].join("\n\n");
export function customerDirectory(saved: AdminCustomer[], bookings: AdminBooking[]): AdminCustomer[] {
 const groups:{customer:AdminCustomer;live:boolean;test:boolean}[]=[];
 const rows=[...saved.map(c=>({customer:{...c,bookingIds:[...(c.bookingIds??[])],sourceCustomerIds:[...new Set([c.id,...(c.sourceCustomerIds??[])])]},live:!c.testMode,test:!!c.testMode})),...bookings.map(b=>({customer:{id:"guest-"+encodeURIComponent(normalizeEmail(b.email)||normalizePhone(b.phone)||b.id),name:b.name,email:b.email,phone:b.phone,company:"",source:b.source,status:"Active" as const,preferences:"",notes:"",followUp:"",lastContact:"",bookingIds:[b.id],sourceCustomerIds:[] as string[]},live:!b.testMode,test:!!b.testMode}))];
 for(const row of rows){
  const matches=groups.filter(g=>samePerson(g.customer,row.customer)||g.customer.bookingIds.some(id=>row.customer.bookingIds.includes(id))||g.customer.id===row.customer.id);
  const base=matches[0]??{customer:{...row.customer,bookingIds:[],emails:[],phones:[],sourceCustomerIds:[]},live:false,test:false};
  const all=[...matches.map(g=>g.customer),row.customer];
  base.live=row.live||matches.some(g=>g.live);base.test=row.test||matches.some(g=>g.test);
  base.customer={...base.customer,name:all.find(c=>c.name&&c.name!=="Customer")?.name??row.customer.name,email:all.find(c=>c.email)?.email??"",phone:all.find(c=>c.phone)?.phone??"",company:all.find(c=>c.company)?.company??"",status:all.some(c=>c.status==="VIP")?"VIP":base.customer.status,notes:joinText(all.map(c=>c.notes)),preferences:joinText(all.map(c=>c.preferences)),lastContact:all.map(c=>c.lastContact).filter(Boolean).sort().at(-1)??"",followUp:all.map(c=>c.followUp).filter(Boolean).sort()[0]??"",bookingIds:[...new Set(all.flatMap(c=>c.bookingIds))],emails:[...new Set(all.flatMap(emails))],phones:[...new Set(all.flatMap(phones))],sourceCustomerIds:[...new Set(all.flatMap(c=>c.sourceCustomerIds??[]))],testMode:!base.live&&base.test?true:undefined,containsTestBookings:base.test};
  for(const group of matches){const i=groups.indexOf(group);if(i>=0)groups.splice(i,1);}groups.push(base);
 }
 return groups.map(g=>g.customer);
}
