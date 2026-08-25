import { describe, expect, it } from "vitest";
import { decodeReceiptDataUrl, paymentRequestInputSchema } from "./paymentRequests";

describe("payment request validation", () => {
  it("accepts a minimal safe payment request payload", () => {
    const parsed = paymentRequestInputSchema.parse({
      paymentMethod: "kbzpay",
      payerName: "Payment Record",
      accountHint: "4821",
      amountMmk: 100000,
      paymentReference: "ref-01",
      receiptDataUrl: "data:image/png;base64,MTIzNDU2Nzg5MDEyMzQ1Njc4OTA=",
      receiptName: "receipt.png",
    });
    expect(parsed.amountMmk).toBe(100000);
  });

  it("rejects sensitive-looking account values and unsupported receipt content", () => {
    expect(() => paymentRequestInputSchema.parse({
      paymentMethod: "kbzpay", payerName: "Payment Record", accountHint: "123456789", amountMmk: 100000,
      receiptDataUrl: "data:image/png;base64,MTIzNDU2Nzg5MDEyMzQ1Njc4OTA=", receiptName: "receipt.png",
    })).toThrow();
    expect(() => decodeReceiptDataUrl("data:text/plain;base64,aGVsbG8=")).toThrow("PNG, JPG, WEBP or PDF");
  });
});
