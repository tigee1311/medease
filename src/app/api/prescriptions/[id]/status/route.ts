import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/user";
import { resolveSeniorContext } from "@/lib/care-context";
import { db } from "@/lib/db";
import { prescriptionStatusSchema } from "@/lib/validators/prescription";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser();
  const context = resolveSeniorContext(user);
  const body = await request.json();
  const parsed = prescriptionStatusSchema.safeParse(body);
  const { id } = await params;

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request." }, { status: 400 });
  }

  const existing = await db.prescription.findFirst({
    where: {
      id,
      seniorId: context.seniorId,
    },
  });

  if (!existing) {
    return NextResponse.json({ error: "Prescription not found." }, { status: 404 });
  }

  await db.prescription.update({
    where: {
      id,
    },
    data: {
      status: parsed.data.status,
    },
  });

  return NextResponse.json({ ok: true });
}
