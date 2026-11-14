import type { Metadata } from "next";
import { ADMIN_SERVICES } from "@/lib/admin-demo-data";
import { Dashboard } from "./dashboard";

export const metadata: Metadata = {
  title: "Broker dashboard demo",
  robots: { index: false, follow: false },
};

export default async function BrokerDashboardPage({searchParams}: {searchParams: Promise<{status?: string}>}) {
  const {status} = await searchParams;
  return <Dashboard services={ADMIN_SERVICES.filter(([id]) => ["yachts", "private-chefs", "vip-nightlife"].includes(id))} pending={status === "pending"} />;
}
