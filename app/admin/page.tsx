import type { Metadata } from "next";
import { AdminLogin } from "@/components/admin-login";

export const metadata: Metadata = {
 title: "Private access — Admin",
 description: "Blackline Concierge private workspace.",
 robots: { index: false, follow: false },
};

export default function AdminPage(){return <AdminLogin/>;}
