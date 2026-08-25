import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { paymentRequests } from "../drizzle/schema";
import { getDb } from "./db";
import { storagePut } from "./storage";

const allowedReceiptTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"] as const;
const MAX_RECEIPT_BYTES = 10 * 1024 * 1024;

export const paymentRequestInputSchema = z.object({
  paymentMethod: z.enum(["kbzpay", "wavepay", "ayapay", "kbzbank", "ayabank", "bangkok", "kasikorn"]),
  payerName: z.string().trim().min(2).max(120),
  accountHint: z.string().trim().regex(/^[0-9A-Za-z]{0,8}$/).optional(),
  amountMmk: z.number().int().positive().max(1_000_000_000),
  paymentReference: z.string().trim().max(100).optional(),
  receiptDataUrl: z.string().min(32).max(14_500_000),
  receiptName: z.string().trim().min(1).max(255),
});

export type PaymentRequestInput = z.infer<typeof paymentRequestInputSchema>;

export function decodeReceiptDataUrl(dataUrl: string) {
  const match = /^data:([^;]+);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!match) throw new Error("Receipt must be a valid base64 file upload.");

  const contentType = match[1];
  if (!allowedReceiptTypes.includes(contentType as (typeof allowedReceiptTypes)[number])) {
    throw new Error("Receipt must be a PNG, JPG, WEBP or PDF file.");
  }

  const data = Buffer.from(match[2], "base64");
  if (data.length === 0 || data.length > MAX_RECEIPT_BYTES) {
    throw new Error("Receipt must be no larger than 10 MB.");
  }

  return { contentType, data };
}

function safeFileName(name: string) {
  const cleaned = name.replace(/[^A-Za-z0-9._-]/g, "_").replace(/^_+/, "");
  return cleaned || "receipt";
}

export async function createPaymentRequest(userId: number, input: PaymentRequestInput) {
  const db = await getDb();
  if (!db) throw new Error("Payment records are temporarily unavailable.");

  const { contentType, data } = decodeReceiptDataUrl(input.receiptDataUrl);
  const requestCode = `PR-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
  const receipt = await storagePut(`payment-proofs/${userId}/${requestCode}-${safeFileName(input.receiptName)}`, data, contentType);

  await db.insert(paymentRequests).values({
    userId,
    requestCode,
    paymentMethod: input.paymentMethod,
    payerName: input.payerName,
    accountHint: input.accountHint || null,
    amountMmk: input.amountMmk,
    paymentReference: input.paymentReference || null,
    receiptStorageKey: receipt.key,
    receiptUrl: receipt.url,
    receiptName: safeFileName(input.receiptName),
    receiptContentType: contentType,
  });

  return { requestCode, status: "pending_review" as const };
}

export async function listPaymentRequestsForUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Payment records are temporarily unavailable.");

  return db.select({
    requestCode: paymentRequests.requestCode,
    paymentMethod: paymentRequests.paymentMethod,
    amountMmk: paymentRequests.amountMmk,
    status: paymentRequests.status,
    createdAt: paymentRequests.createdAt,
  }).from(paymentRequests).where(eq(paymentRequests.userId, userId)).orderBy(desc(paymentRequests.createdAt)).limit(12);
}
