import { and, desc, eq, inArray } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { supportCases, users } from "../drizzle/schema";
import { getDb } from "./db";

export const CASE_SERVICE_KEYS = [
  "platform_earnings",
  "payout_receiving",
  "account_setup",
  "address_support",
] as const;

export const caseServiceKeySchema = z.enum(CASE_SERVICE_KEYS);

const serviceLabels: Record<(typeof CASE_SERVICE_KEYS)[number], string> = {
  platform_earnings: "Platform earnings",
  payout_receiving: "Payout & receiving",
  account_setup: "Account setup",
  address_support: "Address support",
};

export const supportCaseInputSchema = z.object({
  serviceKey: caseServiceKeySchema,
  platformName: z.string().trim().min(2).max(100),
  issueSummary: z.string().trim().min(4).max(180),
  details: z.string().trim().min(20).max(2000),
});

export type SupportCaseInput = z.infer<typeof supportCaseInputSchema>;

export const CASE_STATUSES = ["open", "clarification_requested", "resolved", "closed"] as const;
export type CaseStatus = (typeof CASE_STATUSES)[number];
const openCaseStatuses = ["open", "clarification_requested"] as const;

export function canTransitionCaseStatus(current: CaseStatus, next: Exclude<CaseStatus, "open">) {
  if (!openCaseStatuses.includes(current as (typeof openCaseStatuses)[number])) return false;
  return ["clarification_requested", "resolved", "closed"].includes(next);
}

export function validateCaseReviewAction(input: { status: Exclude<CaseStatus, "open">; staffNote?: string }) {
  const note = input.staffNote?.trim() || null;
  if (input.status === "clarification_requested" && !note) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Add a note explaining what clarification is needed." });
  }
  if (note && note.length > 2000) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Staff notes must be 2,000 characters or fewer." });
  }
  return note;
}

export async function createSupportCase(userId: number, input: SupportCaseInput) {
  const db = await getDb();
  if (!db) throw new Error("Support cases are temporarily unavailable.");

  const parsed = supportCaseInputSchema.parse(input);
  const caseCode = `CS-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
  await db.insert(supportCases).values({
    userId,
    caseCode,
    serviceKey: parsed.serviceKey,
    serviceLabel: serviceLabels[parsed.serviceKey],
    platformName: parsed.platformName,
    issueSummary: parsed.issueSummary,
    details: parsed.details,
  });

  return { caseCode, status: "open" as const };
}

export async function listSupportCasesForUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Support cases are temporarily unavailable.");

  return db.select({
    caseCode: supportCases.caseCode,
    serviceLabel: supportCases.serviceLabel,
    platformName: supportCases.platformName,
    issueSummary: supportCases.issueSummary,
    status: supportCases.status,
    staffNote: supportCases.staffNote,
    createdAt: supportCases.createdAt,
    updatedAt: supportCases.updatedAt,
  }).from(supportCases).where(eq(supportCases.userId, userId)).orderBy(desc(supportCases.createdAt)).limit(12);
}

export async function listSupportCasesForReview(status?: CaseStatus) {
  const db = await getDb();
  if (!db) throw new Error("Support cases are temporarily unavailable.");

  const conditions = status ? eq(supportCases.status, status) : inArray(supportCases.status, openCaseStatuses);
  return db.select({
    id: supportCases.id,
    caseCode: supportCases.caseCode,
    serviceKey: supportCases.serviceKey,
    serviceLabel: supportCases.serviceLabel,
    platformName: supportCases.platformName,
    issueSummary: supportCases.issueSummary,
    details: supportCases.details,
    status: supportCases.status,
    staffNote: supportCases.staffNote,
    reviewedAt: supportCases.reviewedAt,
    createdAt: supportCases.createdAt,
    updatedAt: supportCases.updatedAt,
    submitterName: users.name,
    submitterEmail: users.email,
  }).from(supportCases).leftJoin(users, eq(supportCases.userId, users.id)).where(conditions).orderBy(desc(supportCases.createdAt)).limit(100);
}

export async function reviewSupportCase(input: { caseCode: string; status: Exclude<CaseStatus, "open">; staffNote?: string }, reviewerId: number) {
  const db = await getDb();
  if (!db) throw new Error("Support cases are temporarily unavailable.");

  const note = validateCaseReviewAction(input);
  const result = await db.update(supportCases).set({
    status: input.status,
    staffNote: note,
    reviewedByUserId: reviewerId,
    reviewedAt: new Date(),
  }).where(and(
    eq(supportCases.caseCode, input.caseCode),
    inArray(supportCases.status, openCaseStatuses),
  ));

  if (result[0].affectedRows === 0) {
    throw new TRPCError({ code: "CONFLICT", message: "This case was already updated or does not exist." });
  }

  return { success: true as const, caseCode: input.caseCode, status: input.status };
}
