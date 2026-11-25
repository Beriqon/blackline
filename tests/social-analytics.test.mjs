import assert from "node:assert/strict";
import fs from "node:fs";
import {createRequire} from "node:module";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const require=createRequire(import.meta.url);
function loadSocial(fetch) {
 const modules=new Map();
 function load(name) {
  if(name==="server-only"||name==="supabase-server")return {};
  if(name.startsWith("node:"))return require(name);
  if(modules.has(name))return modules.get(name);
  const api={};
  modules.set(name,api);
  const source=fs.readFileSync(new URL(`../lib/${name}.ts`,import.meta.url),"utf8");
  const {outputText}=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}});
  vm.runInNewContext(outputText,{exports:api,require:module=>load(module.replace(/^\.\//,"")),URL,URLSearchParams,FormData,Buffer,AbortSignal,fetch,process});
  return api;
 }
 return {...load("social-provider"),...load("social-connections")};
}

test("OAuth uses the expected providers, read permissions and registered Blackline callbacks",()=>{
 const api=loadSocial(()=>assert.fail("Unexpected network request"));
 for(const [provider,hostname] of [["instagram","www.instagram.com"],["tiktok","www.tiktok.com"]]){
  const url=api.authorizationUrl(provider,"app-test","nonce");
  assert.equal(url.hostname,hostname);
  assert.equal(url.searchParams.get("state"),"nonce");
  assert.equal(url.searchParams.get("redirect_uri"),`https://www.blacklineconcierge.group/api/admin/social-analytics/${provider}/callback`);
  assert.doesNotMatch(url.href,/client_secret|content_publish/);
 }
});

test("stored tokens are encrypted, randomized and tied to the provider",()=>{
 const api=loadSocial(()=>assert.fail("Unexpected network request"));
 const key=Buffer.alloc(32,9);
 const tokens={accessToken:"mock-access",expiresAt:1700000000000,refreshToken:"mock-refresh"};
 const first=api.sealSocialTokens("tiktok",tokens,key);
 const second=api.sealSocialTokens("tiktok",tokens,key);
 assert.notEqual(first,second);
 assert.ok(!first.includes(tokens.accessToken));
 assert.equal(api.openSocialTokens("tiktok",first,key).refreshToken,tokens.refreshToken);
 assert.throws(()=>api.openSocialTokens("instagram",first,key));
 assert.throws(()=>api.openSocialTokens("tiktok",first,Buffer.alloc(32,8)));
});

test("TikTok excludes other accounts and never invents or exposes unavailable data",async()=>{
 let requested=0;
 let username="other-account";
 const api=loadSocial(async(url,options)=>{
  requested++;
  assert.equal(options.headers.Authorization,"Bearer mock-access");
  if(url.pathname==="/v2/user/info/")return Response.json({data:{user:{username,follower_count:28}},error:{code:"ok"}});
  assert.equal(url.pathname,"/v2/video/list/");
  return Response.json({data:{videos:[{id:"1",title:"Arrival",create_time:1700000000,view_count:60,like_count:0,share_url:"https://example.com/forged"}]},error:{code:"ok"}});
 });
 const tokens={accessToken:"mock-access",expiresAt:1700000000000};
 await assert.rejects(api.socialReport("tiktok",tokens),error=>error.kind==="wrong_account");
 assert.equal(requested,1);
 username="blacklineconcierge";
 const result=await api.socialReport("tiktok",tokens);
 assert.equal(result.followers,28);
 assert.equal(result.posts[0].views,60);
 assert.equal(result.posts[0].likes,0);
 assert.equal(result.posts[0].averageWatchSeconds,null);
 assert.equal(result.posts[0].url,null);
 assert.ok(!JSON.stringify(result).includes(tokens.accessToken));
});

test("Instagram shows available metrics when other media insights fail",async()=>{
 const api=loadSocial(async(url)=>{
  if(url.pathname.endsWith("/me"))return Response.json({user_id:"account",username:"blackline_concierge",media_count:2});
  if(url.pathname.endsWith("/media"))return Response.json({data:[
   {id:"reel",media_product_type:"REELS",like_count:4,permalink:"https://www.instagram.com/reel/example/"},
   {id:"post",like_count:2,comments_count:1},
  ]});
  if(url.pathname.endsWith("/reel/insights"))return Response.json({data:[{name:"views",values:[{value:100}]},{name:"ig_reels_avg_watch_time",values:[{value:2400}]}]});
  return Response.json({error:{code:10}},{status:403});
 });
 const report=await api.socialReport("instagram",{accessToken:"mock",expiresAt:1700000000000});
 assert.equal(report.partial,true);
 assert.equal(report.posts[0].averageWatchSeconds,2.4);
 assert.equal(report.posts[1].views,null);
 assert.equal(report.posts[1].comments,1);
});

test("Instagram exchanges the authorization code server-side and TikTok keeps the rotated refresh token",async()=>{
 const api=loadSocial(async(url,options)=>{
  const parsed=new URL(url);
  if(parsed.hostname==="api.instagram.com"){
   assert.equal(options.body.get("code"),"test-code");
   assert.equal(options.body.get("client_secret"),"test-secret");
   return Response.json({data:[{access_token:"short",permissions:"instagram_business_basic,instagram_business_manage_insights"}]});
  }
  if(parsed.hostname==="graph.instagram.com"){
   assert.equal(parsed.searchParams.get("access_token"),"short");
   return Response.json({access_token:"long",expires_in:5184000});
  }
  assert.equal(parsed.hostname,"open.tiktokapis.com");
  assert.equal(options.body.get("refresh_token"),"previous");
  return Response.json({access_token:"new-access",expires_in:7200,refresh_token:"rotated",refresh_expires_in:86400});
 });
 const credentials={id:"test-id",secret:"test-secret"};
 assert.equal((await api.exchangeSocialCode("instagram","test-code",credentials)).accessToken,"long");
 const newTokens=await api.refreshSocialTokens("tiktok",{accessToken:"old",expiresAt:0,refreshToken:"previous"},credentials);
 assert.equal(newTokens.refreshToken,"rotated");
 assert.ok(newTokens.refreshExpiresAt>Date.now());
});
