import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/user";
import { db } from "@/lib/db";

export async function PATCH(request: Request) {
  const user = await requireUser();
  const body = (await request.json()) as { demoMode?: boolean };

  if (typeof body.demoMode !== "boolean") {
    return NextResponse.json({ error: "demoMode must be a boolean." }, { status: 400 });
  }

  await db.user.update({
    where: { id: user.id },
    data: { demoMode: body.demoMode },
  });

  return NextResponse.json({ ok: true });
}
