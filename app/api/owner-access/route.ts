import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const OWNER_COOKIE = "blackline-owner-access";

type Body = {
  code?: string;
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const expected = process.env.OWNER_BOOKING_CODE?.trim();
  if (!expected) {
    return NextResponse.json(
      { error: "OWNER_BOOKING_CODE is not configured." },
      { status: 503 },
    );
  }

  if ((body.code ?? "").trim() !== expected) {
    return NextResponse.json({ error: "Invalid access code." }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set(OWNER_COOKIE, expected, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(OWNER_COOKIE);
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const expected = process.env.OWNER_BOOKING_CODE?.trim();
  const cookieStore = await cookies();
  const unlocked =
    !!expected && cookieStore.get(OWNER_COOKIE)?.value === expected;
  return NextResponse.json({ unlocked });
}
