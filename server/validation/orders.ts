import { z } from "zod";

import { isValidCpf } from "@/lib/cpf";
import { parseCustomSizeText } from "@/lib/custom-product-size";
import { ORDER_STATUSES } from "@/types";

const cpfOrderSchema = z
  .string()
  .transform((s) => s.replace(/\D/g, ""))
  .pipe(
    z
      .string()
      .length(11, { message: "CPF invalido." })
      .refine((d) => isValidCpf(d), { message: "CPF invalido." }),
  );

const dimensionSchema = z.coerce
  .number({ message: "Informe uma medida valida." })
  .finite({ message: "Informe uma medida valida." })
  .positive({ message: "A medida deve ser maior que zero." })
  .max(100000, { message: "A medida informada esta acima do limite." });

const createOrderBaseSchema = z.object({
  productSlug: z.string().trim().min(1).max(80),
  width: z.union([z.string(), z.number()]).optional(),
  height: z.union([z.string(), z.number()]).optional(),
  widthCm: z.union([z.string(), z.number()]).optional(),
  heightCm: z.union([z.string(), z.number()]).optional(),
  customSize: z.string().trim().max(80).optional(),
  customSizeUnit: z.enum(["cm", "m"]).optional(),
  quantity: z.coerce.number().int().positive().max(100000),
  material: z.string().trim().min(1).max(120),
  finishing: z.string().trim().min(1).max(120),
  deadline: z.string().trim().min(1).max(120),
  /** CPF do comprador, normalizado para somente digitos. */
  cpf: cpfOrderSchema,
  selectedAddonIds: z.array(z.string().trim().min(1).max(80)).optional(),
  notes: z.string().trim().max(2000).optional(),
  fileId: z.string().trim().min(1).max(120).nullable().optional(),
  /** Legado: ignorado pelo servidor; pedido sempre usa PIX com desconto. */
  paymentMethod: z.enum(["pix", "card"]).optional(),
});

export const createOrderSchema = createOrderBaseSchema
  .superRefine((input, ctx) => {
    const parsedCustomSize = parseCustomSizeText(input.customSize);
    const rawWidth = input.widthCm ?? input.width;
    const rawHeight = input.heightCm ?? input.height;

    if (!parsedCustomSize && (rawWidth === undefined || rawHeight === undefined)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["customSize"],
        message: "Informe largura e altura ou um tamanho personalizado como 10x20cm.",
      });
      return;
    }

    if (parsedCustomSize) {
      return;
    }

    const width = dimensionSchema.safeParse(rawWidth);
    const height = dimensionSchema.safeParse(rawHeight);

    if (!width.success) {
      for (const issue of width.error.issues) {
        ctx.addIssue({ ...issue, path: ["width"] });
      }
    }

    if (!height.success) {
      for (const issue of height.error.issues) {
        ctx.addIssue({ ...issue, path: ["height"] });
      }
    }
  })
  .transform((input) => {
    const parsedCustomSize = parseCustomSizeText(input.customSize);
    const rawWidth = input.widthCm ?? input.width;
    const rawHeight = input.heightCm ?? input.height;

    return {
      productSlug: input.productSlug,
      width: parsedCustomSize?.widthCm ?? dimensionSchema.parse(rawWidth),
      height: parsedCustomSize?.heightCm ?? dimensionSchema.parse(rawHeight),
      quantity: input.quantity,
      material: input.material,
      finishing: input.finishing,
      deadline: input.deadline,
      cpf: input.cpf,
      selectedAddonIds: input.selectedAddonIds,
      notes: input.notes,
      fileId: input.fileId,
      paymentMethod: input.paymentMethod,
    };
  });

export const updateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES),
  note: z.string().trim().max(500).optional(),
});
