import "server-only";
import {hasZelleAccess,zelleDatabase} from "./zelle-server";
import {publicProducts} from "./catalog-server";
import type {ZelleOrder} from "./zelle-types";
import {zelleConfirmation} from "./zelle-confirmation-view";
export async function getZelleConfirmation(id:string){
 if(!await hasZelleAccess(id))return null;
 const order=await zelleDatabase<ZelleOrder>("get",{orderId:id});
 if(!order||order.status==="awaiting_transfer")return null;
 let pictures=Object.fromEntries(order.lines.map(line=>[line.productId,line.imageSrc??""]));
 try{const products=await publicProducts();pictures=Object.fromEntries(order.lines.map(line=>[line.productId,line.imageSrc||products.find(p=>p.id===line.productId)?.images.split("\n").find(Boolean)||""]));}catch{}
 return zelleConfirmation(order,pictures);
}
