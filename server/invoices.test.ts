import { beforeEach, describe, expect, it, vi } from "vitest";

const { getDbMock, storagePutMock, storageGetSignedUrlMock } = vi.hoisted(() => ({
  getDbMock: vi.fn(),
  storagePutMock: vi.fn(),
  storageGetSignedUrlMock: vi.fn(),
}));
vi.mock("./db", () => ({ getDb: getDbMock }));
vi.mock("./storage", () => ({ storagePut: storagePutMock, storageGetSignedUrl: storageGetSignedUrlMock }));

import { appRouter } from "./routers";
import { buildInvoiceNumber, createInvoicePdf, getInvoiceDownloadUrl, issueInvoiceForVerifiedPayment } from "./invoices";
import type { TrpcContext } from "./_core/context";

beforeEach(() => vi.clearAllMocks());

function userContext(id = 8): TrpcContext {
  return {
    user: { id, openId: `user-${id}`, email: `user${id}@example.com`, name: "Test User", loginMethod: "test", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("electronic invoices", () => {
  it("builds an immutable-looking invoice number from the order and issue date", () => {
    expect(buildInvoiceNumber("ORD-2026-ABCD", new Date("2026-08-26T10:00:00Z"))).toBe("INV-20260826-ORD2026ABCD");
  });

  it("renders a branded PDF document", async () => {
    const pdf = await createInvoicePdf({
      invoiceNumber: "INV-20260826-ORD2026ABCD",
      orderNumber: "ORD-2026-ABCD",
      customerName: "Test User",
      customerEmail: "user@example.com",
      serviceLabel: "Account setup",
      paymentMethod: "KBZ Pay",
      amountMmk: 50000,
      issuedAt: new Date("2026-08-26T10:00:00Z"),
    });
    expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
    expect(pdf.length).toBeGreaterThan(1000);
  });

  it("rejects invoice listing and download without an authenticated user", async () => {
    const caller = appRouter.createCaller({ user: null, req: {} as TrpcContext["req"], res: {} as TrpcContext["res"] });
    await expect(caller.invoice.listMine()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.invoice.downloadUrl({ id: 1 })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    expect(getDbMock).not.toHaveBeenCalled();
  });

  it("creates one invoice and reuses it on repeated generation attempts", async () => {
    const request = { id: 44, userId: 8, orderNumber: "ORD-2026-44", serviceLabel: "Account setup", payerName: "Test User", paymentMethod: "kbzpay", amountMmk: 50000, status: "verified", customerEmail: "user@example.com" };
    const created = { id: 1, paymentRequestId: 44, userId: 8, invoiceNumber: "INV-20260826-ORD202644", orderNumber: "ORD-2026-44", serviceLabel: "Account setup", customerName: "Test User", customerEmail: "user@example.com", paymentMethod: "kbzpay", amountMmk: 50000, currency: "MMK", status: "issued", pdfStorageKey: "invoices/INV-20260826-ORD202644.pdf", pdfUrl: "/manus-storage/invoices/INV-20260826-ORD202644.pdf", complianceNote: "This electronic invoice confirms a payment request marked as verified by CreatorHubPlus. Keep it for your records.", issuedAt: new Date(), createdAt: new Date() };
    const chain = (rows: unknown[]) => {
      const where = vi.fn(() => ({ limit: vi.fn().mockResolvedValue(rows) }));
      return { from: vi.fn(() => ({ where, leftJoin: vi.fn(() => ({ where })) })) };
    };
    const select = vi.fn()
      .mockImplementationOnce(() => chain([]))
      .mockImplementationOnce(() => chain([request]))
      .mockImplementationOnce(() => chain([created]))
      .mockImplementationOnce(() => chain([created]));
    const values = vi.fn().mockResolvedValue(undefined);
    getDbMock.mockResolvedValue({ select, insert: vi.fn(() => ({ values })) });
    storagePutMock.mockResolvedValue({ key: created.pdfStorageKey, url: created.pdfUrl });

    await expect(issueInvoiceForVerifiedPayment(44)).resolves.toMatchObject({ invoiceNumber: created.invoiceNumber });
    await expect(issueInvoiceForVerifiedPayment(44)).resolves.toMatchObject({ invoiceNumber: created.invoiceNumber });
    expect(storagePutMock).toHaveBeenCalledTimes(1);
    expect(values).toHaveBeenCalledTimes(1);
  });

  it("scopes download lookup to the authenticated user", async () => {
    const limit = vi.fn().mockResolvedValue([{ storageKey: "invoices/INV-1.pdf", invoiceNumber: "INV-1" }]);
    const where = vi.fn(() => ({ limit }));
    const from = vi.fn(() => ({ where }));
    getDbMock.mockResolvedValue({ select: vi.fn(() => ({ from })) });
    storageGetSignedUrlMock.mockResolvedValue("https://signed.example/invoice.pdf");

    await expect(getInvoiceDownloadUrl(8, 1)).resolves.toEqual({ invoiceNumber: "INV-1", url: "https://signed.example/invoice.pdf" });
    expect(where).toHaveBeenCalledTimes(1);
    expect(storageGetSignedUrlMock).toHaveBeenCalledWith("invoices/INV-1.pdf");
  });
});
