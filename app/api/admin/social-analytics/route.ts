import {SOCIAL_PROVIDERS,type SocialStatus} from "@/lib/social-analytics";
import {currentSocialTokens,readSocialConnection,socialEncryptionKey} from "@/lib/social-connections";
import {SocialApiError,socialCredentials,socialReport} from "@/lib/social-provider";
import {requireAdmin,serverDatabase} from "@/lib/supabase-server";

export const runtime="nodejs";
export const maxDuration=60;

export async function GET() {
 const headers={"Cache-Control":"no-store"};
 if(!await requireAdmin())return Response.json({error:"Sign in as a Blackline administrator."},{status:403,headers});
 const db=await serverDatabase();
 const key=socialEncryptionKey();
 const reports=await Promise.all(SOCIAL_PROVIDERS.map(async provider=>{
  const credentials=socialCredentials(provider);
  let status:SocialStatus;
  if(!credentials||!key)status={state:"setup",message:"Add the server credentials to enable this connection."};
  else{
   try {
    const connection=await readSocialConnection(db,provider);
    if(!connection)status={state:"disconnected"};
    else {
     const tokens=await currentSocialTokens(db,provider,connection,key,credentials);
     status={state:"connected",report:await socialReport(provider,tokens)};
    }
   }catch(error){
    if(error instanceof SocialApiError){
     status=error.kind==="unavailable"?{state:"unavailable",message:"The platform could not load statistics. Try refreshing."}:
      {state:"reauthorize",message:"Reconnect the Blackline account and approve the requested analytics permissions."};
    }else{
     status={state:"unavailable",message:"Could not load this connection. Check storage setup or try again."};
    }
   }
  }
  return [provider,status] as const;
 }));
 return Response.json(Object.fromEntries(reports),{headers});
}
