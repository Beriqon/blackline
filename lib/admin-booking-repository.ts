import type {AdminBooking,AdminProduct} from "./admin-demo-data";
import type {BookingRecord} from "./bookings";
import {cachedRows,saveRow,removeRow} from "./workspace-store";
export function checkoutToAdmin(record:BookingRecord,products:AdminProduct[]):AdminBooking{
 const service=record.service??(record.category==="yacht"?"yachts":"exotic-cars");
 const product=products.find(p=>p.id===`catalog:${service}:${record.itemId}`||p.id===record.itemId);
 return {id:record.id,checkoutId:record.id,paymentStatus:record.status,name:record.customerName,email:record.customerEmail,phone:record.customerPhone??"",source:record.adminSource??(record.source==="instagram"?"Instagram":record.source==="whatsapp"?"WhatsApp":"Website"),affiliate:record.affiliate??"",status:record.adminStatus??(record.status==="cancelled"?"Cancelled":record.status==="pending"?"Pending":"Confirmed"),notes:record.notes??"",items:[{service,product:product?.name??record.itemId,productId:product?.id,start:record.startIso,end:record.endIso,price:record.totalUsd}]};
}
export async function saveAdminBooking(booking:AdminBooking){
 if(!booking.checkoutId){await saveRow("bookings",booking.id,booking);return;}
 const original=cachedRows<BookingRecord>("checkout_bookings").find(b=>b.id===booking.checkoutId);
 if(!original)throw new Error("Reload this booking before saving.");
 const item=booking.items[0];
 if(new Date(item.start).toISOString()!==original.startIso||new Date(item.end).toISOString()!==original.endIso)throw new Error("Create a new reservation to change the dates of an online booking.");
 if(booking.status==="Pending"&&original.status!=="pending")throw new Error("A confirmed online reservation cannot be moved back to pending.");
 if(booking.items.length!==1)throw new Error("Keep an online reservation as one service; create a separate manual booking for additional services.");
 if(item.price!==original.totalUsd)throw new Error("The amount of an online reservation is fixed. Arrange payment adjustments separately.");
 if(item.productId && item.productId!==`catalog:${item.service}:${original.itemId}` && item.productId!==original.itemId)throw new Error("Create a new reservation to change the product of an online booking.");
 await saveRow("checkout_bookings",original.id,{...original,customerName:booking.name,customerEmail:booking.email,customerPhone:booking.phone,notes:booking.notes,adminStatus:booking.status==="Completed"?"Completed":undefined,adminSource:booking.source,affiliate:booking.affiliate,source:booking.source==="WhatsApp"?"whatsapp":booking.source==="Instagram"?"instagram":booking.source==="Website"?"website":"manual",startIso:new Date(item.start).toISOString(),endIso:new Date(item.end).toISOString(),status:booking.status==="Cancelled"?"cancelled":booking.status==="Confirmed"&&original.status==="pending"?"owner_reserved":original.status,updatedAtIso:new Date().toISOString()});
}
export async function deleteAdminBooking(booking:AdminBooking){await removeRow(booking.checkoutId?"checkout_bookings":"bookings",booking.id);}
