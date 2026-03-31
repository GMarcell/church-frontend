import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const memberLoginSchema = z.object({
  name: z.string().min(2, "Name is required"),
  password: z
    .string()
    .regex(/^\d{2}-\d{2}-\d{4}$/, "Use DD-MM-YYYY format"),
});

export type MemberLoginFormValues = z.infer<typeof memberLoginSchema>;
