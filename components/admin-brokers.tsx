"use client";

import Image from "next/image";
import Link from "next/link";
import {useSearchParams} from "next/navigation";
import {useRef,useState} from "react";
import {Building2,Check,ChevronRight,FlaskConical,Handshake,Package,Plus,Search,ShieldCheck,Trash2,Wallet,X} from "lucide-react";
import styles from "@/app/admin/dashboard/dashboard.module.css";
import css from "./admin-brokers.module.css";

type Broker={id:string;company:string;contact:string;email:string;location:string;services:string[];status:"Active"|"Application"|"Inactive"|"Declined";commission:number;notes:string};
const initialBrokers:Broker[]=[
 {id:"DEMO-BR-01",company:"Demo Ocean Partners",contact:"Demo contact A",email:"contact@ocean-partners.example",location:"Miami Beach",services:["Yachts"],status:"Active",commission:10,notes:"Sample yacht partner. Commercial terms still need to be agreed and recorded."},
 {id:"DEMO-BR-02",company:"Demo Prestige Network",contact:"Demo contact B",email:"contact@prestige-network.example",location:"Miami",services:["Exotic cars","Chauffeur services"],status:"Active",commission:12,notes:"Example partner offering luxury vehicle listings."},
 {id:"DEMO-BR-03",company:"Demo Coastal Experiences",contact:"Demo contact C",email:"contact@coastal-experiences.example",location:"Fort Lauderdale",services:["Villas & stays","Yachts"],status:"Application",commission:0,notes:"Fictional application awaiting company and listing review. No verification has been performed."},
 {id:"DEMO-BR-04",company:"Demo Private Travel",contact:"Demo contact D",email:"contact@private-travel.example",location:"Miami",services:["Private jets"],status:"Inactive",commission:8,notes:"Example inactive broker retained for reference."},
];
const initialListings=[
 {id:"DEMO-L01",photos:["/yachts/90azimutdaydreamin/90azimutdaydreamin.jpg","/yachts/90azimutdaydreamin/90azimutdaydreamin2.jpg"],broker:"DEMO-BR-01",name:"68 ft yacht charter",service:"Yachts",status:"Published",rate:4200,unit:"per charter"},
 {id:"DEMO-L02",photos:["/home/miami-dusk.webp","/home/affiliate-yacht-lifestyle.png"],broker:"DEMO-BR-01",name:"Sunset yacht experience",service:"Yachts",status:"Needs review",rate:2400,unit:"per charter"},
 {id:"DEMO-L03",photos:["/exoticcar/lamborghini/huracanspyderred/huracanspyderred1.webp","/exoticcar/lamborghini/huracanspyderred/huracanspyderred2.webp"],broker:"DEMO-BR-02",name:"Luxury sports car",service:"Exotic cars",status:"Published",rate:1450,unit:"per day"},
 {id:"DEMO-L04",photos:["/home/chauffeur-exterior.webp","/home/chauffeur-interior.webp"],broker:"DEMO-BR-02",name:"Executive airport transfer",service:"Chauffeur services",status:"Draft",rate:380,unit:"per transfer"},
 {id:"DEMO-L05",broker:"DEMO-BR-03",name:"Waterfront villa",service:"Villas & stays",status:"Needs review",rate:2800,unit:"per night"},
];
const commissions=[
 {id:"DEMO-ORDER-01",broker:"DEMO-BR-01",guest:"Alex Morgan",experience:"Private yacht charter",bookedOn:"2026-11-12",date:"Nov 21, 2026",location:"Miami Beach, FL",guests:8,bookingStatus:"Confirmed",amount:4200,commission:420,status:"Pending"},
 {id:"DEMO-ORDER-02",broker:"DEMO-BR-02",guest:"Jordan Ellis",experience:"Executive airport transfer",bookedOn:"2026-11-04",date:"Nov 8, 2026",location:"Miami International Airport",guests:3,bookingStatus:"Completed",amount:1450,commission:174,status:"Settled"},
 {id:"DEMO-ORDER-03",broker:"DEMO-BR-02",guest:"Taylor Reed",experience:"Private chauffeur",bookedOn:"2026-11-13",date:"Nov 22, 2026",location:"Brickell, FL",guests:4,bookingStatus:"Confirmed",amount:960,commission:115.2,status:"Pending"},
 {id:"DEMO-ORDER-04",broker:"DEMO-BR-02",guest:"Casey Lane",experience:"Exotic car rental",bookedOn:"2026-11-11",date:"Nov 19, 2026",location:"Miami Beach, FL",guests:2,bookingStatus:"Confirmed",amount:2200,commission:264,status:"Pending"},
 {id:"DEMO-ORDER-05",broker:"DEMO-BR-02",guest:"Morgan Hayes",experience:"Executive airport transfer",bookedOn:"2026-11-09",date:"Nov 16, 2026",location:"Miami International Airport",guests:3,bookingStatus:"Confirmed",amount:480,commission:57.6,status:"Pending"},
 {id:"DEMO-ORDER-06",broker:"DEMO-BR-02",guest:"Riley Parker",experience:"Private chauffeur",bookedOn:"2026-11-07",date:"Nov 12, 2026",location:"Coral Gables, FL",guests:4,bookingStatus:"Completed",amount:840,commission:100.8,status:"Pending"},
 {id:"DEMO-ORDER-07",broker:"DEMO-BR-02",guest:"Jamie Brooks",experience:"Exotic car rental",bookedOn:"2026-11-02",date:"Nov 6, 2026",location:"Downtown Miami, FL",guests:2,bookingStatus:"Completed",amount:1800,commission:216,status:"Settled"},
 {id:"DEMO-ORDER-08",broker:"DEMO-BR-02",guest:"Avery Quinn",experience:"Executive airport transfer",bookedOn:"2026-10-28",date:"Nov 3, 2026",location:"Miami International Airport",guests:2,bookingStatus:"Completed",amount:520,commission:62.4,status:"Settled"},
 {id:"DEMO-ORDER-09",broker:"DEMO-BR-02",guest:"Drew Walker",experience:"Private chauffeur",bookedOn:"2026-10-24",date:"Oct 29, 2026",location:"Brickell, FL",guests:5,bookingStatus:"Completed",amount:1100,commission:132,status:"Settled"},
 {id:"DEMO-ORDER-10",broker:"DEMO-BR-02",guest:"Blake Carter",experience:"Exotic car rental",bookedOn:"2026-10-20",date:"Oct 25, 2026",location:"Miami Beach, FL",guests:2,bookingStatus:"Completed",amount:2500,commission:300,status:"Settled"},
];
const money=(value:number)=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(value);

