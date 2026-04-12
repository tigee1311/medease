import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/user";
import { resolveSeniorContext } from "@/lib/care-context";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const user = await requireUser();
  const context = resolveSeniorContext(user);
  const body = (await request.json()) as {
    prescriptionId?: string;
    status?: "TAKEN" | "MISSED" | "SKIPPED" | "NEEDS_REVIEW";
    source?: "MANUAL" | "CAMERA" | "DEMO";
    verification?: {
      result: "VERIFIED" | "REVIEW" | "MISMATCH";
      confidence: number;
      explanation: string;
      verificationLabel: string;
    };
  };

  if (!body.prescriptionId || !body.status || !body.source) {
    return NextResponse.json({ error: "Prescription, status, and source are required." }, { status: 400 });
  }

  const prescription = await db.prescription.findFirst({
    where: {
      id: body.prescriptionId,
      seniorId: context.seniorId,
    },
  });

  if (!prescription) {
    return NextResponse.json({ error: "Prescription not found." }, { status: 404 });
  }

  const now = new Date();
  const event = await db.medicationEvent.create({
    data: {
      prescriptionId: prescription.id,
      seniorId: context.seniorId,
      loggedById: user.id,
      status: body.status,
      source: body.source,
      scheduledFor: now,
      takenAt: body.status === "TAKEN" ? now : null,
      verificationScore: body.verification?.confidence,
      verificationLabel: body.verification?.verificationLabel,
      adherenceScore: body.status === "TAKEN" ? 100 : body.status === "NEEDS_REVIEW" ? 60 : 20,
      note:
        body.status === "MISSED"
          ? "Marked missed from the timeline workflow."
          : body.verification?.explanation,
    },
  });

  if (body.verification) {
    await db.verificationAttempt.create({
      data: {
        prescriptionId: prescription.id,
        seniorId: context.seniorId,
        eventId: event.id,
        result: body.verification.result,
        confidence: body.verification.confidence,
        mode: body.source.toLowerCase(),
        explanation: body.verification.explanation,
      },
    });
  }

  return NextResponse.json({ id: event.id, status: event.status });
}
