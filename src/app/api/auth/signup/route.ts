import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { hashPassword } from "@/lib/auth/password";
import { createSessionToken, SESSION_COOKIE } from "@/lib/auth/token";
import { db } from "@/lib/db";
import { signupSchema } from "@/lib/validators/auth";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = signupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request." }, { status: 400 });
  }

  const existingUser = await db.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });

  if (existingUser) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const user = await db.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      passwordHash: await hashPassword(parsed.data.password),
      role: parsed.data.role,
      age: parsed.data.age,
    },
  });

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
