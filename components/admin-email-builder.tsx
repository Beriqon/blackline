"use client";

import Link from "next/link";
import {useEffect,useRef,useState} from "react";
import {ArrowDown,ArrowLeft,ArrowUp,Copy,Mail,Plus,Save,Trash2} from "lucide-react";
import {MarketingAudience} from "./admin-email-marketing";
import {loadRows, saveRow, uploadPhoto} from "@/lib/workspace-store";
import {blockKinds,copyDraft,emailStarterLayouts,makeBlock,makeDraft,readEmailDrafts,renderCampaignHtml,safeEmailImage,saveEmailDraft,type BlockKind,type CampaignReview,type EmailBlock,type EmailDraft} from "@/lib/admin-email-drafts";
import {marketingAudience,selectedMarketingRecipients} from "@/lib/admin-email-audience";
import type {AdminCustomer} from "@/lib/admin-customers";
import {isLocalDashboardPreview} from "@/lib/dashboard-preview";
import styles from "@/app/admin/dashboard/dashboard.module.css";
import css from "./admin-email-builder.module.css";
import type {ComponentProps} from "react";

type AudienceProps = Omit<ComponentProps<typeof MarketingAudience>,"customers"|"selectedIds"|"onSelection"|"sample"|"setSample">;
const presets = [...Object.entries(emailStarterLayouts).map(([id, layout]) => [id, layout.label]), ["blank", "Blank layout"]];

class DeliveryError extends Error {
 constructor(message:string,readonly recipientsChanged:boolean){super(message);}
}

async function requestDelivery<T>(body: object): Promise<T> {
 const response = await fetch("/api/admin/email-marketing", {
  method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(body),
 });
 const result = await response.json().catch(() => null);
 if (!response.ok || !result) throw new DeliveryError(result?.error ?? "The email service did not respond. Check Resend before trying again.",result?.recipientsChanged===true);
 return result as T;
}

async function publishCampaignImages(draft: EmailDraft) {
 const publish = (url: string) => url.startsWith("data:") ? uploadPhoto(url) : url;
 const blocks = await Promise.all(draft.blocks.map(async block => ({
  ...block, image: await publish(block.image), secondImage: await publish(block.secondImage),
 })));
 return {...draft, blocks};
}

function PhotoField({label,value,onChange,onError}:{label:string;value:string;onChange:(value:string)=>void;onError:(error:string)=>void}){
 return <div className={css.photoField}>
  <label>{label}<input value={value.startsWith("data:")?"":value} placeholder={value.startsWith("data:")?"Local photo attached":"https://… or /home/…"} onChange={e=>onChange(e.target.value)}/></label>
  {value&&!safeEmailImage(value)&&<small>Use an HTTPS image URL or a local site path.</small>}
  <label>Choose an image<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={event=>{
   const file=event.currentTarget.files?.[0];
   event.currentTarget.value="";
   if(!file)return;
   if(!/^image\/(jpeg|png|webp|gif)$/.test(file.type)||file.size>1024*1024){onError("Choose a JPG, PNG, WebP or GIF under 1 MB.");return;}
   const reader=new FileReader();
   reader.onload=()=>{if(typeof reader.result==="string"){onChange(reader.result);onError("");}};
   reader.onerror=()=>onError("The photo could not be opened.");
   reader.readAsDataURL(file);
  }}/></label>
  {value&&<button className={styles.secondary} onClick={()=>onChange("")}>Remove photo</button>}
 </div>;
}

