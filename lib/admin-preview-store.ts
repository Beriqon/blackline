import { loadRows } from "./workspace-store";
import {isLocalDashboardPreview} from "./dashboard-preview";
import {DEMO_BOOKINGS} from "./admin-demo-data";
import {checkoutToAdmin} from "./admin-booking-repository";
import type {BookingRecord} from "./bookings";
import type { AdminProduct, AdminBooking } from "./admin-demo-data";
export async function loadAdminPreview() {
 if(isLocalDashboardPreview()){
  const {createClient}=await import("@supabase/supabase-js");
  const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
  const {data,error}=await db.from("products").select("data").eq("status","visible").order("id");
  if(error)throw new Error(error.message);
  return {products:(data??[]).map(row=>row.data as AdminProduct),bookings:DEMO_BOOKINGS};
 }
 const [products,bookings] = await Promise.all([loadRows<AdminProduct>("products"),loadRows<AdminBooking>("bookings")]);
 const online=await loadRows<BookingRecord>("checkout_bookings");return {products,bookings:[...bookings,...online.map(b=>checkoutToAdmin(b,products))]};
}
