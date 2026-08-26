import { describe, expect, it } from "vitest";
import { formatUnreadBadgeCount } from "@/components/DashboardLayout";
import { buildOrdersCsv, escapeCsvField, filterAndSortOrders, getAccountListState, getAccountRequestPresentation, statusCopy } from "./Account";

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

  it("filters by status and date and leaves the source order list unchanged", () => {
    const orders = [
      { orderNumber: "old", status: "verified", createdAt: new Date("2026-07-01T00:00:00Z") },
      { orderNumber: "recent-pending", status: "pending_review", createdAt: new Date("2026-08-24T00:00:00Z") },
      { orderNumber: "recent-reply", status: "clarification_requested", createdAt: new Date("2026-08-25T00:00:00Z") },
    ];
    const filtered = filterAndSortOrders(orders, "needs_reply", "7d", "newest", new Date("2026-08-26T00:00:00Z"));
    expect(filtered.map((order) => order.orderNumber)).toEqual(["recent-reply"]);
    expect(orders.map((order) => order.orderNumber)).toEqual(["old", "recent-pending", "recent-reply"]);
    expect(filterAndSortOrders(orders, "all", "all", "oldest")[0].orderNumber).toBe("old");
  });

  it("creates a spreadsheet-friendly CSV with escaped review notes", () => {
    expect(escapeCsvField('note, "quoted"')).toBe('"note, ""quoted"""');
    const csv = buildOrdersCsv([{ orderNumber: "ORD-1", requestCode: "PR-1", serviceLabel: "Account setup", paymentMethod: "kbzpay", amountMmk: 100000, status: "clarification_requested", reviewNote: "Upload, then confirm", createdAt: new Date("2026-08-26T00:00:00Z") }]);
    expect(csv).toContain("Order number,Request code,Service");
    expect(csv).toContain('ORD-1,PR-1,Account setup,kbzpay,100000,Needs your reply,"Upload, then confirm"');
    expect(csv.charCodeAt(0)).toBe(0xfeff);
  });

  it("formats the navigation unread badge accessibly", () => {
    expect(formatUnreadBadgeCount(0)).toBeNull();
    expect(formatUnreadBadgeCount(undefined)).toBeNull();
    expect(formatUnreadBadgeCount(7)).toBe("7");
    expect(formatUnreadBadgeCount(100)).toBe("99+");
  });
});
