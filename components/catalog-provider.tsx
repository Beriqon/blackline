"use client";
import {createContext,useContext,useEffect,useMemo,useState,type ReactNode} from "react";
import type {AdminProduct} from "@/lib/admin-demo-data";
import {applyCatalog} from "@/lib/catalog-live";
import {supabaseBrowser} from "@/lib/supabase-browser";
export const CatalogContext=createContext<readonly AdminProduct[]>([]);
export function CatalogProvider({initial,children}:{initial:AdminProduct[];children:ReactNode}){
 const [products,setProducts]=useState(initial);
 useEffect(()=>{const refresh=async()=>{const {data,error}=await supabaseBrowser().from("products").select("data").eq("status","visible").order("id");if(!error&&data)setProducts(data.map((r:{data:AdminProduct})=>r.data));};window.addEventListener("focus",refresh);window.addEventListener("blackline-database-updated",refresh);return()=>{window.removeEventListener("focus",refresh);window.removeEventListener("blackline-database-updated",refresh);};},[]);
 return <CatalogContext.Provider value={products}>{children}</CatalogContext.Provider>;
}
export function usePublishedCollection<T extends {id:string}>(service:string, originals:readonly T[]){const products=useContext(CatalogContext);return useMemo(()=>applyCatalog(service,originals,products),[service,originals,products]);}
