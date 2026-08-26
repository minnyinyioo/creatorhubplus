import { describe, expect, it } from "vitest";
import { paymentCatalogDefaults, paymentServicePriceUpdateSchema } from "./paymentCatalog";
import { appRouter } from "./routers";
import { getPaymentNotificationCopy } from "./paymentNotifications";
import type { TrpcContext } from "./_core/context";

function userContext(): TrpcContext {
  return {
    user: { id: 8, openId: "user-test", email: "user@example.com", name: "Applicant", loginMethod: "test", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("server-controlled payment catalog", () => {
  it("defines the supported service paths", () => {
    expect(paymentCatalogDefaults.map((item) => item.serviceKey)).toEqual([
      "platform_earnings",
      "payout_receiving",
      "account_setup",
      "address_support",
    ]);
  });

  it("accepts a non-negative MMK price or an explicit quote-required null", () => {
    expect(paymentServicePriceUpdateSchema.parse({ serviceKey: "account_setup", priceMmk: "150000" }).priceMmk).toBe(150000);
    expect(paymentServicePriceUpdateSchema.parse({ serviceKey: "account_setup", priceMmk: null }).priceMmk).toBeNull();
    expect(() => paymentServicePriceUpdateSchema.parse({ serviceKey: "account_setup", priceMmk: -1 })).toThrow();
  });

  it("does not expose price mutation to applicants", async () => {
    const caller = appRouter.createCaller(userContext());
    await expect(caller.paymentCatalog.updatePrice({ serviceKey: "account_setup", priceMmk: 150000 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("creates actionable review copy for each user-facing status", () => {
    expect(getPaymentNotificationCopy({ kind: "clarification_requested", orderNumber: "ORD-123", reviewNote: "Please upload the full receipt." }).message).toContain("Please upload the full receipt.");
    expect(getPaymentNotificationCopy({ kind: "verified", orderNumber: "ORD-123", serviceLabel: "Payout & receiving" }).title).toContain("ORD-123");
    expect(getPaymentNotificationCopy({ kind: "submitted", orderNumber: "ORD-123", serviceLabel: "Account setup" }).message).toContain("Account setup");
  });
});
