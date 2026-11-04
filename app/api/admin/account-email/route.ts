import {NextResponse} from "next/server";
import {publicDatabase} from "@/lib/supabase-server";
import {accountEmailRequest,requestAccountEmail,accountRequestOriginAllowed} from "@/lib/admin-account";
const attempts=new Map<string,number>();
export async function POST(request:Request){
 if(!accountRequestOriginAllowed(request.headers.get("origin"),request.headers.get("host"),process.env.NODE_ENV==="development"))return NextResponse.json({error:"Please submit this form from the Blackline website."},{status:403});
 let body:unknown;
 try{if(Number(request.headers.get("content-length")??0)>2048)throw new Error();body=await request.json();accountEmailRequest(body);}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Invalid request."},{status:400});}
 // Supabase enforces its own distributed mail limits as well as this local cooldown.
 const key="administrator",now=Date.now();
 if((attempts.get(key)??0)>now-60000)return NextResponse.json({error:"Please wait a minute before requesting another email."},{status:429,headers:{"Retry-After":"60"}});
 attempts.set(key,now);
 try{
  const {error}=await requestAccountEmail(body,publicDatabase().auth);
  if(error){console.error("[account-email] Supabase rejected the email request",{status:error.status});return NextResponse.json({error:error.status===429?"Too many requests. Please wait before trying again.":"The email could not be sent. Please try again later or contact Blackline."},{status:error.status===429?429:502});}
  return NextResponse.json({ok:true},{headers:{"Cache-Control":"no-store"}});
 }catch{return NextResponse.json({error:"The email service is currently unavailable. Please try again later."},{status:502});}
}
