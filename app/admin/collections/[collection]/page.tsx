import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ADMIN_SERVICES } from "@/lib/admin-demo-data";
import { AdminDashboard } from "@/components/admin-dashboard";
type Props={params:Promise<{collection:string}>};
const aliases:Record<string,string>={"on-the-water":"jetskis-jetcars","vip-venues":"vip-nightlife","photo-video-shoots":"photographer"};
export async function generateMetadata({params}:Props){const {collection}=await params;const key=aliases[collection]??collection;return {title:(ADMIN_SERVICES.find(s=>s[0]===key)?.[1]??"Collection")+" — Admin",robots:{index:false,follow:false}};}
export default async function CollectionPage({params}:Props){const {collection}=await params;const key=aliases[collection]??collection;if(!ADMIN_SERVICES.some(s=>s[0]===key))notFound();return <Suspense fallback={null}><AdminDashboard initialView={key}/></Suspense>;}
