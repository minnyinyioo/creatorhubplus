import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { paymentRequests } from "../drizzle/schema";
import { getDb } from "./db";
import { storagePut } from "./storage";

export const paymentMethodSchema = z.enum([
  "kbzpay",
  "wavepay",
  "ayapay",
  "kbzbank",
  "ayabank",
  "bangkok",
  "kasikorn",
]);

export const allowedReceiptTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"] as const;
export const MAX_RECEIPT_BYTES = 10 * 1024 * 1024;

export const paymentRequestFieldsSchema = z.object({
  paymentMethod: paymentMethodSchema,
  payerName: z.string().trim().min(2).max(120),
  accountHint: z.string().trim().regex(/^[0-9A-Za-z]{0,8}$/).optional(),
  amountMmk: z.coerce.number().int().positive().max(1_000_000_000),
  paymentReference: z.string().trim().max(100).optional(),
});

export type PaymentRequestFields = z.infer<typeof paymentRequestFieldsSchema>;

export type ReceiptUpload = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
};

function safeFileName(name: string) {
  const cleaned = name.replace(/[^A-Za-z0-9._-]/g, "_").replace(/^_+/, "").slice(0, 255);
  return cleaned || "receipt";
}

function hasSignature(buffer: Buffer, contentType: string) {
  if (contentType === "application/pdf") return buffer.subarray(0, 5).toString("ascii") === "%PDF-";
  if (contentType === "image/png") return buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (contentType === "image/jpeg") return buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]));
  if (contentType === "image/webp") return buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP";
  return false;
}

export function validateReceiptUpload(file: ReceiptUpload) {
  if (!allowedReceiptTypes.includes(file.mimetype as (typeof allowedReceiptTypes)[number])) {
    throw new Error("Receipt must be a PNG, JPG, WEBP or PDF file.");
  }
  if (file.size <= 0 || file.size > MAX_RECEIPT_BYTES || file.buffer.length !== file.size) {
    throw new Error("Receipt must be no larger than 10 MB.");
  }
  if (!hasSignature(file.buffer, file.mimetype)) {
    throw new Error("Receipt content does not match its declared file type.");
  }
}

export async function createPaymentRequest(userId: number, input: PaymentRequestFields, file: ReceiptUpload) {
  const db = await getDb();
  if (!db) throw new Error("Payment records are temporarily unavailable.");

  validateReceiptUpload(file);
  const requestCode = `PR-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
  const receiptName = safeFileName(file.originalname);
  const receipt = await storagePut(`payment-proofs/${userId}/${requestCode}-${receiptName}`, file.buffer, file.mimetype);

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
    receiptName,
    receiptContentType: file.mimetype,
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
    reviewNote: paymentRequests.reviewNote,
    createdAt: paymentRequests.createdAt,
  }).from(paymentRequests).where(eq(paymentRequests.userId, userId)).orderBy(desc(paymentRequests.createdAt)).limit(12);
}
