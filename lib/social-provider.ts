import "server-only";
import {ACCOUNT_SITE_ORIGIN} from "./admin-account";
import {SOCIAL_ACCOUNTS,type SocialPost,type SocialProvider,type SocialReport} from "./social-analytics";

const instagramGraph = "https://graph.instagram.com";
const tiktokApi = "https://open.tiktokapis.com";
const graphVersion = "v25.0";
const scopes = {
 instagram:["instagram_business_basic","instagram_business_manage_insights"],
 tiktok:["user.info.basic","user.info.profile","user.info.stats","video.list"],
};

export type SocialTokens = {accessToken:string; expiresAt:number; refreshToken?:string; refreshExpiresAt?:number};
export class SocialApiError extends Error {
 constructor(readonly kind:"reauthorize"|"unavailable"|"wrong_account"|"permissions") {super(kind);}
}

export function socialCredentials(provider:SocialProvider) {
 const id = (provider==="instagram"?process.env.INSTAGRAM_APP_ID:process.env.TIKTOK_CLIENT_KEY)?.trim();
 const secret = (provider==="instagram"?process.env.INSTAGRAM_APP_SECRET:process.env.TIKTOK_CLIENT_SECRET)?.trim();
 return id&&secret?{id,secret}:null;
}

export function socialCallback(provider:SocialProvider) {
 return `${ACCOUNT_SITE_ORIGIN}/api/admin/social-analytics/${provider}/callback`;
}

export function authorizationUrl(provider:SocialProvider, clientId:string, state:string) {
 const url = new URL(provider==="instagram"?"https://www.instagram.com/oauth/authorize":"https://www.tiktok.com/v2/auth/authorize/");
 url.search = new URLSearchParams({
  [provider==="instagram"?"client_id":"client_key"]:clientId,
  redirect_uri:socialCallback(provider), response_type:"code", state, scope:scopes[provider].join(","),
 }).toString();
 if(provider==="instagram"){
  url.searchParams.set("enable_fb_login","false");
  url.searchParams.set("force_reauth","true");
 }
 return url;
}

async function providerJson<T>(url:URL|string, init?:RequestInit):Promise<T> {
 let response:Response;
 try{response=await fetch(url,{...init,cache:"no-store",redirect:"error",signal:AbortSignal.timeout(8000)});}
 catch{throw new SocialApiError("unavailable");}
 if(response.status===204)return undefined as T;
 const body=await response.json().catch(()=>null);
 const error=body?.error;
 const code=typeof error==="string"?error:error?.code;
 if(!response.ok||!body||(error&&code!=="ok")){
  if(response.status===401||code===190||["invalid_grant","access_token_invalid","token_expired"].includes(code)) throw new SocialApiError("reauthorize");
  if(response.status===403||code===10||code===200||code==="scope_not_authorized") throw new SocialApiError("permissions");
  throw new SocialApiError("unavailable");
 }
 return body as T;
}

function get<T>(origin:string,path:string,params:Record<string,string>,token?:string) {
 const url = new URL(path,origin);
 url.search = new URLSearchParams(params).toString();
 return providerJson<T>(url,token?{headers:{Authorization:`Bearer ${token}`}}:undefined);
}

function form<T>(url:string,params:Record<string,string>) {
 return providerJson<T>(url,{method:"POST",body:new URLSearchParams(params)});
}

type TokenResponse = {access_token?:string; expires_in?:number; refresh_token?:string; refresh_expires_in?:number; scope?:string; permissions?:string|string[]};

function parseToken(token:TokenResponse, previous?:SocialTokens):SocialTokens {
 if(!token.access_token||!Number.isFinite(token.expires_in)||token.expires_in!<=0) throw new SocialApiError("unavailable");
 const now=Date.now();
 return {accessToken:token.access_token,expiresAt:now+token.expires_in!*1000,refreshToken:token.refresh_token??previous?.refreshToken,
  refreshExpiresAt:token.refresh_expires_in?now+token.refresh_expires_in*1000:previous?.refreshExpiresAt};
}

export async function exchangeSocialCode(provider:SocialProvider, code:string, credential:{id:string;secret:string}):Promise<SocialTokens> {
 const common={client_secret:credential.secret,grant_type:"authorization_code",code,redirect_uri:socialCallback(provider)};
 if(provider==="tiktok"){
  const token=await form<TokenResponse>(`${tiktokApi}/v2/oauth/token/`,{...common,client_key:credential.id});
  const granted=new Set(token.scope?.split(",").map(value=>value.trim()));
  if(scopes.tiktok.some(scope=>!granted.has(scope)))throw new SocialApiError("permissions");
  if(!token.refresh_token)throw new SocialApiError("unavailable");
  return parseToken(token);
 }
 const instagramForm=new FormData();
 for(const [name,value] of Object.entries({...common,client_id:credential.id}))instagramForm.set(name,value);
 const result=await providerJson<TokenResponse & {data?:TokenResponse[]}>("https://api.instagram.com/oauth/access_token",{method:"POST",body:instagramForm});
 const short=result.data?.[0]??result;
 if(!short.access_token)throw new SocialApiError("unavailable");
 if(short.permissions){
  const granted=new Set((Array.isArray(short.permissions)?short.permissions:short.permissions.split(",")).map(value=>value.trim()));
  if(scopes.instagram.some(scope=>!granted.has(scope)))throw new SocialApiError("permissions");
 }
 return parseToken(await get<TokenResponse>(instagramGraph,"/access_token",{grant_type:"ig_exchange_token",client_secret:credential.secret,access_token:short.access_token}));
}

