import path from "node:path";

import { env } from "@/server/config/env";
import { ordersRepository } from "@/server/repositories/orders.repository";
import { paymentSettingsRepository } from "@/server/repositories/payment-settings.repository";
import { paymentsRepository } from "@/server/repositories/payments.repository";
import { usersRepository } from "@/server/repositories/users.repository";

export const uploadsDirectory = path.join(process.cwd(), env.UPLOAD_DIR);

export async function findUserByEmail(email: string) {
  return usersRepository.findByEmail(email);
}

export async function findUserById(id: string) {
  return usersRepository.findById(id);
}

export async function getUsers() {
  return usersRepository.findAll();
}

export async function getOrders() {
  return ordersRepository.findAll();
}

export async function getOrdersByUser(userId: string) {
  return ordersRepository.findByClientId(userId);
}

export async function getPaymentSettings() {
  return paymentSettingsRepository.get();
}

export async function getPendingPixPayments() {
  return paymentsRepository.listPending();
}
