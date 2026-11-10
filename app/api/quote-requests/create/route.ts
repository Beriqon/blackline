import { NextResponse } from "next/server";

import type { BookingSource } from "@/lib/bookings";
import type {
  QuoteRequestItem,
  QuoteRequestStatus,
} from "@/lib/quote-requests-store";
import { createQuoteRequest } from "@/lib/quote-requests-store";
import {normalizeQuoteContact} from "@/lib/quote-contact";

export const runtime = "nodejs";

type Body = {
  customerName?: string;
  customerEmail?: string;
  customerPhone?:string;
  source?: BookingSource;
  message?: string;
  summary?: string;
  items?: QuoteRequestItem[];
  status?: QuoteRequestStatus;
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  if(!body||typeof body!=="object"||Array.isArray(body))return NextResponse.json({error:"Invalid quote request."},{status:400});

  const contact=normalizeQuoteContact({name:typeof body.customerName==="string"?body.customerName:"",email:typeof body.customerEmail==="string"?body.customerEmail:"",phone:typeof body.customerPhone==="string"?body.customerPhone:""});
  if(!contact)return NextResponse.json({error:"Enter your name, email and international phone number before requesting a quote."},{status:400});
  const message = typeof body.message==="string"?body.message.trim():"";
  if (!message || message.length>8000 || (body.customerEmail?.length??0)>254 || (body.items?.length??0)>50) {
    return NextResponse.json({ error: "message is required." }, { status: 400 });
  }

  const customerName = contact.name;
  const customerEmail = contact.email;
  const source = body.source ?? "website";
  if(!["website","whatsapp","instagram"].includes(source))return NextResponse.json({error:"Invalid request source."},{status:400});

  try {
    const quoteRequest = await createQuoteRequest({
      customerName,
      customerEmail,
      customerPhone:contact.phone,
      source,
      message,
      summary: body.summary,
      items: Array.isArray(body.items)?body.items.filter(i=>i&&typeof i.id==="string"&&typeof i.title==="string").map(i=>({id:i.id.slice(0,250),title:i.title.slice(0,250),category:typeof i.category==="string"?i.category.slice(0,80):"other",subtitle:typeof i.subtitle==="string"?i.subtitle.slice(0,2000):undefined})):undefined,
      status: "pending",
    });

    return NextResponse.json({ quoteRequest });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Could not create quote request.",
      },
      { status: 400 },
    );
  }
}

