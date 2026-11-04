import {ArrowUpRight,CalendarDays} from "lucide-react";
import type {AdminBooking} from "@/lib/admin-demo-data";
import {agreedBookingValue,bookingHistoryByYear} from "@/lib/customer-insights";
import styles from "@/app/admin/dashboard/dashboard.module.css";
import css from "./admin-customers.module.css";

const money=(n:number)=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(n);
function dateTime(value:string){const date=new Date(value);return Number.isFinite(date.getTime())?new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric",year:"numeric",hour:"numeric",minute:"2-digit"}).format(date):"Date not set";}
export function CustomerBookingHistory({bookings,onOpen,readOnly=false}:{bookings:AdminBooking[];onOpen:(booking:AdminBooking)=>void;readOnly?:boolean}){
 const groups=bookingHistoryByYear(bookings);
 return <section className={css.history} aria-labelledby="customer-history-title">
  <div className={styles.formSectionHeading}><h3 id="customer-history-title">Booking history</h3><span className={css.muted}>All years · {bookings.length} {bookings.length===1?"booking":"bookings"}</span></div>
  <div className={css.historySummary}><div><span>Total bookings</span><strong>{bookings.length}</strong></div><div><span>Confirmed & completed</span><strong>{bookings.filter(b=>b.status==="Confirmed"||b.status==="Completed").length}</strong></div><div><span>Agreed booking value</span><strong>{money(agreedBookingValue(bookings))}</strong></div></div>
  <p className={css.muted}>Includes pending, confirmed, completed and cancelled bookings. Value counts confirmed and completed bookings, not payments received. Grouped by the first service date of each booking; all service dates use your local time zone.</p>
  {groups.length?groups.map(group=><section className={css.yearGroup} key={group.year} aria-label={`${group.year} booking history`}><div className={css.yearHeading}><h4><CalendarDays size={16}/>{group.year}</h4><span>{group.bookings.length} {group.bookings.length===1?"booking":"bookings"} · {money(group.value)} agreed</span></div>
   {group.bookings.map(booking=><article className={css.historyBooking} key={booking.id}><div className={css.bookingHeading}><div><strong>{booking.id}</strong><small>{booking.source}{booking.affiliate?` · ${booking.affiliate}`:""}{booking.id.startsWith("BL-DEMO")?" · Demo booking":""}</small></div><span className={styles.bookingStatus} data-status={booking.status}>{booking.status}</span></div>
    <ul className={css.serviceList}>{booking.items.map((item,index)=><li key={`${booking.id}-${index}`}><div><strong>{item.product||"Service"}</strong><p>{dateTime(item.start)} → {dateTime(item.end)}</p></div><span>{item.price>0?money(item.price):"On request"}</span></li>)}</ul>
    <div className={css.bookingFooter}><span>Booking total <strong>{booking.items.some(item=>item.price>0)?money(booking.items.reduce((sum,item)=>sum+(Number.isFinite(item.price)?item.price:0),0)):"On request"}</strong></span>{!readOnly&&<button type="button" className={styles.secondary} onClick={()=>onOpen(booking)}>Open booking<ArrowUpRight size={14}/></button>}</div>
   </article>)}
  </section>):<p className={styles.formHint}>No bookings yet. Matching workspace bookings appear here automatically, including future visits and repeat bookings.</p>}
 </section>;
}
