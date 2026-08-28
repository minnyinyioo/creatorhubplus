import { describe, expect, it, vi } from "vitest";
import { formatUnreadBadgeCount, requestMarkAllNotificationsRead } from "@/components/DashboardLayout";
import { buildOrdersCsv, escapeCsvField, exportOrdersCsvWithFeedback, filterAndSortInvoices, filterAndSortOrders, getAccountListState, getAccountRequestPresentation, getExportButtonLabel, searchOrders, statusCopy } from "./Account";

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

  it("filters invoices by query and sorts by amount without mutating the source", () => {
    const invoices = [
      { invoiceNumber: "INV-OLD", orderNumber: "ORD-OLD", serviceLabel: "Address service", status: "issued", amountMmk: 50000, issuedAt: new Date("2026-08-20") },
      { invoiceNumber: "INV-NEW", orderNumber: "ORD-NEW", serviceLabel: "Account setup", status: "issued", amountMmk: 150000, issuedAt: new Date("2026-08-25") },
    ];
    expect(filterAndSortInvoices(invoices, "account", "issued", "amount_high").map((invoice) => invoice.invoiceNumber)).toEqual(["INV-NEW"]);
    expect(filterAndSortInvoices(invoices, "", "all", "oldest").map((invoice) => invoice.invoiceNumber)).toEqual(["INV-OLD", "INV-NEW"]);
    expect(invoices.map((invoice) => invoice.invoiceNumber)).toEqual(["INV-OLD", "INV-NEW"]);
  });

  it("finds orders by order number or request code, case-insensitively", () => {
    const orders = [
      { orderNumber: "ORD-ALPHA", requestCode: "PR-100", status: "verified", createdAt: new Date("2026-08-20") },
      { orderNumber: "ORD-BETA", requestCode: "PR-200", status: "pending_review", createdAt: new Date("2026-08-21") },
    ];
    expect(searchOrders(orders, "beta").map((order) => order.orderNumber)).toEqual(["ORD-BETA"]);
    expect(searchOrders(orders, "PR-100").map((order) => order.orderNumber)).toEqual(["ORD-ALPHA"]);
    expect(searchOrders(orders, "")).toHaveLength(2);
  });

  it("switches export feedback text while the browser prepares the file", () => {
    expect(getExportButtonLabel(false)).toBe("Export CSV");
    expect(getExportButtonLabel(true)).toBe("Preparing CSV…");
  });

  it("runs the CSV export lifecycle and reports success or failure", async () => {
    const order = { orderNumber: "ORD-1", requestCode: "PR-1", serviceLabel: "Account setup", paymentMethod: "kbzpay", amountMmk: 100000, status: "verified", createdAt: new Date("2026-08-26T00:00:00Z") };
    const downloaded: unknown[] = [];
    const success = vi.fn();
    const error = vi.fn();
    await expect(exportOrdersCsvWithFeedback([order], { waitForPaint: async () => undefined, download: (orders) => downloaded.push(orders), onSuccess: success, onError: error })).resolves.toBe(true);
    expect(downloaded).toHaveLength(1);
    expect(success).toHaveBeenCalledWith(1);
    expect(error).not.toHaveBeenCalled();

    const failed = vi.fn(() => { throw new Error("disk full"); });
    const failedToast = vi.fn();
    await expect(exportOrdersCsvWithFeedback([order], { waitForPaint: async () => undefined, download: failed, onError: failedToast })).resolves.toBe(false);
    expect(failedToast).toHaveBeenCalledOnce();
  });

  it("creates a spreadsheet-friendly CSV with escaped review notes", () => {
    expect(escapeCsvField('note, "quoted"')).toBe('"note, ""quoted"""');
    const csv = buildOrdersCsv([{ orderNumber: "ORD-1", requestCode: "PR-1", serviceLabel: "Account setup", paymentMethod: "kbzpay", amountMmk: 100000, status: "clarification_requested", reviewNote: "Upload, then confirm", createdAt: new Date("2026-08-26T00:00:00Z") }]);
    expect(csv).toContain("Order number,Request code,Service");
    expect(csv).toContain('ORD-1,PR-1,Account setup,kbzpay,100000,Needs your reply,"Upload, then confirm"');
    expect(csv.charCodeAt(0)).toBe(0xfeff);
  });

  it("wires the notification menu bulk-read action safely", () => {
    const markAll = vi.fn();
    expect(requestMarkAllNotificationsRead(3, false, markAll)).toBe(true);
    expect(markAll).toHaveBeenCalledOnce();
    expect(requestMarkAllNotificationsRead(0, false, markAll)).toBe(false);
    expect(requestMarkAllNotificationsRead(2, true, markAll)).toBe(false);
    expect(markAll).toHaveBeenCalledOnce();
  });

  it("formats the navigation unread badge accessibly", () => {
    expect(formatUnreadBadgeCount(0)).toBeNull();
    expect(formatUnreadBadgeCount(undefined)).toBeNull();
    expect(formatUnreadBadgeCount(7)).toBe("7");
    expect(formatUnreadBadgeCount(100)).toBe("99+");
  });
});
