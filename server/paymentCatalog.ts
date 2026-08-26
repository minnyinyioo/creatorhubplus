import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { paymentServiceCatalog } from "../drizzle/schema";
import { getDb } from "./db";

export const paymentCatalogDefaults = [
  { serviceKey: "platform_earnings", serviceLabel: "Platform earnings" },
  { serviceKey: "payout_receiving", serviceLabel: "Payout & receiving" },
  { serviceKey: "account_setup", serviceLabel: "Account setup" },
  { serviceKey: "address_support", serviceLabel: "Address support" },
] as const;

export const paymentCatalogServiceKeySchema = z.enum(paymentCatalogDefaults.map((item) => item.serviceKey) as [string, ...string[]]);

export const paymentServicePriceUpdateSchema = z.object({
  serviceKey: paymentCatalogServiceKeySchema,
  priceMmk: z.coerce.number().int().nonnegative().max(1_000_000_000).nullable(),
  priceLabel: z.string().trim().min(1).max(120).optional(),
});

async function ensurePaymentCatalog() {
  const db = await getDb();
  if (!db) throw new Error("Payment records are temporarily unavailable.");
  const existing = await db.select({ serviceKey: paymentServiceCatalog.serviceKey }).from(paymentServiceCatalog);
  const existingKeys = new Set(existing.map((item) => item.serviceKey));
  const missing = paymentCatalogDefaults.filter((item) => !existingKeys.has(item.serviceKey));
  if (missing.length > 0) {
    await db.insert(paymentServiceCatalog).values(missing.map((item) => ({
      serviceKey: item.serviceKey,
      serviceLabel: item.serviceLabel,
      priceMmk: null,
      priceLabel: "Quote required",
      isActive: 1,
    })));
  }
  return db;
}

export async function listPaymentServiceCatalog() {
  const db = await ensurePaymentCatalog();
  return db.select().from(paymentServiceCatalog).where(eq(paymentServiceCatalog.isActive, 1)).orderBy(asc(paymentServiceCatalog.id));
}

export async function getPaymentServiceConfig(serviceKey: string) {
  const db = await ensurePaymentCatalog();
  const rows = await db.select().from(paymentServiceCatalog).where(eq(paymentServiceCatalog.serviceKey, serviceKey)).limit(1);
  return rows[0];
}

export async function updatePaymentServicePrice(userId: number, input: z.infer<typeof paymentServicePriceUpdateSchema>) {
  const db = await ensurePaymentCatalog();
  const priceLabel = input.priceLabel?.trim() || (input.priceMmk === null ? "Quote required" : `${input.priceMmk.toLocaleString()} MMK`);
  const result = await db.update(paymentServiceCatalog).set({
    priceMmk: input.priceMmk,
    priceLabel,
    updatedByUserId: userId,
  }).where(eq(paymentServiceCatalog.serviceKey, input.serviceKey));
  if (result[0].affectedRows === 0) throw new Error("That service is not available.");
  return { success: true as const, serviceKey: input.serviceKey, priceMmk: input.priceMmk, priceLabel };
}
