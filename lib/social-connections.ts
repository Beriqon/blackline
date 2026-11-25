import "server-only";
import {createCipheriv,createDecipheriv,randomBytes,randomUUID} from "node:crypto";
import {serverDatabase} from "./supabase-server";
import {refreshSocialTokens,type SocialTokens} from "./social-provider";
import type {SocialProvider} from "./social-analytics";

type Connection = {sealed_tokens:string; refresh_lock:string|null; refresh_until:string|null};
type Database = Awaited<ReturnType<typeof serverDatabase>>;

export function socialEncryptionKey() {
 const input=process.env.SOCIAL_TOKEN_ENCRYPTION_KEY?.trim()??"";
 if(!/^[A-Za-z0-9+/]{43}=$/.test(input))return null;
 const key=Buffer.from(input,"base64");
 return key.length===32?key:null;
}

export function sealSocialTokens(provider:SocialProvider,tokens:SocialTokens,key:Buffer) {
 const iv=randomBytes(12);
 const cipher=createCipheriv("aes-256-gcm",key,iv);
 cipher.setAAD(Buffer.from(provider));
 const ciphertext=Buffer.concat([cipher.update(JSON.stringify(tokens),"utf8"),cipher.final()]);
 return [iv,cipher.getAuthTag(),ciphertext].map(part=>part.toString("base64url")).join(".");
}

export function openSocialTokens(provider:SocialProvider,sealed:string,key:Buffer):SocialTokens {
 const [iv,tag,ciphertext]=sealed.split(".").map(part=>Buffer.from(part,"base64url"));
 const decipher=createDecipheriv("aes-256-gcm",key,iv);
 decipher.setAAD(Buffer.from(provider));
 decipher.setAuthTag(tag);
 return JSON.parse(Buffer.concat([decipher.update(ciphertext),decipher.final()]).toString("utf8")) as SocialTokens;
}

export async function readSocialConnection(db:Database,provider:SocialProvider):Promise<Connection|null> {
 const {data,error}=await db.from("social_connections").select("sealed_tokens,refresh_lock,refresh_until").eq("provider",provider).maybeSingle();
 if(error)throw new Error("Social analytics storage is unavailable. Check the Supabase setup.");
 return data as Connection|null;
}

export async function storeSocialConnection(db:Database,provider:SocialProvider,tokens:SocialTokens,key:Buffer) {
 const {error}=await db.from("social_connections").upsert({provider,sealed_tokens:sealSocialTokens(provider,tokens,key),refresh_lock:null,refresh_until:null});
 if(error)throw new Error("Could not save the social connection.");
}

export async function removeSocialConnection(db:Database,provider:SocialProvider,connection:Connection) {
 const {data,error}=await db.from("social_connections").delete().eq("provider",provider).eq("sealed_tokens",connection.sealed_tokens).select("provider").maybeSingle();
 if(error||!data)throw new Error("The connection changed. Refresh the page and try again.");
}

export async function currentSocialTokens(db:Database,provider:SocialProvider,connection:Connection,key:Buffer,credentials:{id:string;secret:string}) {
 const token=openSocialTokens(provider,connection.sealed_tokens,key);
 const refreshWindow=provider==="instagram"?7*86400000:10*60000;
 if(token.expiresAt>Date.now()+refreshWindow)return token;
 const until=connection.refresh_until?Date.parse(connection.refresh_until):0;
 if(until>Date.now()){
  if(token.expiresAt>Date.now())return token;
  throw new Error("The connection is refreshing. Try again in a moment.");
 }

 const lock=randomUUID();
 let claim=db.from("social_connections").update({refresh_lock:lock,refresh_until:new Date(Date.now()+30000).toISOString()})
  .eq("provider",provider).eq("sealed_tokens",connection.sealed_tokens);
 claim=connection.refresh_lock?claim.eq("refresh_lock",connection.refresh_lock):claim.is("refresh_lock",null);
 const {data,error}=await claim.select("provider").maybeSingle();
 if(error||!data)throw new Error("The connection changed. Refresh the page and try again.");

 try {
  const renewed=await refreshSocialTokens(provider,token,credentials);
  const saved=await db.from("social_connections").update({sealed_tokens:sealSocialTokens(provider,renewed,key),refresh_lock:null,refresh_until:null})
   .eq("provider",provider).eq("refresh_lock",lock).select("provider").maybeSingle();
  if(saved.error||!saved.data)throw new Error("Could not save the renewed social connection.");
  return renewed;
 }catch(error){
  await db.from("social_connections").update({refresh_lock:null,refresh_until:null}).eq("provider",provider).eq("refresh_lock",lock);
  throw error;
 }
}
