import type {Metadata} from "next";
import Link from "next/link";
import {hasZelleAccess,zelleDatabase} from "@/lib/zelle-server";
import type {ZelleOrder} from "@/lib/zelle-types";
import {ZellePayment} from "@/components/zelle-payment";
import {BlacklineConfirmation} from "@/components/blackline-confirmation";
import {getZelleConfirmation} from "@/lib/zelle-confirmation";
export const metadata:Metadata={title:"Zelle payment | Blackline",robots:{index:false,follow:false},referrer:"no-referrer"};
export const dynamic="force-dynamic";
export default async function Page({searchParams}:{searchParams:Promise<{order_id?:string}>}){
 const {order_id:id}=await searchParams;let order:ZelleOrder|null=null;
 if(id&&await hasZelleAccess(id))try{order=await zelleDatabase<ZelleOrder>("get",{orderId:id});}catch{}
 if(!order)return <section style={{padding:80,textAlign:"center"}}><h1>Your Zelle order is unavailable</h1><p>Open your payment instructions in the browser where you started checkout, or contact your concierge.</p><Link href="/contact">Contact Blackline</Link></section>;
 if(order.status!=="awaiting_transfer")return <BlacklineConfirmation confirmation={await getZelleConfirmation(order.id)}/>;
 return <ZellePayment order={order}/>;
}
