import type { Metadata } from "next";
import { cookies } from "next/headers";

import { OwnerAccessGate } from "@/components/owner-access-gate";
import { OwnerBookingsAdmin } from "@/components/owner-bookings-admin";
import { listBookings } from "@/lib/bookings-store";
import { listQuoteRequests } from "@/lib/quote-requests-store";

export const metadata: Metadata = {
  title: "Admin bookings",
  robots: { index: false, follow: false },
};

const OWNER_COOKIE = "blackline-owner-access";

export default async function OwnerBookingsPage() {
  const cookieStore = await cookies();
  const expected = process.env.OWNER_BOOKING_CODE?.trim();
  const unlocked =
    !!expected && cookieStore.get(OWNER_COOKIE)?.value === expected;

  if (!unlocked) {
    return <OwnerAccessGate />;
  }

  const bookings = await listBookings();
  const quoteRequests = await listQuoteRequests();

  return (
    <section className="border-b border-gold/10 bg-[linear-gradient(180deg,#171717_0%,#1d1d1d_55%,#222222_100%)] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.42em] text-gold/90">
          Admin
        </p>
        <h1 className="mt-5 font-serif text-3xl tracking-tight text-cream sm:text-4xl">
          Owner admin bookings
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-cream/68">
          Create bookings for direct clients, mark them as reserved or paid
          offline, and keep the live availability synced for the public site.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="border border-gold/15 bg-[#262626] px-4 py-3">
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-gold/75">
              Access
            </p>
            <p className="mt-1 text-sm text-cream/78">Protected by your owner code</p>
          </div>
          <div className="border border-gold/15 bg-[#262626] px-4 py-3">
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-gold/75">
              Actions
            </p>
            <p className="mt-1 text-sm text-cream/78">Create, update, cancel, delete</p>
          </div>
          <div className="border border-gold/15 bg-[#262626] px-4 py-3">
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-gold/75">
              Sync
            </p>
            <p className="mt-1 text-sm text-cream/78">Bookings block live availability</p>
          </div>
        </div>
        <div className="mt-10">
          <OwnerBookingsAdmin
            initialBookings={bookings.reverse()}
            initialQuoteRequests={quoteRequests.sort((a, b) =>
              b.createdAtIso.localeCompare(a.createdAtIso),
            )}
          />
        </div>
      </div>
    </section>
  );
}
