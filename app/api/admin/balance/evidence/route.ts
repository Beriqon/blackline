import {requireAdmin} from '@/lib/supabase-server';
import {balanceDatabase} from '@/lib/balance-server';
export async function GET(request:Request){
 if(!await requireAdmin())return new Response('Administrator access required',{status:403});
 const id=new URL(request.url).searchParams.get('id');if(!id||!/^[a-f0-9-]{36}$/.test(id))return new Response('Invalid reference',{status:400});
 try{const proof=await balanceDatabase<{imageBase64:string}|null>('evidence',{id});if(!proof)return new Response('No screenshot',{status:404});return new Response(new Uint8Array(Buffer.from(proof.imageBase64,'base64')),{headers:{'Content-Type':'image/jpeg','Cache-Control':'private, no-store','Content-Security-Policy':"default-src 'none'; sandbox",'X-Content-Type-Options':'nosniff'}});}catch{return new Response('Screenshot unavailable',{status:503});}
}
