import {getZelleConfirmation} from "@/lib/zelle-confirmation";
import {createOrderConfirmationPdf} from "@/lib/order-confirmation-pdf";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export const maxDuration=60;
export async function GET(request:Request){
 const id=new URL(request.url).searchParams.get("order_id");
 if(!id||!/^BL-[A-Z0-9-]{1,100}$/.test(id))return Response.json({error:"Confirmation unavailable."},{status:404});
 try{const confirmation=await getZelleConfirmation(id);if(!confirmation)return Response.json({error:"Confirmation unavailable."},{status:404,headers:{"Cache-Control":"no-store"}});const bytes=await createOrderConfirmationPdf(confirmation);return new Response(new Uint8Array(bytes),{headers:{"Content-Type":"application/pdf","Content-Disposition":`attachment; filename="Blackline-${id}.pdf"`,"Cache-Control":"private, no-store, max-age=0","X-Content-Type-Options":"nosniff","Referrer-Policy":"no-referrer"}});}catch{return Response.json({error:"Your PDF could not be generated. Please try again."},{status:503,headers:{"Cache-Control":"no-store"}});}
}