export function AdminEmailMarketing({mode="campaign",...props}:AudienceProps & {mode?:"campaign"|"template"}){
 const [templates,setTemplates]=useState<EmailDraft[]>([]);
 const [templatesReady,setTemplatesReady]=useState(false);
 const [saving,setSaving]=useState(false);
 const [delivery,setDelivery]=useState<"test"|"prepare"|"send"|null>(null);
 const deliveryLock=useRef(false);
 const [customers,setCustomers]=useState<AdminCustomer[]|null>(null);
 const [customerError,setCustomerError]=useState("");
 const [drafts,setDrafts]=useState<EmailDraft[]>([]);
 const section=mode;
 const [draft,setDraft]=useState<EmailDraft|null>(null);
 const [step,setStep]=useState<"design"|"review">(mode==="campaign"?"review":"design");
 const [layout,setLayout]=useState("offer");
 const [blockKind,setBlockKind]=useState<BlockKind>("image");
 const [mobile,setMobile]=useState(false);
 const [notice,setNotice]=useState("");
 const [error,setError]=useState("");
 useEffect(()=>{
  if(mode!=="campaign"||isLocalDashboardPreview())return;
  let active=true;
  void loadRows<AdminCustomer>("customers").then(rows=>{if(active)setCustomers(rows);})
   .catch(()=>{if(active)setCustomerError("Customer profiles could not be loaded. Reload to review campaign recipients.");});
  return ()=>{active=false;};
 },[mode]);
 useEffect(()=>{
  let active=true;
  void loadRows<EmailDraft>("email_templates").then(rows=>{
   if(active){setTemplates(rows);setTemplatesReady(true);}
  }).catch(()=>{if(active)setError("Shared templates could not be loaded. Reload to try again.");});
  function load(){
   try{setDrafts(readEmailDrafts());}
   catch{setError("Local drafts could not be opened in this browser.");}
  }
  function initialize(){
   load();
   if(mode==="campaign"){
    const starter=makeDraft("campaign");
    setDraft(current=>current??starter);
   }
  }
  initialize();
  window.addEventListener("storage",load);
  return ()=>{active=false;window.removeEventListener("storage",load);};
 },[mode]);
 const open=(item:EmailDraft)=>{setDraft(item);setStep(mode==="campaign"?"review":"design");setError("");setNotice("");};
 const update=(change:Partial<EmailDraft>)=>setDraft(current=>current?{...current,...change}:current);
 const updateBlock=(id:string,change:Partial<EmailBlock>)=>setDraft(current=>current?{...current,blocks:current.blocks.map(block=>block.id===id?{...block,...change}:block)}:current);
 const moveBlock=(index:number,offset:number)=>{
  if(!draft)return;
  const blocks=[...draft.blocks];
  const target=index+offset;
  if(target<0||target>=blocks.length)return;
  [blocks[index],blocks[target]]=[blocks[target],blocks[index]];
  update({blocks});
 };
 const save=async(item:EmailDraft)=>{
  if(saving)return;
  setError("");
  if(!item.name.trim()){setError("Enter a name before saving.");return false;}
  if(item.kind==="template"){
   if(!templatesReady){setError("Shared templates are unavailable. Reload before saving.");return;}
   const saved={...item,name:item.name.trim(),audienceIds:[],sampleAudience:false,updatedAt:new Date().toISOString()};
   setSaving(true);
   try{
    await saveRow("email_templates",saved.id,saved);
    setTemplates(current=>[saved,...current.filter(row=>row.id!==saved.id)]);
    setNotice("Template saved to the shared workspace.");
   }catch(error){setError(error instanceof Error?error.message:"Could not save the shared template.");}
   finally{setSaving(false);}
   return;
  }
  try{
   const next=saveEmailDraft({...item,name:item.name.trim()});
   setDrafts(next);
   setNotice(item.kind==="campaign"?"Campaign saved on this browser.":"Template saved on this browser.");
   return true;
  }catch{setError("Could not save locally. Browser storage may be full or unavailable. Try removing large images.");return false;}
 };
 const sharedIds=new Set(templates.map(item=>item.id));
 const templateDrafts=[...templates,...drafts.filter(item=>item.kind==="template"&&!sharedIds.has(item.id))].sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt));
 const visible=mode==="template"?templateDrafts:drafts.filter(item=>item.kind==="campaign");
 const name=section==="campaign"?"campaign":"template";
 const previewOnly=isLocalDashboardPreview();
 const recipients=draft&&!draft.review&&!draft.sampleAudience&&customers&&props.ready&&props.trashReady
  ? selectedMarketingRecipients(marketingAudience(customers,props.bookings,props.trash),new Set(draft.audienceIds))
  : [];
 const persistCampaign=(item:EmailDraft)=>{
  const next=saveEmailDraft(item);
  setDrafts(next);
  setDraft(next.find(row=>row.id===item.id)??item);
 };
 const deliver=async(action:"test"|"prepare"|"send")=>{
  if(!draft||deliveryLock.current||previewOnly)return;
  deliveryLock.current=true;
  setDelivery(action);
  setNotice("");
  setError("");
  try{
   if(action==="send"){
    if(!draft.review||draft.review.status==="sent")return;
    const attempted:CampaignReview={...draft.review,status:"attempted"};
    persistCampaign({...draft,review:attempted});
    await requestDelivery({action,token:attempted.token});
    persistCampaign({...draft,review:{...attempted,status:"sent"}});
    setNotice("Resend accepted the campaign. Check Resend for delivery status.");
    return;
   }
   const prepared=await publishCampaignImages(draft);
   setDraft(prepared);
   if(action==="test"){
    await requestDelivery({action,draft:prepared,requestId:crypto.randomUUID()});
    setNotice("Resend accepted the test email for blackline235@gmail.com.");
    return;
   }
   const review=await requestDelivery<Omit<CampaignReview,"status">>({
    action,draft:prepared,recipients:recipients.map(contact=>contact.email),postalAddress:draft.postalAddress,
   });
   persistCampaign({...prepared,review:{...review,status:"ready"}});
  }catch(error){
   if(error instanceof DeliveryError&&error.recipientsChanged&&draft.review){
    try{persistCampaign({...draft,review:{...draft.review,status:"ready"}});}
    catch{setError("Could not save changes in this browser.");return;}
   }
   setError(error instanceof Error?error.message:"Could not complete the email request.");
  }
  finally{deliveryLock.current=false;setDelivery(null);}
 };
 const discardReview=()=>{
  if(!draft||draft.review?.status!=="ready")return;
  try{persistCampaign({...draft,review:undefined});setError("");}
  catch{setError("Could not save changes in this browser.");}
 };
 return <div className={css.page}>
  <header className={css.header}>
   <div><p className={styles.eyebrow}>BLACKLINE / MARKETING</p><h1>{mode==="campaign"?"Email marketing":draft?"Template editor":"Email templates"}</h1></div>
   {mode==="campaign"?<Link className={styles.secondary} href="/admin/dashboard?view=email-templates">Manage templates</Link>:draft&&<button className={styles.secondary} onClick={()=>{setDraft(null);setNotice("");setError("");}}><ArrowLeft size={15}/>Back to library</button>}
  </header>
  <aside className={css.notice}>{mode==="template" ? <p>Templates are shared across your workspace. Open and save an older browser template to add it to the shared library.</p> : <p>Campaign drafts are saved in this browser. Saved workspace templates are available to use in campaigns.</p>}</aside>
  {notice&&<p role="status" className={css.notice}>{notice}</p>}
  {error&&<p role="alert" className={css.error}>{error}</p>}
  {customerError&&<p role="alert" className={css.error}>{customerError}</p>}
  <fieldset disabled={!!delivery} className={css.workflow}>
  {(mode==="campaign"||!draft)&&<section className={css.panel}>
   <div className={css.library}>
    <p className={css.libraryDescription}>{section==="campaign"
     ?"Create a mail for a specific group of customers. Choose a design, select recipients and review the campaign."
     :"Create a reusable email design. Use it in a campaign when you’re ready to choose recipients."}</p>
    {mode==="campaign"&&<label>Saved campaign<select value={visible.some(item=>item.id===draft?.id)?draft?.id:""} onChange={e=>{const item=visible.find(item=>item.id===e.target.value);if(item)open(item);}}><option value="" disabled>{visible.length?"Choose a campaign":"No saved campaigns yet"}</option>{visible.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label>}
    <label>Starting layout<select value={layout} onChange={e=>setLayout(e.target.value)}>
     <optgroup label="Starter layouts">{presets.map(([id,label])=><option key={id} value={id}>{label}</option>)}</optgroup>
     {!!templateDrafts.length&&<optgroup label="Saved templates">{templateDrafts.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</optgroup>}
    </select></label>
    <button className={styles.primary} onClick={()=>{const source=templateDrafts.find(item=>item.id===layout);open(source?copyDraft(source,section):makeDraft(section,layout));}}><Plus size={15}/>New {name}</button>
   </div>
   {mode==="template"&&(visible.length?<ul className={css.records}>{visible.map(item=><li key={item.id}>
    <button className={css.record} onClick={()=>open(item)}><Mail size={17}/><span><strong>{item.name}</strong><small>{item.subject||"No subject"} · {item.blocks.length} blocks</small></span></button>
    <button className={styles.secondary} onClick={()=>open(copyDraft(item,item.kind))}><Copy size={14}/>Duplicate</button>
   </li>)}</ul>:<p className={css.empty}>Create your first {name} from a starter layout or a blank design.</p>)}
  </section>}
  {draft&&<>
   <div className={css.toolbar}>
    <nav className={css.tabs} aria-label="Editor sections">
     <button aria-pressed={step==="design"} disabled={!!draft.review} onClick={()=>setStep("design")}>Design email</button>
     <button aria-pressed={step==="review"} onClick={()=>setStep("review")}>{draft.kind==="campaign"?"Preview & send":"Preview design"}</button>
    </nav>
    <div className={css.actions}>
     {draft.kind==="campaign"&&<button className={styles.secondary} disabled={saving||!templatesReady} onClick={()=>{const template=copyDraft(draft,"template");if(draft.name.trim())template.name=draft.name.trim();save(template);}}><Copy size={14}/>Save as template</button>}
     <button className={styles.primary} disabled={saving||(draft.kind==="template"&&!templatesReady)} onClick={()=>void save(draft)}><Save size={15}/>Save {draft.kind==="campaign"?"draft":"template"}</button>
    </div>
   </div>
   <div className={css.editor}>
    {step==="design"?<section className={css.panel}>
     <div className={css.fields}>
      <label>{draft.kind==="campaign"?"Campaign":"Template"} name<input maxLength={120} value={draft.name} onChange={e=>update({name:e.target.value})}/></label>
      <label>Subject<input maxLength={180} value={draft.subject} onChange={e=>update({subject:e.target.value})}/></label>
      <label>Inbox preview text<input maxLength={200} value={draft.preheader} onChange={e=>update({preheader:e.target.value})}/></label>
     </div>
     <div className={css.blocks}>{draft.blocks.map((block,index)=><details key={block.id} className={css.block}>
      <summary>{block.kind} <small>{block.text.slice(0,55)}</small></summary>
      <div className={css.fields}>
       {block.kind!=="gallery"&&<label>{block.kind==="image"?"Caption":"Text"}<textarea rows={block.kind==="text"?5:2} maxLength={8000} value={block.text} onChange={e=>updateBlock(block.id,{text:e.target.value})}/></label>}
       {["logo","cover","image","gallery"].includes(block.kind)&&<>
        <PhotoField label="Image URL" value={block.image} onChange={image=>updateBlock(block.id,{image})} onError={setError}/>
        <label>Image description<input value={block.alt} onChange={e=>updateBlock(block.id,{alt:e.target.value})}/></label>
       </>}
       {block.kind==="gallery"&&<>
        <PhotoField label="Second image URL" value={block.secondImage} onChange={secondImage=>updateBlock(block.id,{secondImage})} onError={setError}/>
        <label>Second image description<input value={block.secondAlt} onChange={e=>updateBlock(block.id,{secondAlt:e.target.value})}/></label>
       </>}
       {block.kind==="button"&&<label>Button URL<input value={block.url} placeholder="https://…" onChange={e=>updateBlock(block.id,{url:e.target.value})}/></label>}
       <div className={css.colors}>
        <label>Text color<input type="color" value={block.color} onChange={e=>updateBlock(block.id,{color:e.target.value})}/></label>
        <label>Background<input type="color" value={block.background} onChange={e=>updateBlock(block.id,{background:e.target.value})}/></label>
       </div>
       <div className={css.actions}>
        <button className={styles.secondary} disabled={index===0} onClick={()=>moveBlock(index,-1)}><ArrowUp size={14}/>Move up</button>
        <button className={styles.secondary} disabled={index===draft.blocks.length-1} onClick={()=>moveBlock(index,1)}><ArrowDown size={14}/>Move down</button>
        <button className={styles.secondary} onClick={()=>update({blocks:draft.blocks.filter(item=>item.id!==block.id)})}><Trash2 size={14}/>Remove</button>
       </div>
      </div>
     </details>)}</div>
     <div className={css.library}><label>Block type<select value={blockKind} onChange={e=>setBlockKind(e.target.value as BlockKind)}>{blockKinds.map(kind=><option key={kind}>{kind}</option>)}</select></label><button className={styles.secondary} onClick={()=>update({blocks:[...draft.blocks,makeBlock(blockKind)]})}><Plus size={14}/>Add block</button></div>
    </section>:<section className={css.panel}><div className={css.fields}>
     <h2>{draft.name||"Untitled draft"}</h2><p>{draft.subject||"No subject entered"}</p>
     {draft.kind==="campaign"&&<>
      {previewOnly&&<p>Sign in as an administrator to send email.</p>}
      {!draft.review&&<>
       <p>{recipients.length} existing customers selected. Customers with an active marketing subscription are eligible. Record their consent in Customers.</p>
       <a className={styles.secondary} href="#campaign-recipients">Choose recipients</a>
       <label>Business mailing address<textarea rows={2} maxLength={350} value={draft.postalAddress??""} onChange={event=>update({postalAddress:event.target.value})}/></label>
       <div className={css.actions}>
        <button className={styles.secondary} disabled={previewOnly} onClick={()=>void deliver("test")}>{delivery==="test"?"Sending test…":"Send test to Blackline Gmail"}</button>
        <button className={styles.primary} disabled={previewOnly||!recipients.length||!draft.postalAddress?.trim()} onClick={()=>void deliver("prepare")}>{delivery==="prepare"?"Preparing recipients…":"Review recipients"}</button>
       </div>
      </>}
      {draft.review&&<>
       <p>{draft.review.count} eligible {draft.review.count===1?"recipient":"recipients"} · {draft.review.excluded} excluded</p>
       {draft.review.status==="sent"?<p>Submitted to Resend for delivery.</p>:<>
        <p>{draft.review.status==="attempted"?"Check the existing broadcast before retrying. Retrying uses the same Resend broadcast.":"Confirm to send this campaign to the eligible recipients above."}</p>
        <div className={css.actions}>
         <button className={styles.primary} disabled={previewOnly} onClick={()=>void deliver("send")}>{delivery==="send"?"Submitting…":draft.review.status==="attempted"?"Retry or check status":"Confirm and send campaign"}</button>
         {draft.review.status==="ready"&&<button className={styles.secondary} onClick={discardReview}>Back to editing</button>}
        </div>
       </>}
      </>}
      <a className={styles.secondary} href="https://resend.com/broadcasts" target="_blank" rel="noreferrer">View campaigns in Resend</a>
     </>}
    </div></section>}
    <section className={css.panel}>
     <div className={css.previewHeader}><div><strong>Email preview</strong><small>{draft.subject||"Subject line"}</small></div><div className={css.tabs} aria-label="Preview width"><button aria-pressed={!mobile} onClick={()=>setMobile(false)}>Desktop</button><button aria-pressed={mobile} onClick={()=>setMobile(true)}>Mobile</button></div></div>
     {draft.blocks.length?<iframe className={css.frame} data-mobile={mobile} title="Email design preview" sandbox="" srcDoc={renderCampaignHtml(draft,{preview:true})}/>:<p className={css.empty}>Add a block to start your design.</p>}
    </section>
   </div>
   {mode==="campaign"&&!draft.review&&<section id="campaign-recipients">
    <MarketingAudience key={draft.id} {...props} ready={props.ready&&(customers!==null||previewOnly)} customers={customers??[]} selectedIds={draft.audienceIds} onSelection={audienceIds=>update({audienceIds})} sample={draft.sampleAudience} setSample={sampleAudience=>update({sampleAudience})}/>
    <div className={css.library}><button className={styles.primary} onClick={()=>save(draft)}>Save campaign draft</button></div>
   </section>}
  </>}
  </fieldset>
 </div>;
}
