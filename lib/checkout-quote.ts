import {stripeMode} from "./stripe-mode";
import "server-only";
import { randomUUID } from "node:crypto";
import type { CartAddonsState, CartLine } from "./cart-types";
import { publicProducts, publishedProduct } from "./catalog-server";
import { prepareBookingRecord } from "./bookings-store";
import { computeBookingQuote, getExoticCarById, getExoticCarBookingModes, type BookingRecord } from "./bookings";
import { getYachtBySlug } from "./yachts-data";
import { depositCents, experienceTotalCents, findCartProduct, type OrderLine } from "./checkout-pricing";
import type { CheckoutOrder } from "./checkout-orders";
import {bookingDateTime} from "./booking-time";

export type CheckoutBody = { items?: CartLine[]; addons?: CartAddonsState; customerName?: string; customerEmail?: string; customerPhone?: string; expectedDepositCents?: number;expectedAmountCents?:number;paymentType?:"deposit"|"full" };

export async function quoteCheckout(body: CheckoutBody) {
  if(body?.paymentType!==undefined&&body.paymentType!=="deposit"&&body.paymentType!=="full")throw Error("Choose a 30% deposit or full payment.");
  if (!body || !Array.isArray(body.items) || !body.items.length || body.items.length > 30) throw new Error("Choose between 1 and 30 experiences.");
  const products = await publicProducts();
  const lines: OrderLine[] = [], bookings: BookingRecord[] = [];
  const seen = new Set<string>();
  const id = `BL-${randomUUID().toUpperCase()}`;
  for (const item of body.items) {
    if (!item || typeof item.id !== "string" || typeof item.href !== "string" || item.quantity !== 1) throw new Error("Invalid selection. Please add the experience again.");
    const product = findCartProduct(item, products);
    if (!product) throw new Error("An experience is no longer published. Please refresh your selection.");
    const key = `${product.id}:${JSON.stringify(item.bookingSelection ?? item.experienceSelection ?? null)}`;
    if (seen.has(key)) throw new Error("This experience appears twice in your selection.");
    seen.add(key);
    let totalCents: number | null = null;
    let description = typeof item.subtitle === "string" ? item.subtitle.slice(0, 1200) : "";
    if (item.bookingSelection) {
      const selection = item.bookingSelection;
      if (selection.itemId !== item.id || selection.category !== item.category || !["exotic-car", "yacht"].includes(selection.category)) throw new Error("Invalid booking selection.");
      // Compute from the published database product, never from browser amounts.
      const booking = await prepareBookingRecord({ selection, customerName: body.customerName ?? "", customerEmail: body.customerEmail ?? "", customerPhone: body.customerPhone, source: "website", status: "pending", paymentMode: "skip_with_code", paymentType: "deposit", holdMinutes: 35 });
      const live = selection.category === "yacht"
        ? await publishedProduct(product.service, selection.itemId, getYachtBySlug(selection.itemId))
        : await publishedProduct(product.service, selection.itemId, getExoticCarById(selection.itemId));
      if (!live) throw new Error("This product is no longer available.");
      if (selection.category === "exotic-car") {
        const car = live as import("./exotic-cars-data").ExoticCar;
        if (!getExoticCarBookingModes(car).includes(selection.rentalMode)) throw new Error("Choose a valid rental mode.");
        if (selection.rentalMode === "chauffeur" && (!Number.isInteger(selection.durationHours) || selection.durationHours! < 1 || selection.durationHours! > 12)) throw new Error("Choose a valid rental duration.");
      }
      const quote = computeBookingQuote(selection, live);
      description = selection.category === "exotic-car"
        ? `${quote.description} · ${selection.startDate}${selection.endDate && selection.endDate !== selection.startDate ? ` to ${selection.endDate}` : ""}`
        : `${quote.description} · ${selection.charterDate} at ${selection.startTime}`;
      if (quote.payableOnline && quote.totalUsd > 0 && product.unit !== "on request") {
        totalCents = Math.round(quote.totalUsd * 100);
        bookings.push({ ...booking, paymentMode: "stripe", paymentType:body.paymentType??"deposit", depositUsd: depositCents(totalCents) / 100, notes: `Order ${id}`, orderId: id });
      }
    } else {
      totalCents = experienceTotalCents(item, product);
      if (item.experienceSelection) description = `${item.experienceSelection.date} · ${item.experienceSelection.hours} hours · ${item.experienceSelection.units} units`;
    }
    const activityDate=totalCents!==null?item.experienceSelection?.date:undefined;
    const activityStart=activityDate?bookingDateTime(activityDate,"00:00","America/New_York"):null;
    const followingDate=activityDate?new Date(Date.parse(activityDate+"T00:00:00Z")+86400000).toISOString().slice(0,10):undefined;
    const activityEnd=followingDate?bookingDateTime(followingDate,"00:00","America/New_York"):null;
    const activityInventory=activityStart&&activityEnd?{resourceId:product.id,startIso:activityStart.toISOString(),endIso:activityEnd.toISOString(),service:product.service,itemId:item.id}:undefined;
    lines.push({inventory:activityInventory, cartKey: typeof item.key === "string" ? item.key.slice(0, 2000) : undefined, imageSrc: product.images?.split("\n").find(Boolean), productId: product.id, title: product.name, description, totalCents, status: totalCents === null ? "price_follows" : "priced" });
  }
  const addons = body.addons;
  for (const [enabled, title] of [[addons?.femaleHosts, "Female hosts"], [addons?.photoshoot, "Photo / video shoot"], [addons?.securityArmed, "Armed security"], [addons?.securityUnarmed, "Unarmed security"]] as const) {
    if (enabled) lines.push({ productId: `addon:${title}`, title, description: title === "Female hosts" ? `${Math.min(8, Math.max(1, Math.floor(Number(addons?.femaleHostsCount) || 1)))} hosts; scope and price to be agreed separately` : "Scope and price to be agreed separately", totalCents: null, status: "price_follows" });
  }
  const knownTotalCents = lines.reduce((sum, line) => sum + (line.totalCents ?? 0), 0);
  if (!Number.isSafeInteger(knownTotalCents) || knownTotalCents > 50_000_000) throw new Error("Please contact your concierge for this amount.");
  const due = depositCents(knownTotalCents);
  const order: CheckoutOrder = { id, testMode: stripeMode()==="test", status: "pending", customerName: body.customerName?.trim() ?? "", customerEmail: body.customerEmail?.trim() ?? "", customerPhone: body.customerPhone?.trim() ?? "", lines, knownTotalCents, depositCents: due, remainingCents: knownTotalCents - due, bookingIds: bookings.map(b => b.id), createdAtIso: new Date().toISOString() };
  order.paymentType=body.paymentType??"deposit";
  order.amountDueCents=order.paymentType==="full"?knownTotalCents:due;
  order.remainingCents=knownTotalCents-order.amountDueCents;
  return { order, bookings };
}
