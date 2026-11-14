"use client";

import {useState, type FormEvent} from "react";
import Image from "next/image";
import Link from "next/link";
import { Archive, BadgeCheck, Clock3, Eye, EyeOff, Pencil, Plus, RotateCcw, Search, Trash2, CalendarDays, ChevronRight, Files, Inbox, Menu, LogOut, LayoutDashboard, Package, Settings, Users } from "lucide-react";
import admin from "@/app/admin/dashboard/dashboard.module.css";
import { AdminCalendar } from "@/components/admin-calendar";
import { BrokerBookings, BrokerCustomers, BrokerDocuments } from "./broker-workspace-pages";
import overview from "@/components/admin-overview.module.css";
import settingsStyles from "@/components/admin-settings.module.css";
import css from "./dashboard.module.css";

type View = "Overview" | "Bookings" | "Calendar & availability" | "Customers" | "Inquiries" | "Documents" | "All listings" | "Archive" | "Settings";
type Listing = {id: string; name: string; service: string; location: string; price: string; specs: string; availability: string; photo: string; status: "Live" | "Draft" | "In review"};
const customers = [{name:"Alex Morgan",email:"alex@example.com",listing:"Sunset yacht charter"},{name:"Jordan Ellis",email:"jordan@example.com",listing:"Private chef tasting menu"}];
const pageSize = 12;
const examples: Listing[] = [
  {id:"yacht", name:"Sunset yacht charter", service:"yachts", location:"Miami Beach", price:"$1,800 / charter", specs:"12 guests · 4 hours", availability:"Friday–Sunday", photo:"/home/miami-dusk.webp", status:"Live"},
  {id:"chef", name:"Private chef tasting menu", service:"private-chefs", location:"Brickell", price:"$175 / guest", specs:"Five courses · up to 10 guests", availability:"By request", photo:"/home/private-chefs-cover.webp", status:"In review"},
];
const fleet: Listing[] = Array.from({ length: 99 }, (_, index) => ({
  ...examples[0],
  id: "fleet-" + index,
  name: "Charter yacht " + String(index + 1).padStart(2, "0"),
  location: index % 2 === 0 ? "Miami Beach" : "Fort Lauderdale",
  photo: "",
  status: index % 3 === 0 ? "Draft" : "In review",
}));