const directory = "/admin/dashboard?view=brokers";
const profileHref = (id:string) => directory + "&broker=" + encodeURIComponent(id);
type Listing = Omit<typeof initialListings[number],"status"> & {status:"Published"|"Needs review"|"Draft"|"Declined"|"Approved"};

function readPhoto(file:File):Promise<string>{
 return new Promise((resolve,reject)=>{
  const reader=new FileReader();
  reader.onload=()=>resolve(String(reader.result));
  reader.onerror=()=>reject(reader.error);
  reader.readAsDataURL(file);
 });
}

function BrokerProfile({broker,listings,onBrokerStatus,onListing,onRemove}:{
 broker:Broker;
 listings:Listing[];
 onBrokerStatus:(status:Broker["status"])=>void;
 onListing:(listing:Listing)=>void;
 onRemove:(id:string)=>void;
}){
 const [removing,setRemoving]=useState<Listing|null>(null);
 const removeDialog=useRef<HTMLDialogElement>(null);
 const reviewDialog=useRef<HTMLDialogElement>(null);
 const [photos,setPhotos]=useState<string[]>([]);
 const [photoError,setPhotoError]=useState("");
 const [readingPhotos,setReadingPhotos]=useState(false);
 const photoSession=useRef(0);
 const openReview=(id:string)=>{
  photoSession.current++;
  setPhotos(listings.find(listing=>listing.id===id)?.photos??[]);
  setPhotoError("");
  setReadingPhotos(false);
  setEditing(id);
  reviewDialog.current?.showModal();
 };
 async function selectPhotos(input:HTMLInputElement,index?:number){
  const files=Array.from(input.files??[]);
  input.value="";
  if(!files.length)return;
  if(files.some(file=>!["image/jpeg","image/png","image/webp"].includes(file.type)||file.size>5*1024*1024)){
   setPhotoError("Choose JPG, PNG or WebP photos up to 5 MB each.");
   return;
  }
  const session=photoSession.current;
  setReadingPhotos(true);
  setPhotoError("");
  try{
   const images=await Promise.all(files.map(readPhoto));
   if(session===photoSession.current)setPhotos(current=>index===undefined?[...current,...images]:current.map((src,i)=>i===index?images[0]:src));
  }catch{
   if(session===photoSession.current)setPhotoError("The photos could not be opened. Try selecting them again.");
  }finally{
   if(session===photoSession.current)setReadingPhotos(false);
  }
 }
 const closeReview=()=>reviewDialog.current?.close();
 const [editing,setEditing]=useState<string|null>(null);
 const [query,setQuery]=useState("");
 const [status,setStatus]=useState("");
 const [feedback,setFeedback]=useState("");
 const [showAllBookings,setShowAllBookings]=useState(false);
 const visible=listings.filter(listing=>(!status||listing.status===status)&&
  [listing.name,listing.service,listing.id].join(" ").toLowerCase().includes(query.trim().toLowerCase()));
 const verified=broker.status==="Active";
 const deliveredBookings=commissions.filter(order=>order.broker===broker.id)
  .sort((first,second)=>second.bookedOn.localeCompare(first.bookedOn));
 const visibleBookings=showAllBookings?deliveredBookings:deliveredBookings.slice(0,3);
 const revenue=deliveredBookings.reduce((total,order)=>total+order.amount,0);
 const commissionDue=deliveredBookings.reduce((total,order)=>total+(order.status==="Pending"?order.commission:0),0);
 const changeStatus=(next:Broker["status"])=>{
  onBrokerStatus(next);
  setFeedback(next==="Active"?"Broker verified in this preview.":next==="Declined"?"Application declined in this preview.":"Broker access marked inactive in this preview.");
 };
 const review=(listing:Listing,next:"Approved"|"Declined")=>{
  onListing({...listing,status:next});
  setFeedback(listing.name+" marked "+next.toLowerCase()+" in this preview.");
 };
 return <div className={css.page}>
  <div className={css.profileNav}><Link href={directory} className={styles.secondary}>Back to brokers</Link><a className={styles.primary} href="#broker-listings">View listings <ChevronRight size={14}/></a></div>
  <header className={css.heading}><div><p className={styles.eyebrow}>BLACKLINE / BROKER PROFILE</p><h1>{broker.company}</h1><p>{broker.contact} · {broker.location}</p></div><span className={css.badge} data-state={broker.status}>{verified?"✓ Verified":broker.status}</span></header>
  <p className={css.note}>Demo workspace. Changes reset when you reload.</p>
  <section className={css.profileMetrics} aria-label="Broker performance">
   <div className={styles.stat}><div>Delivered bookings<Package size={16} aria-hidden="true"/></div><strong>{deliveredBookings.length}</strong></div>
   <div className={styles.stat}><div>Revenue generated<Wallet size={16} aria-hidden="true"/></div><strong>{money(revenue)}</strong></div>
   <div className={styles.stat}><div>Commission payable<Handshake size={16} aria-hidden="true"/></div><strong>{money(commissionDue)}</strong></div>
  </section>
  <section className={`${css.panel} ${css.bookingHistory}`} aria-labelledby="broker-bookings-heading">
   <div className={css.sectionHeading}>
    <h2 id="broker-bookings-heading">Referred bookings</h2>
    {deliveredBookings.length>3?<button type="button" className={styles.secondary} aria-expanded={showAllBookings} aria-controls="broker-booking-records" onClick={()=>setShowAllBookings(previous=>!previous)}>
     {showAllBookings?"Show latest 3":`View all ${deliveredBookings.length} bookings`}
    </button>:<span className={css.soon}>{deliveredBookings.length} {deliveredBookings.length===1?"booking":"bookings"}</span>}
   </div>
   <div id="broker-booking-records">
   {visibleBookings.length===0?<p className={css.empty}>No bookings have been attributed to this broker.</p>:visibleBookings.map(order=>(
    <details className={css.bookingRecord} key={order.id}>
     <summary>
      <ChevronRight size={15} aria-hidden="true"/>
      <span><strong>{order.experience}</strong><small>{order.guest} · {order.date}</small></span>
      <span className={css.badge}>{order.bookingStatus}</span>
      <strong>{money(order.amount)}</strong>
     </summary>
     <dl className={`${css.details} ${css.bookingDetails}`}>
      <div><dt>Booking reference</dt><dd>{order.id}</dd></div>
      <div><dt>Guest</dt><dd>{order.guest} · {order.guests} guests</dd></div>
      <div><dt>Service date</dt><dd>{order.date}</dd></div>
      <div><dt>Location</dt><dd>{order.location}</dd></div>
      <div><dt>Booking value</dt><dd>{money(order.amount)}</dd></div>
      <div><dt>Broker commission</dt><dd>{money(order.commission)} <span className={css.badge} data-state={order.status}>{order.status}</span></dd></div>
     </dl>
    </details>
   ))}
   </div>
  </section>
  {feedback&&<p className={css.note} role="status">{feedback}</p>}
  <div className={css.profileColumns}>
  <section className={css.panel}>
   <div className={css.sectionHeading}><h2>Broker details</h2></div>
   <div className={styles.dialogBody}>
    <dl className={css.details}>{[["Reference",broker.id],["Company",broker.company],["Contact person",broker.contact],["Email",broker.email],["Location",broker.location],["Commission rate",broker.commission?broker.commission+"%":"Not agreed"]].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
    <h3 className={css.subheading}>Services offered</h3><div className={css.tags}>{broker.services.map(service=><span key={service}>{service}</span>)}</div>
    <h3 className={css.subheading}>Internal notes</h3><p className={css.note}>{broker.notes}</p>
   </div>
  </section>
  <section className={css.panel}>
   <div className={css.sectionHeading}><h2>Verification & documents</h2><span className={css.badge} data-state={broker.status}>{verified?"Verified":broker.status}</span></div>
   <div className={styles.dialogBody}>
    <dl className={css.details}>{["Government-issued ID","Signed broker agreement","Business registration"].map(document=><div key={document}><dt>{document}</dt><dd>Demo document checklist</dd></div>)}</dl>
    <div className={styles.actions}>
     {verified?<button className={styles.secondary} onClick={()=>changeStatus("Inactive")}>Mark inactive</button>:<button className={styles.primary} onClick={()=>changeStatus("Active")}><ShieldCheck size={15}/>Verify broker</button>}
     {broker.status==="Application"&&<button className={styles.danger} onClick={()=>changeStatus("Declined")}>Decline application</button>}
    </div>
   </div>
  </section>
  </div>
  <section id="broker-listings" className={css.panel}>
   <div className={styles.panelHeading}><h2>Broker listings</h2><span className={css.listingCount}>{listings.length} {listings.length===1?"listing":"listings"}</span></div>
   <div className={css.filters}><label><Search size={15}/><input aria-label="Search broker listings" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search name, service or reference…"/></label><select aria-label="Listing status" value={status} onChange={e=>setStatus(e.target.value)}><option value="">All listing statuses</option>{["Needs review","Draft","Approved","Published","Declined"].map(value=><option key={value}>{value}</option>)}</select></div>
   {visible.length?<div className={styles.tableScroll}><table className={css.table}>
    <thead><tr><th>Listing</th><th>Service</th><th>Rate</th><th>Status</th><th>Actions</th></tr></thead>
    <tbody>{visible.map(listing=><tr key={listing.id}>
     <td><div className={styles.productCell}>{listing.photos?.[0]?<Image className={styles.productThumb} src={listing.photos[0]} unoptimized={listing.photos[0].startsWith("data:")} alt="" width={56} height={56}/>:<span className={styles.productThumb}><Package size={17}/></span>}<div><button className={styles.customerButton} onClick={()=>openReview(listing.id)}>{listing.name}</button><small>{listing.id} · {listing.photos?.length ?? 0} photos</small></div></div></td><td>{listing.service}</td><td>{money(listing.rate)}<small>{listing.unit}</small></td>
     <td><span className={css.badge} data-state={listing.status}>{listing.status}</span></td>
     <td><div className={styles.actions}><button className={styles.secondary} onClick={()=>openReview(listing.id)}>View listing<ChevronRight size={14}/></button>{listing.status==="Published"&&<button className={styles.secondary} aria-label={"Delete "+listing.name} title="Delete published listing" onClick={()=>{setRemoving(listing);removeDialog.current?.showModal();}}><Trash2 size={15}/></button>}</div></td>
    </tr>)}</tbody>
   </table></div>:<p className={css.empty}>No listings match these filters.</p>}
   <dialog className={styles.dialog} ref={reviewDialog} aria-label="Listing details" onClose={()=>{photoSession.current++;setEditing(null);setPhotos([]);}}>
   {listings.filter(listing=>listing.id===editing).map(listing=><form key={listing.id} className={styles.dialogBody} onSubmit={event=>{
    event.preventDefault();
    if(readingPhotos)return;
    const data=new FormData(event.currentTarget);
    const name=String(data.get("name")).trim(),unit=String(data.get("unit")).trim();
    if(!name||!unit){setFeedback("Enter a listing name and rate unit.");return;}
    onListing({...listing,photos,name,unit,rate:Number(data.get("rate")),service:String(data.get("service")),
     status:listing.status==="Published"||listing.status==="Approved"?"Needs review":listing.status});
    closeReview();
    setFeedback("Listing changes saved in this preview.");
   }}>
    <h3 className={css.subheading}>Review {listing.name}</h3>
    <fieldset disabled={readingPhotos}>
     <legend className={css.subheading}>Listing photos</legend>
     <p className={css.note}>JPG, PNG or WebP · up to 5 MB per photo. The first photo is the thumbnail.</p>
     <label className={styles.fullField}>Add photos<input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={event=>void selectPhotos(event.currentTarget)}/></label>
     {readingPhotos&&<p role="status">Loading photos…</p>}
     {photoError&&<p role="alert" className={styles.error}>{photoError}</p>}
     {photos.length ? <div className={css.listingGallery}>{photos.map((src,index)=><div key={index}>
      <Image src={src} unoptimized={src.startsWith("data:")} alt={listing.name+" — photo "+(index+1)} width={480} height={300}/>
      { !src.startsWith("data:") && <a href={src} target="_blank" rel="noopener noreferrer">Open photo {index+1}</a> }
      <label className={styles.fullField}>Replace photo {index+1}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={event=>void selectPhotos(event.currentTarget,index)}/></label>
      <button className={styles.secondary} type="button" onClick={()=>setPhotos(current=>current.filter((_,i)=>i!==index))}>Remove photo {index+1}</button>
     </div>)}</div>:<p className={css.note}>No photos attached.</p>}
    </fieldset>
    <div className={styles.formGrid}>
     <label>Listing name<input name="name" required defaultValue={listing.name}/></label>
     <label>Service<select name="service" defaultValue={listing.service}>{broker.services.map(service=><option key={service}>{service}</option>)}</select></label>
     <label>Rate (USD)<input name="rate" type="number" step="0.01" min="0" required defaultValue={listing.rate}/></label>
     <label>Rate unit<input name="unit" required defaultValue={listing.unit}/></label>
    </div>
    <p className={css.note}>{listing.status==="Needs review"&&!verified?"Verify this broker before approving the listing.":"Save edits before approving the listing."}</p>
    <div className={styles.actions}>
     <button className={styles.secondary} type="button" onClick={closeReview}>Close</button>
     <button className={styles.secondary} type="submit" disabled={readingPhotos}>Save edits</button>
     {listing.status==="Needs review"&&<><button className={styles.primary} type="button" disabled={!verified||readingPhotos||photos!==listing.photos && (photos.length>0||!!listing.photos?.length)} onClick={()=>{review(listing,"Approved");closeReview();}}>Approve listing</button><button className={styles.danger} type="button" onClick={()=>{review(listing,"Declined");closeReview();}}>Decline listing</button></>}
    </div>
   </form>)}
   </dialog>
   <dialog className={styles.dialog} ref={removeDialog} aria-labelledby="delete-broker-listing" onClose={()=>setRemoving(null)}>
    <div className={styles.dialogHeader}><h2 id="delete-broker-listing">Delete published listing?</h2></div>
    <div className={styles.dialogBody}><p>{removing?.name} will be removed from the demo broker profile and listings overview.</p></div>
    <div className={styles.dialogActions}><button className={styles.secondary} onClick={()=>removeDialog.current?.close()}>Cancel</button><button className={styles.danger} disabled={!removing} onClick={()=>{if(!removing)return;onRemove(removing.id);setFeedback(removing.name+" removed from the demo.");removeDialog.current?.close();}}>Delete listing</button></div>
   </dialog>
  </section>
 </div>;
}

export function AdminBrokers(){
 const params=useSearchParams();
 const brokerId=params.get("broker");
 const [brokers,setBrokers]=useState(initialBrokers);
 const [listings,setListings]=useState<Listing[]>(initialListings as Listing[]);
 const [tab,setTab]=useState("directory"),[query,setQuery]=useState(""),[status,setStatus]=useState("all"),[service,setService]=useState("all");
 const [draft,setDraft]=useState({company:"",contact:"",email:"",phone:"",location:"",commission:"",notes:""});
 const editor=useRef<HTMLDialogElement>(null);
 const rows=brokers.filter(b=>(tab!=="applications"||b.status==="Application")&&(status==="all"||b.status===status)&&(service==="all"||b.services.includes(service))&&[b.company,b.contact,b.location,b.email].join(" ").toLowerCase().includes(query.trim().toLowerCase()));
 const visibleIds=new Set(rows.map(b=>b.id));
 const visibleListings=listings.filter(l=>visibleIds.has(l.broker)&&(service==="all"||l.service===service));
 const reset=()=>{setQuery("");setStatus("all");setService("all");};
 const selected=brokers.find(b=>b.id===brokerId);
 if(brokerId)return selected?<BrokerProfile key={selected.id} broker={selected} listings={listings.filter(l=>l.broker===selected.id)} onBrokerStatus={status=>setBrokers(rows=>rows.map(b=>b.id===selected.id?{...b,status}:b))} onRemove={id=>setListings(rows=>rows.filter(l=>l.id!==id))} onListing={listing=>setListings(rows=>rows.map(l=>l.id===listing.id?listing:l))}/>:<section className={styles.panel}><p className={css.note}>Broker not found.</p><Link className={styles.secondary} href={directory}>Back to brokers</Link></section>;
 return <div className={css.page}>
  <header className={css.heading}><div><p className={styles.eyebrow}>BLACKLINE / PARTNERS</p><h1>Brokers</h1><p>Manage your partner network, applications, listings and commission agreements.</p></div><button className={styles.primary} onClick={()=>{setDraft({company:"",contact:"",email:"",phone:"",location:"",commission:"",notes:""});editor.current?.showModal();}}><Plus size={15}/>Preview broker form</button></header>
  <aside className={css.banner}><FlaskConical size={22}/><div><strong>Broker workspace preview</strong><p>All brokers, applications, listings and amounts shown here are fictional. The database is not connected. Review changes are kept until you reload the page.</p></div><span className={css.soon}>Soon</span></aside>
  <div className={css.stats}>{[{label:"Verified brokers",value:brokers.filter(b=>b.status==="Active").length,Icon:Handshake},{label:"New applications",value:brokers.filter(b=>b.status==="Application").length,Icon:ShieldCheck},{label:"Listings to review",value:listings.filter(l=>l.status==="Needs review").length,Icon:Package},{label:"Pending commission",value:money(commissions.filter(c=>c.status==="Pending").reduce((s,c)=>s+c.commission,0)),Icon:Wallet}].map(m=><article key={m.label}><div><span>{m.label}</span><m.Icon size={17}/></div><strong>{m.value}</strong><small>FICTIONAL DEMO DATA</small></article>)}</div>
  <section className={css.panel}><div className={css.tabs} role="group" aria-label="Broker workspace sections">{[["directory","Broker directory"],["applications","Applications"],["listings","Listings & approvals"],["commissions","Commissions"]].map(([key,label])=><button key={key} aria-pressed={tab===key} onClick={()=>{setTab(key);reset();}}>{label}</button>)}</div><div className={css.filters}><label><Search size={15}/><input aria-label="Search brokers" placeholder="Search broker, contact or location…" value={query} onChange={e=>setQuery(e.target.value)}/></label><select aria-label="Broker service" value={service} onChange={e=>setService(e.target.value)}><option value="all">All services</option>{[...new Set(brokers.flatMap(b=>b.services))].map(s=><option key={s}>{s}</option>)}</select>{tab!=="applications"&&<select aria-label="Broker status" value={status} onChange={e=>setStatus(e.target.value)}><option value="all">All broker statuses</option><option value="Active">Verified</option><option>Declined</option><option>Application</option><option>Inactive</option></select>}<button className={css.textButton} onClick={reset}>Reset</button></div>
   <div className={css.sectionHeading}><h2>{tab==="directory"?"Your broker network":tab==="applications"?"Applications awaiting review":tab==="listings"?"Broker listings":"Commission overview"}</h2><span className={css.soon}>DEMO RECORDS</span></div>
   {tab==="directory"||tab==="applications"?<><p className={css.note}>{tab==="applications"?"Review company details, services and documents before approving a broker.":"Open a sample broker profile to see their details, listings and commercial terms."}</p>{rows.length?<div className={styles.tableScroll}><table className={css.table}><thead><tr><th>Broker / contact</th><th>Services</th><th>Listings</th><th>Commission rate</th><th>Status</th><th/></tr></thead><tbody>{rows.map(b=><tr key={b.id}><td><Link className={styles.customerButton} href={profileHref(b.id)}>{b.company}</Link><small>{b.contact} · {b.location}</small><small>{b.email}</small></td><td><div className={css.tags}>{b.services.map(s=><span key={s}>{s}</span>)}</div></td><td>{listings.filter(l=>l.broker===b.id).length} demo listings</td><td>{b.commission?b.commission+"%":"Not agreed"}</td><td><span className={css.badge} data-state={b.status}>{b.status==="Active"?"✓ Verified":b.status}</span></td><td><Link className={styles.secondary} href={profileHref(b.id)}>{tab==="applications"?"Review application":"View profile"}<ChevronRight size={13}/></Link></td></tr>)}</tbody></table></div>:<div className={css.empty}><Building2 size={28}/><p>No sample brokers match these filters.</p><button className={styles.secondary} onClick={reset}>Reset filters</button></div>}</>:tab==="listings"?<><p className={css.note}>Example submission workflow: Draft → Needs review → Published. These statuses are fictional; no real website products are created or changed.</p>{visibleListings.length?<div className={styles.tableScroll}><table className={css.table}><thead><tr><th>Listing / service</th><th>Broker</th><th>Example rate</th><th>Status</th><th>Action</th></tr></thead><tbody>{visibleListings.map(l=><tr key={l.id}><td><strong>{l.name}</strong><small>{l.service} · {l.id}</small></td><td><Link className={styles.customerButton} href={profileHref(l.broker)}>{brokers.find(b=>b.id===l.broker)?.company}</Link></td><td>{money(l.rate)}<small>{l.unit}</small></td><td><span className={css.badge} data-state={l.status}>{l.status}</span></td><td><Link className={styles.secondary} href={profileHref(l.broker)+"#broker-listings"}>Review listings</Link></td></tr>)}</tbody></table></div>:<p className={css.empty}>No sample listings match these filters.</p>}</>:<><p className={css.note}>Illustrative commissions payable to brokers for referred bookings. Actual commission direction, calculation basis and payout rules still need to be configured. No real payment is made.</p>{commissions.some(c=>visibleIds.has(c.broker))?<div className={styles.tableScroll}><table className={css.table}><thead><tr><th>Booking reference</th><th>Broker</th><th>Example booking value</th><th>Example commission</th><th>Status</th><th/></tr></thead><tbody>{commissions.filter(c=>visibleIds.has(c.broker)).map(c=><tr key={c.id}><td>{c.id}</td><td>{brokers.find(b=>b.id===c.broker)?.company}</td><td>{money(c.amount)}</td><td>{money(c.commission)}</td><td><span className={css.badge} data-state={c.status}>{c.status} · demo</span></td><td><button className={styles.secondary} disabled>Payouts coming soon</button></td></tr>)}</tbody></table></div>:<p className={css.empty}>No sample commissions match these filters.</p>}</>}
   <p className={css.caption}>Preview only · Broker data and statuses are examples · Database integration pending</p>
  </section>
  <section className={css.workflow} aria-label="Planned broker workflow">{[{title:"1. Review the partner",text:"Company details, contact person, services and supporting documents.",Icon:Building2},{title:"2. Approve their listings",text:"Check product details, rates and availability before publishing.",Icon:Package},{title:"3. Track the relationship",text:"Linked bookings, commission agreements and settlement history.",Icon:Handshake}].map(s=><article key={s.title}><s.Icon size={20}/><h3>{s.title}</h3><p>{s.text}</p></article>)}</section>
  <dialog ref={editor} className={styles.dialog} aria-labelledby="broker-editor-title"><div className={styles.dialogHeader}><div><p className={styles.eyebrow}>NEW BROKER / PREVIEW</p><h2 id="broker-editor-title">Broker details</h2></div><button aria-label="Close broker form" onClick={()=>editor.current?.close()}><X size={20}/></button></div><div className={styles.dialogBody}><p className={css.modalNotice}>This form previews the future setup. Nothing is saved and no invitation is sent. Entered details are cleared when you reopen it.</p><div className={styles.formGrid}>{([["company","Company name"],["contact","Contact person"],["email","Email"],["phone","Phone / WhatsApp"],["location","Location"],["commission","Illustrative commission (%)"]] as const).map(([key,label])=><label key={key}>{label}<input maxLength={200} type={key==="email"?"email":key==="phone"?"tel":key==="commission"?"number":"text"} min={key==="commission"?0:undefined} max={key==="commission"?100:undefined} value={draft[key]} onChange={e=>setDraft({...draft,[key]:e.target.value})}/></label>)}</div><label className={styles.fullField}>Services, agreements & internal notes<textarea rows={4} maxLength={3000} value={draft.notes} onChange={e=>setDraft({...draft,notes:e.target.value})} placeholder="Services offered, commission basis, responsibilities and payment terms…"/></label><p className={css.note}>Document uploads, broker invitations, verification and listing approval will become available after integration.</p></div><div className={styles.dialogActions}><button className={styles.secondary} onClick={()=>editor.current?.close()}>Close preview</button><button className={styles.primary} disabled><Check size={14}/>Saving coming soon</button></div></dialog>
 </div>;
}
