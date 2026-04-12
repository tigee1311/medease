import "server-only";

import type { Prescription, VerificationResult } from "@prisma/client";

function hashValue(input: string) {
  return Array.from(input).reduce((total, char, index) => total + char.charCodeAt(0) * (index + 3), 0);
}

export function buildMockVerification({
  imageData,
  prescription,
  demoMode,
}: {
  imageData: string;
  prescription: Pick<Prescription, "id" | "medicationName" | "dosage">;
  demoMode: boolean;
}) {
  const seed = hashValue(`${prescription.id}:${prescription.medicationName}:${imageData.length}`);
  const normalized = seed % 100;

  let result: VerificationResult = "VERIFIED";
  let confidence = 92;
  let explanation = `Mock AI verified the captured medication label against ${prescription.medicationName} ${prescription.dosage}.`;

  if (!demoMode && normalized > 74) {
    result = "REVIEW";
    confidence = 68;
    explanation = "Mock AI saw the medication, but the image quality suggests a caregiver should review the dose before logging it.";
  }

  if (!demoMode && normalized > 89) {
    result = "MISMATCH";
    confidence = 38;
    explanation = "Mock AI could not match the visible packaging to the active prescription with enough certainty.";
  }

  if (demoMode) {
    confidence = 98;
    explanation = `Demo mode returned an instant verification for ${prescription.medicationName}.`;
  }

  return {
    result,
    confidence,
    explanation,
    verificationLabel:
      result === "VERIFIED" ? "Ready to log" : result === "REVIEW" ? "Needs review" : "Possible mismatch",
  };
}
