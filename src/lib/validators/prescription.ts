import { z } from "zod";

const dayOptions = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export const prescriptionSchema = z.object({
  medicationName: z.string().min(2, "Enter the medication name."),
  purpose: z.string().min(2, "Describe what this medication is for."),
  dosage: z.string().min(2, "Enter the dosage."),
  instructions: z.string().min(8, "Add clear instructions."),
  scheduleTimes: z
    .string()
    .min(3, "Add at least one time.")
    .transform((value) =>
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    ),
  daysOfWeek: z
    .array(z.enum(dayOptions))
    .min(1, "Choose at least one day.")
    .max(7),
  startDate: z.string().min(1, "Choose a start date."),
  refillDate: z.string().optional(),
  notes: z.string().optional(),
});

export const prescriptionStatusSchema = z.object({
  status: z.enum(["ACTIVE", "ON_HOLD", "COMPLETED"]),
});

export const prescriptionDays = dayOptions;
