"use client";

import {useCallback,useEffect,useState} from "react";
import {useSearchParams} from "next/navigation";
import {ArrowUpRight,Camera,Link2,Music2,RefreshCw,Unlink} from "lucide-react";
import {SOCIAL_ACCOUNTS,SOCIAL_PROVIDERS,socialProvider,type SocialPost,type SocialProvider,type SocialStatus} from "@/lib/social-analytics";
import {isLocalDashboardPreview} from "@/lib/dashboard-preview";
import dashboard from "@/app/admin/dashboard/dashboard.module.css";
import styles from "./admin-social-analytics.module.css";

const endpoint="/api/admin/social-analytics";
const icons={instagram:Camera,tiktok:Music2};
const messages:Record<string,string>={
 connected:"Account connected.",
 cancelled:"Authorization was cancelled or declined. Connect again when you’re ready.",
 invalid_state:"The connection session expired. Sign in and start again.",
 wrong_account:"The account you authorized does not match the Blackline profile shown below.",
 permissions:"The platform did not grant the required analytics permissions.",
 setup:"The server credentials are incomplete.",
 failed:"Could not connect the account. Check the provider app and Supabase setup, then try again.",
};
const formatNumber=new Intl.NumberFormat("en-US");
const formatDate=new Intl.DateTimeFormat("en-US",{dateStyle:"medium",timeZone:"UTC"});
const formatRefreshTime=new Intl.DateTimeFormat("en-US",{dateStyle:"medium",timeStyle:"short"});

function postDate(value:string|null) {
 const time=value?Date.parse(value):NaN;
 return Number.isFinite(time)?formatDate.format(time):null;
}

function Post({post}:{post:SocialPost}) {
 const metrics=[
  ["Views",post.views],["Likes",post.likes],["Comments",post.comments],["Shares",post.shares],
  ["Reach",post.reach],["Avg. watch time",post.averageWatchSeconds],
 ] as const;
 return <li className={styles.post}>
  <div className={styles.postHeading}>
   <small>{[post.kind,postDate(post.publishedAt)].filter(Boolean).join(" · ")}</small>
   <h3>{post.title.length>140?post.title.slice(0,137)+"…":post.title}</h3>
   {post.url&&<a href={post.url} target="_blank" rel="noreferrer">View post <ArrowUpRight size={14} aria-hidden="true"/></a>}
  </div>
  <dl className={styles.postMetrics}>{metrics.filter(([,value])=>value!==null).map(([label,value])=>
   <div key={label}><dt>{label}</dt><dd>{formatNumber.format(label==="Avg. watch time"?Math.round(value!*10)/10:value!)}{label==="Avg. watch time"?" s":""}</dd></div>
  )}</dl>
 </li>;
}

