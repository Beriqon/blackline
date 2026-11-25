import "server-only";
import {after} from "next/server";
import {CampaignError, emailDelivery} from "./admin-email-delivery";

export function checkoutMarketingConsent(request: Request, choice: unknown, email: string) {
 if (choice !== true || request.headers.get("origin") !== new URL(request.url).origin) return;
 const address = email.trim().toLowerCase();
 if (address.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) return;
 return {email: address, recordedAt: new Date().toISOString(), source: "checkout" as const};
}

export type CheckoutMarketingConsent = NonNullable<ReturnType<typeof checkoutMarketingConsent>>;

export function syncCheckoutMarketing(consent?: CheckoutMarketingConsent) {
 if (!consent || (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production")) return;
 after(async () => {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) { console.warn("[checkout-marketing] RESEND_API_KEY is missing"); return; }
  for (let attempt = 0; attempt < 2; attempt++) {
   try {
    await emailDelivery(key).synchronizeOptIn(consent.email, true);
    return;
   } catch (error) {
    if (error instanceof CampaignError && error.status === 409 && /unsubscribed/i.test(error.message)) return;
    if (attempt === 1) console.error("[checkout-marketing] Consent saved on checkout record; Resend sync failed", {source:consent.source});
   }
  }
 });
}
