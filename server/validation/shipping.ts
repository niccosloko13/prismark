import { z } from "zod";

export const shippingQuoteSchema = z.object({
  cep: z.string().trim().min(8).max(9),
  width: z.coerce.number().positive().max(5000).optional(),
  height: z.coerce.number().positive().max(5000).optional(),
  quantity: z.coerce.number().int().positive().max(100000).optional(),
});
