"use client";

import Link from "next/link";
import {useEffect,useRef,useState} from "react";
import {ArrowUpRight,CalendarDays,Check,ChevronLeft,ChevronRight,Clock3,FlaskConical,LockKeyhole,Plus,X} from "lucide-react";
import {CALENDAR_DEMO_TODAY,CALENDAR_PRODUCTS,calendarDate,calendarMonth,calendarWeek,createCalendarDemo,eventsInCalendarRange,eventsOnCalendarDay,moveCalendarMonth,shiftCalendarDay,type CalendarEvent,type CalendarProduct} from "@/lib/admin-calendar-demo";
import {loadSetting,saveRow} from "@/lib/workspace-store";
import {ADMIN_SERVICES,type AdminBooking,type AdminProduct} from "@/lib/admin-demo-data";
import styles from "@/app/admin/dashboard/dashboard.module.css";
import css from "./admin-calendar.module.css";

const DEMO_EVENTS=createCalendarDemo();
const weekdays=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const format=(date:string,options:Intl.DateTimeFormatOptions)=>new Intl.DateTimeFormat("en-US",{...options,timeZone:"UTC"}).format(calendarDate(date));
const shortDate=(date:string)=>format(date,{month:"short",day:"numeric"});
const dayTitle=(date:string)=>format(date,{weekday:"long",month:"long",day:"numeric",year:"numeric"});
const eventTime=(event:CalendarEvent,date:string)=>`${event.start.slice(0,10)<date?"Continues":event.start.slice(11)} – ${event.end.slice(0,10)>date?shortDate(event.end.slice(0,10))+" "+event.end.slice(11):event.end.slice(11)}`;

