// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  mutate: vi.fn(),
  invalidate: vi.fn(),
}));

vi.mock("@/components/DashboardLayout", () => ({ default: ({ children }: { children: React.ReactNode }) => React.createElement("main", null, children) }));
vi.mock("@/_core/hooks/useAuth", () => ({ useAuth: () => ({ user: { name: "Admin", role: "admin" }, loading: false, logout: vi.fn() }) }));
vi.mock("@/lib/trpc", () => ({
  trpc: {
    paymentReview: {
      list: { useQuery: () => ({ data: [{ requestCode: "REQ-1", status: "pending_review", amountMmk: 100000, payerName: "Payer", paymentMethod: "KBZ Pay", serviceLabel: "Platform earnings", createdAt: new Date("2026-08-26T00:00:00Z"), accountHint: "09", submitterName: "Payer", submitterEmail: "payer@example.com", receiptName: "receipt.jpg", receiptUrl: "https://example.com/receipt.jpg", receiptContentType: "image/jpeg", paymentReference: "REF-1" }], isLoading: false, isFetching: false, error: null, refetch: vi.fn() }) },
      update: { useMutation: ({ onSuccess }: { onSuccess?: (result: { requestCode: string; status: string }) => void }) => ({ isPending: false, mutate: (input: unknown) => { state.mutate(input); onSuccess?.({ requestCode: "REQ-1", status: String((input as { status: string }).status) }); } }) },
    },
    useUtils: () => ({ paymentReview: { list: { invalidate: state.invalidate } } }),
  },
}));
vi.mock("@/components/ui/button", () => ({ Button: ({ children, onClick, disabled, className, ...props }: { children?: React.ReactNode; onClick?: () => void; disabled?: boolean; className?: string; [key: string]: unknown }) => React.createElement("button", { ...props, type: "button", onClick, disabled, className }, children) }));

vi.stubGlobal("React", React);
let StaffReviewContent: React.ComponentType;
let reviewActionLabel: (defaultLabel: string, isPending: boolean) => string;

beforeAll(async () => {
  ({ StaffReviewContent, reviewActionLabel } = await import("./StaffReview"));
});
beforeEach(() => vi.clearAllMocks());
afterEach(() => cleanup());

describe("staff review quick actions rendered", () => {
  it("renders the receipt-to-decision case route as part of the review desk", () => {
    render(React.createElement(StaffReviewContent));
    expect(document.querySelector(".case-route-rail")).toBeTruthy();
    expect(screen.getByText("Receipt")).toBeTruthy();
    expect(screen.getByText("Recipient match")).toBeTruthy();
    expect(screen.getByText("Review decision")).toBeTruthy();
  });

  it("uses an explicit saving label while a review mutation is pending", () => {
    expect(reviewActionLabel("Approve payment", true)).toBe("Saving review…");
    expect(reviewActionLabel("Approve payment", false)).toBe("Approve payment");
  });
  it("exposes approve and reject shortcuts and sends the selected request to the real mutation", async () => {
    render(React.createElement(StaffReviewContent));
    await waitFor(() => expect(screen.getByRole("button", { name: "Approve payment REQ-1" })).toBeTruthy());
    fireEvent.click(screen.getByRole("button", { name: "Approve payment REQ-1" }));
    expect(state.mutate).toHaveBeenCalledWith({ requestCode: "REQ-1", status: "verified", reviewNote: undefined });
    fireEvent.click(screen.getByRole("button", { name: "Reject payment REQ-1" }));
    expect(state.mutate).toHaveBeenCalledWith({ requestCode: "REQ-1", status: "rejected", reviewNote: undefined });
  });
});
