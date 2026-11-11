"use client";

import Link from "next/link";
import {useEffect,useState} from "react";
import {ArrowDown,ArrowLeft,ArrowUp,Copy,Mail,Plus,Save,Trash2} from "lucide-react";
import {MarketingAudience} from "./admin-email-marketing";
import {blockKinds,copyDraft,emailStarterLayouts,makeBlock,makeDraft,readEmailDrafts,renderCampaignHtml,safeEmailImage,saveEmailDraft,type BlockKind,type EmailBlock,type EmailDraft} from "@/lib/admin-email-drafts";
import styles from "@/app/admin/dashboard/dashboard.module.css";
import css from "./admin-email-builder.module.css";
import type {ComponentProps} from "react";

type AudienceProps = Omit<ComponentProps<typeof MarketingAudience>,"selectedIds"|"onSelection"|"sample"|"setSample">;
const presets = [...Object.entries(emailStarterLayouts).map(([id, layout]) => [id, layout.label]), ["blank", "Blank layout"]];

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
  return ()=>window.removeEventListener("storage",load);
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
 const save=(item:EmailDraft)=>{
  setError("");
  if(!item.name.trim()){setError("Enter a name before saving.");return false;}
  try{
   const next=saveEmailDraft({...item,name:item.name.trim()});
   setDrafts(next);
   setNotice(item.kind==="campaign"?"Campaign saved on this browser.":"Template saved on this browser.");
   return true;
  }catch{setError("Could not save locally. Browser storage may be full or unavailable. Try removing large images.");return false;}
 };
 const visible=drafts.filter(item=>item.kind===section);
 const templateDrafts=drafts.filter(item=>item.kind==="template");
 const name=section==="campaign"?"campaign":"template";
 return <div className={css.page}>
  <header className={css.header}>
   <div><p className={styles.eyebrow}>BLACKLINE / MARKETING</p><h1>{mode==="campaign"?"Email marketing":draft?"Template editor":"Email templates"}</h1></div>
   {mode==="campaign"?<Link className={styles.secondary} href="/admin/dashboard?view=email-templates">Manage templates</Link>:draft&&<button className={styles.secondary} onClick={()=>{setDraft(null);setNotice("");setError("");}}><ArrowLeft size={15}/>Back to library</button>}
  </header>
  <aside className={css.notice}><strong>Sending coming soon</strong><p>Drafts and templates are saved in this browser. Shared storage and email delivery are awaiting integration.</p></aside>
  {notice&&<p role="status" className={css.notice}>{notice}</p>}
  {error&&<p role="alert" className={css.error}>{error}</p>}
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
     <button aria-pressed={step==="design"} onClick={()=>setStep("design")}>Design email</button>
     <button aria-pressed={step==="review"} onClick={()=>setStep("review")}>{draft.kind==="campaign"?"Preview & send":"Preview design"}</button>
    </nav>
    <div className={css.actions}>
     {draft.kind==="campaign"&&<button className={styles.secondary} onClick={()=>{const template=copyDraft(draft,"template");if(draft.name.trim())template.name=draft.name.trim();save(template);}}><Copy size={14}/>Save as template</button>}
     <button className={styles.primary} onClick={()=>save(draft)}><Save size={15}/>Save {draft.kind==="campaign"?"draft":"template"}</button>
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
      <p>{draft.audienceIds.length} {draft.sampleAudience?"sample ":""}customers selected</p>
      <a className={styles.secondary} href="#campaign-recipients">Choose recipients</a>
      <p>Connect Resend to enable sending. You can save this campaign as a draft now.</p>
      <button className={styles.primary} disabled>Send campaign · Soon</button>
     </>}
    </div></section>}
    <section className={css.panel}>
     <div className={css.previewHeader}><div><strong>Email preview</strong><small>{draft.subject||"Subject line"}</small></div><div className={css.tabs} aria-label="Preview width"><button aria-pressed={!mobile} onClick={()=>setMobile(false)}>Desktop</button><button aria-pressed={mobile} onClick={()=>setMobile(true)}>Mobile</button></div></div>
     {draft.blocks.length?<iframe className={css.frame} data-mobile={mobile} title="Email design preview" sandbox="" srcDoc={renderCampaignHtml(draft,{preview:true})}/>:<p className={css.empty}>Add a block to start your design.</p>}
    </section>
   </div>
   {mode==="campaign"&&<section id="campaign-recipients">
    <MarketingAudience key={draft.id} {...props} selectedIds={draft.audienceIds} onSelection={audienceIds=>update({audienceIds})} sample={draft.sampleAudience} setSample={sampleAudience=>update({sampleAudience})}/>
    <div className={css.library}><button className={styles.primary} onClick={()=>save(draft)}>Save campaign draft</button><button className={styles.secondary} disabled>Send campaign · Soon</button></div>
   </section>}
  </>}
 </div>;
}
