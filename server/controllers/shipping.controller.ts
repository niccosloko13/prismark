import { NextRequest, NextResponse } from "next/server";

import { withController } from "@/server/controllers/controller-utils";
import { shippingService } from "@/server/services/shipping.service";

export async function quoteShippingController(request: NextRequest) {
  return withController(async () => {
    const params = request.nextUrl.searchParams;
    const quote = await shippingService.quote({
      cep: params.get("cep") ?? "",
      width: params.get("width") ?? undefined,
      height: params.get("height") ?? undefined,
      quantity: params.get("quantity") ?? undefined,
    });

    return NextResponse.json({ quote });
  });
}
