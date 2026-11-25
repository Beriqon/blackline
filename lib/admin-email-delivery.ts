import "server-only";
import {createHash, createHmac, timingSafeEqual} from "node:crypto";
import {ACCOUNT_SITE_ORIGIN, ADMIN_ACCOUNT_EMAIL} from "./admin-account";
import {blockKinds, renderCampaignHtml, safeEmailImage, type EmailBlock, type EmailDraft} from "./admin-email-drafts";

const sender = "Blackline Concierge <updates@news.blacklineconcierge.group>";
const optInSegmentName = "Blackline Marketing Opt-In";
const uuid = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const pause = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class CampaignError extends Error {
 constructor(message: string, readonly status = 400, readonly providerStatus?: number) { super(message); }
}

function field(value: unknown, limit: number, label: string, required = false) {
 if (typeof value !== "string" || value.length > limit || (required && !value.trim())) {
  throw new CampaignError(`Check the ${label}.`);
 }
 return value.trim();
}

function recipientEmail(value: unknown) {
 const email = field(value, 254, "recipient email", true).toLowerCase();
 if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new CampaignError("Invalid recipient email.");
 return email;
}

function campaign(input: unknown): EmailDraft {
 const draft = input as EmailDraft | undefined;
 if (!draft || draft.kind !== "campaign" || !Array.isArray(draft.blocks) || !draft.blocks.length || draft.blocks.length > 50) {
  throw new CampaignError("Add between 1 and 50 email blocks.");
 }
 const blocks = draft.blocks.map((block): EmailBlock => {
  if (!block || !blockKinds.includes(block.kind)) throw new CampaignError("Invalid email block.");
  const image = (value: unknown) => {
   const url = field(value, 2048, "image URL");
   if (url && (!safeEmailImage(url) || url.startsWith("data:"))) {
    throw new CampaignError("Use a public HTTPS image or a site image path.");
   }
   return url;
  };
  const url = field(block.url, 2048, "button link", block.kind === "button");
  if (block.kind === "button" && !/^https:\/\/[^\s]+$/i.test(url)) throw new CampaignError("Use an HTTPS button link.");
  return {
   id: "", kind: block.kind, url, image: image(block.image), secondImage: image(block.secondImage),
   text: field(block.text, 5000, "block text"), alt: field(block.alt, 500, "image description"),
   secondAlt: field(block.secondAlt, 500, "image description"),
   color: field(block.color, 30, "text color"), background: field(block.background, 30, "background color"),
  };
 });
 return {
  id: "", kind: "campaign", blocks, audienceIds: [], sampleAudience: false, updatedAt: "",
  name: field(draft.name, 120, "campaign name", true),
  subject: field(draft.subject, 200, "subject", true).replace(/[\r\n]/g, " "),
  preheader: field(draft.preheader, 300, "preview text"),
 };
}

type Contact = {id: string; email: string; unsubscribed: boolean};
type Segment = {id: string; name: string; created_at?: string};
type Broadcast = {id: string; status: string; segment_id: string; sent_at?: string | null};
type Confirmation = {id: string; segment: string; source: string; digest: string};
const subscribed = (contacts: Contact[]) => contacts.filter(contact => contact.unsubscribed === false);
const contactKey = (contact: Contact) => JSON.stringify([contact.id, contact.email.trim().toLowerCase()]);
const digest = (contacts: Contact[]) => createHash("sha256").update(contacts.map(contactKey).sort().join("\n")).digest("hex");
export const RECIPIENTS_CHANGED = "The recipient list changed. Discard this review and prepare the campaign again.";
const ALREADY_UNSUBSCRIBED = "This customer is unsubscribed in Resend. Their subscription was left as is.";

