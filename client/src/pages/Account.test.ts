import { describe, expect, it } from "vitest";
import { getAccountListState, getAccountRequestPresentation, statusCopy } from "./Account";

describe("personal centre presentation", () => {
  it("distinguishes loading, error, empty and ready query states", () => {
    expect(getAccountListState(true, false, 0)).toBe("loading");
    expect(getAccountListState(false, true, 0)).toBe("error");
    expect(getAccountListState(false, false, 0)).toBe("empty");
    expect(getAccountListState(false, false, 1)).toBe("ready");
  });

  it("keeps review notes alongside an actionable next step", () => {
    const presentation = getAccountRequestPresentation("clarification_requested", "  Upload the full receipt.  ");
    expect(presentation.label).toBe("Needs your reply");
    expect(presentation.next).toContain("submit the missing clarification");
    expect(presentation.staffNote).toBe("Upload the full receipt.");
  });

  it("falls back to pending review for unknown or initial statuses", () => {
    expect(statusCopy("pending_review").label).toBe("Pending review");
    expect(statusCopy("unknown").tone).toBe("pending");
  });
});
