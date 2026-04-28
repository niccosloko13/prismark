import { getProductBySlug } from "@/lib/catalog";
import { roundTo } from "@/lib/utils";
import type { PriceBreakdown, Product, QuoteInput } from "@/types";

function calculateForProduct(
  product: Product,
  input: Omit<QuoteInput, "productSlug">,
): PriceBreakdown {
  const area = roundTo((input.width / 100) * (input.height / 100), 4);
  const billableArea = Math.max(area, product.minimumArea);
  const material =
    product.materials.find((item) => item.label === input.material) ?? product.materials[0];
  const finishing =
    product.finishings.find((item) => item.label === input.finishing) ?? product.finishings[0];
  const deadline =
    product.deadlines.find((item) => item.label === input.deadline) ?? product.deadlines[0];

  const pricePerM2 = roundTo(product.basePriceM2 * material.multiplier);
  const unitBase = roundTo(pricePerM2 * billableArea);
  const subtotal = roundTo(unitBase * input.quantity);
  const finishingFee = roundTo(
    finishing.type === "perUnit" ? finishing.fee * input.quantity : finishing.fee,
  );
  const baseTotal = roundTo((subtotal + finishingFee) * deadline.multiplier);
  const addonsTotal = roundTo(Math.max(0, input.addonsTotal ?? 0));
  const total = roundTo(baseTotal + addonsTotal);

  return {
    area,
    billableArea: roundTo(billableArea, 4),
    pricePerM2,
    materialMultiplier: material.multiplier,
    finishingFee,
    deadlineMultiplier: deadline.multiplier,
    unitBase,
    subtotal,
    addonsTotal,
    total,
  };
}

export function calculateQuote(input: QuoteInput): PriceBreakdown {
  const product = getProductBySlug(input.productSlug);

  if (!product) {
    throw new Error("Produto não encontrado para precificação.");
  }

  return calculateForProduct(product, {
    width: input.width,
    height: input.height,
    quantity: input.quantity,
    material: input.material,
    finishing: input.finishing,
    deadline: input.deadline,
    addonsTotal: input.addonsTotal,
  });
}
