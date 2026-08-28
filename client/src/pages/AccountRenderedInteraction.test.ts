// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "sonner";

const state = vi.hoisted(() => ({
  requests: { data: [{ requestCode: "PR-TEST", orderNumber: "ORD-TEST", serviceKey: "account_setup", serviceLabel: "Account setup", paymentMethod: "kbzpay", amountMmk: 150000, status: "verified", reviewNote: null, createdAt: new Date("2026-08-26T00:00:00Z") }], isLoading: false, isError: false },
  notifications: { data: [{ id: 1, title: "Verified", message: "Your payment is verified.", readAt: null, createdAt: new Date("2026-08-26T00:00:00Z") }], isLoading: false, isError: false },
  unread: { data: 1, isLoading: false, isError: false },
  invoices: { data: [], isLoading: false, isError: false },
  markAll: vi.fn(),
}));

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/components/DashboardLayout", () => ({ default: ({ children }: { children: React.ReactNode }) => React.createElement("main", null, children) }));
vi.mock("wouter", () => ({ Link: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => React.createElement("a", { href, ...props }, children) }));
vi.mock("@/lib/trpc", () => ({
  trpc: {
    paymentRequest: { listMine: { useQuery: () => state.requests } },
    invoice: { listMine: { useQuery: () => state.invoices }, downloadUrl: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) } },
    paymentNotification: {
      listMine: { useQuery: () => state.notifications },
      unreadCount: { useQuery: () => state.unread },
      markRead: { useMutation: () => ({ mutate: vi.fn() }) },
      markAllRead: { useMutation: () => ({ mutate: state.markAll }) },
    },
    useUtils: () => ({ paymentNotification: { listMine: { invalidate: vi.fn() }, unreadCount: { invalidate: vi.fn() } } }),
  },
}));

vi.stubGlobal("React", React);
let Account: React.ComponentType;

afterEach(() => cleanup());

beforeEach(async () => {
  if (!Account) ({ default: Account } = await import("./Account"));
  vi.clearAllMocks();
  state.unread.data = 1;
  Object.defineProperty(URL, "createObjectURL", { configurable: true, value: vi.fn(() => "blob:test") });
  Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: vi.fn() });
});

describe("account center rendered interactions", () => {
  it("shows the export spinner while preparing and reports a success toast", async () => {
    let releaseFrame: (() => void) | undefined;
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { releaseFrame = () => callback(0); return 1; });
    render(React.createElement(Account));
    fireEvent.click(screen.getByRole("button", { name: /Export CSV/i }));
    expect(screen.getByRole("button", { name: /Preparing CSV/i })).toBeTruthy();
    releaseFrame?.();
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("1 order exported as CSV."));
    expect(screen.getByRole("button", { name: /Export CSV/i })).toBeTruthy();
  });

  it("reports an error toast when the browser cannot create the CSV download", async () => {
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { callback(0); return 1; });
    Object.defineProperty(URL, "createObjectURL", { configurable: true, value: vi.fn(() => { throw new Error("blocked"); }) });
    render(React.createElement(Account));
    fireEvent.click(screen.getByRole("button", { name: /Export CSV/i }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("We couldn’t export your order history. Please try again."));
  });

});
