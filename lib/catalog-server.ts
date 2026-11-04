import "server-only";
import { cache } from "react";
import { publicDatabase } from "./supabase-server";
import type {AdminProduct} from "./admin-demo-data";
import {applyCatalog,applyProduct} from "./catalog-live";
export const publicProducts=cache(async():Promise<AdminProduct[]>=>{
 const {data,error}=await publicDatabase().from("products").select("data").eq("status","visible").order("id");
 if(error)throw new Error("The catalog could not be loaded. Please try again.");return (data??[]).map(row=>row.data as AdminProduct);
});
export async function publishedCollection<T extends {id:string}>(service:string,originals:readonly T[]){return applyCatalog(service,originals,await publicProducts());}
export async function publishedProduct<T extends {id:string}>(service:string,id:string,original?:T):Promise<T|undefined>{const p=(await publicProducts()).find(p=>p.service===service&&(p.id===id||p.id===`catalog:${service}:${id}`));return p?applyProduct(service,original,p):undefined;}
