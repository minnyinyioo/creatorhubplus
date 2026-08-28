import { describe, expect, it, vi } from "vitest";
import { runProtectedAction } from "./Home";

describe("public protected-action gate", () => {
  it("does not execute a payment or case action before authentication", () => {
    const authorized = vi.fn();
    const unauthenticated = vi.fn();
    expect(runProtectedAction(false, authorized, unauthenticated)).toBe("authentication_required");
    expect(authorized).not.toHaveBeenCalled();
    expect(unauthenticated).toHaveBeenCalledOnce();
  });

  it("continues the requested action for an authenticated user", () => {
    const authorized = vi.fn();
    expect(runProtectedAction(true, authorized, vi.fn())).toBe("authorized");
    expect(authorized).toHaveBeenCalledOnce();
  });

  it.each([
    "Continue with this case",
    "Start a support case",
    "ဤတောင်းဆိုမှုဖြင့် ဆက်လက်ရန်",
    "အကူအညီတောင်းဆိုမှု စတင်ရန်",
  ])("keeps %s behind the shared authentication guard", () => {
    const beginWrite = vi.fn();
    const startAuthentication = vi.fn();
    expect(runProtectedAction(false, beginWrite, startAuthentication)).toBe("authentication_required");
    expect(beginWrite).not.toHaveBeenCalled();
    expect(startAuthentication).toHaveBeenCalledOnce();
  });
});
