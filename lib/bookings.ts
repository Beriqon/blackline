import { computeFleetTotals, durationOptionsFromYacht } from "@/lib/yacht-fleet-pricing";
import { ALL_EXOTIC_CARS, type ExoticCar } from "@/lib/exotic-cars-data";
import { getYachtBySlug, type Yacht } from "@/lib/yachts-data";

export type BookingCategory = "exotic-car" | "yacht";
export type BookingStatus =
  | "pending"
  | "deposit_paid"
  | "paid"
  | "owner_reserved"
  | "cancelled";
export type BookingPaymentMode = "stripe" | "skip_with_code";
export type BookingSource = "website" | "instagram" | "whatsapp" | "manual";
export type BookingPaymentType = "full" | "deposit";

export type ExoticCarBookingMode = "self-drive" | "chauffeur";

export type ExoticCarBookingSelection = {
  category: "exotic-car";
  itemId: string;
  rentalMode: ExoticCarBookingMode;
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  durationHours?: number;
};

export type YachtBookingSelection = {
  category: "yacht";
  itemId: string;
  charterDate: string;
  startTime: string;
  durationLabel: string;
  gratuityPct: number;
};

export type BookingSelection =
  | ExoticCarBookingSelection
  | YachtBookingSelection;

export type BookingQuote = {
  category: BookingCategory;
  itemId: string;
  title: string;
  baseUsd: number;
  totalUsd: number;
  depositUsd: number;
  priceLabel: string;
  description: string;
  payableOnline: boolean;
  reasonIfUnavailable?: string;
  breakdown: readonly { label: string; amountUsd: number }[];
};

export type BookingRecord = {
  id: string;
  category: BookingCategory;
  itemId: string;
  startIso: string;
  endIso: string;
  bookingMode?: string;
  totalUsd: number;
  depositUsd?: number;
  status: BookingStatus;
  paymentMode: BookingPaymentMode;
  paymentType?: BookingPaymentType;
  customerName: string;
  customerEmail: string;
  source: BookingSource;
  selection: BookingSelection;
  createdAtIso: string;
  updatedAtIso: string;
  holdUntilIso?: string;
  stripeSessionId?: string;
};

export type AvailabilityWindow = {
  bookingId: string;
  startIso: string;
  endIso: string;
  label: string;
  status: BookingStatus;
  source: BookingSource;
};

const DAY_MS = 24 * 60 * 60 * 1000;

export function getExoticCarById(id: string): ExoticCar | undefined {
  return ALL_EXOTIC_CARS.find((car) => car.id === id);
}

export function hasKnownOnlinePrice(priceLine?: string): boolean {
  if (!priceLine) return false;
  if (/xxx/i.test(priceLine)) return false;
  const matches = priceLine.match(/(\d[\d,]*)(?:\s*[–-]\s*(\d[\d,]*))?/g) ?? [];
  return matches.length === 1 && !/[–-]/.test(matches[0]!);
}

export function parseSingleUsd(priceLine?: string): number | null {
  if (!priceLine || /xxx/i.test(priceLine)) return null;
  const normalized = priceLine.replace(/,/g, "");
  const match = normalized.match(/\$?\s*(\d+(?:\.\d+)?)/);
  if (!match) return null;
  if (/[–-]/.test(normalized)) return null;
  const value = Number.parseFloat(match[1]!);
  return Number.isFinite(value) ? Math.round(value) : null;
}

export function formatUsd(value: number): string {
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

function parseDateOnly(input: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) return null;
  const next = new Date(`${input}T00:00:00`);
  return Number.isNaN(next.getTime()) ? null : next;
}

