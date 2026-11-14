"use client";

import {useEffect,useRef,useState} from "react";
import {Building2,ChevronRight,FileCheck2,FileSpreadsheet,FileText,Files,FolderOpen,Handshake,Plus,Search,ShieldCheck,Upload,X} from "lucide-react";
import styles from "@/app/admin/dashboard/dashboard.module.css";
import css from "./admin-documents.module.css";

import {supabaseBrowser} from "@/lib/supabase-browser";

const folders=[
 {id:"contracts",name:"Contracts",description:"Rental contracts, service agreements and signed customer contracts.",Icon:FileCheck2},
 {id:"invoices",name:"Invoices & receipts",description:"Customer invoices, supplier invoices and proof of business expenses.",Icon:FileSpreadsheet},
 {id:"suppliers",name:"Supplier agreements",description:"Supplier terms, price agreements and rental partner documents.",Icon:Handshake},
 {id:"company",name:"Company & insurance",description:"Business registration, insurance policies and company certificates.",Icon:ShieldCheck},
 {id:"bookings",name:"Booking documents",description:"Itineraries, confirmations and instructions for a specific booking.",Icon:FolderOpen},
 {id:"templates",name:"Templates",description:"Reusable blank contracts, proposals and document templates.",Icon:Files},
] as const;
type FolderId=typeof folders[number]["id"];
const contexts=["Business","Booking","Supplier","Broker"] as const;
type Context=typeof contexts[number];
type DocumentRecord={id:string;name:string;folder:FolderId;context:Context;reference:string;format:"PDF"|"DOCX"|"XLSX";status:"Signed"|"Filed"|"Draft"|"Needs review";created_at:string;description:string};
const mime={PDF:"application/pdf",DOCX:"application/vnd.openxmlformats-officedocument.wordprocessingml.document",XLSX:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"};
const date=(value:string)=>new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric",year:"numeric",timeZone:"UTC"}).format(new Date(value));

export function AdminDocuments({demoDocuments, hiddenFolders = []}: {demoDocuments?: DocumentRecord[]; hiddenFolders?: FolderId[]} = {}){
 const [folder,setFolder]=useState<FolderId|"all">("all"),[context,setContext]=useState<Context|"all">("all"),[query,setQuery]=useState(""),[status,setStatus]=useState("all"),[format,setFormat]=useState("all");
 const [selected,setSelected]=useState<DocumentRecord|null>(null),[draft,setDraft]=useState({name:"",folder:"contracts" as FolderId,context:"Business" as Context,reference:"",notes:""});
 const details=useRef<HTMLDialogElement>(null),upload=useRef<HTMLDialogElement>(null);
 const [documents,setDocuments]=useState<DocumentRecord[]>(demoDocuments ?? []);
 const [loading,setLoading]=useState(!demoDocuments),[failed,setFailed]=useState(false);
 const [busy,setBusy]=useState(false),[error,setError]=useState("");
 useEffect(()=>{
  if(demoDocuments)return;
  let active=true;
  async function load(){
   try{
    const db=supabaseBrowser();
    const {data:allowed,error:accessError}=await db.rpc("is_blackline_admin");
    if(accessError||!allowed)throw new Error("Access denied");
    const records:DocumentRecord[]=[];
    for(let offset=0;;offset+=200){
     const {data,error}=await db.from("admin_documents").select("*")
      .order("created_at",{ascending:false}).order("id").range(offset,offset+199);
     if(error)throw error;
     if(!active)return;
     records.push(...data);
     if(data.length<200)break;
    }
    setDocuments(records);
   }catch{
    if(active)setFailed(true);
   }finally{
    if(active)setLoading(false);
   }
  }
  void load();
  return ()=>{active=false;};
 },[demoDocuments]);
 async function save(form:HTMLFormElement){
  if(busy||demoDocuments)return;
  const fields=new FormData(form);
  const file=fields.get("file");
  const extension=file instanceof File?file.name.split(".").pop()?.toUpperCase():undefined;
  if(!(file instanceof File)||!file.size||file.size>6291456||
     (extension!=="PDF"&&extension!=="DOCX"&&extension!=="XLSX")){
   setError("Choose a PDF, DOCX or XLSX file up to 6 MB.");
   return;
  }
  setBusy(true);
  setError("");
  try{
   const id=crypto.randomUUID();
   const db=supabaseBrowser();
   const storage=db.storage.from("admin-documents");
   const uploaded=await storage.upload(id,file,{contentType:mime[extension]});
   if(uploaded.error)throw new Error("The file could not be uploaded.");
   const {data,error}=await db.from("admin_documents").insert({
    id,name:draft.name.trim()||file.name.slice(0,160).trim(),folder:draft.folder,context:draft.context,
    reference:draft.reference.trim(),description:draft.notes.trim(),format:extension,status:fields.get("status"),
   }).select().single();
   if(error){
    await storage.remove([id]);
    throw new Error("Could not save the document details. Reload the library before retrying.");
   }
   setDocuments(current=>[data,...current]);
   upload.current?.close();
   clear();
  }catch(error){
   setError(error instanceof Error?error.message:"The document could not be saved.");
  }finally{
   setBusy(false);
  }
 }
 async function download(record:DocumentRecord){
  if(demoDocuments)return;
  setError("");
  setBusy(true);
  try{
   const extension="."+record.format.toLowerCase();
   const filename=record.name.toLowerCase().endsWith(extension)?record.name:record.name+extension;
   const {data,error}=await supabaseBrowser().storage.from("admin-documents")
    .createSignedUrl(record.id,60,{download:filename});
   if(error)throw error;
   const link=document.createElement("a");
   link.href=data.signedUrl;
   link.click();
  }catch{
   setError("The file could not be downloaded.");
  }finally{
   setBusy(false);
  }
 }
 const rows=documents.filter(d=>!hiddenFolders.includes(d.folder)&&(folder==="all"||d.folder===folder)&&(context==="all"||d.context===context)&&(status==="all"||d.status===status)&&(format==="all"||d.format===format)&&[d.name,d.reference,d.description].join(" ").toLowerCase().includes(query.trim().toLowerCase()));
 const visibleFolders=folders.filter(item=>!hiddenFolders.includes(item.id));
 const currentFolder=visibleFolders.find(f=>f.id===folder);
 const clear=()=>{setFolder("all");setContext("all");setQuery("");setStatus("all");setFormat("all");};
 const openUpload=()=>{setError("");setDraft({name:"",folder:folder==="all"?"contracts":folder,context:context==="all"?"Business":context,reference:"",notes:""});upload.current?.showModal();};
 return <div className={css.page}>
  <div className={styles.pageHeading}><div><p className={styles.eyebrow}>BLACKLINE / DOCUMENTS</p><h1>Every document. <em>The right place.</em></h1><p>Keep company records, contracts and booking documents neatly separated.</p></div><button className={styles.primary} disabled={loading||failed||!!demoDocuments} onClick={openUpload}><Plus size={15}/>Upload document</button></div>
  <div className={css.summary}><div><Files size={20}/><span>Document library<strong>{documents.length} documents</strong></span></div><div><FolderOpen size={20}/><span>Organized by purpose<strong>{visibleFolders.length} categories</strong></span></div><div><Building2 size={20}/><span>Company & partner files<strong>Stored separately by context</strong></span></div><div><FileCheck2 size={20}/><span>Review queue<strong>{documents.filter(d=>d.status==="Needs review").length} documents</strong></span></div></div>
  <section aria-labelledby="document-folders-heading"><div className={css.sectionHeading}><div><p className={styles.eyebrow}>A PLACE FOR EVERY FILE</p><h2 id="document-folders-heading">Document categories</h2></div><button className={css.textButton} onClick={()=>setFolder("all")}>Show all categories</button></div><div className={css.folders}>{visibleFolders.map(f=><button key={f.id} className={css.folder} aria-pressed={folder===f.id} onClick={()=>setFolder(value=>value===f.id?"all":f.id)}><div><f.Icon size={22}/><span>{documents.filter(d=>d.folder===f.id).length} files</span></div><h3>{f.name}</h3><p>{f.description}</p><span className={css.folderFooter}>Browse category<ChevronRight size={13}/></span></button>)}</div></section>
  <section className={css.panel} aria-label="Document library"><div className={css.panelHeader}><div><p className={styles.eyebrow}>YOUR DOCUMENT LIBRARY</p><h2>{currentFolder?.name??"All documents"}</h2><p className={css.muted}>{currentFolder?.description??"Filter by category and keep your own business documents separate from booking and partner files."}</p></div></div><div className={css.contextTabs} role="group" aria-label="Document owner or linked record">{(["all",...contexts] as const).map(value=><button key={value} aria-pressed={context===value} onClick={()=>setContext(value)}>{value==="all"?"All documents":value==="Business"?"My business documents":`${value}s`}<small>{documents.filter(d=>(folder==="all"||d.folder===folder)&&(value==="all"||d.context===value)).length}</small></button>)}</div><div className={css.filters}><label className={css.search}><Search size={15}/><input aria-label="Search documents" placeholder="Search a file name, booking or partner…" value={query} onChange={e=>setQuery(e.target.value)}/></label><select aria-label="Document file type" value={format} onChange={e=>setFormat(e.target.value)}><option value="all">All file types</option><option>PDF</option><option>DOCX</option><option>XLSX</option></select><select aria-label="Document status" value={status} onChange={e=>setStatus(e.target.value)}><option value="all">All statuses</option><option>Signed</option><option>Filed</option><option>Draft</option><option>Needs review</option></select></div><div className={css.resultLine}><span>{rows.length} {rows.length===1?"document":"documents"}</span><button className={css.textButton} onClick={clear}>Reset filters</button></div>{loading?<p role="status">Loading documents…</p>:failed?<p role="alert">The library could not be loaded. Sign in as an administrator and reload the page.</p>:rows.length?<div className={styles.tableScroll}><table className={css.table}><thead><tr><th>Document</th><th>Category</th><th>Belongs to</th><th>Status</th><th>Uploaded</th><th/></tr></thead><tbody>{rows.map(d=><tr key={d.id}><td><div className={css.fileCell}><span className={css.fileIcon}><FileText size={20}/><small>{d.format}</small></span><div><button className={styles.customerButton} onClick={()=>{setError("");setSelected(d);details.current?.showModal();}}>{d.name}</button></div></div></td><td>{visibleFolders.find(f=>f.id===d.folder)?.name}</td><td><span className={css.contextLabel}>{d.context==="Business"?"My business":d.context}</span><small>{d.reference}</small></td><td><span className={css.status} data-status={d.status}>{d.status}</span></td><td>{date(d.created_at)}</td><td><button className={css.detailsButton} aria-label={`View details for ${d.name}`} onClick={()=>{setError("");setSelected(d);details.current?.showModal();}}><ChevronRight size={16}/></button></td></tr>)}</tbody></table></div>:<div className={css.empty}><FolderOpen size={30}/><h3>No documents match.</h3><p>Try another category, context or search.</p><button className={styles.secondary} onClick={clear}>Reset filters</button></div>}</section>
  <dialog ref={details} className={styles.dialog} aria-labelledby="document-details-title"><div className={styles.dialogHeader}><div><p className={styles.eyebrow}>DOCUMENT</p><h2 id="document-details-title">Document details</h2></div><button aria-label="Close document details" onClick={()=>details.current?.close()}><X size={20}/></button></div>{selected&&<div className={styles.dialogBody}><div className={css.documentHero}><FileText size={30}/><div><h3>{selected.name}</h3><p>{selected.id} · {selected.format}</p></div></div><dl className={css.detailList}>{[["Category",visibleFolders.find(f=>f.id===selected.folder)?.name],["Belongs to",selected.context==="Business"?"My business documents":selected.context],["Linked record",selected.reference],["Status",selected.status],["Uploaded",date(selected.created_at)]].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><p className={css.muted}>{selected.description}</p>{error&&<p role="alert">{error}</p>}</div>}<div className={styles.dialogActions}><button className={styles.secondary} onClick={()=>details.current?.close()}>Close</button><button className={styles.primary} disabled={!selected||busy||!!demoDocuments} onClick={()=>selected&&void download(selected)}>Download</button></div></dialog>
  <dialog ref={upload} className={styles.dialog} aria-labelledby="document-upload-title" onCancel={e=>{if(busy)e.preventDefault();}} onClose={()=>upload.current?.querySelector("form")?.reset()}><form onSubmit={e=>{e.preventDefault();void save(e.currentTarget);}}><fieldset disabled={busy} style={{border:0,padding:0,margin:0,minWidth:0}}><div className={styles.dialogHeader}><div><p className={styles.eyebrow}>DOCUMENT UPLOAD</p><h2 id="document-upload-title">Give every document a home</h2></div><button type="button" aria-label="Close document upload" onClick={()=>upload.current?.close()}><X size={20}/></button></div><div className={styles.dialogBody}><div className={css.uploadZone}><Upload size={28}/><label>File <input name="file" type="file" accept=".pdf,.docx,.xlsx" required/></label><small>PDF, DOCX or XLSX · up to 6 MB</small></div><div className={styles.formGrid}><label>Document name<input maxLength={160} value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})} placeholder="For example: yacht rental contract"/></label><label>Category<select value={draft.folder} onChange={e=>setDraft({...draft,folder:e.target.value as FolderId})}>{visibleFolders.map(f=><option key={f.id} value={f.id}>{f.name}</option>)}</select></label><label>Belongs to<select value={draft.context} onChange={e=>setDraft({...draft,context:e.target.value as Context,reference:""})}>{contexts.map(c=><option key={c} value={c}>{c==="Business"?"My business documents":c}</option>)}</select></label><label>{draft.context==="Business"?"Internal reference (optional)":`${draft.context} reference`}<input maxLength={200} value={draft.reference} onChange={e=>setDraft({...draft,reference:e.target.value})} placeholder={draft.context==="Business"?"For example: company insurance":"Booking or partner reference"}/></label></div><p className={css.categoryHint}>{visibleFolders.find(f=>f.id===draft.folder)?.description}</p><label className={styles.fullField}>Internal notes<textarea rows={3} maxLength={2000} value={draft.notes} onChange={e=>setDraft({...draft,notes:e.target.value})} placeholder="What is this document for?"/></label><label className={styles.fullField}>Status<select name="status" defaultValue="Filed"><option>Filed</option><option>Draft</option><option>Needs review</option><option>Signed</option></select></label>{error&&<p role="alert">{error}</p>}</div><div className={styles.dialogActions}><button type="button" className={styles.secondary} onClick={()=>upload.current?.close()}>Cancel</button><button type="submit" className={styles.primary}>{busy?"Uploading…":"Upload & save"}</button></div></fieldset></form></dialog>
 </div>;
}
