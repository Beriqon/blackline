import type {AdminBooking} from "./admin-demo-data";
import {quoteToAdmin} from "./admin-quote-bookings";
import type {AdminProduct} from "./admin-demo-data";
// Only used by the existing localhost read-only preview, never by the live feed.
export function adminPaymentPreview(products:AdminProduct[]):AdminBooking[]{
 const createdAtIso="2026-11-09T18:00:00Z";
 const lines=[{productId:"catalog:exotic-cars:chevrolet-corvette-c8-stingray",title:"Corvette C8 Stingray",description:"Self-drive · November 20",totalCents:59900,status:"priced" as const},{productId:"catalog:villas:placida",title:"Placida",description:"Dates and proposal to be agreed",totalCents:null,status:"price_follows" as const}];
 const items=lines.map(l=>({service:l.totalCents===null?"villas":"exotic-cars",product:l.title,productId:l.productId,start:l.totalCents===null?"":"2026-11-20T10:00:00Z",end:l.totalCents===null?"":"2026-11-21T10:00:00Z",price:(l.totalCents??0)/100,priceFollows:l.totalCents===null,description:l.description}));
 const base={name:"Alex Morgan",email:"alex@example.com",phone:"+1 202 555 0101",source:"Website" as const,affiliate:"",notes:"Read-only example",items,createdAtIso};
 const order={id:"BL-DEMO-ZELLE",customerName:base.name,customerEmail:base.email,customerPhone:base.phone,lines,knownTotalCents:59900,depositCents:17970,remainingCents:0,amountDueCents:59900,paymentType:"full" as const,bookingIds:[],createdAtIso,testMode:false as const,paymentMethod:"zelle" as const,status:"payment_submitted" as const,holdUntilIso:"2026-11-12T18:00:00Z",hasEvidence:false};
 return [{...base,id:order.id,status:"Pending",zelleOrder:order},{...base,id:"BL-DEMO-STRIPE-DEPOSIT",status:"Confirmed",testMode:true,stripeOrder:{knownTotalCents:59900,paidCents:17970,remainingCents:41930,createdAtIso,paymentType:"deposit"}},quoteToAdmin({id:"BL-DEMO-QUOTE",customerName:"Jamie Parker",customerEmail:"jamie@example.com",customerPhone:"+12025550222",source:"whatsapp",status:"pending",createdAtIso,updatedAtIso:createdAtIso,message:"A private villa for four guests. Please confirm dates and pricing.",items:[{category:"villas",id:"placida",title:"Placida"}],summary:"Villa proposal requested"},products)];
}
