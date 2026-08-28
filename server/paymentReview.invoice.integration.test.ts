import { describe, expect, it, vi } from "vitest";

const { getDbMock, storagePutMock, storageGetSignedUrlMock } = vi.hoisted(() => ({
  getDbMock: vi.fn(),
  storagePutMock: vi.fn(),
  storageGetSignedUrlMock: vi.fn(),
}));
vi.mock("./db", () => ({ getDb: getDbMock }));
vi.mock("./storage", () => ({ storagePut: storagePutMock, storageGetSignedUrl: storageGetSignedUrlMock }));

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function adminContext(): TrpcContext {
  return {
    user: { id: 7, openId: "admin-test", email: "admin@example.com", name: "Review Staff", loginMethod: "test", role: "admin", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("verified payment invoice flow", () => {
  it("persists exactly one invoice and one PDF upload during verification", async () => {
    const pendingRequest = { id: 44, userId: 8, orderNumber: "ORD-2026-44", serviceLabel: "Account setup", status: "pending_review" };
    const verifiedRequest = { ...pendingRequest, payerName: "Test User", paymentMethod: "kbzpay", amountMmk: 50000, customerEmail: "user@example.com", status: "verified" };
    const invoice = { id: 1, paymentRequestId: 44, userId: 8, invoiceNumber: "INV-20260826-ORD202644", orderNumber: "ORD-2026-44", serviceLabel: "Account setup", customerName: "Test User", customerEmail: "user@example.com", paymentMethod: "kbzpay", amountMmk: 50000, currency: "MMK", status: "issued", pdfStorageKey: "invoices/INV-20260826-ORD202644.pdf", pdfUrl: "/manus-storage/invoices/INV-20260826-ORD202644.pdf", complianceNote: "This electronic invoice confirms a payment request marked as verified by CreatorHubPlus. Keep it for your records.", issuedAt: new Date(), createdAt: new Date() };
    const selectRows = [[pendingRequest], [], [verifiedRequest], [invoice]];
    const select = vi.fn(() => {
      const rows = selectRows.shift();
      const where = vi.fn(() => ({ limit: vi.fn().mockResolvedValue(rows) }));
      return { from: vi.fn(() => ({ where, leftJoin: vi.fn(() => ({ where })) })) };
    });
    const update = vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn().mockResolvedValue([{ affectedRows: 1 }]) })) }));
    const values = vi.fn().mockResolvedValue(undefined);
    getDbMock.mockResolvedValue({ select, update, insert: vi.fn(() => ({ values })) });
    storagePutMock.mockResolvedValue({ key: invoice.pdfStorageKey, url: invoice.pdfUrl });

    const result = await appRouter.createCaller(adminContext()).paymentReview.update({ requestCode: "PR-TEST-44", status: "verified" });

    expect(result).toMatchObject({ status: "verified", orderNumber: "ORD-2026-44" });
    expect(storagePutMock).toHaveBeenCalledTimes(1);
    expect(values).toHaveBeenCalledWith(expect.objectContaining({ paymentRequestId: 44, userId: 8, invoiceNumber: expect.stringMatching(/^INV-/), pdfStorageKey: invoice.pdfStorageKey }));
    expect(values).toHaveBeenCalledTimes(2);
  });
});
