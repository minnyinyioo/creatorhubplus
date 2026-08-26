import { describe, expect, it } from "vitest";
import { quickReviewActionLabels } from "./StaffReview";

describe("staff payment review quick actions", () => {
  it("exposes explicit approve and reject labels for one-click review actions", () => {
    expect(quickReviewActionLabels.approve).toBe("Approve payment");
    expect(quickReviewActionLabels.reject).toBe("Reject payment");
  });
});
