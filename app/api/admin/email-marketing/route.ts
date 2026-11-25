import {CampaignError, emailDelivery, RECIPIENTS_CHANGED} from "@/lib/admin-email-delivery";
import {requireAdmin} from "@/lib/supabase-server";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: Request) {
 const headers = {"Cache-Control": "no-store"};
 try {
  if (request.headers.get("origin") !== new URL(request.url).origin || !await requireAdmin()) {
   throw new CampaignError("Sign in as a Blackline administrator to send email.", 403);
  }
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) throw new CampaignError("Set RESEND_API_KEY on the server to enable email sending.", 503);
  if (Number(request.headers.get("content-length")) > 2_000_000) throw new CampaignError("The email is too large.", 413);
  let body;
  try { body = await request.json(); } catch { throw new CampaignError("Invalid email request."); }
  const delivery = emailDelivery(key);
  switch (body?.action) {
   case "subscription": return Response.json(await delivery.subscription(body.email), {headers});
   case "subscribe": return Response.json(await delivery.synchronizeOptIn(body.email, body.confirmed), {headers});
   case "sync-existing": return Response.json(await delivery.syncExisting(body.emails, body.confirmed), {headers});
   case "test": return Response.json(await delivery.test(body.draft, body.requestId), {headers});
   case "prepare": return Response.json(await delivery.prepare(body.draft, body.recipients, body.postalAddress), {headers});
   case "send": return Response.json(await delivery.send(body.token), {headers});
   default: throw new CampaignError("Invalid email action.");
  }
 } catch (error) {
  if (error instanceof CampaignError) return Response.json({error: error.message, recipientsChanged: error.message === RECIPIENTS_CHANGED}, {status: error.status, headers});
  console.error("[email-marketing] Unexpected request failure", {name: error instanceof Error ? error.name : "unknown"});
  return Response.json({error: "The email service could not complete the request. Check Resend before creating another campaign."}, {status: 502, headers});
 }
}
