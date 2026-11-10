import type {Metadata} from 'next';
import {loadBalance,balanceConfirmation} from '@/lib/balance-confirmation';
import {BlacklineConfirmation} from '@/components/blackline-confirmation';
import {BalancePaymentPage} from '@/components/balance-payment';
export const dynamic='force-dynamic';
export const metadata:Metadata={title:'Your remaining balance — Blackline',robots:{index:false,follow:false},referrer:'no-referrer'};
export default async function Page({searchParams}:{searchParams:Promise<{id?:string;token?:string}>}){
 const p=await searchParams;let record=null;
 try{record=await loadBalance(p.id??'',p.token??'');}catch{}
 if(!record)return <BalancePaymentPage record={null} token="" publishableKey=""/>;
 if(record.status==='paid'||record.status==='zelle_submitted')return <BlacklineConfirmation confirmation={await balanceConfirmation(record)} pdfUrl={`/api/balance/confirmation?id=${encodeURIComponent(record.id)}&token=${encodeURIComponent(p.token??'')}`}/>;
 return <BalancePaymentPage record={record} token={p.token??''} publishableKey={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim()??''}/>;
}
