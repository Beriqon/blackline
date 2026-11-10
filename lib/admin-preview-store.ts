import type {BalancePayment} from "./balance-types";
import { loadRows } from "./workspace-store";
import {isLocalDashboardPreview} from "./dashboard-preview";
import {DEMO_BOOKINGS} from "./admin-demo-data";
import {checkoutToAdmin} from "./admin-booking-repository";
import type {BookingRecord} from "./bookings";
import type { AdminProduct, AdminBooking } from "./admin-demo-data";
import type {ZelleOrder} from "./zelle-types";
import type {QuoteRequestRecord} from "./quote-requests-store";
import {combineBookingQuotes} from "./admin-quote-bookings";
import {adminPaymentPreview} from "./admin-payment-preview";
import {supabaseBrowser} from "./supabase-browser";
import {checkoutOrderToAdmin,zelleOrderToAdmin,type AdminCheckoutOrder} from "./admin-checkout-orders";
export async function loadAdminCheckoutOrders(products:AdminProduct[]){
 if(isLocalDashboardPreview())return [];
 const [{data,error},zelle,quotes,balances,live]=await Promise.all([supabaseBrowser().rpc("blackline_admin_checkout_orders"),supabaseBrowser().rpc("blackline_admin_zelle",{operation:"list",payload:{}}),loadRows<QuoteRequestRecord>("quote_requests"),supabaseBrowser().rpc("blackline_admin_balances"),supabaseBrowser().rpc("blackline_admin_live_orders")]);
 if(error||zelle.error||balances.error||live.error)throw new Error("Online bookings could not be loaded. Check the admin checkout database setup and try Refresh bookings.");
 return combineBookingQuotes([...([...((data??[]) as AdminCheckoutOrder[]),...((live.data??[]) as AdminCheckoutOrder[])]).map(row=>checkoutOrderToAdmin(row,products)),...((zelle.data??[]) as {order:ZelleOrder;bookings:BookingRecord[]}[]).map(row=>zelleOrderToAdmin(row,products))],quotes,products).map(b=>({...b,balancePayment:((balances.data??[]) as BalancePayment[]).find(p=>p.orderId===b.id&&p.source===(b.zelleOrder?"zelle":"stripe"))}));
}
export async function loadAdminPreview() {
 if(isLocalDashboardPreview()){
  const {createClient}=await import("@supabase/supabase-js");
  const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
  const {data,error}=await db.from("products").select("data").eq("status","visible").order("id");
  if(error)throw new Error(error.message);
  const products=(data??[]).map(row=>row.data as AdminProduct);
  return {products,bookings:[...DEMO_BOOKINGS,...adminPaymentPreview(products)]};
 }
 const [products,bookings] = await Promise.all([loadRows<AdminProduct>("products"),loadRows<AdminBooking>("bookings")]);
 const online=await loadRows<BookingRecord>("checkout_bookings");
 let stripe:AdminBooking[]=[],stripeError="";
 try{stripe=await loadAdminCheckoutOrders(products);}catch(e){stripeError=e instanceof Error?e.message:"Stripe bookings could not be loaded.";}
 return {products,bookings:[...bookings,...online.filter(b=>b.paymentMode!=="zelle"&&!(b.paymentMode==="stripe"&&b.orderId)).map(b=>checkoutToAdmin(b,products)),...stripe],stripeError};
}
