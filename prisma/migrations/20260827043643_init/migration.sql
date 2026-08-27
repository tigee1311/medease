-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SENIOR', 'CAREGIVER');

-- CreateEnum
CREATE TYPE "RelationshipStatus" AS ENUM ('ACTIVE', 'PENDING', 'PAUSED');

-- CreateEnum
CREATE TYPE "PrescriptionStatus" AS ENUM ('ACTIVE', 'ON_HOLD', 'COMPLETED');

-- CreateEnum
CREATE TYPE "MedicationEventStatus" AS ENUM ('TAKEN', 'MISSED', 'SKIPPED', 'NEEDS_REVIEW');

-- CreateEnum
CREATE TYPE "MedicationEventSource" AS ENUM ('MANUAL', 'CAMERA', 'DEMO');

-- CreateEnum
CREATE TYPE "VerificationResult" AS ENUM ('VERIFIED', 'REVIEW', 'MISMATCH');

-- CreateEnum
CREATE TYPE "CaregiverEventType" AS ENUM ('CHECK_IN', 'REMINDER', 'ALERT', 'ESCALATION', 'NOTE');

-- CreateEnum
CREATE TYPE "SeverityLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'SENIOR',
    "age" INTEGER,
    "timezone" TEXT NOT NULL DEFAULT 'America/Los_Angeles',
    "phone" TEXT,
    "demoMode" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareRelationship" (
    "id" TEXT NOT NULL,
    "seniorId" TEXT NOT NULL,
    "caregiverId" TEXT NOT NULL,
    "status" "RelationshipStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CareRelationship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prescription" (
    "id" TEXT NOT NULL,
    "seniorId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "medicationName" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "scheduleTimes" JSONB NOT NULL,
    "daysOfWeek" JSONB NOT NULL,
    "refillDate" TIMESTAMP(3),
    "prescribedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "status" "PrescriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "verificationMode" TEXT NOT NULL DEFAULT 'camera_or_demo',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prescription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicationEvent" (
    "id" TEXT NOT NULL,
    "prescriptionId" TEXT NOT NULL,
    "seniorId" TEXT NOT NULL,
    "loggedById" TEXT NOT NULL,
    "status" "MedicationEventStatus" NOT NULL,
    "source" "MedicationEventSource" NOT NULL,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "takenAt" TIMESTAMP(3),
    "note" TEXT,
    "adherenceScore" INTEGER,
    "verificationScore" INTEGER,
    "verificationLabel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MedicationEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationAttempt" (
    "id" TEXT NOT NULL,
    "prescriptionId" TEXT NOT NULL,
    "seniorId" TEXT NOT NULL,
    "eventId" TEXT,
    "result" "VerificationResult" NOT NULL,
    "confidence" INTEGER NOT NULL,
    "mode" TEXT NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "artifactUrl" TEXT,
    "explanation" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerificationAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaregiverEvent" (
    "id" TEXT NOT NULL,
    "seniorId" TEXT NOT NULL,
    "caregiverId" TEXT,
    "createdById" TEXT NOT NULL,
    "type" "CaregiverEventType" NOT NULL,
    "severity" "SeverityLevel" NOT NULL DEFAULT 'LOW',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaregiverEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CareRelationship_seniorId_caregiverId_key" ON "CareRelationship"("seniorId", "caregiverId");

-- CreateIndex
CREATE INDEX "MedicationEvent_seniorId_scheduledFor_idx" ON "MedicationEvent"("seniorId", "scheduledFor");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationAttempt_eventId_key" ON "VerificationAttempt"("eventId");

-- CreateIndex
CREATE INDEX "CaregiverEvent_seniorId_createdAt_idx" ON "CaregiverEvent"("seniorId", "createdAt");

-- AddForeignKey
ALTER TABLE "CareRelationship" ADD CONSTRAINT "CareRelationship_seniorId_fkey" FOREIGN KEY ("seniorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareRelationship" ADD CONSTRAINT "CareRelationship_caregiverId_fkey" FOREIGN KEY ("caregiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_seniorId_fkey" FOREIGN KEY ("seniorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicationEvent" ADD CONSTRAINT "MedicationEvent_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "Prescription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicationEvent" ADD CONSTRAINT "MedicationEvent_seniorId_fkey" FOREIGN KEY ("seniorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicationEvent" ADD CONSTRAINT "MedicationEvent_loggedById_fkey" FOREIGN KEY ("loggedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationAttempt" ADD CONSTRAINT "VerificationAttempt_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "Prescription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationAttempt" ADD CONSTRAINT "VerificationAttempt_seniorId_fkey" FOREIGN KEY ("seniorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationAttempt" ADD CONSTRAINT "VerificationAttempt_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "MedicationEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaregiverEvent" ADD CONSTRAINT "CaregiverEvent_seniorId_fkey" FOREIGN KEY ("seniorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaregiverEvent" ADD CONSTRAINT "CaregiverEvent_caregiverId_fkey" FOREIGN KEY ("caregiverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaregiverEvent" ADD CONSTRAINT "CaregiverEvent_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
