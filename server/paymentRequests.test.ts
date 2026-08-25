import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { canTransitionReviewStatus, validateReviewAction } from "./paymentReview";
import { merchantRecipientInputSchema } from "./merchantRecipients";
import { validateReceiptUpload } from "./paymentRequests";

const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function createContext(role: "user" | "admin"): TrpcContext {
  return {
    user: {
      id: role === "admin" ? 7 : 8,
      openId: `${role}-test-user`,
      email: `${role}@example.com`,
      name: role === "admin" ? "Review Staff" : "Applicant",
      loginMethod: "test",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("receipt upload validation", () => {
  it("accepts a signature-matching PNG upload", () => {
    expect(() => validateReceiptUpload({
      buffer: Buffer.concat([pngHeader, Buffer.from("receipt")]),
      mimetype: "image/png",
      originalname: "receipt.png",
      size: pngHeader.length + 7,
    })).not.toThrow();
  });

  it("rejects a file whose bytes do not match its declared type", () => {
    expect(() => validateReceiptUpload({
      buffer: Buffer.from("not-a-png"),
      mimetype: "image/png",
      originalname: "receipt.png",
      size: 9,
    })).toThrow("does not match");
  });
});

describe("review transitions", () => {
  it("allows only open requests to move into a review outcome", () => {
    expect(canTransitionReviewStatus("pending_review", "verified")).toBe(true);
    expect(canTransitionReviewStatus("clarification_requested", "rejected")).toBe(true);
    expect(canTransitionReviewStatus("verified", "rejected")).toBe(false);
  });

  it("requires a note when requesting clarification", () => {
    expect(() => validateReviewAction({ status: "clarification_requested" })).toThrow("clarification");
    expect(validateReviewAction({ status: "clarification_requested", reviewNote: "Please upload the full receipt." })).toBe("Please upload the full receipt.");
  });
});

describe("merchant recipient validation", () => {
  it("accepts a permanent internal QR asset path", () => {
    expect(merchantRecipientInputSchema.parse({
      paymentMethod: "wavepay",
      providerLabel: "Wave Pay",
      kind: "Wallet",
      accountName: "Verified Merchant",
      accountIdentifier: "09 123 456 789",
      instructions: "Open the official Wave app and confirm the verified account name.",
      qrUrl: "/manus-storage/wave-verified-qr.png",
      isActive: true,
    }).qrUrl).toBe("/manus-storage/wave-verified-qr.png");
  });
});

describe("paymentReview authorization", () => {
  it("rejects a signed-in applicant before touching review data", async () => {
    const caller = appRouter.createCaller(createContext("user"));
    await expect(caller.paymentReview.list({})).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
