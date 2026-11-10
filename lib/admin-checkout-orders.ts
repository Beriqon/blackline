import type {AdminBooking, AdminProduct} from "./admin-demo-data";
import type {BookingRecord} from "./bookings";
import type {CheckoutOrder} from "./checkout-orders";
import type {ZelleOrder} from "./zelle-types";

export function zelleOrderToAdmin({order,bookings}:{order:ZelleOrder;bookings:BookingRecord[]},products:AdminProduct[]):AdminBooking{
 const base=checkoutOrderToAdmin({order:{...order,testMode:true,status:"deposit_paid"},bookings},products);
 return {...base,testMode:undefined,stripeOrder:undefined,zelleOrder:order,paymentStatus:order.status,status:order.status==="confirmed"?"Confirmed":["rejected","expired"].includes(order.status)?"Cancelled":"Pending"};
}

export type AdminCheckoutOrder = {order: CheckoutOrder & {paidAtIso?:string}; bookings: BookingRecord[]};

// Read the paid order itself: one row per order, regardless of webhook retries.
export function checkoutOrderToAdmin({order,bookings}:AdminCheckoutOrder,products:AdminProduct[]):AdminBooking {
 if(typeof order.testMode!=="boolean" || !["deposit_paid","payment_review"].includes(order.status)) throw new Error("Only paid orders belong in this booking feed.");
 const unused=[...bookings];
 return {
  id:order.id,createdAtIso:order.createdAtIso,testMode:order.testMode?true:undefined,paymentStatus:order.status,source:"Website",affiliate:"",status:order.status==="payment_review"?"Pending":"Confirmed",
  name:order.customerName,email:order.customerEmail,phone:order.customerPhone,notes:"",
  stripeOrder:{requiresReview:order.status==="payment_review",reviewReason:(order as CheckoutOrder&{reviewReason?:string}).reviewReason,paymentType:order.paymentType,knownTotalCents:order.knownTotalCents,paidCents:order.amountPaidCents??order.amountDueCents??order.depositCents,remainingCents:order.remainingCents,createdAtIso:order.createdAtIso,paidAtIso:order.paidAtIso},
  items:order.lines.map(line=>{
   const product=products.find(p=>p.id===line.productId);
   const service=product?.service??/^catalog:([^:]+):/.exec(line.productId)?.[1]??"Experience";
   const reservationIndex=line.totalCents===null?-1:unused.findIndex(b=>line.productId===b.itemId || line.productId===`catalog:${b.service??(b.category==="yacht"?"yachts":"exotic-cars")}:${b.itemId}`);
   const reservation=reservationIndex<0?undefined:unused.splice(reservationIndex,1)[0];
   return {service,product:line.title,productId:line.productId,start:reservation?.startIso??"",end:reservation?.endIso??"",price:(line.totalCents??0)/100,priceFollows:line.totalCents===null,description:line.description,imageSrc:line.imageSrc??product?.images.split("\n").find(Boolean)};
  }),
 };
}