export async function refreshSocialTokens(provider:SocialProvider, token:SocialTokens, credentials:{id:string;secret:string}) {
 if(provider==="instagram"){
  if(token.expiresAt<=Date.now())throw new SocialApiError("reauthorize");
  return parseToken(await get<TokenResponse>(instagramGraph,"/refresh_access_token",{grant_type:"ig_refresh_token",access_token:token.accessToken}));
 }
 if(!token.refreshToken||(token.refreshExpiresAt&&token.refreshExpiresAt<=Date.now()))throw new SocialApiError("reauthorize");
 return parseToken(await form<TokenResponse>(`${tiktokApi}/v2/oauth/token/`,{client_key:credentials.id,client_secret:credentials.secret,grant_type:"refresh_token",refresh_token:token.refreshToken}),token);
}

export async function revokeSocialAccess(provider:SocialProvider, token:SocialTokens, credential:{id:string;secret:string}) {
 if(provider==="tiktok"){
  await form(`${tiktokApi}/v2/oauth/revoke/`,{client_key:credential.id,client_secret:credential.secret,token:token.accessToken});
 }
}

type Account = {id?:string; user_id?:string; username?:string; followers_count?:number; media_count?:number; follower_count?:number; video_count?:number};
type TikTokVideo = {id:string;title?:string;video_description?:string;share_url?:string;create_time?:number;view_count?:number;like_count?:number;comment_count?:number;share_count?:number};
type InstagramPost = {id:string;caption?:string;permalink?:string;timestamp?:string;media_product_type?:string;media_type?:string;like_count?:number;comments_count?:number};
type Insight = {name:string;values?:{value?:number}[];total_value?:{value?:number}};
const metric=(value:unknown)=>typeof value==="number"&&Number.isFinite(value)&&value>=0?value:null;

function safePostUrl(value:string|undefined, provider:SocialProvider) {
 if(!value)return null;
 try {
  const url=new URL(value);
  const domain=provider==="instagram"?"instagram.com":"tiktok.com";
  return url.protocol==="https:"&&(url.hostname===domain||url.hostname.endsWith("."+domain))?url.href:null;
 } catch {return null;}
}

export async function socialAccount(provider:SocialProvider, token:SocialTokens):Promise<Account & {username:string}> {
 const account=provider==="instagram"
  ?await get<Account>(instagramGraph,`/${graphVersion}/me`,{fields:"user_id,username,followers_count,media_count"},token.accessToken)
  :(await get<{data:{user:Account}}>(tiktokApi,"/v2/user/info/",{fields:"username,follower_count,video_count"},token.accessToken)).data.user;
 if(account.username?.toLowerCase()!==SOCIAL_ACCOUNTS[provider].username)throw new SocialApiError("wrong_account");
 return {...account,username:account.username};
}

export async function socialReport(provider:SocialProvider,token:SocialTokens):Promise<SocialReport> {
 const account=await socialAccount(provider,token);
 let posts:SocialPost[];
 let partial=false;
 if(provider==="tiktok"){
  const url=new URL("/v2/video/list/",tiktokApi);
  url.searchParams.set("fields","id,title,video_description,share_url,create_time,view_count,like_count,comment_count,share_count");
  const result=await providerJson<{data:{videos:TikTokVideo[]}}>(url,{method:"POST",
   headers:{Authorization:`Bearer ${token.accessToken}`,"Content-Type":"application/json"},body:JSON.stringify({max_count:12})});
  posts=(result.data.videos??[]).map(video=>({
   id:video.id,title:video.title||video.video_description||"TikTok video",url:safePostUrl(video.share_url,provider),
   publishedAt:video.create_time?new Date(video.create_time*1000).toISOString():null,kind:"Video",
   views:metric(video.view_count),likes:metric(video.like_count),comments:metric(video.comment_count),shares:metric(video.share_count),reach:null,averageWatchSeconds:null,
  }));
 }else{
  const accountId=account.user_id??account.id;
  if(!accountId)throw new SocialApiError("unavailable");
  const path=`/${graphVersion}/${encodeURIComponent(accountId)}/media`;
  const result=await get<{data:InstagramPost[]}>(instagramGraph,path,{fields:"id,caption,permalink,timestamp,media_type,media_product_type,like_count,comments_count",limit:"12"},token.accessToken);
  posts=await Promise.all(result.data.map(async post=>{
   const reel=post.media_product_type==="REELS";
   const values=new Map<string,number|null>();
   try {
    const insight=await get<{data:Insight[]}>(instagramGraph,`/${graphVersion}/${encodeURIComponent(post.id)}/insights`,{metric:reel?"views,reach,shares,ig_reels_avg_watch_time":"views,reach,shares"},token.accessToken);
    for(const entry of insight.data)values.set(entry.name,metric(entry.values?.[0]?.value??entry.total_value?.value));
   }catch {partial=true;}
   const watchTime=values.get("ig_reels_avg_watch_time");
   return {id:post.id,title:post.caption||"Instagram post",url:safePostUrl(post.permalink,provider),publishedAt:post.timestamp??null,kind:reel?"Reel":post.media_type==="CAROUSEL_ALBUM"?"Carousel":"Post",
    views:values.get("views")??null,reach:values.get("reach")??null,shares:values.get("shares")??null,likes:metric(post.like_count),comments:metric(post.comments_count),
    averageWatchSeconds:watchTime==null?null:watchTime/1000};
  }));
 }
 return {username:account.username,followers:metric(account.followers_count??account.follower_count),postsCount:metric(account.media_count??account.video_count),posts,updatedAt:new Date().toISOString(),partial};
}
