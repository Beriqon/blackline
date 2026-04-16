import type { Metadata } from "next";

import OwnerBookingsPage from "@/app/owner/bookings/page";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <OwnerBookingsPage />;
}
