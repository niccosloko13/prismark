import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email().transform((value) => value.trim().toLowerCase()),
  password: z.string().min(6).max(100),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().email().transform((value) => value.trim().toLowerCase()),
  company: z.string().trim().min(2).max(160),
  phone: z.string().trim().min(8).max(32),
  password: z.string().min(8).max(100),
});

export const googleIdentitySchema = z.object({
  googleSub: z.string().trim().min(1).max(255),
  email: z.string().email().transform((value) => value.trim().toLowerCase()),
  emailVerified: z.literal(true),
  name: z.string().trim().min(1).max(160).optional(),
  picture: z.string().url().optional(),
});
