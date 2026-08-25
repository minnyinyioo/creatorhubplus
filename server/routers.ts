import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { listMerchantRecipients, getActiveMerchantRecipient, merchantRecipientInputSchema, upsertMerchantRecipient } from "./merchantRecipients";
import { listPaymentRequestsForReview, reviewPaymentRequest, REVIEW_STATUSES } from "./paymentReview";
import { listPaymentRequestsForUser, paymentMethodSchema } from "./paymentRequests";
import { CASE_STATUSES, caseServiceKeySchema, createSupportCase, listSupportCasesForReview, listSupportCasesForUser, reviewSupportCase } from "./supportCases";
import { archiveWorkspaceTask, createWorkspaceTask, deleteWorkspaceTask, listArchivedWorkspaceTasks, listWorkspaceTasks, updateWorkspaceTask, workspaceTaskArchiveSchema, workspaceTaskCreateSchema, workspaceTaskDeleteSchema, workspaceTaskUpdateSchema, workspaceViewKeySchema } from "./workspaceTasks";
import { createLibraryItem, deleteLibraryItem, libraryItemCreateSchema, libraryItemDeleteSchema, libraryItemUpdateSchema, listLibraryItems, updateLibraryItem } from "./workspaceLibrary";
import { getWorkspaceSettings, updateWorkspaceSettings, workspaceSettingsUpdateSchema } from "./workspaceSettings";

const reviewStatusSchema = z.enum(REVIEW_STATUSES);
const caseStatusSchema = z.enum(CASE_STATUSES);
const reviewActionSchema = z.object({
  requestCode: z.string().trim().min(1).max(32),
  status: z.enum(["clarification_requested", "verified", "rejected"]),
  reviewNote: z.string().trim().max(2000).optional(),
});
const caseInputSchema = z.object({
  serviceKey: caseServiceKeySchema,
  platformName: z.string().trim().min(2).max(100),
  issueSummary: z.string().trim().min(4).max(180),
  details: z.string().trim().min(20).max(2000),
});
const caseReviewActionSchema = z.object({
  caseCode: z.string().trim().min(1).max(32),
  status: z.enum(["clarification_requested", "resolved", "closed"]),
  staffNote: z.string().trim().max(2000).optional(),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  paymentRequest: router({
    listMine: protectedProcedure.query(({ ctx }) => listPaymentRequestsForUser(ctx.user.id)),
    recipient: publicProcedure.input(z.object({ paymentMethod: paymentMethodSchema })).query(({ input }) => getActiveMerchantRecipient(input.paymentMethod)),
  }),
  supportCase: router({
    create: protectedProcedure.input(caseInputSchema).mutation(({ ctx, input }) => createSupportCase(ctx.user.id, input)),
    listMine: protectedProcedure.query(({ ctx }) => listSupportCasesForUser(ctx.user.id)),
    listForReview: adminProcedure.input(z.object({ status: caseStatusSchema.optional() }).optional()).query(({ input }) => listSupportCasesForReview(input?.status)),
    review: adminProcedure.input(caseReviewActionSchema).mutation(({ ctx, input }) => reviewSupportCase(input, ctx.user.id)),
  }),
  workspaceTask: router({
    list: protectedProcedure.input(z.object({ viewKey: workspaceViewKeySchema.optional() }).optional()).query(({ ctx, input }) => listWorkspaceTasks(ctx.user.id, input?.viewKey)),
    listArchived: protectedProcedure.query(({ ctx }) => listArchivedWorkspaceTasks(ctx.user.id)),
    create: protectedProcedure.input(workspaceTaskCreateSchema).mutation(({ ctx, input }) => createWorkspaceTask(ctx.user.id, input)),
    update: protectedProcedure.input(workspaceTaskUpdateSchema).mutation(({ ctx, input }) => updateWorkspaceTask(ctx.user.id, input)),
    archive: protectedProcedure.input(workspaceTaskArchiveSchema).mutation(({ ctx, input }) => archiveWorkspaceTask(ctx.user.id, input)),
    delete: protectedProcedure.input(workspaceTaskDeleteSchema).mutation(({ ctx, input }) => deleteWorkspaceTask(ctx.user.id, input.id)),
  }),
  workspaceLibrary: router({
    list: protectedProcedure.query(({ ctx }) => listLibraryItems(ctx.user.id)),
    create: protectedProcedure.input(libraryItemCreateSchema).mutation(({ ctx, input }) => createLibraryItem(ctx.user.id, input)),
    update: protectedProcedure.input(libraryItemUpdateSchema).mutation(({ ctx, input }) => updateLibraryItem(ctx.user.id, input)),
    delete: protectedProcedure.input(libraryItemDeleteSchema).mutation(({ ctx, input }) => deleteLibraryItem(ctx.user.id, input.id)),
  }),
  workspaceSettings: router({
    get: protectedProcedure.query(({ ctx }) => getWorkspaceSettings(ctx.user.id)),
    update: protectedProcedure.input(workspaceSettingsUpdateSchema).mutation(({ ctx, input }) => updateWorkspaceSettings(ctx.user.id, input)),
  }),
  paymentReview: router({
    list: adminProcedure.input(z.object({ status: reviewStatusSchema.optional() }).optional()).query(({ input }) => listPaymentRequestsForReview(input?.status)),
    update: adminProcedure.input(reviewActionSchema).mutation(({ ctx, input }) => reviewPaymentRequest(input, ctx.user.id)),
  }),
  merchantRecipient: router({
    list: adminProcedure.query(() => listMerchantRecipients()),
    upsert: adminProcedure.input(merchantRecipientInputSchema).mutation(({ input }) => upsertMerchantRecipient(input)),
  }),
});

export type AppRouter = typeof appRouter;
