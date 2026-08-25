import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { listMerchantRecipients, getActiveMerchantRecipient, merchantRecipientInputSchema, upsertMerchantRecipient } from "./merchantRecipients";
import { listPaymentRequestsForReview, reviewPaymentRequest, REVIEW_STATUSES } from "./paymentReview";
import { listPaymentRequestsForUser, paymentMethodSchema } from "./paymentRequests";

const reviewStatusSchema = z.enum(REVIEW_STATUSES);
const reviewActionSchema = z.object({
  requestCode: z.string().trim().min(1).max(32),
  status: z.enum(["clarification_requested", "verified", "rejected"]),
  reviewNote: z.string().trim().max(2000).optional(),
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
