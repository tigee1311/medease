import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/user";
import { resolveSeniorContext } from "@/lib/care-context";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const user = await requireUser();
  const context = resolveSeniorContext(user);
  const body = (await request.json()) as {
    type?: "CHECK_IN" | "REMINDER" | "ALERT" | "ESCALATION" | "NOTE";
    severity?: "LOW" | "MEDIUM" | "HIGH";
    title?: string;
    message?: string;
  };

  if (!body.type || !body.severity || !body.title || !body.message) {
    return NextResponse.json({ error: "All caregiver event fields are required." }, { status: 400 });
  }

  const event = await db.caregiverEvent.create({
    data: {
      seniorId: context.seniorId,
      caregiverId: context.caregiverId,
      createdById: user.id,
      type: body.type,
      severity: body.severity,
      title: body.title,
      message: body.message,
    },
  });

  return NextResponse.json({ id: event.id });
}
