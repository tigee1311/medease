import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/user";
import { resolveSeniorContext } from "@/lib/care-context";
import { db } from "@/lib/db";
import { prescriptionSchema } from "@/lib/validators/prescription";

export async function POST(request: Request) {
  const user = await requireUser();
  const context = resolveSeniorContext(user);
  const body = await request.json();
  const parsed = prescriptionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request." }, { status: 400 });
  }

  const prescription = await db.prescription.create({
    data: {
      seniorId: context.seniorId,
      createdById: user.id,
      medicationName: parsed.data.medicationName,
      purpose: parsed.data.purpose,
      dosage: parsed.data.dosage,
      instructions: parsed.data.instructions,
      scheduleTimes: parsed.data.scheduleTimes,
      daysOfWeek: parsed.data.daysOfWeek,
      startDate: new Date(parsed.data.startDate),
      refillDate: parsed.data.refillDate ? new Date(parsed.data.refillDate) : null,
      notes: parsed.data.notes,
    },
  });

  return NextResponse.json({ id: prescription.id });
}
