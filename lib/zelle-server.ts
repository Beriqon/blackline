import "server-only";
import {createHmac,timingSafeEqual} from "node:crypto";
import {cookies} from "next/headers";
import {publicDatabase} from "./supabase-server";
const cookieName=(id:string)=>"blackline_zelle_"+id;
function signature(id:string){const key=process.env.BLACKLINE_BOOKING_TOKEN;if(!key)throw Error("Booking database is not configured.");return createHmac("sha256",key).update("zelle-access:"+id).digest("hex");}
export async function grantZelleAccess(id:string){(await cookies()).set(cookieName(id),`${id}.${signature(id)}`,{httpOnly:true,sameSite:"strict",secure:process.env.NODE_ENV==="production",path:"/",maxAge:7*86400});}
export async function hasZelleAccess(id:string){if(!/^BL-[A-Z0-9-]{1,100}$/.test(id))return false;const actual=Buffer.from((await cookies()).get(cookieName(id))?.value??"");const expected=Buffer.from(`${id}.${signature(id)}`);return actual.length===expected.length&&timingSafeEqual(actual,expected);}
export async function zelleDatabase<T>(operation:string,payload:unknown):Promise<T>{const {data,error}=await publicDatabase().rpc("blackline_zelle_request",{token:process.env.BLACKLINE_BOOKING_TOKEN,operation,payload});if(error)throw Error(error.message);return data as T;}
export function sameOrigin(request:Request){return request.headers.get("origin")===new URL(request.url).origin;}
