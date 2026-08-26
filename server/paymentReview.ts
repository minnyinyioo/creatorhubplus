import { and, desc, eq, inArray } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { paymentRequests, users } from "../drizzle/schema";
import { getDb } from "./db";
import { createPaymentNotification } from "./paymentNotifications";

export const REVIEW_STATUSES = ["pending_review", "clarification_requested", "verified", "rejected"] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

const transitionableStatuses = ["pending_review", "clarification_requested"] as const;

export function canTransitionReviewStatus(current: ReviewStatus, next: Exclude<ReviewStatus, "pending_review">) {
  if (!transitionableStatuses.includes(current as (typeof transitionableStatuses)[number])) return false;
  return ["clarification_requested", "verified", "rejected"].includes(next);
}

export function validateReviewAction(input: { status: Exclude<ReviewStatus, "pending_review">; reviewNote?: string }) {
  const note = input.reviewNote?.trim() || null;
  if (input.status === "clarification_requested" && !note) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Add a note explaining what clarification is needed." });
  }
  if ((input.status === "rejected" || input.status === "verified") && note && note.length > 2000) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Review notes must be 2,000 characters or fewer." });
  }
  return note;
}

export async function listPaymentRequestsForReview(status?: ReviewStatus) {
  const db = await getDb();
  if (!db) throw new Error("Payment records are temporarily unavailable.");

  const conditions = status ? eq(paymentRequests.status, status) : inArray(paymentRequests.status, transitionableStatuses);
  return db.select({
    id: paymentRequests.id,
    requestCode: paymentRequests.requestCode,
    orderNumber: paymentRequests.orderNumber,
    quotedAmountMmk: paymentRequests.quotedAmountMmk,
    serviceKey: paymentRequests.serviceKey,
    serviceLabel: paymentRequests.serviceLabel,
    paymentMethod: paymentRequests.paymentMethod,
    payerName: paymentRequests.payerName,
    accountHint: paymentRequests.accountHint,
    amountMmk: paymentRequests.amountMmk,
    paymentReference: paymentRequests.paymentReference,
    receiptUrl: paymentRequests.receiptUrl,
    receiptName: paymentRequests.receiptName,
    receiptContentType: paymentRequests.receiptContentType,
    status: paymentRequests.status,
    reviewNote: paymentRequests.reviewNote,
    reviewedAt: paymentRequests.reviewedAt,
    createdAt: paymentRequests.createdAt,
    submitterName: users.name,
    submitterEmail: users.email,
  }).from(paymentRequests).leftJoin(users, eq(paymentRequests.userId, users.id)).where(conditions).orderBy(desc(paymentRequests.createdAt)).limit(100);
}

export async function reviewPaymentRequest(input: { requestCode: string; status: Exclude<ReviewStatus, "pending_review">; reviewNote?: string }, reviewerId: number) {
  const db = await getDb();
  if (!db) throw new Error("Payment records are temporarily unavailable.");

  const note = validateReviewAction(input);
  const existing = await db.select({
    id: paymentRequests.id,
    userId: paymentRequests.userId,
    orderNumber: paymentRequests.orderNumber,
    serviceLabel: paymentRequests.serviceLabel,
    status: paymentRequests.status,
  }).from(paymentRequests).where(eq(paymentRequests.requestCode, input.requestCode)).limit(1);
  const request = existing[0];
  if (!request || !transitionableStatuses.includes(request.status as (typeof transitionableStatuses)[number])) {
    throw new TRPCError({ code: "CONFLICT", message: "This request was already reviewed or does not exist." });
  }

  const result = await db.update(paymentRequests).set({
    status: input.status,
    reviewNote: note,
    reviewedByUserId: reviewerId,
    reviewedAt: new Date(),
  }).where(and(
    eq(paymentRequests.requestCode, input.requestCode),
    inArray(paymentRequests.status, transitionableStatuses),
  ));

  if (result[0].affectedRows === 0) {
    throw new TRPCError({ code: "CONFLICT", message: "This request was already reviewed or does not exist." });
  }

  await createPaymentNotification({
    userId: request.userId,
    paymentRequestId: request.id,
    kind: input.status,
    orderNumber: request.orderNumber,
    serviceLabel: request.serviceLabel,
    reviewNote: note,
  });

  return { success: true as const, requestCode: input.requestCode, orderNumber: request.orderNumber, status: input.status };
}
