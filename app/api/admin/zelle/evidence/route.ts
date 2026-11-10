import {requireAdmin} from "@/lib/supabase-server";
import {zelleDatabase} from "@/lib/zelle-server";
export const runtime="nodejs";
export async function GET(request:Request){
 if(!await requireAdmin())return new Response("Administrator access required",{status:403});
 const id=new URL(request.url).searchParams.get("order_id");if(!id||!/^BL-[A-Z0-9-]+$/.test(id))return new Response("Invalid order",{status:400});
 try{const proof=await zelleDatabase<{imageBase64:string}|null>("evidence",{orderId:id});if(!proof)return new Response("No screenshot submitted",{status:404});return new Response(new Uint8Array(Buffer.from(proof.imageBase64,"base64")),{headers:{"Content-Type":"image/jpeg","Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff","Content-Disposition":'inline; filename="zelle-payment.jpg"',"Content-Security-Policy":"default-src 'none'; sandbox"}});}catch{return new Response("Screenshot unavailable",{status:503});}
}
