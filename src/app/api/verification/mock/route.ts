import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/user";
import { resolveSeniorContext } from "@/lib/care-context";
import { db } from "@/lib/db";
import { buildMockVerification } from "@/lib/mock-verification";

export async function POST(request: Request) {
  const user = await requireUser();
  const context = resolveSeniorContext(user);
  const body = (await request.json()) as {
    prescriptionId?: string;
    imageData?: string;
  };

  if (!body.prescriptionId || !body.imageData) {
    return NextResponse.json({ error: "Prescription and image data are required." }, { status: 400 });
  }

  const prescription = await db.prescription.findFirst({
    where: {
      id: body.prescriptionId,
      seniorId: context.seniorId,
    },
    select: {
      id: true,
      medicationName: true,
      dosage: true,
    },
  });

  if (!prescription) {
    return NextResponse.json({ error: "Prescription not found." }, { status: 404 });
  }

  const verification = buildMockVerification({
    imageData: body.imageData,
    prescription,
    demoMode: user.demoMode,
  });

  return NextResponse.json({
    ...verification,
    source: user.demoMode ? "demo" : "mock-camera",
  });
}
