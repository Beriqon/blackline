import type {AdminBooking,AdminProduct} from "./admin-demo-data";
import type {QuoteRequestRecord} from "./quote-requests-store";
function messageField(message:string,labels:string){return new RegExp(`^(?:${labels})\\s*:\\s*(.+)$`,"im").exec(message??"")?.[1].trim()??"";}
export function quoteToAdmin(request:QuoteRequestRecord,products:AdminProduct[]):AdminBooking{
 const name=request.customerName&&request.customerName!=="Customer"?request.customerName:messageField(request.message,"Name|Nombre|Naam")||"Contact details not provided";
 const email=request.customerEmail||messageField(request.message,"Email|E-mail|Correo");
 const phone=request.customerPhone||messageField(request.message,"Phone(?: number)?|Tel[eé]fono|Telefoon|WhatsApp|Mobile");
 return {id:request.id,createdAtIso:request.createdAtIso,quoteRequest:request,name,email,phone,source:request.source==="whatsapp"?"WhatsApp":request.source==="instagram"?"Instagram":"Website",affiliate:"",status:request.status==="cancelled"?"Cancelled":request.status==="confirmed"?"Confirmed":"Pending",notes:request.message,items:request.items?.length?request.items.map(item=>{const product=products.find(p=>p.id===item.id||p.id.endsWith(":"+item.id));return {service:product?.service??item.category,product:item.title,productId:product?.id??item.id,start:"",end:"",price:0,priceFollows:true,description:item.subtitle,imageSrc:product?.images.split("\n").find(Boolean)};}):[{service:"Quote request",product:request.summary||"Concierge quote request",start:"",end:"",price:0,priceFollows:true}]};
}
export function combineBookingQuotes(bookings:AdminBooking[],requests:QuoteRequestRecord[],products:AdminProduct[]){
 const rows=bookings.map(b=>({...b,items:[...b.items],linkedQuotes:[...(b.linkedQuotes??[])]}));
 for(const request of requests){
  const quote=quoteToAdmin(request,products);
  const parent=request.orderId?rows.find(b=>b.id===request.orderId&&!!quote.email&&b.email.trim().toLowerCase()===quote.email.trim().toLowerCase()):undefined;
  if(parent){parent.linkedQuotes.push(request);for(const item of quote.items)if(!parent.items.some(i=>i.productId&&i.productId===item.productId))parent.items.push(item);}
  else rows.push({...quote,linkedQuotes:[]});
 }
 return rows;
}
