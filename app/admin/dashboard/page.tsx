import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminDashboard } from "@/components/admin-dashboard";
export const metadata:Metadata={title:"Dashboard — Blackline",robots:{index:false,follow:false}};
export default function DashboardPage(){return <Suspense fallback={null}><AdminDashboard/></Suspense>;}
