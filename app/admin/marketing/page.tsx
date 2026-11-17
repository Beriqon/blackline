import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminDashboard } from "@/components/admin-dashboard";

export const metadata: Metadata = {
  title: "Social analytics — Blackline Admin",
  robots: { index: false, follow: false },
};

export default function MarketingPage() {
  return (
    <Suspense fallback={null}>
      <AdminDashboard initialView="social-analytics" />
    </Suspense>
  );
}
