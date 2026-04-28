import { createPixPaymentController } from "@/server/controllers/payments.controller";

export const runtime = "nodejs";
export const POST = createPixPaymentController;
