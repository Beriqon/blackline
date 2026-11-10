"use client";

import {useCallback,useEffect,useRef,useState} from "react";
import {Building2,Check,Handshake,Package,Plus,RefreshCw,Search,X} from "lucide-react";
import {ADMIN_SERVICES,type AdminProduct} from "@/lib/admin-demo-data";
import {blankSupplier,blankSupplierRate,filterSuppliers,normalizeSupplier,SUPPLIER_RATE_UNITS,validateSupplier,type AdminSupplier,type SupplierRate} from "@/lib/admin-suppliers";
import {loadRows,saveRow} from "@/lib/workspace-store";
import {isLocalDashboardPreview} from "@/lib/dashboard-preview";
import styles from "@/app/admin/dashboard/dashboard.module.css";
import css from "./admin-suppliers.module.css";

// Enable only after the supplier database setup has been applied and verified.
const supplierStorageEnabled=false;

const money=(value:string)=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(Number(value));

export function AdminSuppliers({products,productsReady}:{products:AdminProduct[];productsReady:boolean}){
 const [suppliers,setSuppliers]=useState<AdminSupplier[]>([]),[loading,setLoading]=useState(true),[loadError,setLoadError]=useState("");
 const [query,setQuery]=useState(""),[status,setStatus]=useState("all"),[service,setService]=useState("all");
 const [draft,setDraft]=useState<AdminSupplier|null>(null),[error,setError]=useState(""),[feedback,setFeedback]=useState(""),[saving,setSaving]=useState(false);
 const dialog=useRef<HTMLDialogElement>(null),savingRef=useRef(false);
 const preview=isLocalDashboardPreview();
 const load=useCallback(async()=>{
  setLoading(true);setLoadError("");
  try{if(supplierStorageEnabled&&!isLocalDashboardPreview())setSuppliers(await loadRows<AdminSupplier>("suppliers"));}
  catch{setLoadError("Suppliers could not be loaded. Please try again. If this persists, check the supplier database setup.");}
  finally{setLoading(false);}
 },[]);
 useEffect(()=>{void load();},[load]);
 const open=(supplier?:AdminSupplier)=>{setDraft(supplier?structuredClone(supplier):blankSupplier());setError("");dialog.current?.showModal();};
 const close=()=>{if(savingRef.current)return;dialog.current?.close();setDraft(null);setError("");};
 const updateRate=(id:string,change:Partial<SupplierRate>)=>setDraft(s=>s?{...s,rates:s.rates.map(r=>r.id===id?{...r,...change}:r)}:s);
 const save=async()=>{
  if(!supplierStorageEnabled||!draft||savingRef.current||preview)return;
  const validation=validateSupplier(draft,products);if(validation){setError(validation);return;}
  const supplier=normalizeSupplier(draft,products);
  savingRef.current=true;setSaving(true);setError("");
  try{await saveRow("suppliers",supplier.id,supplier);setSuppliers(rows=>[...rows.filter(s=>s.id!==supplier.id),supplier]);setFeedback(`${supplier.company} saved.`);dialog.current?.close();setDraft(null);}
  catch(e){setError(e instanceof Error?e.message:"Supplier could not be saved. Try again.");}
  finally{savingRef.current=false;setSaving(false);}
 };
 const rows=filterSuppliers(suppliers,query,status,service);
 const active=suppliers.filter(s=>s.status==="Active"),rates=active.flatMap(s=>s.rates);
 const field=(key:"company"|"contact"|"email"|"phone"|"website"|"location"|"address",label:string,type="text",required=false)=><label>{label}<input type={type} required={required} maxLength={300} value={draft?.[key]??""} onChange={e=>setDraft(s=>s?{...s,[key]:e.target.value}:s)}/></label>;
 return <>
  <div className={styles.pageHeading}><div><p className={styles.eyebrow}>BLACKLINE / SUPPLY NETWORK</p><h1>Your suppliers. <em>Every detail.</em></h1><p>Rental partners, contact details and agreed product costs in one place.</p></div><button className={styles.primary} disabled={loading||!!loadError||preview} onClick={()=>open()}><Plus size={16}/>Add supplier</button></div>
  <aside className={css.comingSoon} aria-label="Supplier management availability"><strong>Coming soon · Nothing is saved yet</strong><p>Supplier management is still in preview. The database is not connected yet. You can explore the form, but supplier details and product rates are not saved and will be lost when you close the form or leave this page.</p></aside>
  {preview&&<p className={css.feedback}>Read-only preview. Sign in as an administrator to manage suppliers.</p>}
  <div className={styles.stats}>{[["Suppliers",suppliers.length,"Your complete supplier directory",Handshake],["Active suppliers",active.length,"Available rental partners",Building2],["Products covered",new Set(rates.map(r=>r.productId)).size,"Across active suppliers",Package],["Product rates",rates.length,"Agreed rates with active suppliers",Check]].map(([label,value,detail,Icon])=>{const I=Icon as typeof Handshake;return <article className={styles.stat} key={String(label)}><div><span>{String(label)}</span><I size={17}/></div><strong>{loading||loadError?"—":String(value)}</strong><p>{String(detail)}</p></article>;})}</div>
  {feedback&&<p role="status" className={css.feedback}>{feedback}</p>}
  <section className={styles.panel} aria-busy={loading}>
   <div className={styles.panelHeading}><div><p className={styles.eyebrow}>YOUR RENTAL PARTNERS</p><h2>Supplier directory</h2></div><button className={styles.secondary} disabled={loading||!supplierStorageEnabled} onClick={()=>void load()}><RefreshCw size={14}/>Refresh</button></div>
   <div className={styles.tableTools}><label><Search size={15}/><input aria-label="Search suppliers" placeholder="Supplier, contact, location or product…" value={query} onChange={e=>setQuery(e.target.value)}/></label><select aria-label="Supplier service" value={service} onChange={e=>setService(e.target.value)}><option value="all">All services</option>{ADMIN_SERVICES.map(([id,label])=><option value={id} key={id}>{label}</option>)}</select><select aria-label="Supplier status" value={status} onChange={e=>setStatus(e.target.value)}><option value="all">All suppliers</option><option>Active</option><option>Inactive</option></select></div>
   {loading?<p role="status" className={styles.empty}>Loading suppliers…</p>:loadError?<div className={css.empty}><p role="alert">{loadError}</p><button className={styles.secondary} onClick={()=>void load()}>Try again</button></div>:rows.length?<div className={styles.tableScroll}><table className={css.table}><thead><tr><th>Supplier</th><th>Contact details</th><th>Products & costs</th><th>Status</th><th/></tr></thead><tbody>{rows.map(s=><tr key={s.id}><td><button className={styles.customerButton} onClick={()=>open(s)}>{s.company}</button><small>{s.contact||"No contact person"}</small><small>{s.location}</small></td><td>{s.email&&<a className={css.contactLink} href={`mailto:${s.email}`}>{s.email}</a>}{s.phone&&<small>{s.phone}</small>}{!s.email&&!s.phone&&<small>No contact details</small>}</td><td>{s.rates.length?<><div className={css.ratePreview}>{s.rates.slice(0,2).map(r=><div key={r.id}><strong>{products.find(p=>p.id===r.productId)?.name??r.productName}</strong><span>{money(r.cost)} <small>{r.unit} · tax {r.tax}</small></span></div>)}</div>{s.rates.length>2&&<button className={css.textButton} onClick={()=>open(s)}>+ {s.rates.length-2} more rates</button>}</>:<small>No product rates yet</small>}</td><td><span className={styles.productStatus} data-status={s.status==="Active"?"visible":"hidden"}>{s.status}</span></td><td><button className={styles.secondary} onClick={()=>open(s)}>Manage</button></td></tr>)}</tbody></table></div>:<div className={css.empty}><Building2 size={32}/><h3>{suppliers.length?"No suppliers match your filters.":"Build your supplier network."}</h3><p>{suppliers.length?"Try a different search, service or status.":"Add your external rental partners and record what they charge for each product."}</p><button className={styles.secondary} disabled={preview} onClick={()=>{if(suppliers.length){setQuery("");setService("all");setStatus("all");}else open();}}>{suppliers.length?"Clear filters":"Add your first supplier"}</button></div>}
  </section>
  <p className={styles.formHint}>Supplier costs are internal USD rates. Set a supplier to Inactive to keep their details and agreements on record.</p>
  <dialog ref={dialog} className={`${styles.dialog} ${css.dialog}`} aria-labelledby="supplier-title" onCancel={e=>{if(savingRef.current)e.preventDefault();}} onClose={()=>{setDraft(null);setError("");}}>
   <div className={styles.dialogHeader}><div><p className={styles.eyebrow}>BLACKLINE / SUPPLIERS</p><h2 id="supplier-title">{draft&&suppliers.some(s=>s.id===draft.id)?"Manage supplier":"New supplier"}</h2></div><button disabled={saving} aria-label="Close supplier dialog" onClick={close}><X size={20}/></button></div>
   {draft&&<form onSubmit={e=>{e.preventDefault();void save();}}><fieldset disabled={saving||preview} className={css.fields}><div className={styles.dialogBody}>
    <div className={css.sectionHeading}><span>01</span><div><h3>Supplier details</h3><p>Your rental partner and the person to contact.</p></div></div>
    <div className={styles.formGrid}>{field("company","Company name","text",true)}{field("contact","Contact person")}{field("email","Email","email")}{field("phone","Phone / WhatsApp","tel")}{field("website","Website (https://…)","url")}{field("location","City / region")}{field("address","Address")}<label>Status<select value={draft.status} onChange={e=>setDraft({...draft,status:e.target.value as AdminSupplier["status"]})}><option>Active</option><option>Inactive</option></select></label></div>
    <div className={`${css.sectionHeading} ${css.rateHeading}`}><span>02</span><div><h3>Products & supplier costs</h3><p>Add agreed rental costs. Each product can have multiple rate bases.</p></div></div>
    {!productsReady&&<p className={styles.formHint}>The product catalog is loading. Product rates will become available when the catalog has loaded. Nothing is saved in this preview.</p>}
    {!draft.rates.length&&<div className={css.noRates}><Package size={23}/><p>No product rates added yet.</p><small>Add rates now or complete them later.</small></div>}
    {draft.rates.map((r,index)=>{const missing=r.productId&&!products.some(p=>p.id===r.productId);return <fieldset key={r.id} className={css.rateCard}><legend>Product rate {index+1}</legend><div className={styles.formGrid}><label>Product<select required value={r.productId} onChange={e=>{const p=products.find(p=>p.id===e.target.value);updateRate(r.id,{productId:e.target.value,productName:p?.name??"",service:p?.service??""});}}><option value="">Choose a product</option>{missing&&<option value={r.productId}>{r.productName} (not in current catalog)</option>}{ADMIN_SERVICES.map(([id,label])=><optgroup key={id} label={label}>{products.filter(p=>p.service===id).sort((a,b)=>a.name.localeCompare(b.name)).map(p=><option key={p.id} value={p.id}>{p.name}{p.status!=="visible"?` (${p.status})`:""}</option>)}</optgroup>)}</select></label><label>Supplier cost (USD)<input required type="number" inputMode="decimal" min="0" max="999999999.99" step="0.01" placeholder="0.00" value={r.cost} onChange={e=>updateRate(r.id,{cost:e.target.value})}/></label><label>Rate basis<select value={r.unit} onChange={e=>updateRate(r.id,{unit:e.target.value})}>{SUPPLIER_RATE_UNITS.map(unit=><option key={unit}>{unit}</option>)}</select></label><label>Tax treatment<select value={r.tax} onChange={e=>updateRate(r.id,{tax:e.target.value as SupplierRate["tax"]})}><option value="excluded">Tax excluded</option><option value="included">Tax included</option></select></label></div><label className={styles.fullField}>Rate conditions<textarea rows={2} maxLength={3000} value={r.notes} onChange={e=>updateRate(r.id,{notes:e.target.value})} placeholder="Minimum duration, delivery fees, seasonal rates…"/></label><button type="button" className={css.removeRate} onClick={()=>setDraft({...draft,rates:draft.rates.filter(rate=>rate.id!==r.id)})}><X size={13}/>Remove rate</button></fieldset>;})}
    <button type="button" className={styles.secondary} disabled={!productsReady||!products.length} onClick={()=>setDraft({...draft,rates:[...draft.rates,blankSupplierRate()]})}><Plus size={14}/>Add product rate</button>
    <div className={`${css.sectionHeading} ${css.rateHeading}`}><span>03</span><div><h3>Agreements & notes</h3><p>Keep the practical details close to your supplier.</p></div></div>
    <label className={styles.fullField}>Payment & cancellation terms<textarea rows={3} maxLength={5000} value={draft.terms} onChange={e=>setDraft({...draft,terms:e.target.value})} placeholder="Deposit, payment deadlines, cancellation policy…"/></label><label className={styles.fullField}>Internal notes<textarea rows={3} maxLength={5000} value={draft.notes} onChange={e=>setDraft({...draft,notes:e.target.value})} placeholder="Preferred contact hours, pickup instructions or other agreements…"/></label>
    <p className={styles.formHint}><strong>Preview only: nothing entered in this form is saved.</strong> These are reference rates. They do not change website prices or automatically assign a supplier to bookings.</p>
   </div></fieldset>{error&&<p role="alert" className={`${styles.error} ${css.saveError}`}>{error}</p>}<div className={styles.dialogActions}><button type="button" disabled={saving} className={styles.secondary} onClick={close}>Cancel</button><button type="submit" disabled={saving||preview||!supplierStorageEnabled} className={styles.primary}><Check size={15}/>{!supplierStorageEnabled?"Saving coming soon":saving?"Saving…":"Save supplier"}</button></div></form>}
  </dialog>
 </>;
}
