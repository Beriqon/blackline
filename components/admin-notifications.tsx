"use client";
import {useEffect,useState} from "react";
import {Bell,BellOff,RefreshCw,Send} from "lucide-react";
import {supabaseBrowser} from "@/lib/supabase-browser";
import {isLocalDashboardPreview} from "@/lib/dashboard-preview";
import styles from "@/app/admin/dashboard/dashboard.module.css";
import settings from "./admin-settings.module.css";
async function deviceRequest(action:string,input:Record<string,unknown>={}){
 const {data,error}=await supabaseBrowser().rpc("blackline_push_device",{action,input});
 if(error)throw new Error(error.message);return data;
}
function keyBytes(value:string){const raw=atob(value.replace(/-/g,"+").replace(/_/g,"/")+"=".repeat((4-value.length%4)%4));return Uint8Array.from(raw,c=>c.charCodeAt(0));}
export function AdminNotifications(){
 const [enabled,setEnabled]=useState(false),[permission,setPermission]=useState("default"),[supported,setSupported]=useState(false),[ready,setReady]=useState(false),[busy,setBusy]=useState(false),[feedback,setFeedback]=useState(""),[ios,setIos]=useState(false),[standalone,setStandalone]=useState(false);
 async function refresh(){
  const available=window.isSecureContext&&"serviceWorker" in navigator&&"PushManager" in window&&"Notification" in window;
  setSupported(available);setPermission("Notification" in window?Notification.permission:"unavailable");
  setIos(/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1));
  setStandalone(window.matchMedia("(display-mode: standalone)").matches||Boolean((navigator as Navigator&{standalone?:boolean}).standalone));
  try{if(available&&!isLocalDashboardPreview()){
   const registration=await navigator.serviceWorker.getRegistration("/admin/");const subscription=await registration?.pushManager.getSubscription();
   const status=subscription?await deviceRequest("status",{endpoint:subscription.endpoint}):null;
   setEnabled(Boolean(status?.enabled)&&Notification.permission==="granted");
  }}catch{setFeedback("Could not check this device. Sign in and select Check status to try again.");}finally{setReady(true);}
 }
 useEffect(()=>{void refresh();const onFocus=()=>void refresh();window.addEventListener("focus",onFocus);return()=>window.removeEventListener("focus",onFocus);},[]);
 async function toggle(){
  if(busy||isLocalDashboardPreview())return;setBusy(true);setFeedback("");
  try{if(enabled){
   const registration=await navigator.serviceWorker.getRegistration("/admin/");const subscription=await registration?.pushManager.getSubscription();
   // Disable on the server first; retain the browser subscription to allow safe retries.
   if(subscription)await deviceRequest("disable",{endpoint:subscription.endpoint});
   setEnabled(false);setFeedback("Booking notifications are off on this device. Other devices keep their own setting.");
  }else{
   // Permission must be requested directly from the owner's click, including on iOS.
   const decision=await Notification.requestPermission();setPermission(decision);
   if(decision!=="granted"){setFeedback("Permission was not granted. Follow the instructions below, then select Check status.");return;}
   const config=await deviceRequest("config");
   if(!config?.configured||!config.publicKey)throw new Error("Notifications are not configured yet. Please contact Blackline support.");
   await navigator.serviceWorker.register("/admin/push-sw.js",{scope:"/admin/",updateViaCache:"none"});
   const registration=await navigator.serviceWorker.ready;
   let subscription=await registration.pushManager.getSubscription();
   if(!subscription)subscription=await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:keyBytes(config.publicKey)});
   await deviceRequest("subscribe",{subscription:subscription.toJSON()});
   setEnabled(true);setFeedback("Booking notifications are on for this device, including when the dashboard tab is closed. Send a test to check delivery.");
  }}catch(e){setFeedback(e instanceof Error?e.message:"Could not update notifications. Follow the instructions below and try again.");}finally{setBusy(false);}
 }
 async function test(){
  setBusy(true);setFeedback("");
  try{const registration=await navigator.serviceWorker.getRegistration("/admin/");const subscription=await registration?.pushManager.getSubscription();
   if(!subscription)throw new Error("Enable notifications on this device first.");
   await deviceRequest("test",{endpoint:subscription.endpoint});setFeedback("Test queued. It should arrive within about a minute. If it does not, check the browser and device settings below.");
  }catch(e){setFeedback(e instanceof Error?e.message:"The test could not be queued.");}finally{setBusy(false);}
 }
 const requiresInstall=ios&&!standalone;
 return <section className={styles.panel} id="notifications"><div className={styles.panelHeading}><div><p className={styles.eyebrow}>STAY IN THE KNOW</p><h2>Booking notifications</h2></div><Bell size={21}/></div><div className={settings.body}>
 <p className={styles.formHint}>Receive a push alert for a new booking or booking request, even when this dashboard tab is closed. Tap the alert to open Bookings. Customer details stay inside your secure dashboard.</p>
 <div className={settings.securityRow}><div><strong>Notifications on this device</strong><p>{!ready?"Checking this browser…":enabled?"On · new bookings and booking requests":permission==="denied"?"Blocked by this browser · follow the steps below":requiresInstall?"Install Blackline on your Home Screen first":!supported?"Push is unavailable in this browser. Use a supported browser on the live HTTPS website.":"Off · enable alerts for this browser"}</p></div><button type="button" className={enabled?styles.secondary:styles.primary} role="switch" aria-checked={enabled} aria-label="Booking notifications on this device" disabled={!ready||busy||!supported||requiresInstall||permission==="denied"} onClick={()=>void toggle()}>{enabled?<BellOff size={16}/>:<Bell size={16}/>} {busy?"Please wait…":enabled?"Turn off":"Turn on"}</button></div>
 <div className={settings.notificationActions}><button type="button" className={styles.secondary} disabled={!enabled||busy} onClick={()=>void test()}><Send size={15}/>Send test notification</button><button type="button" className={styles.secondary} disabled={busy} onClick={()=>void refresh()}><RefreshCw size={15}/>Check status</button></div><p role="status" aria-live="polite" className={styles.formHint}>{feedback}</p>
 <div className={settings.notificationHelp}><h3>How to enable notifications</h3><ol><li>Sign in on the device where you want alerts. Open <strong>Settings → Notifications</strong>.</li><li>Select <strong>Turn on</strong> and choose <strong>Allow</strong> in the browser prompt.</li><li>Select <strong>Send test notification</strong>. Allow about a minute for delivery. You can then close the dashboard tab.</li></ol>
 <h3>iPhone & iPad</h3><p>Use iOS/iPadOS 16.4 or newer. Open the live website in Safari, tap Share → Add to Home Screen (or find this under More). Open Blackline from that new icon, sign in, then return to Settings → Notifications and turn alerts on. A regular Safari tab cannot receive these alerts on iPhone.</p>
 <h3>Blocked, or no browser prompt?</h3><p>Browsers do not allow this page to open or change their permission settings automatically. Open the site controls beside the address bar → Site settings / Permissions → Notifications → Allow. In Safari on Mac, use Safari → Settings → Websites → Notifications. Then return here and select Check status, followed by Turn on if needed.</p>
 <h3>Still no alerts?</h3><p>In your device settings, open Notifications and allow alerts for your browser or the Blackline Home Screen app. Check Focus / Do Not Disturb, internet access and battery restrictions. On a computer, keep the browser allowed to run in the background; delivery may pause if the browser is fully quit. If this in-app browser does not support push, open the live website in Safari, Chrome, Edge or Firefox.</p>
 <h3>Turn off, or use another device</h3><p>Return to Settings → Notifications and select Turn off. This stops future alerts on this device; it does not affect another device. To enable again, select Turn on. If you blocked permission in the browser or device settings, allow it there first. Set up each device separately. Existing notifications may remain in the notification centre.</p>
 <p>Alerts normally arrive within about a minute. Your browser and operating system control final delivery. This setting is for push alerts; it does not send activation emails.</p></div>
 </div></section>;
}