export function AdminSocialAnalytics() {
 const params=useSearchParams();
 const [reports,setReports]=useState<Partial<Record<SocialProvider,SocialStatus>>>({});
 const [loading,setLoading]=useState(false);
 const [busy,setBusy]=useState<SocialProvider|null>(null);
 const [feedback,setFeedback]=useState<{text:string;error?:boolean}|null>(null);
 const preview=isLocalDashboardPreview();

 const load=useCallback(async(signal?:AbortSignal)=>{
  if(preview)return;
  setLoading(true);
  try{
   const response=await fetch(endpoint,{cache:"no-store",signal});
   const data=await response.json();
   if(!response.ok)throw new Error(data.error??"Could not load social analytics.");
   if(!signal?.aborted)setReports(data);
  }catch(error){
   if(!signal?.aborted)setFeedback({text:error instanceof Error?error.message:"Could not load social analytics.",error:true});
  }finally{if(!signal?.aborted)setLoading(false);}
 },[preview]);

 useEffect(()=>{
  const controller=new AbortController();
  void load(controller.signal);
  return ()=>controller.abort();
 },[load]);

 async function change(provider:SocialProvider,action:"connect"|"disconnect"){
  if(preview||busy)return;
  setBusy(provider);
  setFeedback(null);
  try{
   const response=await fetch(endpoint+"/"+provider+"/"+action,{method:"POST"});
   const data=await response.json();
   if(!response.ok)throw new Error(data.error??"Could not update the connection.");
   if(action==="connect"){
    window.location.assign(data.url);
    return;
   }
   setFeedback({text:data.revoked?"Account disconnected.":"Account removed from Blackline. You can also remove the app in the platform’s account settings."});
   await load();
  }catch(error){setFeedback({text:error instanceof Error?error.message:"Could not update the connection.",error:true});}
  finally{setBusy(null);}
 }

 const result=params.get("connection")??"";
 const callbackProvider=params.get("provider");
 const callbackMessage=socialProvider(callbackProvider)&&Object.hasOwn(messages,result)?SOCIAL_ACCOUNTS[callbackProvider].label+" · "+messages[result]:null;
 const linked=SOCIAL_PROVIDERS.filter(provider=>reports[provider]?.report);
 return <div className={styles.page}>
  <header className={styles.header}>
   <div><h1>Social analytics</h1><p>Connect Blackline’s Instagram and TikTok accounts to see recent post performance.</p></div>
   {!preview&&<button type="button" className={dashboard.secondary} disabled={loading||!!busy} onClick={()=>{setFeedback(null);void load();}}><RefreshCw size={15}/>{loading?"Refreshing…":"Refresh statistics"}</button>}
  </header>
  {(feedback||callbackMessage)&&<p className={feedback?.error||(!feedback&&result!=="connected")?styles.error:styles.notice} role={feedback?.error||(!feedback&&result!=="connected")?"alert":"status"}>{feedback?.text??callbackMessage}</p>}
  {preview&&<p className={styles.notice}>Sign in on the live Blackline website to manage connections.</p>}
  <section aria-labelledby="social-account-heading">
   <h2 id="social-account-heading" className={styles.sectionTitle}>Accounts</h2>
   <div className={styles.accounts}>{SOCIAL_PROVIDERS.map(provider=>{
    const account=SOCIAL_ACCOUNTS[provider],status=reports[provider],Icon=icons[provider];
    const state=preview?"Read-only":!status?(loading?"Checking connection…":"Connection status unavailable"):
     {setup:"Setup required",disconnected:"Not connected",connected:"Connected",reauthorize:"Reconnect required",unavailable:"Temporarily unavailable"}[status.state];
    return <article key={provider} className={styles.account}>
     <div className={styles.accountHeading}><Icon size={20} aria-hidden="true"/><div><h3>{account.label}</h3><a href={account.url} target="_blank" rel="noreferrer">@{account.username}<ArrowUpRight size={13} aria-hidden="true"/></a></div><span className={styles.status} data-connected={status?.state==="connected"}>{state}</span></div>
     {status?.message&&<p className={styles.accountMessage}>{status.message}</p>}
     {!preview&&status&&["disconnected","connected","reauthorize","unavailable"].includes(status.state)&&<div className={styles.actions}>
      {status.state!=="connected"&&status.state!=="unavailable"&&<button className={dashboard.primary} type="button" disabled={!!busy} onClick={()=>void change(provider,"connect")}><Link2 size={15}/>{status.state==="reauthorize"?"Reconnect":"Connect"} {account.label}</button>}
      {["connected","reauthorize","unavailable"].includes(status.state)&&<button className={dashboard.secondary} type="button" disabled={!!busy} onClick={()=>void change(provider,"disconnect")}><Unlink size={15}/>Disconnect</button>}
     </div>}
    </article>;
   })}</div>
  </section>
  {linked.map(provider=>{
   const report=reports[provider]!.report!,account=SOCIAL_ACCOUNTS[provider];
   return <section className={styles.report} key={provider} aria-label={account.label+" statistics"}>
    <div className={styles.reportHeading}><div><h2>{account.label} performance</h2><p>Up to 12 recent posts with totals reported by {account.label}.</p><p>Updated {formatRefreshTime.format(new Date(report.updatedAt))}</p></div>
     <dl className={styles.accountMetrics}>{report.followers!==null&&<div><dt>Followers</dt><dd>{formatNumber.format(report.followers)}</dd></div>}{report.postsCount!==null&&<div><dt>Posts</dt><dd>{formatNumber.format(report.postsCount)}</dd></div>}</dl></div>
    {report.partial&&<p className={styles.notice}>Some metrics were unavailable from Instagram. The results below show the data received.</p>}
    {report.posts.length?<ul className={styles.posts}>{report.posts.map(post=><Post key={post.id} post={post}/>)}</ul>:<p className={styles.empty}>This account has no published posts available to report.</p>}
   </section>;
  })}
 </div>;
}
