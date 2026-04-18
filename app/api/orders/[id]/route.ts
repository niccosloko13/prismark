import { getOrderController, updateOrderStatusController } from "@/server/controllers/orders.controller";

export const runtime = "nodejs";
export const GET = getOrderController;
export const PATCH = updateOrderStatusController;
