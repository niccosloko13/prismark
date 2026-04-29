import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Senha deve ter pelo menos 8 caracteres.")
  .max(100)
  .refine((value) => /[A-Za-zÀ-ÿ]/.test(value), {
    message: "Senha deve incluir pelo menos uma letra.",
  })
  .refine((value) => /\d/.test(value), {
    message: "Senha deve incluir pelo menos um número.",
  });

export const loginSchema = z.object({
  email: z.string().email().transform((value) => value.trim().toLowerCase()),
  password: z.string().min(8).max(100),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().email().transform((value) => value.trim().toLowerCase()),
  company: z
    .string()
    .trim()
    .max(160)
    .optional()
    .transform((value) => (value && value.length >= 2 ? value : "Particular")),
  phone: z
    .string()
    .trim()
    .max(32)
    .optional()
    .transform((value) => {
      if (!value) {
        return "";
      }
      const digits = value.replace(/\D/g, "");
      if (digits.length >= 8) {
        return value.trim();
      }
      return "";
    }),
  password: passwordSchema,
});

export const googleIdentitySchema = z.object({
  googleSub: z.string().trim().min(1).max(255),
  email: z.string().email().transform((value) => value.trim().toLowerCase()),
  emailVerified: z.literal(true),
  name: z.string().trim().min(1).max(160).optional(),
  picture: z.string().url().optional(),
});
