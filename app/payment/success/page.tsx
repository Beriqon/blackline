import type { Metadata } from "next";
import { BlacklineConfirmation } from "@/components/blackline-confirmation";
import { getOrderConfirmation } from "@/lib/order-confirmation";
import type { OrderConfirmation } from "@/lib/order-confirmation-view";

export const metadata: Metadata = { title: "Your Blackline confirmation", robots: { index: false, follow: false }, referrer: "no-referrer" };
export const dynamic = "force-dynamic";

export default async function PaymentSuccessPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id: sessionId } = await searchParams;
  let confirmation: OrderConfirmation | null = null;
  if (typeof sessionId === "string") {
    try { confirmation = await getOrderConfirmation(sessionId); }
    catch { /* Show a recoverable state. Never claim a payment succeeded without verification. */ }
  }
  return <BlacklineConfirmation confirmation={confirmation} />;
}
