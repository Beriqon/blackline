"use client";

import { useEffect, useMemo, useState } from "react";

import {
  ALL_EXOTIC_CARS,
  type ExoticCar,
} from "@/lib/exotic-cars-data";
import {
  YACHTS,
  type Yacht,
} from "@/lib/yachts-data";
import type { BookingRecord, BookingSelection, BookingSource } from "@/lib/bookings";
import type { QuoteRequestRecord } from "@/lib/quote-requests-store";

const fieldClass =
  "mt-1.5 w-full border border-gold/20 bg-[#303030] px-3 py-2 text-sm text-cream";

function todayPlus(days: number) {
  const next = new Date();
  next.setDate(next.getDate() + days);
  return next.toISOString().slice(0, 10);
}

function formatIsoShort(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  // en-CA gives `YYYY-MM-DD`
  const datePart = d.toLocaleDateString("en-CA");
  const timePart = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${datePart} ${timePart}`;
}

function formatTimeAmPm(time24: string) {
  const match = time24.match(/^(\d{2}):(\d{2})$/);
  if (!match) return time24;
  const hour24 = Number.parseInt(match[1]!, 10);
  const minute = match[2]!;
  const hour12 = hour24 % 12 || 12;
  const ampm = hour24 >= 12 ? "PM" : "AM";
  return `${hour12}:${minute} ${ampm}`;
}

const CHAUFFEUR_TIME_OPTIONS = ["10:00", "13:00", "16:00", "19:00"] as const;
const YACHT_TIME_OPTIONS = ["10:00", "12:00", "14:00"] as const;

const SELF_DRIVE_TIME_OPTIONS = (() => {
  const times: string[] = [];
  for (let h = 9; h <= 20; h += 1) {
    const hh = String(h).padStart(2, "0");
    times.push(`${hh}:00`);
  }
  return times;
})();

export function OwnerBookingsAdmin({
  initialBookings,
  initialQuoteRequests,
}: {
  initialBookings: BookingRecord[];
  initialQuoteRequests: QuoteRequestRecord[];
}) {
  const [bookings, setBookings] = useState(initialBookings);
  const [quoteRequests, setQuoteRequests] = useState(initialQuoteRequests);
  const [adminTab, setAdminTab] = useState<"bookings" | "quote-requests">(
    "bookings",
  );
  const [bookingTimeRange, setBookingTimeRange] = useState<
    "24h" | "7d" | "30d" | "all"
  >("24h");
  const [category, setCategory] = useState<"exotic-car" | "yacht">("exotic-car");
  const [carId, setCarId] = useState<string>(() => {
    return [...ALL_EXOTIC_CARS].sort((a, b) => a.name.localeCompare(b.name))[0]?.id ?? "";
  });
  const [carMode, setCarMode] = useState<"self-drive" | "chauffeur">("self-drive");
  const [startDate, setStartDate] = useState(todayPlus(1));
  const [endDate, setEndDate] = useState(todayPlus(1));
  const [startTime, setStartTime] = useState("10:00");
  const [durationHours, setDurationHours] = useState(4);
  const [selfDriveStartTime, setSelfDriveStartTime] = useState("09:00");
  const [selfDriveEndTime, setSelfDriveEndTime] = useState("20:00");
  const [yachtId, setYachtId] = useState<string>(() => {
    return [...YACHTS].sort((a, b) => a.name.localeCompare(b.name))[0]?.id ?? "";
  });
  const [durationLabel, setDurationLabel] = useState("4 hours");
  const [gratuityPct, setGratuityPct] = useState(18);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [source, setSource] = useState<BookingSource>("instagram");
  const [markAs, setMarkAs] = useState<"owner_reserved" | "paid">("owner_reserved");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    if (category === "yacht") {
      if (!YACHT_TIME_OPTIONS.includes(startTime as (typeof YACHT_TIME_OPTIONS)[number])) {
        setStartTime(YACHT_TIME_OPTIONS[0]);
      }
    } else if (category === "exotic-car" && carMode === "chauffeur") {
      if (!CHAUFFEUR_TIME_OPTIONS.includes(startTime as (typeof CHAUFFEUR_TIME_OPTIONS)[number])) {
        setStartTime(CHAUFFEUR_TIME_OPTIONS[0]);
      }
    }
  }, [category, carMode, startTime]);

  const filteredBookings = useMemo(() => {
    if (bookingTimeRange === "all") return bookings;
    const nowMs = Date.now();
    const windowMs =
      bookingTimeRange === "24h"
        ? 24 * 60 * 60 * 1000
        : bookingTimeRange === "7d"
          ? 7 * 24 * 60 * 60 * 1000
          : 30 * 24 * 60 * 60 * 1000;

    return bookings.filter((booking) => {
      const createdMs = new Date(booking.createdAtIso).getTime();
      if (Number.isNaN(createdMs)) return false;
      return createdMs >= nowMs - windowMs;
    });
  }, [bookingTimeRange, bookings]);

  const filteredQuoteRequests = useMemo(() => {
    if (bookingTimeRange === "all") return quoteRequests;
    const nowMs = Date.now();
    const windowMs =
      bookingTimeRange === "24h"
        ? 24 * 60 * 60 * 1000
        : bookingTimeRange === "7d"
          ? 7 * 24 * 60 * 60 * 1000
          : 30 * 24 * 60 * 60 * 1000;

    return quoteRequests.filter((req) => {
      const createdMs = new Date(req.createdAtIso).getTime();
      if (Number.isNaN(createdMs)) return false;
      return createdMs >= nowMs - windowMs;
    });
  }, [bookingTimeRange, quoteRequests]);

  const selectedCar = useMemo(
    () => ALL_EXOTIC_CARS.find((item) => item.id === carId),
    [carId],
  );
  const selectedYacht = useMemo(
    () => YACHTS.find((item) => item.id === yachtId),
    [yachtId],
  );

  const sortedCars = useMemo(
    () => [...ALL_EXOTIC_CARS].sort((a, b) => a.name.localeCompare(b.name)),
    [],
  );
  const sortedYachts = useMemo(
    () => [...YACHTS].sort((a, b) => a.name.localeCompare(b.name)),
    [],
  );

  const selection: BookingSelection =
    category === "exotic-car"
      ? carMode === "self-drive"
        ? {
            category,
            itemId: carId,
            rentalMode: carMode,
            startDate,
            endDate,
            startTime: selfDriveStartTime,
            endTime: selfDriveEndTime,
          }
        : {
            category,
            itemId: carId,
            rentalMode: carMode,
            startDate,
            startTime,
            durationHours,
          }
      : {
          category,
          itemId: yachtId,
          charterDate: startDate,
          startTime,
          durationLabel,
          gratuityPct,
        };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
      <div className="border border-gold/15 bg-[#262626] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.16)] sm:p-6">
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.32em] text-gold/80">
          Manual owner booking
        </p>
        <p className="mt-3 text-sm leading-relaxed text-cream/70">
          Use this for Instagram, WhatsApp, or direct bookings. Stripe is skipped,
          but the slot is blocked immediately in the live availability feed.
        </p>
        <div className="mt-4">
          <button
            type="button"
            disabled={logoutLoading}
            onClick={async () => {
              setLogoutLoading(true);
              await fetch("/api/owner-access", { method: "DELETE" });
              window.location.reload();
            }}
            className="inline-flex min-h-10 items-center justify-center border border-gold/25 bg-[#2f2f2f] px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-cream/88 disabled:opacity-40"
          >
            {logoutLoading ? "Logging out..." : "Log out"}
          </button>
        </div>

        <div className="mt-6 grid gap-4 border-t border-gold/12 pt-5 sm:grid-cols-2">
          <div>
            <label className="text-[0.6rem] font-medium uppercase tracking-[0.24em] text-gold/65">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as "exotic-car" | "yacht")}
              className={fieldClass}
            >
              <option value="exotic-car">Exotic car</option>
              <option value="yacht">Yacht</option>
            </select>
          </div>
          <div>
            <label className="text-[0.6rem] font-medium uppercase tracking-[0.24em] text-gold/65">
              Source
            </label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value as BookingSource)}
              className={fieldClass}
            >
              <option value="instagram">Instagram</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="manual">Manual</option>
              <option value="website">Website assist</option>
            </select>
          </div>
        </div>

        {category === "exotic-car" ? (
          <>
            <div className="mt-4">
              <label className="text-[0.6rem] font-medium uppercase tracking-[0.24em] text-gold/65">
                Vehicle
              </label>
              <select
                value={carId}
                onChange={(e) => setCarId(e.target.value)}
                className={fieldClass}
              >
                {sortedCars.map((car: ExoticCar) => (
                  <option key={car.id} value={car.id}>
                    {car.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-[0.6rem] font-medium uppercase tracking-[0.24em] text-gold/65">
                  Mode
                </label>
                <select
                  value={carMode}
                  onChange={(e) => setCarMode(e.target.value as "self-drive" | "chauffeur")}
                  className={fieldClass}
                >
                  <option value="self-drive">Self-drive</option>
                  <option value="chauffeur">Chauffeur</option>
                </select>
              </div>
              <div>
                <label className="text-[0.6rem] font-medium uppercase tracking-[0.24em] text-gold/65">
                  Start date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={fieldClass}
                />
              </div>
            </div>
            {carMode === "self-drive" ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="text-[0.6rem] font-medium uppercase tracking-[0.24em] text-gold/65">
                    End date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label className="text-[0.6rem] font-medium uppercase tracking-[0.24em] text-gold/65">
                    Start time
                  </label>
                  <select
                    value={selfDriveStartTime}
                    onChange={(e) => setSelfDriveStartTime(e.target.value)}
                    className={fieldClass}
                  >
                    {SELF_DRIVE_TIME_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {formatTimeAmPm(t)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[0.6rem] font-medium uppercase tracking-[0.24em] text-gold/65">
                    End time
                  </label>
                  <select
                    value={selfDriveEndTime}
                    onChange={(e) => setSelfDriveEndTime(e.target.value)}
                    className={fieldClass}
                  >
                    {SELF_DRIVE_TIME_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {formatTimeAmPm(t)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[0.6rem] font-medium uppercase tracking-[0.24em] text-gold/65">
                    Start time
                  </label>
                  <select
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className={fieldClass}
                  >
                    {CHAUFFEUR_TIME_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {formatTimeAmPm(t)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[0.6rem] font-medium uppercase tracking-[0.24em] text-gold/65">
                    Duration
                  </label>
                  <select
                    value={durationHours}
                    onChange={(e) => setDurationHours(Number.parseInt(e.target.value, 10))}
                    className={fieldClass}
                  >
                    {[2, 4, 6, 8].map((value) => (
                      <option key={value} value={value}>
                        {value} hrs
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            <p className="mt-3 text-[0.78rem] text-cream/58">
              {selectedCar?.name}
            </p>
          </>
        ) : (
          <>
            <div className="mt-4">
              <label className="text-[0.6rem] font-medium uppercase tracking-[0.24em] text-gold/65">
                Yacht
              </label>
              <select
                value={yachtId}
                onChange={(e) => setYachtId(e.target.value)}
                className={fieldClass}
              >
                {sortedYachts.map((yacht: Yacht) => (
                  <option key={yacht.id} value={yacht.id}>
                    {yacht.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div>
                <label className="text-[0.6rem] font-medium uppercase tracking-[0.24em] text-gold/65">
                  Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={fieldClass}
                />
              </div>
              <div>
                <label className="text-[0.6rem] font-medium uppercase tracking-[0.24em] text-gold/65">
                  Start time
                </label>
                <select
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className={fieldClass}
                >
                  {YACHT_TIME_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {formatTimeAmPm(t)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[0.6rem] font-medium uppercase tracking-[0.24em] text-gold/65">
                  Duration
                </label>
                <input
                  type="text"
                  value={durationLabel}
                  onChange={(e) => setDurationLabel(e.target.value)}
                  className={fieldClass}
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="text-[0.6rem] font-medium uppercase tracking-[0.24em] text-gold/65">
                Gratuity %
              </label>
              <select
                value={gratuityPct}
                onChange={(e) => setGratuityPct(Number.parseInt(e.target.value, 10))}
                className={fieldClass}
              >
                {[15, 18, 20, 22].map((value) => (
                  <option key={value} value={value}>
                    {value}%
                  </option>
                ))}
              </select>
            </div>
            <p className="mt-3 text-[0.78rem] text-cream/58">
              {selectedYacht?.name}
            </p>
          </>
        )}

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-[0.6rem] font-medium uppercase tracking-[0.24em] text-gold/65">
              Customer name
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className={fieldClass}
            />
          </div>
          <div>
            <label className="text-[0.6rem] font-medium uppercase tracking-[0.24em] text-gold/65">
              Customer email
            </label>
            <input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className={fieldClass}
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="text-[0.6rem] font-medium uppercase tracking-[0.24em] text-gold/65">
            Mark booking as
          </label>
          <select
            value={markAs}
            onChange={(e) => setMarkAs(e.target.value as "owner_reserved" | "paid")}
            className={fieldClass}
          >
            <option value="owner_reserved">Reserved (skip payment)</option>
            <option value="paid">Paid offline</option>
          </select>
        </div>

        {error ? <p className="mt-4 text-sm text-red-300/90">{error}</p> : null}
        {statusMessage ? (
          <p className="mt-4 border border-gold/18 bg-[#303030] px-3 py-2 text-sm text-gold-secondary">
            {statusMessage}
          </p>
        ) : null}

        <button
          type="button"
          disabled={submitting}
          onClick={async () => {
            setSubmitting(true);
            setError(null);
            setStatusMessage(null);
            try {
              const res = await fetch("/api/bookings/owner-create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  selection,
                  customerName,
                  customerEmail,
                  source,
                  markAs,
                }),
              });
              const data = (await res.json()) as {
                booking?: BookingRecord;
                error?: string;
              };
              if (!res.ok || !data.booking) {
                throw new Error(data.error || "Could not create booking.");
              }
              setBookings((prev) => [data.booking!, ...prev]);
              setStatusMessage("Booking created and blocked in the calendar.");
            } catch (nextError) {
              setError(
                nextError instanceof Error
                  ? nextError.message
                  : "Could not create booking.",
              );
            } finally {
              setSubmitting(false);
            }
          }}
          className="mt-6 inline-flex min-h-11 items-center justify-center border border-gold/40 bg-gold px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#0b0b0b] shadow-[0_12px_30px_rgba(198,164,108,0.18)] transition-all hover:bg-gold-secondary disabled:opacity-40"
        >
          {submitting ? "Saving..." : "Create owner booking"}
        </button>
      </div>

      <div className="border border-gold/15 bg-[#262626] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.16)] sm:p-6">
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.32em] text-gold/80">
          {adminTab === "bookings" ? "Booking admin" : "Quote request admin"}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-cream/70">
          {adminTab === "bookings"
            ? "Review recent bookings and update the status or source directly."
            : "Review quote requests and update their status directly."}
        </p>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => setAdminTab("bookings")}
            className={
              adminTab === "bookings"
                ? "flex-1 rounded border border-gold/45 bg-gold/[0.12] px-3 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-cream"
                : "flex-1 rounded border border-gold/15 bg-[#0a0a0a] px-3 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-cream/60 transition-colors hover:border-gold/35 hover:text-cream/80"
            }
          >
            Bookings
          </button>
          <button
            type="button"
            onClick={() => setAdminTab("quote-requests")}
            className={
              adminTab === "quote-requests"
                ? "flex-1 rounded border border-gold/45 bg-gold/[0.12] px-3 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-cream"
                : "flex-1 rounded border border-gold/15 bg-[#0a0a0a] px-3 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-cream/60 transition-colors hover:border-gold/35 hover:text-cream/80"
            }
          >
            Quote requests
          </button>
        </div>
        <div className="mt-4">
          <label
            className="text-[0.6rem] font-medium uppercase tracking-[0.24em] text-gold/65"
            htmlFor="owner-bookings-range"
          >
            Filter
          </label>
          <select
            id="owner-bookings-range"
            value={bookingTimeRange}
            onChange={(e) =>
              setBookingTimeRange(e.target.value as "24h" | "7d" | "30d" | "all")
            }
            className={fieldClass}
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="all">All</option>
          </select>
        </div>
        <ul className="mt-5 space-y-4">
          {adminTab === "bookings" ? (
            filteredBookings.length === 0 ? (
              <li className="border border-gold/15 bg-[#303030] p-4 text-sm text-cream/60 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
                No bookings in this range.
              </li>
            ) : (
              filteredBookings.slice(0, 12).map((booking) => (
                <li
                  key={booking.id}
                  className="border border-gold/15 bg-[#303030] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.08)]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-cream">
                        {booking.selection.itemId} · {booking.bookingMode}
                      </p>
                      <p className="mt-1 text-[0.78rem] text-gold-secondary">
                        {booking.status} · {booking.source}
                      </p>
                    </div>
                    <span className="border border-gold/18 bg-[#2a2a2a] px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-cream/82">
                      {booking.category}
                    </span>
                  </div>
                  <p className="mt-3 text-[0.78rem] text-cream/58">
                    {formatIsoShort(booking.startIso)} to{" "}
                    {formatIsoShort(booking.endIso)}
                  </p>
                  <p className="mt-1 text-[0.78rem] text-cream/58">
                    {booking.customerName || "No name"} ·{" "}
                    {booking.customerEmail || "No email"}
                  </p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <select
                      value={booking.status}
                      onChange={async (e) => {
                        const status = e.target.value as BookingRecord["status"];
                        const res = await fetch(
                          "/api/bookings/owner-manage",
                          {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              bookingId: booking.id,
                              status,
                            }),
                          },
                        );
                        const data = (await res.json()) as {
                          booking?: BookingRecord;
                          error?: string;
                        };
                        if (!res.ok || !data.booking) {
                          setError(data.error || "Could not update booking.");
                          return;
                        }
                        setBookings((prev) =>
                          prev.map((item) =>
                            item.id === booking.id ? data.booking! : item,
                          ),
                        );
                        setStatusMessage("Booking updated.");
                      }}
                      className={fieldClass}
                    >
                      <option value="pending">Pending</option>
                      <option value="deposit_paid">Deposit paid</option>
                      <option value="paid">Paid</option>
                      <option value="owner_reserved">Owner reserved</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <select
                      value={booking.source}
                      onChange={async (e) => {
                        const source = e.target.value as BookingSource;
                        const res = await fetch(
                          "/api/bookings/owner-manage",
                          {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              bookingId: booking.id,
                              source,
                            }),
                          },
                        );
                        const data = (await res.json()) as {
                          booking?: BookingRecord;
                          error?: string;
                        };
                        if (!res.ok || !data.booking) {
                          setError(data.error || "Could not update booking.");
                          return;
                        }
                        setBookings((prev) =>
                          prev.map((item) =>
                            item.id === booking.id ? data.booking! : item,
                          ),
                        );
                        setStatusMessage("Booking updated.");
                      }}
                      className={fieldClass}
                    >
                      <option value="website">Website</option>
                      <option value="instagram">Instagram</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="manual">Manual</option>
                    </select>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        const res = await fetch(
                          "/api/bookings/owner-manage",
                          {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              bookingId: booking.id,
                              status: "cancelled",
                            }),
                          },
                        );
                        const data = (await res.json()) as {
                          booking?: BookingRecord;
                          error?: string;
                        };
                        if (!res.ok || !data.booking) {
                          setError(data.error || "Could not cancel booking.");
                          return;
                        }
                        setBookings((prev) =>
                          prev.map((item) =>
                            item.id === booking.id ? data.booking! : item,
                          ),
                        );
                        setStatusMessage("Booking cancelled.");
                      }}
                      className="inline-flex min-h-10 items-center justify-center border border-gold/25 bg-[#2f2f2f] px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-cream/88"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        const res = await fetch(
                          "/api/bookings/owner-manage",
                          {
                            method: "DELETE",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ bookingId: booking.id }),
                          },
                        );
                        const data = (await res.json()) as { error?: string };
                        if (!res.ok) {
                          setError(data.error || "Could not delete booking.");
                          return;
                        }
                        setBookings((prev) =>
                          prev.filter((item) => item.id !== booking.id),
                        );
                        setStatusMessage("Booking deleted.");
                      }}
                      className="inline-flex min-h-10 items-center justify-center border border-red-300/35 bg-[#382424] px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))
            )
          ) : (
            <>
              {filteredQuoteRequests.length === 0 ? (
                <li className="border border-gold/15 bg-[#303030] p-4 text-sm text-cream/60 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
                  No quote requests in this range.
                </li>
              ) : (
                filteredQuoteRequests.slice(0, 12).map((req) => {
                  const preview =
                    (req.summary ?? req.message.split("\n")[0] ?? "").trim() ||
                    "Quote request message";

                  return (
                    <li
                      key={req.id}
                      className="border border-gold/15 bg-[#303030] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.08)]"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-cream">
                            {req.customerName || "No name"}
                          </p>
                          <p className="mt-1 text-[0.78rem] text-gold-secondary">
                            {req.status} · {req.source}
                          </p>
                        </div>
                        <span className="border border-gold/18 bg-[#2a2a2a] px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-cream/82">
                          Quote
                        </span>
                      </div>
                      <p className="mt-3 text-[0.78rem] text-cream/58">
                        Created: {formatIsoShort(req.createdAtIso)}
                      </p>
                      <p className="mt-1 text-[0.78rem] text-cream/58">
                        {req.customerEmail || "No email"}
                      </p>
                      <p className="mt-3 text-[0.78rem] text-cream/55">
                        {preview.length > 140
                          ? `${preview.slice(0, 140)}...`
                          : preview}
                      </p>

                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <select
                          value={req.status}
                          onChange={async (e) => {
                            const status = e.target.value as QuoteRequestRecord["status"];
                            const res = await fetch(
                              "/api/quote-requests/owner-manage",
                              {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  quoteRequestId: req.id,
                                  status,
                                }),
                              },
                            );
                            const data = (await res.json()) as {
                              quoteRequest?: QuoteRequestRecord;
                              error?: string;
                            };
                            if (!res.ok || !data.quoteRequest) {
                              setError(
                                data.error ||
                                  "Could not update quote request.",
                              );
                              return;
                            }
                            setQuoteRequests((prev) =>
                              prev.map((item) =>
                                item.id === req.id ? data.quoteRequest! : item,
                              ),
                            );
                            setStatusMessage("Quote request updated.");
                          }}
                          className={fieldClass}
                        >
                          <option value="pending">Pending</option>
                          <option value="quoted">Quoted</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(req.message);
                              setStatusMessage("WhatsApp message copied.");
                            } catch {
                              setError(
                                "Copy failed in this browser. Please copy manually.",
                              );
                            }
                          }}
                          className="inline-flex min-h-11 items-center justify-center border border-gold/25 bg-[#2f2f2f] px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-cream/88 transition-colors hover:border-gold/35"
                        >
                          Copy message
                        </button>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={async () => {
                            const res = await fetch(
                              "/api/quote-requests/owner-manage",
                              {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  quoteRequestId: req.id,
                                  status: "cancelled",
                                }),
                              },
                            );
                            const data = (await res.json()) as {
                              quoteRequest?: QuoteRequestRecord;
                              error?: string;
                            };
                            if (!res.ok || !data.quoteRequest) {
                              setError(
                                data.error ||
                                  "Could not cancel quote request.",
                              );
                              return;
                            }
                            setQuoteRequests((prev) =>
                              prev.map((item) =>
                                item.id === req.id ? data.quoteRequest! : item,
                              ),
                            );
                            setStatusMessage("Quote request cancelled.");
                          }}
                          className="inline-flex min-h-10 items-center justify-center border border-gold/25 bg-[#2f2f2f] px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-cream/88"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            const res = await fetch(
                              "/api/quote-requests/owner-manage",
                              {
                                method: "DELETE",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ quoteRequestId: req.id }),
                              },
                            );
                            const data = (await res.json()) as { error?: string };
                            if (!res.ok) {
                              setError(
                                data.error || "Could not delete quote request.",
                              );
                              return;
                            }
                            setQuoteRequests((prev) =>
                              prev.filter((item) => item.id !== req.id),
                            );
                            setStatusMessage("Quote request deleted.");
                          }}
                          className="inline-flex min-h-10 items-center justify-center border border-red-300/35 bg-[#382424] px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  );
                })
              )}
            </>
          )}
        </ul>
      </div>
    </div>
  );
}
