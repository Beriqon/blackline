import {loadBalance,balanceConfirmation} from '@/lib/balance-confirmation';
import {createOrderConfirmationPdf} from '@/lib/order-confirmation-pdf';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const maxDuration=60;
export async function GET(request:Request){
 const p=new URL(request.url).searchParams;
 try{const record=await loadBalance(p.get('id')??'',p.get('token')??'');if(!record)return Response.json({error:'Confirmation unavailable.'},{status:404});
 const bytes=await createOrderConfirmationPdf(await balanceConfirmation(record));return new Response(new Uint8Array(bytes),{headers:{'Content-Type':'application/pdf','Content-Disposition':`attachment; filename="Blackline-${record.orderId.replace(/[^A-Za-z0-9-]/g,'')}.pdf"`,'Cache-Control':'private, no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff'}});
 }catch{return Response.json({error:'PDF unavailable. Please try again.'},{status:503});}
}
