import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(2, "Enter your full name."),
  email: z.email("Enter a valid email address."),
  password: z
    .string()
    .min(8, "Use at least 8 characters.")
    .regex(/[A-Z]/, "Include one uppercase letter.")
    .regex(/[0-9]/, "Include one number."),
  role: z.enum(["SENIOR", "CAREGIVER"]),
  age: z.coerce.number().int().min(50).max(110).optional(),
});

export const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});
