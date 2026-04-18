import { createOrderController, listOrdersController } from "@/server/controllers/orders.controller";

export const runtime = "nodejs";
export const GET = listOrdersController;
export const POST = createOrderController;
