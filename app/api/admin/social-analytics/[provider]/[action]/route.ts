import {randomBytes,timingSafeEqual} from "node:crypto";
import {NextRequest,NextResponse} from "next/server";
import {ACCOUNT_SITE_ORIGIN} from "@/lib/admin-account";
import {socialProvider} from "@/lib/social-analytics";
import {openSocialTokens,readSocialConnection,removeSocialConnection,socialEncryptionKey,storeSocialConnection} from "@/lib/social-connections";
import {authorizationUrl,exchangeSocialCode,revokeSocialAccess,socialAccount,SocialApiError,socialCredentials} from "@/lib/social-provider";
import {requireAdmin,serverDatabase} from "@/lib/supabase-server";

export const runtime="nodejs";
const headers={"Cache-Control":"no-store","Referrer-Policy":"no-referrer"};
const cookieOptions={httpOnly:true,secure:true,sameSite:"lax" as const,path:"/"};
const cookieName=(provider:string)=>`__Host-blackline-${provider}-state`;
type Context={params:Promise<{provider:string;action:string}>};

function returnToDashboard(provider:string,result:string) {
 const url=new URL("/admin/marketing",ACCOUNT_SITE_ORIGIN);
 url.searchParams.set("provider",provider);
 url.searchParams.set("connection",result);
 const response=NextResponse.redirect(url,{headers});
 response.cookies.set(cookieName(provider),"",{...cookieOptions,maxAge:0});
 return response;
}

export async function POST(request:NextRequest,{params}:Context) {
 const {provider,action}=await params;
 if(!socialProvider(provider)||!["connect","disconnect"].includes(action))return NextResponse.json({error:"Unknown connection."},{status:404,headers});
 if(request.headers.get("origin")!==request.nextUrl.origin||!await requireAdmin()){
  return NextResponse.json({error:"Sign in as a Blackline administrator."},{status:403,headers});
 }
 const key=socialEncryptionKey();
 const credentials=socialCredentials(provider);
 if(!key||!credentials)return NextResponse.json({error:"Set up the social analytics server credentials first."},{status:503,headers});
 if(action==="connect"&&request.nextUrl.origin!==ACCOUNT_SITE_ORIGIN){
  return NextResponse.json({error:"Connect this account from the live Blackline website."},{status:400,headers});
 }
 try {
  const db=await serverDatabase();
  const connection=await readSocialConnection(db,provider);
  if(action==="connect"){
   const state=randomBytes(32).toString("base64url");
   const response=NextResponse.json({url:authorizationUrl(provider,credentials.id,state).href},{headers});
   response.cookies.set(cookieName(provider),state,{...cookieOptions,maxAge:600});
   return response;
  }
  if(connection){
   if(connection.refresh_until&&Date.parse(connection.refresh_until)>Date.now()){
    return NextResponse.json({error:"This connection is refreshing. Try again shortly."},{status:409,headers});
   }
   const tokens=openSocialTokens(provider,connection.sealed_tokens,key);
   let revoked=provider==="tiktok";
   try{await revokeSocialAccess(provider,tokens,credentials);}
   catch{revoked=false;}
   await removeSocialConnection(db,provider,connection);
   return NextResponse.json({ok:true,revoked},{headers});
  }
  return NextResponse.json({ok:true,revoked:false},{headers});
 }catch{
  return NextResponse.json({error:"Could not update the social connection. Check the Supabase setup and try again."},{status:502,headers});
 }
}

export async function GET(request:NextRequest,{params}:Context) {
 const {provider,action}=await params;
 if(!socialProvider(provider)||action!=="callback")return NextResponse.json({error:"Unknown callback."},{status:404,headers});
 const state=request.nextUrl.searchParams.get("state")??"";
 const expected=request.cookies.get(cookieName(provider))?.value??"";
 const nonce=/^[A-Za-z0-9_-]{43}$/;
 if(!nonce.test(state)||!nonce.test(expected)||!timingSafeEqual(Buffer.from(state),Buffer.from(expected))||!await requireAdmin()){
  return returnToDashboard(provider,"invalid_state");
 }
 const code=request.nextUrl.searchParams.get("code");
 if(request.nextUrl.searchParams.has("error")||!code||code.length>4096)return returnToDashboard(provider,"cancelled");
 const key=socialEncryptionKey();
 const credentials=socialCredentials(provider);
 if(!key||!credentials)return returnToDashboard(provider,"setup");
 try {
  const tokens=await exchangeSocialCode(provider,code,credentials);
  await socialAccount(provider,tokens);
  await storeSocialConnection(await serverDatabase(),provider,tokens,key);
  return returnToDashboard(provider,"connected");
 }catch(error){
  if(error instanceof SocialApiError&&["wrong_account","permissions"].includes(error.kind))return returnToDashboard(provider,error.kind);
  return returnToDashboard(provider,"failed");
 }
}
