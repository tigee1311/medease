import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { verifyPassword } from "@/lib/auth/password";
import { createSessionToken, SESSION_COOKIE } from "@/lib/auth/token";
import { db } from "@/lib/db";
import { loginSchema } from "@/lib/validators/auth";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request." }, { status: 400 });
  }

  const user = await db.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });

  if (!user) {
    return NextResponse.json({ error: "No account found for that email." }, { status: 401 });
  }

  const matches = await verifyPassword(parsed.data.password, user.passwordHash);

  if (!matches) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const token = await createSessionToken({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });

  return NextResponse.json({ ok: true });
}
