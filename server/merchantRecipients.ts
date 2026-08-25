import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { merchantRecipients } from "../drizzle/schema";
import { getDb } from "./db";
import { paymentMethodSchema } from "./paymentRequests";

const qrAssetUrlSchema = z.string().trim().refine(
  value => value === "" || value.startsWith("/manus-storage/") || /^https:\/\//.test(value),
  "QR assets must use an HTTPS URL or a permanent /manus-storage/ path.",
);

export const merchantRecipientInputSchema = z.object({
  paymentMethod: paymentMethodSchema,
  providerLabel: z.string().trim().min(2).max(80),
  kind: z.enum(["Wallet", "Bank"]),
  accountName: z.string().trim().min(2).max(160),
  accountIdentifier: z.string().trim().min(2).max(160),
  instructions: z.string().trim().min(10).max(2000),
  qrUrl: qrAssetUrlSchema.max(2000).optional(),
  qrStorageKey: z.string().trim().max(500).optional().or(z.literal("")),
  isActive: z.boolean(),
});

export type MerchantRecipientInput = z.infer<typeof merchantRecipientInputSchema>;

export async function getActiveMerchantRecipient(paymentMethod: string) {
  const db = await getDb();
  if (!db) throw new Error("Merchant instructions are temporarily unavailable.");

  const rows = await db.select({
    paymentMethod: merchantRecipients.paymentMethod,
    providerLabel: merchantRecipients.providerLabel,
    kind: merchantRecipients.kind,
    accountName: merchantRecipients.accountName,
    accountIdentifier: merchantRecipients.accountIdentifier,
    instructions: merchantRecipients.instructions,
    qrUrl: merchantRecipients.qrUrl,
  }).from(merchantRecipients).where(and(
    eq(merchantRecipients.paymentMethod, paymentMethod),
    eq(merchantRecipients.isActive, 1),
  )).limit(1);

  const recipient = rows[0];
  if (!recipient) return null;
  return recipient;
}

export async function listMerchantRecipients() {
  const db = await getDb();
  if (!db) throw new Error("Merchant instructions are temporarily unavailable.");

  return db.select().from(merchantRecipients).orderBy(merchantRecipients.providerLabel);
}

export async function upsertMerchantRecipient(input: MerchantRecipientInput) {
  const db = await getDb();
  if (!db) throw new Error("Merchant instructions are temporarily unavailable.");

  await db.insert(merchantRecipients).values({
    paymentMethod: input.paymentMethod,
    providerLabel: input.providerLabel,
    kind: input.kind,
    accountName: input.accountName,
    accountIdentifier: input.accountIdentifier,
    instructions: input.instructions,
    qrUrl: input.qrUrl || null,
    qrStorageKey: input.qrStorageKey || null,
    isActive: input.isActive ? 1 : 0,
  }).onDuplicateKeyUpdate({
    set: {
      providerLabel: input.providerLabel,
      kind: input.kind,
      accountName: input.accountName,
      accountIdentifier: input.accountIdentifier,
      instructions: input.instructions,
      qrUrl: input.qrUrl || null,
      qrStorageKey: input.qrStorageKey || null,
      isActive: input.isActive ? 1 : 0,
      updatedAt: new Date(),
    },
  });

  return { success: true as const };
}
