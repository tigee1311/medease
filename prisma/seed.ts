import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

import { loadEnvFiles } from "./load-env";

loadEnvFiles();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to seed MedEase.");
}

const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  const demoPasswordHash = await bcrypt.hash("DemoPass123", 10);

  const caregiver = await prisma.user.upsert({
    where: { email: "caregiver@medease.app" },
    update: {
      name: "Elena Carter",
      role: "CAREGIVER",
      passwordHash: demoPasswordHash,
      demoMode: true,
    },
    create: {
      email: "caregiver@medease.app",
      name: "Elena Carter",
      role: "CAREGIVER",
      passwordHash: demoPasswordHash,
      age: 46,
      demoMode: true,
    },
  });

  const senior = await prisma.user.upsert({
    where: { email: "senior@medease.app" },
    update: {
      name: "Margaret Jensen",
      role: "SENIOR",
      passwordHash: demoPasswordHash,
      demoMode: true,
    },
    create: {
      email: "senior@medease.app",
      name: "Margaret Jensen",
      role: "SENIOR",
      passwordHash: demoPasswordHash,
      age: 74,
      demoMode: true,
    },
  });

  await prisma.careRelationship.upsert({
    where: {
      seniorId_caregiverId: {
        seniorId: senior.id,
        caregiverId: caregiver.id,
      },
    },
    update: {
      status: "ACTIVE",
      notes: "Primary daughter and medication support partner.",
    },
    create: {
      seniorId: senior.id,
      caregiverId: caregiver.id,
      status: "ACTIVE",
      notes: "Primary daughter and medication support partner.",
    },
  });

  const lisinopril = await prisma.prescription.upsert({
    where: { id: "seed-lisinopril" },
    update: {
      seniorId: senior.id,
      createdById: caregiver.id,
      medicationName: "Lisinopril",
      purpose: "Blood pressure support",
      dosage: "10 mg tablet",
      instructions: "Take one tablet after breakfast with water.",
      scheduleTimes: ["8:00 AM"],
      daysOfWeek: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      startDate: new Date("2026-04-01T08:00:00.000Z"),
      refillDate: new Date("2026-04-22T08:00:00.000Z"),
      notes: "Stored in the breakfast drawer.",
    },
    create: {
      id: "seed-lisinopril",
      seniorId: senior.id,
      createdById: caregiver.id,
      medicationName: "Lisinopril",
      purpose: "Blood pressure support",
      dosage: "10 mg tablet",
      instructions: "Take one tablet after breakfast with water.",
      scheduleTimes: ["8:00 AM"],
      daysOfWeek: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      startDate: new Date("2026-04-01T08:00:00.000Z"),
      refillDate: new Date("2026-04-22T08:00:00.000Z"),
      notes: "Stored in the breakfast drawer.",
    },
  });

  const metformin = await prisma.prescription.upsert({
    where: { id: "seed-metformin" },
    update: {
      seniorId: senior.id,
      createdById: caregiver.id,
      medicationName: "Metformin",
      purpose: "Blood sugar support",
      dosage: "500 mg tablet",
      instructions: "Take with breakfast and dinner.",
      scheduleTimes: ["8:00 AM", "6:30 PM"],
      daysOfWeek: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      startDate: new Date("2026-04-01T08:00:00.000Z"),
      refillDate: new Date("2026-04-28T08:00:00.000Z"),
      notes: "Evening dose works best after the meal.",
    },
    create: {
      id: "seed-metformin",
      seniorId: senior.id,
      createdById: caregiver.id,
      medicationName: "Metformin",
      purpose: "Blood sugar support",
      dosage: "500 mg tablet",
      instructions: "Take with breakfast and dinner.",
      scheduleTimes: ["8:00 AM", "6:30 PM"],
      daysOfWeek: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      startDate: new Date("2026-04-01T08:00:00.000Z"),
      refillDate: new Date("2026-04-28T08:00:00.000Z"),
      notes: "Evening dose works best after the meal.",
    },
  });

  await prisma.verificationAttempt.deleteMany({
    where: {
      seniorId: senior.id,
    },
  });

  await prisma.medicationEvent.deleteMany({
    where: {
      seniorId: senior.id,
    },
  });

  await prisma.caregiverEvent.deleteMany({
    where: {
      seniorId: senior.id,
    },
  });

  const takenEvent = await prisma.medicationEvent.create({
    data: {
      prescriptionId: lisinopril.id,
      seniorId: senior.id,
      loggedById: senior.id,
      status: "TAKEN",
      source: "DEMO",
      scheduledFor: new Date("2026-04-11T15:00:00.000Z"),
      takenAt: new Date("2026-04-11T15:03:00.000Z"),
      verificationScore: 98,
      verificationLabel: "Ready to log",
      adherenceScore: 100,
      note: "Demo mode verification completed instantly.",
    },
  });

  await prisma.verificationAttempt.create({
    data: {
      prescriptionId: lisinopril.id,
      seniorId: senior.id,
      eventId: takenEvent.id,
      result: "VERIFIED",
      confidence: 98,
      mode: "demo",
      explanation: "Demo mode returned an instant verification for Lisinopril.",
    },
  });

  const missedEvent = await prisma.medicationEvent.create({
    data: {
      prescriptionId: metformin.id,
      seniorId: senior.id,
      loggedById: caregiver.id,
      status: "MISSED",
      source: "MANUAL",
      scheduledFor: new Date("2026-04-11T01:30:00.000Z"),
      adherenceScore: 20,
      note: "Evening dose was missed while away from home.",
    },
  });

  await prisma.caregiverEvent.createMany({
    data: [
      {
        seniorId: senior.id,
        caregiverId: caregiver.id,
        createdById: caregiver.id,
        type: "CHECK_IN",
        severity: "LOW",
        title: "Morning check-in completed",
        message: "Margaret confirmed the breakfast medication and hydration routine.",
      },
      {
        seniorId: senior.id,
        caregiverId: caregiver.id,
        createdById: caregiver.id,
        type: "ALERT",
        severity: "HIGH",
        title: "Metformin evening dose missed",
        message: `A manual entry was recorded for a missed Metformin dose. Event ${missedEvent.id} needs follow-up.`,
      },
    ],
  });

  console.log("MedEase seed completed.");
  console.log("Senior login: senior@medease.app / DemoPass123");
  console.log("Caregiver login: caregiver@medease.app / DemoPass123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
