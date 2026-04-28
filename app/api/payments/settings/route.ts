import { getPaymentSettingsController, upsertPaymentSettingsController } from "@/server/controllers/payments.controller";

export const runtime = "nodejs";
export const GET = getPaymentSettingsController;
export const PUT = upsertPaymentSettingsController;