function formatDateOnlyLocal(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateTime(date: string, time: string): Date | null {
  if (!/^\d{2}:\d{2}$/.test(time)) return null;
  const next = new Date(`${date}T${time}:00`);
  return Number.isNaN(next.getTime()) ? null : next;
}

function clampHours(input: number | undefined, fallback: number): number {
  const rounded = Math.round(input ?? fallback);
  return Math.min(12, Math.max(1, rounded));
}

function formatTimeAmPm(time?: string): string {
  if (!time) return "";
  const match = time.match(/^(\d{2}):(\d{2})$/);
  if (!match) return time;
  const hour24 = Number.parseInt(match[1]!, 10);
  const minute = match[2]!;
  const ampm = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;
  return `${hour12}:${minute} ${ampm}`;
}

function daysInclusive(start: Date, end: Date): number {
  const startUtc = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const endUtc = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.floor((endUtc - startUtc) / DAY_MS) + 1;
}

export function getExoticCarBookingModes(car: ExoticCar): ExoticCarBookingMode[] {
  if (car.section === "hourly") return ["chauffeur"];
  if (car.dualRentalOnCard) return ["self-drive", "chauffeur"];
  return ["self-drive"];
}

export function getExoticCarBookingConfig(car: ExoticCar) {
  return {
    rentalModes: getExoticCarBookingModes(car),
    chauffeurSlots: ["10:00", "13:00", "16:00", "19:00"] as const,
    chauffeurDurationHours: [2, 4, 6, 8] as const,
    minimumSelfDriveDays: 1,
  };
}

export function getYachtBookingConfig(yacht: Yacht) {
  return {
    durationOptions: durationOptionsFromYacht(yacht),
    startTimes: ["10:00", "12:00", "14:00"] as const,
    defaultGratuityPct: 18,
  };
}

export function selectionToRange(selection: BookingSelection) {
  if (selection.category === "exotic-car") {
    if (selection.rentalMode === "self-drive") {
      const start = parseDateOnly(selection.startDate);
      const end = parseDateOnly(selection.endDate ?? selection.startDate);
      if (!start || !end || end < start) {
        throw new Error("Choose a valid self-drive date range.");
      }
      const startTime = selection.startTime ?? "09:00";
      const endTime = selection.endTime ?? "20:00";
      const startIsoDateTime = parseDateTime(selection.startDate, startTime);
      const endIsoDateTime = parseDateTime(
        selection.endDate ?? selection.startDate,
        endTime,
      );
      if (!startIsoDateTime || !endIsoDateTime) {
        throw new Error("Choose a valid self-drive start/end time.");
      }
      if (endIsoDateTime.getTime() < startIsoDateTime.getTime()) {
        throw new Error("Choose a valid self-drive start/end time range.");
      }
      return {
        startIso: startIsoDateTime.toISOString(),
        endIso: endIsoDateTime.toISOString(),
        bookingMode: "self-drive",
      };
    }
    const start = parseDateTime(selection.startDate, selection.startTime ?? "");
    if (!start) throw new Error("Choose a valid chauffeur date and time.");
    const hours = clampHours(selection.durationHours, 4);
    const end = new Date(start.getTime() + hours * 60 * 60 * 1000);
    return {
      startIso: start.toISOString(),
      endIso: end.toISOString(),
      bookingMode: "chauffeur",
    };
  }

  const start = parseDateTime(selection.charterDate, selection.startTime);
  if (!start) throw new Error("Choose a valid charter date and departure time.");
  const yacht = getYachtBySlug(selection.itemId);
  if (!yacht) throw new Error("Selected yacht was not found.");
  const option = durationOptionsFromYacht(yacht).find(
    (item) => item.label === selection.durationLabel,
  );
  if (!option) throw new Error("Selected yacht duration is not available.");
  const hours = Number.parseInt(option.label, 10);
  const safeHours = Number.isFinite(hours) ? hours : 4;
  const end = new Date(start.getTime() + safeHours * 60 * 60 * 1000);
  return {
    startIso: start.toISOString(),
    endIso: end.toISOString(),
    bookingMode: option.label,
  };
}

export function describeSelection(selection: BookingSelection): string {
  if (selection.category === "exotic-car") {
    if (selection.rentalMode === "self-drive") {
      const endDate = selection.endDate ?? selection.startDate;
      const startTime = selection.startTime ?? "09:00";
      const endTime = selection.endTime ?? "20:00";
      return `Self-drive · ${selection.startDate} ${formatTimeAmPm(
        startTime,
      )} to ${endDate} ${formatTimeAmPm(endTime)}`;
    }
    const hours = clampHours(selection.durationHours, 4);
    return `Chauffeur · from ${selection.startDate} ${formatTimeAmPm(
      selection.startTime,
    )} for ${hours} hrs`;
  }
  return `${selection.charterDate} ${formatTimeAmPm(
    selection.startTime,
  )} · ${selection.durationLabel} charter`;
}

export function computeBookingQuote(selection: BookingSelection): BookingQuote {
  if (selection.category === "exotic-car") {
    const car = getExoticCarById(selection.itemId);
    if (!car) throw new Error("Selected vehicle was not found.");

    if (selection.rentalMode === "self-drive") {
      const start = parseDateOnly(selection.startDate);
      const end = parseDateOnly(selection.endDate ?? selection.startDate);
      if (!start || !end || end < start) {
        throw new Error("Choose a valid self-drive date range.");
      }
      const rate = parseSingleUsd(car.priceLine);
      const dayCount = daysInclusive(start, end);
      const total = rate ? rate * dayCount : 0;
      const payableOnline = rate !== null;
      return {
        category: "exotic-car",
        itemId: car.id,
        title: car.name,
        baseUsd: total,
        totalUsd: total,
        depositUsd: Math.round(total * 0.3),
        priceLabel: payableOnline
          ? `${formatUsd(rate!)} / day · ${dayCount} day${dayCount === 1 ? "" : "s"}`
          : car.priceLine,
        description: `Self-drive booking for ${dayCount} day${dayCount === 1 ? "" : "s"}`,
        payableOnline,
        reasonIfUnavailable: payableOnline
          ? undefined
          : "This vehicle needs a custom quote before online payment.",
        breakdown: payableOnline
          ? [{ label: `${dayCount} self-drive day${dayCount === 1 ? "" : "s"}`, amountUsd: total }]
          : [],
      };
    }

    const rateLine = car.section === "hourly" ? car.priceLine : car.chauffeurPriceLine;
    const hourlyRate = parseSingleUsd(rateLine);
    const hours = clampHours(selection.durationHours, 4);
    const total = hourlyRate ? hourlyRate * hours : 0;
    const payableOnline = hourlyRate !== null;
    return {
      category: "exotic-car",
      itemId: car.id,
      title: car.name,
      baseUsd: total,
      totalUsd: total,
      depositUsd: Math.round(total * 0.3),
      priceLabel: payableOnline ? `${formatUsd(hourlyRate!)} / hr · ${hours} hrs` : rateLine ?? "Quote required",
      description: `Chauffeur from ${selection.startDate} ${formatTimeAmPm(
        selection.startTime,
      )} for ${hours} hour${hours === 1 ? "" : "s"}`,
      payableOnline,
      reasonIfUnavailable: payableOnline
        ? undefined
        : "Chauffeur pricing is not published yet for online payment.",
      breakdown: payableOnline
        ? [{ label: `${hours} chauffeur hour${hours === 1 ? "" : "s"}`, amountUsd: total }]
        : [],
    };
  }

  const yacht = getYachtBySlug(selection.itemId);
  if (!yacht) throw new Error("Selected yacht was not found.");
  const duration = durationOptionsFromYacht(yacht).find(
    (item) => item.label === selection.durationLabel,
  );
  if (!duration) throw new Error("Selected charter duration was not found.");
  const gratuityPct = Number.isFinite(selection.gratuityPct)
    ? Math.round(selection.gratuityPct)
    : 18;
  const totals = computeFleetTotals(duration.baseUsd, gratuityPct as 15 | 18 | 20 | 22);
  return {
    category: "yacht",
    itemId: yacht.id,
    title: yacht.name,
    baseUsd: duration.baseUsd,
    totalUsd: totals.totalUsd,
    depositUsd: Math.round(totals.totalUsd * 0.3),
    priceLabel: `${duration.label} · ${formatUsd(totals.totalUsd)} total`,
    description: `${duration.label} charter with 7% tax and ${gratuityPct}% gratuity`,
    payableOnline: !yacht.ratesPending,
    reasonIfUnavailable: yacht.ratesPending
      ? "This yacht is still quote-only and cannot be booked online yet."
      : undefined,
    breakdown: [
      { label: "Charter", amountUsd: duration.baseUsd },
      { label: "Tax", amountUsd: totals.taxUsd },
      { label: "Gratuity", amountUsd: totals.gratuityUsd },
    ],
  };
}

export function bookingSelectionKey(selection?: BookingSelection): string {
  if (!selection) return "default";
  return JSON.stringify(selection);
}

export function isBookingRecordActive(record: BookingRecord, now = new Date()): boolean {
  if (record.status === "cancelled") return false;
  if (record.status !== "pending") return true;
  if (!record.holdUntilIso) return false;
  return new Date(record.holdUntilIso).getTime() > now.getTime();
}

export function overlapsRange(
  startIso: string,
  endIso: string,
  otherStartIso: string,
  otherEndIso: string,
): boolean {
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  const otherStart = new Date(otherStartIso).getTime();
  const otherEnd = new Date(otherEndIso).getTime();
  return start < otherEnd && otherStart < end;
}

export function bookingRecordToWindow(record: BookingRecord): AvailabilityWindow {
  return {
    bookingId: record.id,
    startIso: record.startIso,
    endIso: record.endIso,
    status: record.status,
    source: record.source,
    label: describeSelection(record.selection),
  };
}

export function availableSlotsForDate(
  date: string,
  slotTimes: readonly string[],
  durationHours: number,
  windows: readonly AvailabilityWindow[],
) {
  return slotTimes.filter((time) => {
    const start = parseDateTime(date, time);
    if (!start) return false;
    const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);
    return !windows.some((window) =>
      overlapsRange(start.toISOString(), end.toISOString(), window.startIso, window.endIso),
    );
  });
}