export function emailDelivery(key: string) {
 async function resend<T>(path: string, payload?: object, headers?: Record<string, string>, method = payload ? "POST" : "GET"): Promise<T> {
  for (let attempt = 0; ; attempt++) {
   const response = await fetch(`https://api.resend.com${path}`, {
    method, cache: "no-store", signal: AbortSignal.timeout(10000),
    headers: {Authorization: `Bearer ${key}`, "Content-Type": "application/json", "User-Agent": "Blackline-Email-Marketing/1.0", ...headers},
    body: payload ? JSON.stringify(payload) : undefined,
   });
   if (response.ok) return await response.json() as T;
   const error = await response.json().catch(() => null);
   if (typeof error?.message === "string" && error.message.toLowerCase().includes("contacts quota")) {
    throw new CampaignError("This Resend account has reached its marketing contact limit. Check Resend usage.", 409);
   }
   if (["daily_quota_exceeded", "monthly_quota_exceeded"].includes(error?.name)) {
    throw new CampaignError("This Resend account has reached its email sending quota. Check Resend usage.", 429);
   }
   if (response.status === 429 && attempt < 2) {
    const seconds = Number(response.headers.get("retry-after")) || 1;
    await pause(Math.min(5, Math.max(1, seconds)) * 1000);
    continue;
   }
   if (response.status === 401 || response.status === 403) {
    throw new CampaignError("Resend denied this operation. Check the API key permissions and verified sender domain.", 502);
   }
   if (response.status === 429) throw new CampaignError("Resend is rate limiting requests. Try again shortly.", 429);
   if (response.status !== 404) console.error("[email-marketing] Resend request failed", {method, resource: path.split("/")[1], status: response.status});
   throw new CampaignError("Resend did not accept the request. Check the Resend logs and try again.", 502, response.status);
  }
 }

 async function list<T extends {id: string}>(path: string): Promise<T[]> {
  const rows: T[] = [];
  let after = "";
  do {
   const page = await resend<{data: T[]; has_more: boolean}>(`${path}?limit=100${after ? "&after=" + encodeURIComponent(after) : ""}`);
   rows.push(...page.data);
   if (!page.has_more) return rows;
   const next = page.data.at(-1)?.id;
   if (!next || next === after) throw new CampaignError("Resend returned an incomplete contact or segment list.", 502);
   after = next;
  } while (true);
 }

 function signature(payload: string) {
  return createHmac("sha256", key).update("blackline-broadcast:" + payload).digest();
 }

 function decode(token: unknown): Confirmation {
  if (typeof token !== "string" || !/^[\w-]{1,1024}\.[\w-]{43}$/.test(token)) throw new CampaignError("Prepare the campaign before sending.");
  const [payload, mac] = token.split(".");
  if (!timingSafeEqual(signature(payload), Buffer.from(mac, "base64url"))) throw new CampaignError("Campaign confirmation is invalid. Check the draft in Resend.");
  return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Confirmation;
 }

 const contacts = (segment: string) => list<Contact>(`/segments/${encodeURIComponent(segment)}/contacts`);

 async function optInSegment() {
  const segments = (await list<Segment>("/segments")).filter(segment => segment.name === optInSegmentName);
  return segments.sort((a,b) => (a.created_at??"").localeCompare(b.created_at??"") || a.id.localeCompare(b.id))[0];
 }

 async function getContact(email: string) {
  try { return await resend<Contact>(`/contacts/${encodeURIComponent(email)}`); }
  catch (error) {
   if (error instanceof CampaignError && error.providerStatus === 404) return null;
   throw error;
  }
 }

 async function synchronizeOptIn(input: unknown, confirmed: unknown) {
  if (confirmed !== true) throw new CampaignError("Confirm that this customer opted in to marketing emails.");
  const email = recipientEmail(input);
  let contact = await getContact(email);
  if (!contact) {
   try { await resend("/contacts", {email}); }
   catch (error) {
    // A concurrent request may have already created the contact.
    if (!(error instanceof CampaignError) || ![409,422].includes(error.providerStatus??0)) throw error;
   }
   contact = await getContact(email);
  }
  if (!contact) throw new CampaignError("Resend is still processing the contact. Try again shortly.", 409);
  if (contact.unsubscribed !== false) throw new CampaignError(ALREADY_UNSUBSCRIBED, 409);

  let segment = await optInSegment();
  if (!segment) {
   let created: Segment | undefined;
   try { created = await resend<Segment>("/segments", {name: optInSegmentName}); }
   catch (error) {
    if (!(error instanceof CampaignError) || ![409,422].includes(error.providerStatus??0)) throw error;
   }
   segment = await optInSegment() ?? created;
  }
  if (!segment) throw new CampaignError("Resend is still setting up the marketing segment. Try again shortly.", 409);
  const memberships = await list<Segment>(`/contacts/${encodeURIComponent(contact.id)}/segments`);
  if (!memberships.some(membership => membership.id === segment.id)) {
   await resend(`/contacts/${encodeURIComponent(contact.id)}/segments/${encodeURIComponent(segment.id)}`, {});
  }
  return {status:"subscribed"};
 }

 return {
  synchronizeOptIn,
  async syncExisting(input: unknown, confirmed: unknown) {
   if (confirmed !== true || !Array.isArray(input) || !input.length || input.length > 10) {
    throw new CampaignError("Confirm existing consent for a batch of up to 10 customers.");
   }
   const emails = new Set(input.map(recipientEmail));
   const result = {subscribed:0, unsubscribed:0, failed:0};
   for (const email of emails) {
    try { await synchronizeOptIn(email, true); result.subscribed++; }
    catch (error) {
     if (error instanceof CampaignError && error.message === ALREADY_UNSUBSCRIBED) result.unsubscribed++;
     else result.failed++;
    }
    await pause(500);
   }
   return result;
  },
  async subscription(input: unknown) {
   const email = recipientEmail(input);
   const contact = await getContact(email);
   if (!contact) return {status:"unknown"};
   if (contact.unsubscribed !== false) return {status:"unsubscribed"};
   const segment = await optInSegment();
   if (!segment) return {status:"unknown"};
   const memberships = await list<Segment>(`/contacts/${encodeURIComponent(contact.id)}/segments`);
   return {status:memberships.some(membership => membership.id === segment.id)?"subscribed":"unknown"};
  },
  async test(input: unknown, requestId: unknown) {
   const draft = campaign(input);
   if (typeof requestId !== "string" || !uuid.test(requestId)) throw new CampaignError("Invalid test request.");
   const {id} = await resend<{id: string}>("/emails", {
    from: sender, to: [ADMIN_ACCOUNT_EMAIL], reply_to: ADMIN_ACCOUNT_EMAIL, subject: "[TEST] " + draft.subject,
    html: renderCampaignHtml(draft, {assetOrigin: ACCOUNT_SITE_ORIGIN}),
   }, {"Idempotency-Key": `blackline-campaign-test/${requestId}`});
   return {id};
  },
  async prepare(input: unknown, selection: unknown, postalAddress: unknown) {
   const draft = campaign(input);
   const address = field(postalAddress, 350, "business mailing address", true);
   if (!Array.isArray(selection) || !selection.length || selection.length > 500) throw new CampaignError("Select between 1 and 500 existing customers.");
   const selected = new Set(selection.map(recipientEmail));
   const optIn = await optInSegment();
   if (!optIn) throw new CampaignError("Record marketing consent in a Blackline customer profile before preparing a campaign.", 409);
   const source = optIn.id;
   const eligible = [...new Map(subscribed(await contacts(source))
    .map(contact => [contact.email.trim().toLowerCase(), contact] as const)
    .filter(([email]) => selected.has(email))).values()];
   if (!eligible.length) throw new CampaignError("None of the selected customers have an active marketing subscription. Check their Blackline customer profiles.", 409);

   const {id: segment} = await resend<Segment>("/segments", {name: `Blackline campaign ${crypto.randomUUID()}`});
   for (const contact of eligible) {
    await resend(`/contacts/${encodeURIComponent(contact.id)}/segments/${encodeURIComponent(segment)}`, {});
    await pause(225);
   }
   const html = renderCampaignHtml(draft, {assetOrigin: ACCOUNT_SITE_ORIGIN, marketingFooter: address});
   const broadcast = await resend<{id: string}>("/broadcasts", {name: draft.name.slice(0, 70), subject: draft.subject, from: sender, segment_id: segment, html});
   const confirmation: Confirmation = {id: broadcast.id, segment, source, digest: digest(eligible)};
   const payload = Buffer.from(JSON.stringify(confirmation)).toString("base64url");
   return {id: broadcast.id, token: `${payload}.${signature(payload).toString("base64url")}`, count: eligible.length, excluded: selected.size - eligible.length};
  },
  async send(token: unknown) {
   const prepared = decode(token);
   const path = `/broadcasts/${encodeURIComponent(prepared.id)}`;
   const broadcast = await resend<Broadcast>(path);
   if (broadcast.sent_at || ["queued", "sending", "sent"].includes(broadcast.status)) return {id: prepared.id};
   if (broadcast.status !== "draft" || broadcast.segment_id !== prepared.segment) throw new CampaignError("This campaign changed in Resend. Review it there before sending.", 409);
   const recipients = subscribed(await contacts(prepared.segment));
   const currentOptIns = new Set(subscribed(await contacts(prepared.source)).map(contactKey));
   if (digest(recipients) !== prepared.digest || recipients.some(contact => !currentOptIns.has(contactKey(contact)))) {
    throw new CampaignError(RECIPIENTS_CHANGED, 409);
   }
   // Send by the existing Broadcast ID so a retry never creates a second broadcast.
   await resend(path + "/send", {});
   return {id: prepared.id};
  },
 };
}
