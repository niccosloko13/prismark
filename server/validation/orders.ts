import { z } from "zod";

import { isValidCpf } from "@/lib/cpf";
import { ORDER_STATUSES } from "@/types";

const cpfOrderSchema = z
  .string()
  .transform((s) => s.replace(/\D/g, ""))
  .pipe(
    z
      .string()
      .length(11, { message: "CPF inválido." })
      .refine((d) => isValidCpf(d), { message: "CPF inválido." }),
  );

export const createOrderSchema = z.object({
  productSlug: z.string().trim().min(1).max(80),
  width: z.coerce.number().positive().max(100000),
  height: z.coerce.number().positive().max(100000),
  quantity: z.coerce.number().int().positive().max(100000),
  material: z.string().trim().min(1).max(120),
  finishing: z.string().trim().min(1).max(120),
  deadline: z.string().trim().min(1).max(120),
  /** CPF do comprador (somente dígitos após parse). */
  cpf: cpfOrderSchema,
  selectedAddonIds: z.array(z.string().trim().min(1).max(80)).optional(),
  notes: z.string().trim().max(2000).optional(),
  fileId: z.string().trim().min(1).max(120).nullable().optional(),
  /** Legado: ignorado pelo servidor — pedido sempre com total PIX descontado. */
  paymentMethod: z.enum(["pix", "card"]).optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES),
  note: z.string().trim().max(500).optional(),
});
