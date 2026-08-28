import { beforeEach, describe, expect, it, vi } from "vitest";

const { getDbMock, issueInvoiceForVerifiedPaymentMock } = vi.hoisted(() => ({ getDbMock: vi.fn(), issueInvoiceForVerifiedPaymentMock: vi.fn().mockResolvedValue({ invoiceNumber: "INV-TEST" }) }));
vi.mock("./db", () => ({ getDb: getDbMock }));
vi.mock("./invoices", () => ({ issueInvoiceForVerifiedPayment: issueInvoiceForVerifiedPaymentMock }));

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function adminContext(): TrpcContext {
  return {
    user: { id: 7, openId: "admin-test", email: "admin@example.com", name: "Review Staff", loginMethod: "test", role: "admin", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function createReviewDb() {
  const insertValues = vi.fn().mockResolvedValue(undefined);
  const fakeDb = {
    select: vi.fn(() => ({ from: vi.fn(() => ({ where: vi.fn(() => ({ limit: vi.fn().mockResolvedValue([{ id: 44, userId: 8, orderNumber: "ORD-TEST-44", serviceLabel: "Account setup", status: "pending_review" }]) })) })) })),
    update: vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn().mockResolvedValue([{ affectedRows: 1 }]) })) })),
    insert: vi.fn(() => ({ values: insertValues })),
  };
  return { fakeDb, insertValues };
}

describe("payment review notification integration", () => {
  beforeEach(() => vi.clearAllMocks());

  it("writes a user notification after every review outcome", async () => {
    const { fakeDb, insertValues } = createReviewDb();
    getDbMock.mockResolvedValue(fakeDb);
    const caller = appRouter.createCaller(adminContext());

    for (const status of ["clarification_requested", "verified", "rejected"] as const) {
      await caller.paymentReview.update({ requestCode: "PR-TEST-44", status, reviewNote: status === "clarification_requested" ? "Please upload the complete receipt." : undefined });
      expect(insertValues).toHaveBeenLastCalledWith(expect.objectContaining({ userId: 8, paymentRequestId: 44, kind: status, title: expect.stringContaining("ORD-TEST-44") }));
    }
    expect(insertValues).toHaveBeenCalledTimes(3);
    expect(issueInvoiceForVerifiedPaymentMock).toHaveBeenCalledTimes(1);
    expect(issueInvoiceForVerifiedPaymentMock).toHaveBeenCalledWith(44);
  });
});
