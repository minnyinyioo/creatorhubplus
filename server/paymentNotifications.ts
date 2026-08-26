import { and, desc, eq, isNull } from "drizzle-orm";
import { paymentNotifications } from "../drizzle/schema";
import { getDb } from "./db";

export type PaymentNotificationKind = "submitted" | "clarification_requested" | "verified" | "rejected";

type PaymentNotificationCopyInput = {
  kind: PaymentNotificationKind;
  orderNumber: string;
  serviceLabel?: string | null;
  reviewNote?: string | null;
};

export function getPaymentNotificationCopy(input: PaymentNotificationCopyInput) {
  const service = input.serviceLabel ? ` for ${input.serviceLabel}` : "";
  return input.kind === "clarification_requested"
    ? { title: `Clarification needed for ${input.orderNumber}`, message: input.reviewNote || "Please review your payment request and provide the missing clarification." }
    : input.kind === "verified"
      ? { title: `Payment verified for ${input.orderNumber}`, message: `Your payment${service} was verified by the CreatorHubPlus team.` }
      : input.kind === "rejected"
        ? { title: `Payment request updated: ${input.orderNumber}`, message: input.reviewNote || `Your payment${service} was not approved. Please review the staff note.` }
        : { title: `Payment request received: ${input.orderNumber}`, message: `Your payment${service} is now pending staff review.` };
}

export async function createPaymentNotification(input: {
  userId: number;
  paymentRequestId?: number;
  kind: PaymentNotificationKind;
  orderNumber: string;
  serviceLabel?: string | null;
  reviewNote?: string | null;
}) {
  const db = await getDb();
  if (!db) throw new Error("Notifications are temporarily unavailable.");
  const copy = getPaymentNotificationCopy(input);
  await db.insert(paymentNotifications).values({
    userId: input.userId,
    paymentRequestId: input.paymentRequestId ?? null,
    kind: input.kind,
    title: copy.title,
    message: copy.message,
  });
}

export async function listPaymentNotificationsForUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Notifications are temporarily unavailable.");
  return db.select().from(paymentNotifications).where(eq(paymentNotifications.userId, userId)).orderBy(desc(paymentNotifications.createdAt)).limit(30);
}

export async function countUnreadPaymentNotifications(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Notifications are temporarily unavailable.");
  const rows = await db.select({ id: paymentNotifications.id }).from(paymentNotifications).where(and(eq(paymentNotifications.userId, userId), isNull(paymentNotifications.readAt)));
  return rows.length;
}

export async function markPaymentNotificationRead(userId: number, id: number) {
  const db = await getDb();
  if (!db) throw new Error("Notifications are temporarily unavailable.");
  const result = await db.update(paymentNotifications).set({ readAt: new Date() }).where(and(eq(paymentNotifications.id, id), eq(paymentNotifications.userId, userId), isNull(paymentNotifications.readAt)));
  return { success: true as const, updated: result[0].affectedRows > 0 };
}

export async function markAllPaymentNotificationsRead(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Notifications are temporarily unavailable.");
  await db.update(paymentNotifications).set({ readAt: new Date() }).where(and(eq(paymentNotifications.userId, userId), isNull(paymentNotifications.readAt)));
  return { success: true as const };
}