export function isDateBlocked(
  date: string,
  windows: readonly AvailabilityWindow[],
) {
  const day = parseDateOnly(date);
  if (!day) return true;
  const key = formatDateOnlyLocal(day);
  const dayStart = new Date(`${key}T00:00:00`).toISOString();
  const dayEnd = new Date(`${key}T23:59:59`).toISOString();
  return windows.some((window) =>
    overlapsRange(dayStart, dayEnd, window.startIso, window.endIso),
  );
}

export function rangeContainsBlockedDate(
  startDate: string,
  endDate: string,
  windows: readonly AvailabilityWindow[],
) {
  const start = parseDateOnly(startDate);
  const end = parseDateOnly(endDate);
  if (!start || !end || end < start) return true;

  const dayCount = daysInclusive(start, end);
  for (let i = 0; i < dayCount; i += 1) {
    const current = new Date(start.getTime() + i * DAY_MS);
    const key = formatDateOnlyLocal(current);
    if (isDateBlocked(key, windows)) return true;
  }

  return false;
}

export function blockedDateSet(
  windows: readonly AvailabilityWindow[],
  fromDate: string,
  dayCount: number,
) {
  const dates = new Set<string>();
  const start = parseDateOnly(fromDate) ?? new Date();
  for (let i = 0; i < dayCount; i += 1) {
    const current = new Date(start.getTime() + i * DAY_MS);
    const key = formatDateOnlyLocal(current);
    const dayStart = new Date(`${key}T00:00:00`).toISOString();
    const dayEnd = new Date(`${key}T23:59:59`).toISOString();
    if (
      windows.some((window) =>
        overlapsRange(dayStart, dayEnd, window.startIso, window.endIso),
      )
    ) {
      dates.add(key);
    }
  }
  return dates;
}