const settingId="admin-calendar";
type CalendarSettings={blocks:CalendarEvent[];hiddenExamples:string[]};
const emptySettings:CalendarSettings={blocks:[],hiddenExamples:[]};
const miamiTime=(value:string)=>{
 const date=new Date(value);
 if(!Number.isFinite(date.getTime()))return "";
 return new Intl.DateTimeFormat("sv-SE",{timeZone:"America/New_York",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).format(date).replace(" ","T");
};

export function AdminCalendarOverview({bookings,ready}:{bookings:AdminBooking[];ready:boolean}){
 const [today]=useState(()=>miamiTime(new Date().toISOString()).slice(0,10));
 const week=calendarWeek(today);
 const bookingWindows=bookings
  .filter(booking=>booking.status!=="Cancelled"&&!booking.testMode&&!booking.quoteRequest)
  .map(booking=>({status:booking.status,items:booking.items.map(item=>({start:miamiTime(item.start),end:miamiTime(item.end)}))}));

 return <section className={`${css.panel} ${css.overview}`} aria-label="Calendar and availability this week">
  <div className={css.panelHeader}>
   <div><h2>Calendar & availability</h2><p className={css.muted}>{shortDate(week[0])} – {shortDate(week[6])} · Miami time</p></div>
   <Link href="/admin/dashboard?view=calendar" className={styles.secondary}>Open calendar<ArrowUpRight size={14}/></Link>
  </div>
  <div className={css.miniWeek}>{week.map((date,index)=>{
   const nextDay=shiftCalendarDay(date,1);
   const rows=bookingWindows.filter(booking=>booking.items.some(({start,end})=>
    start&&end>start&&start<nextDay+"T00:00"&&end>date+"T00:00"
   ));
   return <div key={date} data-today={date===today} aria-current={date===today?"date":undefined}>
    <span>{weekdays[index]}</span><strong>{calendarDate(date).getUTCDate()}</strong>
    <div className={css.miniDots} aria-hidden="true">
     {rows.some(booking=>booking.status!=="Pending")&&<i data-kind="Confirmed"/>}
     {rows.some(booking=>booking.status==="Pending")&&<i data-kind="Pending"/>}
    </div>
    <small>{ready?`${rows.length} ${rows.length===1?"booking":"bookings"}`:"—"}</small>
   </div>;
  })}</div>
 </section>;
}

export function LiveAdminCalendar({products,bookings,ready}:{products:AdminProduct[];bookings:AdminBooking[];ready:boolean}){
 const [today]=useState(()=>miamiTime(new Date().toISOString()).slice(0,10));
 const inventory=products.filter(p=>p.status!=="archived").map(p=>({id:p.id,name:p.name,service:ADMIN_SERVICES.find(([id])=>id===p.service)?.[1]??p.service,supplier:"—"}));
 const examples=CALENDAR_PRODUCTS.slice(0,3);
 const sampleEvents:CalendarEvent[]=examples.map((p,index)=>{
  const date=shiftCalendarDay(today,index);
  return {id:"example-"+p.id,productId:p.id,title:"Example · "+p.name,guest:index===2?"":"Example guest",start:date+"T10:00",end:date+"T14:00",kind:index===2?"Blocked":index===1?"Pending":"Confirmed",note:"Example for the admin calendar."};
 });
 const schedule=bookings.filter(b=>b.status!=="Cancelled"&&!b.testMode&&!b.quoteRequest).flatMap(b=>b.items.flatMap((item,index)=>{
  const product=inventory.find(p=>p.id===item.productId)??inventory.find(p=>p.name===item.product);
  const start=miamiTime(item.start),end=miamiTime(item.end);
  if(!start||!end||end<=start)return [];
  const productId=product?.id??"booking-product:"+item.service+":"+item.product;
  if(!product)inventory.push({id:productId,name:item.product,service:item.service,supplier:"—"});
  return [{id:b.id+"-"+index,productId,title:item.product,guest:b.name,start,end,kind:b.status==="Pending"?"Pending" as const:"Confirmed" as const,note:b.notes}];
 }));
 return <AdminCalendar inventory={[...inventory,...examples.filter(p=>!inventory.some(item=>item.id===p.id))]} schedule={[...schedule,...sampleEvents]} today={today} live={ready}/>;
}

export function AdminCalendar({ inventory = CALENDAR_PRODUCTS, schedule = DEMO_EVENTS, today = CALENDAR_DEMO_TODAY, live }: { inventory?: CalendarProduct[]; schedule?: CalendarEvent[]; today?:string; live?:boolean } = {}){
 const [selected,setSelected]=useState(today),[view,setView]=useState<"month"|"week"|"day">("month");
 const [service,setService]=useState("all"),[supplier,setSupplier]=useState("all"),[product,setProduct]=useState("all"),[status,setStatus]=useState("all");
 const [blocks,setBlocks]=useState<CalendarEvent[]>([]),[detail,setDetail]=useState<CalendarEvent|null>(null),[feedback,setFeedback]=useState("");
 const [draft,setDraft]=useState({productId:inventory[0]?.id ?? "",date:today,start:"09:00",end:"17:00",note:""}),[error,setError]=useState("");
 const detailDialog=useRef<HTMLDialogElement>(null),blockDialog=useRef<HTMLDialogElement>(null);
 const [settings,setSettings]=useState(emptySettings),[loaded,setLoaded]=useState(false),[busy,setBusy]=useState(false);
 useEffect(()=>{if(!live)return;let active=true;loadSetting(settingId,emptySettings).then(value=>{if(active){setSettings(value);setLoaded(true);}}).catch(err=>{if(active)setFeedback(err.message);});return()=>{active=false;};},[live]);
 const persist=async(next:CalendarSettings)=>{setBusy(true);try{await saveRow("site_settings",settingId,next);setSettings(next);return true;}catch(err){setError(err instanceof Error?err.message:"Could not save calendar changes.");return false;}finally{setBusy(false);}};
 const activeSchedule=[...schedule.filter(e=>!settings.hiddenExamples.includes(e.id)),...blocks,...settings.blocks];
 const blockProducts=inventory.filter(p=>!CALENDAR_PRODUCTS.some(example=>example.id===p.id)&&!p.id.startsWith("booking-product:"));
 const products=inventory.filter(p=>(service==="all"||p.service===service)&&(supplier==="all"||p.supplier===supplier)&&(product==="all"||p.id===product));
 const events=activeSchedule.filter(e=>products.some(p=>p.id===e.productId)&&(status==="all"||e.kind===status));
 const days=view==="month"?calendarMonth(selected):view==="week"?calendarWeek(selected):[selected];
 const rangeStart=view==="month"?selected.slice(0,7)+"-01":days[0];
 const rangeEnd=view==="month"?moveCalendarMonth(rangeStart,1):shiftCalendarDay(days[days.length-1],1);
 const rangeEvents=eventsInCalendarRange(events,rangeStart,rangeEnd);
 const selectedEvents=eventsOnCalendarDay(events,selected);
 const [showUnscheduled,setShowUnscheduled]=useState(false);
 const [availabilityLimit,setAvailabilityLimit]=useState(8);
 const availabilityByProduct=new Map<string,CalendarEvent[]>();
 for(const event of eventsOnCalendarDay(activeSchedule,selected)){
  if(event.id.startsWith("example-"))continue;
  const rows=availabilityByProduct.get(event.productId)??[];
  rows.push(event);
  availabilityByProduct.set(event.productId,rows);
 }
 const scheduledProducts=products.filter(p=>availabilityByProduct.has(p.id));
 const unscheduledProducts=products.filter(p=>!availabilityByProduct.has(p.id));
 const availabilityProducts=showUnscheduled||product!=="all"?[...scheduledProducts,...unscheduledProducts]:scheduledProducts;
 const changeRange=(step:number)=>setSelected(value=>view==="month"?moveCalendarMonth(value,step):shiftCalendarDay(value,step*(view==="week"?7:1)));
 const showDetail=(event:CalendarEvent)=>{setError("");setDetail(event);detailDialog.current?.showModal();};
 const clearFilters=()=>{setService("all");setSupplier("all");setProduct("all");setStatus("all");};
 const heading=view==="month"?format(selected,{month:"long",year:"numeric"}):view==="week"?`${shortDate(days[0])} – ${shortDate(days[6])}, ${calendarDate(days[6]).getUTCFullYear()}`:dayTitle(selected);
 return <div className={css.page}>
  <div className={styles.pageHeading}><div><p className={styles.eyebrow}>BLACKLINE / PLANNING</p><h1>Every booking. <em>In its place.</em></h1><p>Your calendar, rental partners and product availability in one view.</p></div><button className={styles.primary} disabled={live!==undefined&&(!loaded||!blockProducts.length)} onClick={()=>{setDraft({productId:(live===undefined?inventory:blockProducts)[0]?.id ?? "",date:selected,start:"09:00",end:"17:00",note:""});setError("");blockDialog.current?.showModal();}}><Plus size={15}/>Add availability block</button></div>
  {activeSchedule.some(e=>e.id.startsWith("example-"))&&<aside className={css.demoBanner}><FlaskConical size={22}/><div><strong>Example events</strong><p>Open an example to delete it. Examples are excluded from availability and booking totals.</p></div></aside>}
  <div className={css.stats}>{[{label:"Confirmed bookings",value:rangeEvents.filter(e=>!e.id.startsWith("example-")&&e.kind==="Confirmed").length,Icon:Check},{label:"Pending bookings",value:rangeEvents.filter(e=>!e.id.startsWith("example-")&&e.kind==="Pending").length,Icon:Clock3},{label:"Unavailable blocks",value:rangeEvents.filter(e=>!e.id.startsWith("example-")&&e.kind==="Blocked").length,Icon:LockKeyhole},{label:"Products in view",value:products.length,Icon:CalendarDays}].map(({label,value,Icon})=><article key={label}><div><span>{label}</span><Icon size={16}/></div><strong>{value}</strong><small>{view==="month"?"selected month":view==="week"?"selected week":"selected day"}</small></article>)}</div>
  <div className={css.filters}><label>Service<select value={service} onChange={e=>{setService(e.target.value);setProduct("all");}}><option value="all">All services</option>{[...new Set(inventory.map(p=>p.service))].map(s=><option key={s}>{s}</option>)}</select></label><label>Supplier<select value={supplier} onChange={e=>{setSupplier(e.target.value);setProduct("all");}}><option value="all">All suppliers</option>{[...new Set(inventory.map(p=>p.supplier))].map(s=><option key={s}>{s}</option>)}</select></label><label>Product<select value={product} onChange={e=>setProduct(e.target.value)}><option value="all">All products</option>{inventory.filter(p=>(service==="all"||p.service===service)&&(supplier==="all"||p.supplier===supplier)).map(p=><option value={p.id} key={p.id}>{p.name}</option>)}</select></label><label>Event type<select value={status} onChange={e=>setStatus(e.target.value)}><option value="all">All events</option><option>Confirmed</option><option>Pending</option><option>Blocked</option></select></label><button className={css.textButton} onClick={clearFilters}>Reset filters</button></div>
  <div className={css.planningGrid}>
   <section className={css.panel} aria-label="Calendar"><div className={css.calendarToolbar}><div className={css.rangeControls}><button aria-label={`Previous ${view}`} onClick={()=>changeRange(-1)}><ChevronLeft size={17}/></button><h2 aria-live="polite">{heading}</h2><button aria-label={`Next ${view}`} onClick={()=>changeRange(1)}><ChevronRight size={17}/></button></div><div className={css.viewControls}><button onClick={()=>setSelected(today)}>Today</button><div role="group" aria-label="Calendar view">{(["month","week","day"] as const).map(v=><button key={v} aria-pressed={view===v} onClick={()=>setView(v)}>{v}</button>)}</div></div></div>
    <div className={css.legend}>{["Confirmed","Pending","Blocked"].map(s=><span key={s}><i data-kind={s}/>{s}</span>)}<small>All times are Miami local time</small></div>
    {view!=="day"?<div className={css.calendarScroll}><div className={view==="week"?css.weekGrid:css.monthGrid}>{weekdays.map(d=><div key={d} className={css.weekday}>{d}</div>)}{days.map(date=>{const rows=eventsOnCalendarDay(events,date),displayed=view==="month"?rows.slice(0,2):rows;return <div key={date} className={css.dayCell} data-outside={date.slice(0,7)!==selected.slice(0,7)} data-selected={date===selected} data-today={date===today}><button className={css.dateButton} aria-label={`Select ${dayTitle(date)}`} aria-pressed={date===selected} onClick={()=>setSelected(date)}>{calendarDate(date).getUTCDate()}{date===today&&<small>Today</small>}</button><div className={css.cellEvents}>{displayed.map(e=><button key={e.id} data-kind={e.kind} className={css.eventChip} onClick={()=>{setSelected(date);showDetail(e);}}><span>{e.start.slice(0,10)<date?"Continues":e.start.slice(11)}</span><strong>{e.title}</strong></button>)}{rows.length>displayed.length&&<button className={css.more} onClick={()=>{setSelected(date);setView("day");}}>+{rows.length-displayed.length} more</button>}</div></div>;})}</div></div>:<div className={css.dayAgenda}><p className={styles.eyebrow}>SCHEDULE / {dayTitle(selected)}</p>{selectedEvents.length?selectedEvents.map(e=><button key={e.id} className={css.agendaEvent} data-kind={e.kind} onClick={()=>showDetail(e)}><span>{eventTime(e,selected)}</span><div><strong>{e.title}</strong><small>{e.guest||"Product unavailable"} · {inventory.find(p=>p.id===e.productId)?.supplier}</small></div><em>{e.kind}</em><ChevronRight size={14}/></button>):<div className={css.empty}><CalendarDays size={28}/><h3>No events for this day.</h3><p>Try a different date or reset the filters. This does not confirm real availability.</p></div>}</div>}
    <p className={css.caption}>Multi-day rentals appear on each occupied day. Empty dates are not a guarantee of real availability.</p>
   </section>
   <aside className={css.panel}><div className={css.panelHeader}><div><p className={styles.eyebrow}>SELECTED DAY</p><h2>{shortDate(selected)}</h2><p className={css.muted}>{format(selected,{weekday:"long"})} · Miami time</p></div></div><div className={css.daySummary}><div><strong>{selectedEvents.filter(e=>!e.id.startsWith("example-")&&e.kind!=="Blocked").length}</strong><span>bookings</span></div><div><strong>{selectedEvents.filter(e=>!e.id.startsWith("example-")&&e.kind==="Blocked").length}</strong><span>blocks</span></div></div><div className={css.selectedList}>{selectedEvents.length?selectedEvents.map(e=><button key={e.id} className={css.selectedEvent} data-kind={e.kind} onClick={()=>showDetail(e)}><span>{eventTime(e,selected)}</span><strong>{e.title}</strong><small>{e.guest||"Unavailable block"}</small><em>{e.kind}</em></button>):<p className={css.muted}>No matching events. Choose another date or reset the filters.</p>}</div><div className={css.sideNote}><LockKeyhole size={15}/><p>Availability blocks apply to internal planning.</p></div></aside>
  </div>
  <section className={css.panel}><div className={css.panelHeader}><div><p className={styles.eyebrow}>PRODUCT AVAILABILITY</p><h2>What’s on the schedule?</h2><p className={css.muted}>{dayTitle(selected)} · Daily schedule</p></div></div><div className={styles.tableScroll}><table className={css.availabilityTable}><thead><tr><th>Product</th><th>Supplier</th><th>Schedule</th><th>Events on this date</th></tr></thead><tbody>{availabilityProducts.slice(0,availabilityLimit).map(p=>{const rows=availabilityByProduct.get(p.id)??[],blocked=rows.some(e=>e.kind==="Blocked"),booked=rows.some(e=>e.kind==="Confirmed"),pending=rows.some(e=>e.kind==="Pending");const state=blocked?"Blocked":booked?"Confirmed":pending?"Pending":"Empty";return <tr key={p.id}><td><strong>{p.name}</strong><small>{p.service}</small></td><td>{p.supplier}</td><td><span className={css.availabilityBadge} data-kind={state}>{blocked?"Block on schedule":booked?"Booking on schedule":pending?"Pending request":"No scheduled events"}</span></td><td>{rows.length?<div className={css.availabilityEvents}>{rows.map(e=><button key={e.id} onClick={()=>showDetail(e)}>{eventTime(e,selected)} · {e.kind}</button>)}</div>:<small>—</small>}</td></tr>;})}</tbody></table></div>{!products.length&&<p className={css.empty}>No products match these filters. <button className={css.textButton} onClick={clearFilters}>Reset filters</button></p>}{products.length>0&&!availabilityProducts.length&&<p className={css.empty}>No bookings or blocks for these products on this date.</p>}<div className={css.panelHeader}><p className={css.muted} aria-live="polite">Showing {Math.min(availabilityProducts.length,availabilityLimit)} of {availabilityProducts.length} products · {scheduledProducts.length} with scheduled events</p>{product==="all"&&unscheduledProducts.length>0&&<button type="button" className={styles.secondary} aria-pressed={showUnscheduled} onClick={()=>{setShowUnscheduled(!showUnscheduled);setAvailabilityLimit(8);}}>{showUnscheduled?"Show scheduled products only":"Include products without events"}</button>}{availabilityProducts.length>availabilityLimit&&<button type="button" className={styles.secondary} onClick={()=>setAvailabilityLimit(limit=>limit+8)}>Show more products</button>}{availabilityLimit>8&&<button type="button" className={styles.secondary} onClick={()=>setAvailabilityLimit(8)}>Show fewer products</button>}</div></section>
  {feedback&&<p className={css.feedback} role="status">{feedback}</p>}
  <dialog className={styles.dialog} ref={detailDialog} aria-labelledby="calendar-detail-title"><div className={styles.dialogHeader}><div><p className={styles.eyebrow}>CALENDAR EVENT</p><h2 id="calendar-detail-title">{detail?.title??"Event details"}</h2></div><button aria-label="Close event details" onClick={()=>detailDialog.current?.close()}><X size={20}/></button></div>{detail&&<div className={styles.dialogBody}>{detail.id.startsWith("example-")&&<p className={css.modalNotice}>Example event. This does not affect availability.</p>}<dl className={css.details}>{[["Reference",detail.id],["Status",detail.kind],["Product",inventory.find(p=>p.id===detail.productId)?.name],["Supplier",inventory.find(p=>p.id===detail.productId)?.supplier],["Guest",detail.guest||"Not applicable"],["Starts",`${dayTitle(detail.start.slice(0,10))} · ${detail.start.slice(11)}`],["Ends",`${dayTitle(detail.end.slice(0,10))} · ${detail.end.slice(11)}`]].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><p className={css.muted}>{detail.note}</p><p className={css.caption}>All times shown in Miami local time.</p></div>}<div className={styles.dialogActions}>{detail&&live&&(detail.id.startsWith("example-")||settings.blocks.some(block=>block.id===detail.id))&&<button className={styles.danger} disabled={busy||!loaded} onClick={async()=>{if(await persist({blocks:settings.blocks.filter(block=>block.id!==detail.id),hiddenExamples:detail.id.startsWith("example-")?[...settings.hiddenExamples,detail.id]:settings.hiddenExamples}))detailDialog.current?.close();}}>Delete {detail.id.startsWith("example-")?"example":"block"}</button>}{error&&<p className={styles.error} role="alert">{error}</p>}<button className={styles.secondary} onClick={()=>detailDialog.current?.close()}>Close</button></div></dialog>
  <dialog className={styles.dialog} ref={blockDialog} aria-labelledby="calendar-block-title"><div className={styles.dialogHeader}><div><p className={styles.eyebrow}>CALENDAR / AVAILABILITY</p><h2 id="calendar-block-title">Add an availability block</h2></div><button aria-label="Close availability block" onClick={()=>blockDialog.current?.close()}><X size={20}/></button></div><form onSubmit={async e=>{e.preventDefault();if(!draft.productId||!draft.date||draft.end<=draft.start){setError("Choose a product and an end time after the start time.");return;}const block:CalendarEvent={id:`block-${crypto.randomUUID()}`,productId:draft.productId,title:"Unavailable",guest:"",start:`${draft.date}T${draft.start}`,end:`${draft.date}T${draft.end}`,kind:"Blocked",note:draft.note.trim()};if(live){if(!loaded||busy||!blockProducts.some(p=>p.id===draft.productId))return;if(!await persist({...settings,blocks:[...settings.blocks,block]}))return;}else setBlocks(rows=>[...rows,block]);setSelected(draft.date);clearFilters();setFeedback("Availability block added.");blockDialog.current?.close();}}><div className={styles.dialogBody}><p className={css.modalNotice}>{live===undefined?"Blocks in this preview reset when you leave the page.":"Blocks are recorded in the internal schedule. Online checkout uses its own reservation checks."}</p><div className={styles.formGrid}><label>Product<select value={draft.productId} onChange={e=>setDraft({...draft,productId:e.target.value})}>{(live===undefined?inventory:blockProducts).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label><label>Date<input required type="date" value={draft.date} onChange={e=>setDraft({...draft,date:e.target.value})}/></label><label>Start time (Miami)<input required type="time" value={draft.start} onChange={e=>setDraft({...draft,start:e.target.value})}/></label><label>End time (Miami)<input required type="time" value={draft.end} onChange={e=>setDraft({...draft,end:e.target.value})}/></label></div><label className={styles.fullField}>Reason / internal note<textarea rows={3} maxLength={1000} value={draft.note} onChange={e=>setDraft({...draft,note:e.target.value})} placeholder="For example: maintenance or supplier unavailable"/></label>{error&&<p className={styles.error} role="alert">{error}</p>}</div><div className={styles.dialogActions}><button type="button" className={styles.secondary} onClick={()=>blockDialog.current?.close()}>Cancel</button><button type="submit" disabled={busy} className={styles.primary}><Plus size={14}/>Save block</button></div></form></dialog>
 </div>;
}
