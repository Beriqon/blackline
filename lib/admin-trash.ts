import type {AdminCustomer} from './admin-customers';
import {normalizeEmail,normalizePhone} from './admin-customers';
export type TrashEntry={id:string;kind:'booking'|'customer';recordId:string;name:string;deletedAt:string;permanentlyDeletedAt?:string;customer?:AdminCustomer};
export function customerIsDeleted(customer:AdminCustomer,entries:TrashEntry[]){
 return entries.some(e=>e.kind==='customer'&&(e.recordId===customer.id||e.customer&&(
  [e.customer.email,...(e.customer.emails??[])].map(normalizeEmail).filter(Boolean).some(v=>[customer.email,...(customer.emails??[])].map(normalizeEmail).includes(v))||
  [e.customer.phone,...(e.customer.phones??[])].map(normalizePhone).filter(v=>v.length>=7).some(v=>[customer.phone,...(customer.phones??[])].map(normalizePhone).includes(v))||
  e.customer.bookingIds.some(id=>customer.bookingIds.includes(id))
 )));
}
