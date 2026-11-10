import {randomUUID} from 'node:crypto';
import {requireAdmin} from '@/lib/supabase-server';
import {sameOrigin} from '@/lib/zelle-server';
import {balanceDatabase,balancePath} from '@/lib/balance-server';
import {getAppBaseUrl} from '@/lib/stripe-client';
export const runtime='nodejs';
export async function POST(request:Request){
 if(!sameOrigin(request)||!await requireAdmin())return Response.json({error:'Administrator access required.'},{status:403});
 try{const body=await request.json();
 if(body.operation==='create'){
  if(!['stripe','zelle'].includes(body.source)||typeof body.orderId!=='string')return Response.json({error:'Invalid order.'},{status:400});
  const record=await balanceDatabase('create',{id:randomUUID(),source:body.source,orderId:body.orderId});
  if(!record)throw Error('Order unavailable.');return Response.json({url:getAppBaseUrl()+balancePath(record.id),record},{headers:{'Cache-Control':'no-store'}});
 }
 if(!['confirm','reject'].includes(body.operation)||typeof body.id!=='string'||body.bankChecked!==true)return Response.json({error:'Bank verification is required.'},{status:400});
 const record=await balanceDatabase(body.operation,{id:body.id,bankChecked:true,note:typeof body.note==='string'?body.note.slice(0,2000):''});return Response.json({record},{headers:{'Cache-Control':'no-store'}});
 }catch{return Response.json({error:'Could not update the balance payment. Refresh the booking and check the current balance.'},{status:409});}
}
