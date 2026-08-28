import { describe, expect, it } from "vitest";
import { canBeginProtectedPayment, getInitialServiceKey } from "./PaymentRequest";

describe("service-first payment routing", () => {
  it("keeps direct payment entry locked until authentication and a service selection both exist", () => {
    expect(canBeginProtectedPayment(false, true)).toBe(false);
    expect(canBeginProtectedPayment(true, false)).toBe(false);
    expect(canBeginProtectedPayment(true, true)).toBe(true);
  });

  it("hydrates a valid service from a homepage payment link", () => {
    expect(getInitialServiceKey("?service=payout_receiving")).toBe("payout_receiving");
    expect(getInitialServiceKey("?service=platform_earnings")).toBe("platform_earnings");
  });

  it("does not hydrate unknown or missing service values", () => {
    expect(getInitialServiceKey("")).toBeNull();
    expect(getInitialServiceKey("?service=unknown_product")).toBeNull();
  });
});