export function Dashboard({services, pending}: {services: ReadonlyArray<readonly [string, string]>; pending: boolean}) {
  const [mobile, setMobile] = useState(false);
  const [hidden, setHidden] = useState<string[]>([]);
  const [archived, setArchived] = useState<string[]>([]);
  const [verified, setVerified] = useState(!pending);
  const [view, setView] = useState<View>("Overview");
  const [service, setService] = useState("");
  const [listings, setListings] = useState(() => [...examples, ...fleet]);
  const [editor, setEditor] = useState<Listing | null>(null);
  const [settingsTab, setSettingsTab] = useState<"Profile" | "Security">("Profile");
  const [passwordNotice, setPasswordNotice] = useState("");
  const [notice, setNotice] = useState("");
  const category = (id: string) => services.find(([key]) => key === id)?.[1] ?? id;

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("name");
  const [page, setPage] = useState(1);
  const [profile, setProfile] = useState({company:"Coastal Experiences", email:"team@example.com", notifications:true});
  const visibility = (item: Listing) => item.status === "Live" ? hidden.includes(item.id) ? "Hidden" : "Visible" : item.status;
  const toggle = (ids: string[], id: string) => ids.includes(id) ? ids.filter(value => value !== id) : [...ids, id];
  const filtered = listings.filter(item =>
    (archived.includes(item.id) === (view === "Archive")) && (!service || service === item.service) && (!status || status === visibility(item)) &&
    [item.name,item.specs,item.location,category(item.service)].join(" ").toLowerCase().includes(query.trim().toLowerCase())
  ).sort((a,b) => sort === "location" ? a.location.localeCompare(b.location) : a.name.localeCompare(b.name));
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!verified || !editor) return;
    const form = new FormData(event.currentTarget);
    const read = (name: string) => String(form.get(name) ?? "").trim();
    const review = (event.nativeEvent as SubmitEvent).submitter?.getAttribute("value") === "review";
    const listing: Listing = {
      ...editor, name: read("name"), service: read("service"), location: read("location"),
      price: read("price"), specs: read("specs"), availability: read("availability"), status: review ? "In review" : "Draft",
    };
    setListings(current => [...current.filter(item => item.id !== listing.id), listing]);
    setService("");
    setPage(1);
    setStatus("");
    setQuery("");
    setEditor(null);
    setNotice(review ? "Demo submitted for Blackline review. The published version stays live until approval." : "Draft saved for this demo session.");
  }

  function navigate(next: View, categoryId = "") {
    setView(next);
    setService(categoryId);
    setQuery("");
    setStatus("");
    setPage(1);
    setEditor(null);
    setNotice("");
    setMobile(false);
  }

  function nav(item: View, Icon: typeof Package, label: string = item, categoryId = "") {
    const active = view === item && (item !== "All listings" || service === categoryId);
    return <button key={label} type="button" className={active ? admin.navActive : admin.navLink}
      disabled={!verified && item !== "Overview"} aria-current={active ? "page" : undefined}
      onClick={() => navigate(item, categoryId)}><Icon size={16} aria-hidden="true" /><span>{label}</span></button>;
  }

  return (
    <div className={admin.app + " " + css.brokerApp}>
      {mobile && <button className={admin.scrim} aria-label="Close navigation" onClick={() => setMobile(false)} />}
      <aside className={admin.sidebar + (mobile ? " " + admin.sidebarOpen : "")}>
        <button type="button" className={admin.brand + " " + css.brandButton} onClick={() => navigate("Overview")}><strong>BLACKLINE</strong><span>CONCIERGE / BROKER PORTAL</span></button>
        <div className={admin.workspace}><span>B.</span><div>{profile.company}<small>{verified ? "Verified broker" : "Pending verification"}</small></div><ChevronRight size={13} /></div>
        <nav aria-label="Broker navigation">
          <section className={admin.navGroup} aria-label="Workspace"><p className={admin.navCaption}>WORKSPACE</p>
            {nav("Overview",LayoutDashboard)}{nav("Bookings",CalendarDays)}{nav("Calendar & availability",CalendarDays)}{nav("Customers",Users)}
          </section>
          <section className={admin.navGroup} aria-label="Business"><p className={admin.navCaption}>BUSINESS</p>{nav("Inquiries",Inbox)}{nav("Documents",Files)}</section>
          <section className={admin.navGroup} aria-label="Collection"><p className={admin.navCaption}>COLLECTION</p>{nav("All listings",Package)}
            <div className={admin.collectionNav}>{services.map(([id,label]) => nav("All listings",Package,label,id))}</div>{nav("Archive",Archive)}
          </section>
          <section className={admin.navGroup} aria-label="Administration"><p className={admin.navCaption}>ADMINISTRATION</p>{nav("Settings",Settings)}</section>
        </nav>
        <div className={admin.sidebarBottom}><Link href="/" target="_blank" rel="noopener">View website</Link><Link className={admin.secondary} href="/broker"><LogOut size={15} aria-hidden="true" /> Sign out</Link></div>
      </aside>
      <div className={admin.main + " " + css.content}>
        <header className={admin.topbar + " " + css.header}>
          <div><button className={admin.menu} aria-label="Open navigation" onClick={() => setMobile(true)}><Menu size={20} /></button><span>Workspace</span><ChevronRight size={12} /><strong>{view}</strong></div>
          <div className={css.headerAccount}>
          <span className={css.verification} data-verified={verified}>{verified ? <BadgeCheck size={16} aria-hidden="true" /> : <Clock3 size={16} aria-hidden="true" />}{verified ? "Verified broker" : "Pending verification"}</span>
          <label>Demo account <select value={verified ? "verified" : "pending"} onChange={event => {
            setVerified(event.target.value === "verified"); setEditor(null); setView("Overview"); setNotice("");
          }}><option value="verified">Verified</option><option value="pending">Pending verification</option></select></label>
          </div>
        </header>
        <div className={admin.content + " " + css.body}>
          {["Bookings", "All listings", "Archive"].includes(view) && <div className={admin.previewBanner}><span>Broker workspace · Sample data</span><span>Demo mode</span></div>}
          {!["Calendar & availability", "Documents", "Bookings", "Overview", "All listings", "Archive"].includes(view) && <div className={admin.pageHeading}><div><p className={admin.eyebrow}>{profile.company}</p><h1>{view === "Settings" ? <>Your workspace. <em>Your way.</em></> : view === "Customers" ? <>Know your guests. <em>Keep in touch.</em></> : view}</h1></div></div>}
          {!verified ? <section className={css.card}><h2>Blackline is reviewing your application</h2><p>You can check your status here. Listings and inquiries unlock after approval.</p></section> : <>
            {view === "Overview" && <div className={overview.overview}>
              <header className={overview.hero}><div className={overview.headingGroup}><span className={overview.headingMark}><LayoutDashboard size={20} /></span><div className={overview.headingCopy}><span className={overview.headingEyebrow}>BLACKLINE / WORKSPACE</span><h1>Overview</h1><span className={overview.dataLabel}><span />{profile.company} · Demo workspace</span></div></div></header>
              <div className={overview.metrics}>
                {[
                  {label:"Total listings", count:listings.length, Icon:Package},
                  {label:"In review", count:listings.filter(item => item.status === "In review").length, Icon:Inbox},
                  {label:"Inquiries", count:1, Icon:Inbox},
                  {label:"Customers", count:customers.length, Icon:Users},
                ].map(({label,count,Icon}) => <div className={overview.metric} key={label}><div>{label}<Icon size={16} aria-hidden="true" /></div><strong>{count}</strong></div>)}
              </div>
              <section className={overview.panel}>
                <div className={overview.panelHeader}><h2>Listings by service</h2><button className={admin.secondary} onClick={() => setView("All listings")}>All listings</button></div>
                {services.map(([id,label]) => {
                  const group = listings.filter(item => item.service === id);
                  return <div className={css.overviewRow} key={id}>
                    <strong>{label}</strong><span>{group.length} listings · {group.filter(item => item.status === "In review").length} in review</span>
                    <button className={admin.secondary} onClick={() => {setService(id); setQuery(""); setStatus(""); setPage(1); setView("All listings");}}>View listings</button>
                  </div>;
                })}
              </section>
              <section className={overview.panel + " " + css.overviewPanel}>
                <div className={overview.panelHeader}><h2>Latest inquiry</h2><button className={admin.secondary} onClick={() => setView("Inquiries")}>All inquiries</button></div>
                <div className={css.overviewRow}><strong>Sunset yacht charter</strong><span>Saturday charter for eight guests</span><span className={css.badge}>New</span></div>
              </section>
            </div>}
            {view === "Bookings" && <BrokerBookings />}
            {view === "Documents" && <BrokerDocuments />}
            {view === "Calendar & availability" && <AdminCalendar inventory={listings.filter(item => !archived.includes(item.id)).map(item => ({id:item.id,name:item.name,service:category(item.service),supplier:profile.company}))} schedule={[{id:"BL-DEMO-104",productId:"yacht",title:"Sunset yacht charter",guest:"Alex Morgan",start:"2026-11-10T15:00",end:"2026-11-10T19:00",kind:"Confirmed",note:"Broker demo booking"}]} />}
            {(view === "All listings" || view === "Archive") && <>
              <div className={admin.pageHeading}>
                <div><p className={admin.eyebrow}>BLACKLINE / COLLECTION</p><h1>{service ? category(service) : view}</h1><p>{filtered.length} listings · Your broker collection.</p></div>
                {view !== "Archive" && <button className={admin.primary} onClick={() => {setNotice(""); setEditor({id:crypto.randomUUID(),name:"",service:service || services[0][0],location:"",price:"",specs:"",availability:"",photo:"",status:"Draft"});}}><Plus size={16} />Add listing</button>}
              </div>
              {notice && <p role="status">{notice}</p>}
              {editor && <form key={editor.id} className={css.card} onSubmit={save}>
                <h2>{editor.name ? "Edit listing" : "Add listing"}</h2>
                <div className={css.fields}>
                  <label>Listing name<input name="name" defaultValue={editor.name} required /></label>
                  <label>Service<select name="service" defaultValue={editor.service}>{services.map(([id,label]) => <option key={id} value={id}>{label}</option>)}</select></label>
                  <label>Location<input name="location" defaultValue={editor.location} required /></label>
                  <label>Price and unit<input name="price" defaultValue={editor.price} placeholder="$175 / guest" required /></label>
                  <label>Specifications<textarea name="specs" defaultValue={editor.specs} /></label>
                  <label>Availability<textarea name="availability" defaultValue={editor.availability} /></label>
                  <label>Sample photos<input type="file" accept="image/*" multiple /><small>Files can be selected for demonstration.</small></label>
                </div>
                <div className={css.toolbar}><button type="button" onClick={() => setEditor(null)}>Cancel</button><button type="submit">Save draft</button><button className={css.primary} type="submit" value="review">Submit for review</button></div>
              </form>}
              <div className={admin.panel}>
                <div className={admin.tableTools}>
                  <label><Search size={15} /><input aria-label="Search listings" placeholder="Search name, description or location…" value={query} onChange={event => {setQuery(event.target.value); setPage(1);}} /></label>
                  <select aria-label="Service" value={service} onChange={event => {setService(event.target.value); setPage(1);}}>
                  <option value="">All my services ({listings.length})</option>
                  {services.map(([id, label]) => <option key={id} value={id}>{label} ({listings.filter(item => item.service === id).length})</option>)}
                </select>
                  <select aria-label="Sort listings" value={sort} onChange={event => {setSort(event.target.value); setPage(1);}}><option value="name">Name A–Z</option><option value="location">Location</option></select>
                  <select aria-label="Listing status" value={status} onChange={event => {setStatus(event.target.value); setPage(1);}}><option value="">All statuses</option><option>Visible</option><option>Hidden</option><option>Draft</option><option>In review</option></select>
                </div>
                <div className={admin.tableScroll}><table><thead><tr><th>Listing</th><th>Service</th><th>Rate</th><th>Visibility</th><th>Actions</th></tr></thead><tbody>
                {visible.map(item => <tr key={item.id}><td><div className={admin.productCell}>
                  {item.photo ? <Image className={admin.productThumb} src={item.photo} alt="" width={168} height={112} /> : <span className={admin.productThumb}><Package size={17} /></span>}<div>
                  <button className={admin.customerButton} disabled={view === "Archive"} onClick={() => setEditor(item)}>{item.name}</button><small>{item.location}</small>
                  {item.id === "yacht" && item.status !== "Live" && <p>Live version: Sunset yacht charter · $1,800 / charter</p>}
                  </div></div></td><td>{category(item.service)}</td><td>{item.price.split(" / ")[0]}{item.price.includes(" / ") && <small>per {item.price.split(" / ")[1]}</small>}</td>
                  <td><span className={admin.productStatus} data-status={view === "Archive" ? "archived" : visibility(item).toLowerCase()}>{view === "Archive" ? "Archived" : visibility(item)}</span></td>
                  <td><div className={admin.rowActions}>
                    {view !== "Archive" && <>
                      <button aria-label={"Edit " + item.name} title="Edit" onClick={() => {setNotice(""); setEditor(item);}}><Pencil size={14} /></button>
                      <button disabled={item.status !== "Live"} aria-label={(hidden.includes(item.id) ? "Show " : "Hide ") + item.name} title="Toggle visibility" onClick={() => setHidden(ids => toggle(ids,item.id))}>{hidden.includes(item.id) ? <Eye size={15} /> : <EyeOff size={15} />}</button>
                    </>}
                    <button aria-label={(view === "Archive" ? "Restore " : "Archive ") + item.name} title={view === "Archive" ? "Restore" : "Archive"} onClick={() => {setEditor(null); setArchived(ids => toggle(ids,item.id));}}>{view === "Archive" ? <RotateCcw size={14} /> : <Archive size={14} />}</button>
                    <button aria-label={"Delete " + item.name} title="Delete demo listing" onClick={() => {
                      if (!window.confirm("Delete this demo listing?")) return;
                      setEditor(null);
                      setListings(rows => rows.filter(row => row.id !== item.id));
                    }}><Trash2 size={14} /></button>
                  </div></td></tr>)}
              </tbody></table></div></div>
              {filtered.length === 0 ? <p>No listings match these filters.</p> : <div className={css.toolbar}>
                <span>{(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} listings</span>
                <div className={admin.actions}>
                  <button disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Previous</button>
                  <button disabled={currentPage === pages} onClick={() => setPage(currentPage + 1)}>Next</button>
                </div>
              </div>}
            </>}
            {view === "Inquiries" && <section className={css.card}><span className={css.badge}>New</span><h2>Sunset yacht charter</h2><p>Inquiry BL-DEMO-104 · Routed by Blackline to Coastal Experiences.</p><p>Guest is asking about a Saturday charter for eight people.</p></section>}
            {view === "Customers" && <BrokerCustomers customers={customers} />}
            {view === "Settings" && <div className={settingsStyles.layout}>
              <nav className={settingsStyles.tabs} aria-label="Settings sections">{(["Profile","Security"] as const).map(tab => <button key={tab} aria-current={settingsTab === tab ? "page" : undefined} onClick={() => {setSettingsTab(tab); setNotice(""); setPasswordNotice("");}}>{tab}</button>)}</nav>
              <div className={settingsStyles.panels}>{settingsTab === "Profile" ? (
              <section className={admin.panel}><div className={admin.panelHeading}><h2>Business profile</h2></div><div className={settingsStyles.body}>
                <form className={admin.formGrid} onSubmit={event => {
                  event.preventDefault();
                  const data = new FormData(event.currentTarget);
                  setProfile({company:String(data.get("company")),email:String(data.get("email")),notifications:data.has("notifications")});
                  setNotice("Settings saved for this demo session.");
                }}>
                  <label>Display name<input name="company" defaultValue={profile.company} required /></label>
                  <label>Contact email<input name="email" type="email" defaultValue={profile.email} required /></label>
                  <label className={css.check}><input type="checkbox" name="notifications" defaultChecked={profile.notifications} /> Email notifications</label>
                  <div><button className={admin.primary}>Save settings</button></div>
                </form>
                {notice && <p role="status">{notice}</p>}<p>Approved services</p><ul>{services.map(([id,label]) => <li key={id}>{label}</li>)}</ul><p>Identity, business registration and broker agreement reviewed.</p></div></section>
              ) : (
                <section className={admin.panel}>
                  <div className={admin.panelHeading}><h2>Change password</h2></div>
                  <div className={settingsStyles.body}>
                    <p>Use an example password for this demo.</p>
                    <form className={css.securityForm} onSubmit={event => {
                      event.preventDefault();
                      const form = event.currentTarget;
                      const data = new FormData(form);
                      if (data.get("password") !== data.get("confirmation")) {
                        setPasswordNotice("The new passwords do not match.");
                        return;
                      }
                      form.reset();
                      setPasswordNotice("Demo password check complete. Your account password was not changed.");
                    }}>
                      <label>Current password<input type="password" autoComplete="off" required /></label>
                      <label>New password<input name="password" type="password" autoComplete="off" required minLength={10} pattern={"(?=.*\\p{Lu})(?=.*\\p{Ll})(?=.*\\p{Nd})(?=.*[\\p{P}\\p{S}]).{10,}"} aria-describedby="broker-password-hint" /></label>
                      <p id="broker-password-hint">At least 10 characters with an uppercase letter, a lowercase letter, a number and a special character.</p>
                      <label>Confirm new password<input name="confirmation" type="password" autoComplete="off" required /></label>
                      <div><button className={admin.primary}>Change password</button></div>
                    </form>
                    {passwordNotice && <p role="status">{passwordNotice}</p>}
                  </div>
                  <div className={admin.panelHeading}><h2>Two-factor authentication</h2></div>
                  <div className={settingsStyles.body}><p>Available when broker authentication is connected.</p></div>
                </section>
              )}</div>
            </div>}
          </>}
        </div>
      </div>
    </div>
  );
}
