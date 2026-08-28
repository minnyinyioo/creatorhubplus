import React, { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  requests: { data: undefined as unknown, isLoading: false, isError: false },
  notifications: { data: undefined as unknown, isLoading: false, isError: false },
  unread: { data: undefined as unknown, isLoading: false, isError: false },
  invoices: { data: undefined as unknown, isLoading: false, isError: false },
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    paymentRequest: { listMine: { useQuery: () => state.requests } },
    invoice: { listMine: { useQuery: () => state.invoices }, downloadUrl: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) } },
    paymentNotification: {
      listMine: { useQuery: () => state.notifications },
      unreadCount: { useQuery: () => state.unread },
      markRead: { useMutation: () => ({ mutate: vi.fn() }) },
      markAllRead: { useMutation: () => ({ mutate: vi.fn() }) },
    },
    useUtils: () => ({ paymentNotification: { listMine: { invalidate: vi.fn() }, unreadCount: { invalidate: vi.fn() } } }),
  },
}));

vi.mock("@/components/DashboardLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => createElement("main", null, children),
}));

vi.mock("wouter", () => ({
  Link: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => createElement("a", { href, ...props }, children),
}));

vi.stubGlobal("React", React);
const { default: Account } = await import("./Account");

function resetState() {
  state.requests = { data: undefined, isLoading: false, isError: false };
  state.notifications = { data: undefined, isLoading: false, isError: false };
  state.unread = { data: undefined, isLoading: false, isError: false };
  state.invoices = { data: undefined, isLoading: false, isError: false };
}

function renderAccount() {
  return renderToStaticMarkup(createElement(Account));
}

describe("personal centre component states", () => {
  beforeEach(resetState);

  it("renders loading feedback for authenticated queries", () => {
    state.requests = { data: undefined, isLoading: true, isError: false };
    state.notifications = { data: undefined, isLoading: true, isError: false };
    const html = renderAccount();
    expect(html).toContain("Loading your payment history");
    expect(html).toContain("Loading notifications");
  });

  it("renders explicit query errors and keeps the summary honest", () => {
    state.requests = { data: undefined, isLoading: false, isError: true };
    state.notifications = { data: undefined, isLoading: false, isError: true };
    state.unread = { data: undefined, isLoading: false, isError: true };
    const html = renderAccount();
    expect(html).toContain("couldn’t load your payment history");
    expect(html).toContain("couldn’t load your notifications");
    expect(html).toContain("Unable to load updates");
  });

  it("renders an empty state when the account has no orders or updates", () => {
    state.requests = { data: [], isLoading: false, isError: false };
    state.notifications = { data: [], isLoading: false, isError: false };
    state.unread = { data: 0, isLoading: false, isError: false };
    const html = renderAccount();
    expect(html).toContain("No payment orders match these filters yet");
    expect(html).toContain("New payment-review updates will appear here");
  });

  it("renders the payment case-ledger route as a structural part of the page", () => {
    const html = renderAccount();
    expect(html).toContain("case-ledger-page");
    expect(html).toContain("case-route-rail");
    expect(html).toContain("01");
    expect(html).toContain("Payment record");
    expect(html).toContain("Review update");
    expect(html).toContain("Next action");
  });

  it("renders order status, staff note and next step for a real review update", () => {
    state.requests = {
      data: [{ requestCode: "PR-TEST", orderNumber: "ORD-TEST", serviceKey: "account_setup", serviceLabel: "Account setup", paymentMethod: "kbzpay", amountMmk: 150000, status: "clarification_requested", reviewNote: "Upload the complete receipt.", createdAt: new Date("2026-08-26T00:00:00Z") }],
      isLoading: false,
      isError: false,
    };
    state.notifications = { data: [{ id: 1, title: "Clarification needed", message: "Upload the complete receipt.", readAt: null, createdAt: new Date("2026-08-26T00:00:00Z") }], isLoading: false, isError: false };
    state.unread = { data: 1, isLoading: false, isError: false };
    const html = renderAccount();
    expect(html).toContain("ORD-TEST");
    expect(html).toContain("Needs your reply");
    expect(html).toContain("Read the staff note and submit the missing clarification");
    expect(html).toContain("Staff note: Upload the complete receipt.");
    expect(html).toContain("Clarification needed");
  });
});
