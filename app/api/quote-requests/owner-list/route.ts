import {requireAdmin} from "@/lib/supabase-server";
import { NextResponse } from "next/server";

import { listQuoteRequests } from "@/lib/quote-requests-store";

export const runtime = "nodejs";



export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Owner access required." }, { status: 401 });
  }

  const quoteRequests = await listQuoteRequests();
  quoteRequests.sort((a, b) => b.createdAtIso.localeCompare(a.createdAtIso));

  return NextResponse.json({ quoteRequests });
}

