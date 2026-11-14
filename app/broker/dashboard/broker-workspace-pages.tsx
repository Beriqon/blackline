"use client";

import { useRef, useState } from "react";
import admin from "@/app/admin/dashboard/dashboard.module.css";
import { AdminBookings } from "@/components/admin-bookings";
import type { AdminBooking } from "@/lib/admin-demo-data";
import { AdminDocuments } from "@/components/admin-documents";
import customerStyles from "@/components/admin-customers.module.css";

const booking = {
  id: "BL-DEMO-104", customer: "Alex Morgan", listing: "Sunset yacht charter",
  date: "Nov 10, 2026 · 3:00–7:00 PM Miami time", status: "Confirmed",
};

const brokerBooking: AdminBooking = {
  id: booking.id, name: booking.customer, email: "alex@example.com", phone: "",
  source: "Website", affiliate: "", status: "Confirmed", notes: "",
  items: [{ service: "yachts", product: booking.listing, start: "2026-11-10T15:00", end: "2026-11-10T19:00", price: 0 }],
};

export function BrokerBookings() {
  const details = useRef<HTMLDialogElement>(null);
  const create = useRef<HTMLDialogElement>(null);
  const [rows, setRows] = useState([brokerBooking]);
  const [selected, setSelected] = useState(brokerBooking);
  return <>
    <AdminBookings broker bookings={rows} ready stripeError="" refreshing={false}
      onRefresh={() => {}} onNew={() => create.current?.showModal()} onDelete={() => {}} onEdit={record => {setSelected(record); details.current?.showModal();}} />
    <dialog ref={create} className={admin.dialog} aria-labelledby="new-broker-booking">
      <div className={admin.dialogHeader}><h2 id="new-broker-booking">New booking</h2></div>
      <form onSubmit={event => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(form);
        const start = String(data.get("start"));
        setRows(current => [...current, {...brokerBooking, id: "BL-DEMO-" + (104 + current.length), name: String(data.get("guest")), email: "", status: "Pending", items: [{...brokerBooking.items[0], start, end: ""}]}]);
        form.reset();
        create.current?.close();
      }}>
        <div className={admin.dialogBody}><p className={admin.formHint}>Demo booking for Sunset yacht charter.</p><div className={admin.formGrid}>
          <label>Guest name<input name="guest" required /></label>
          <label>Start date and time<input name="start" type="datetime-local" required /></label>
        </div></div>
        <div className={admin.dialogActions}><button type="button" className={admin.secondary} onClick={() => create.current?.close()}>Cancel</button><button className={admin.primary}>Add demo booking</button></div>
      </form>
    </dialog>
    <dialog ref={details} className={admin.dialog} aria-labelledby="broker-booking-title">
      <div className={admin.dialogHeader}><div><p className={admin.eyebrow}>{selected.id}</p><h2 id="broker-booking-title">{selected.name}</h2></div></div>
      <div className={admin.dialogBody}><p>{selected.items[0]?.product}</p><p>{selected.items[0]?.start?.replace("T", " ")}</p><p>{selected.status}</p></div>
      <div className={admin.dialogActions}><button className={admin.secondary} onClick={() => details.current?.close()}>Close</button></div>
    </dialog>
  </>;
}

const documents: NonNullable<Parameters<typeof AdminDocuments>[0]>["demoDocuments"] = [
  {id:"itinerary",name:"Charter itinerary.pdf",folder:"bookings",context:"Booking",reference:booking.id,status:"Filed",format:"PDF",created_at:"2026-11-10T00:00:00Z",description:"Example itinerary shared with this broker."},
  {id:"agreement",name:"Guest charter agreement.pdf",folder:"contracts",context:"Booking",reference:booking.id,status:"Signed",format:"PDF",created_at:"2026-11-10T00:00:00Z",description:"Example agreement shared with this broker."},
];

export function BrokerDocuments() {
  return <AdminDocuments demoDocuments={documents} hiddenFolders={["suppliers"]} />;
}

export function BrokerCustomers({customers}: {customers: {name:string;email:string;listing:string}[]}) {
  const [query, setQuery] = useState("");
  const rows = customers.filter(item => [item.name,item.email,item.listing].join(" ").toLowerCase().includes(query.trim().toLowerCase()));
  return <section className={admin.panel}>
    <div className={admin.panelHeading}><div><p className={admin.eyebrow}>YOUR CUSTOMER DIRECTORY</p><h2>People behind the plans</h2></div><span className={customerStyles.muted}>{rows.length} customers</span></div>
    <div className={admin.tableTools + " " + customerStyles.filters}><label><input type="search" aria-label="Search customers" placeholder="Name, email or listing" value={query} onChange={event => setQuery(event.target.value)} /></label></div>
    {rows.length ? <div className={admin.tableScroll}><table><thead><tr><th>Customer</th><th>Booking insight</th><th>Keep in touch</th></tr></thead><tbody>
      {rows.map(item => <tr key={item.email}><td><strong>{item.name}</strong><small>{item.email}</small></td><td>{item.listing}</td><td><a className={admin.secondary} href={"mailto:" + item.email}>Email</a></td></tr>)}
    </tbody></table></div> : <p className={customerStyles.empty}>No customers match your search.</p>}
  </section>;
}
