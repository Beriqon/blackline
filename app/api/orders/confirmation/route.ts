import {validStripeSessionId} from "@/lib/stripe-mode";
import { getOrderConfirmation } from "@/lib/order-confirmation";
import { createOrderConfirmationPdf } from "@/lib/order-confirmation-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const sessionId = new URL(request.url).searchParams.get("session_id");
  if (!sessionId || !validStripeSessionId(sessionId)) return Response.json({ error: "Confirmation unavailable." }, { status: 404 });
  try {
    const confirmation = await getOrderConfirmation(sessionId);
    if (!confirmation) return Response.json({ error: "Confirmation unavailable." }, { status: 404 });
    const bytes = await createOrderConfirmationPdf(confirmation);
    const filename = `Blackline-${confirmation.order.id.replace(/[^A-Za-z0-9-]/g, "")}.pdf`;
    return new Response(new Uint8Array(bytes), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${filename}"`, "Cache-Control": "private, no-store, max-age=0", "X-Content-Type-Options": "nosniff", "Referrer-Policy": "no-referrer" } });
  } catch {
    return Response.json({ error: "Your PDF could not be generated. Please try again." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
