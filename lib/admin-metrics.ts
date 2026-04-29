import { products as staticCatalog } from "@/lib/catalog";
import { getActiveProducts } from "@/lib/active-products";
import { ordersRepository } from "@/server/repositories/orders.repository";
import { paymentsRepository } from "@/server/repositories/payments.repository";
import { usersRepository } from "@/server/repositories/users.repository";
import type { OrderRecord, OrderStatus } from "@/types";

const REVENUE_STATUSES: OrderStatus[] = ["confirmado", "aguardando arte", "em análise", "produção", "finalizado", "entregue"];

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfMonth() {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export interface AdminDashboardMetrics {
  revenueTotal: number;
  revenueToday: number;
  revenueMonth: number;
  ordersToday: number;
  ordersMonth: number;
  ordersTotal: number;
  pixPending: number;
  ordersInProduction: number;
  clientsRegistered: number;
  productsActive: number;
  productsCatalog: number;
  topProducts: Array<{ slug: string; name: string; count: number }>;
}

export async function getAdminDashboardMetrics(): Promise<AdminDashboardMetrics> {
  const [orders, pendingPix, users, activeProducts] = await Promise.all([
    ordersRepository.findAll(),
    paymentsRepository.listPending(),
    usersRepository.findAll(),
    getActiveProducts(),
  ]);

  const clients = users.filter((u) => u.role === "client");
  const t0 = startOfToday();
  const m0 = startOfMonth();

  const ordersToday = orders.filter((o) => new Date(o.createdAt) >= t0).length;
  const ordersMonth = orders.filter((o) => new Date(o.createdAt) >= m0).length;

  const sumValue = (list: OrderRecord[]) => list.reduce((s, o) => s + o.value, 0);

  const revenueOrders = orders.filter((o) => REVENUE_STATUSES.includes(o.status));
  const revenueTodayOrders = revenueOrders.filter((o) => new Date(o.createdAt) >= t0);
  const revenueMonthOrders = revenueOrders.filter((o) => new Date(o.createdAt) >= m0);

  const inProduction = orders.filter((o) => o.status === "produção" || o.status === "em análise").length;

  const bySlug = new Map<string, number>();
  const nameBySlug = new Map<string, string>();
  for (const o of orders) {
    bySlug.set(o.productSlug, (bySlug.get(o.productSlug) ?? 0) + 1);
    nameBySlug.set(o.productSlug, o.productName);
  }
  const topProducts = [...bySlug.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([slug, count]) => ({ slug, name: nameBySlug.get(slug) ?? slug, count }));

  return {
    revenueTotal: sumValue(revenueOrders),
    revenueToday: sumValue(revenueTodayOrders),
    revenueMonth: sumValue(revenueMonthOrders),
    ordersToday,
    ordersMonth,
    ordersTotal: orders.length,
    pixPending: pendingPix.length,
    ordersInProduction: inProduction,
    clientsRegistered: clients.length,
    productsActive: activeProducts.length,
    productsCatalog: staticCatalog.length,
    topProducts,
  };
}
