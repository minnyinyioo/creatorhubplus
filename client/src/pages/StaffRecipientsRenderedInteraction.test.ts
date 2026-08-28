// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("@/_core/hooks/useAuth", () => ({ useAuth: () => ({ user: { name: "Admin", role: "admin" }, loading: false }) }));
vi.mock("@/components/DashboardLayout", () => ({ default: ({ children }: { children: React.ReactNode }) => React.createElement("main", null, children) }));
vi.mock("@/components/ui/button", () => ({ Button: ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) => React.createElement("button", props, children) }));
vi.mock("@/lib/trpc", () => ({ trpc: { merchantRecipient: { list: { useQuery: () => ({ data: [], refetch: vi.fn() }) }, upsert: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) } } } }));

vi.stubGlobal("React", React);
let StaffRecipientsContent: React.ComponentType;
beforeAll(async () => ({ StaffRecipientsContent } = await import("./StaffRecipients")));
afterEach(() => cleanup());

describe("merchant recipient case-ledger structure", () => {
  it("renders the provider-to-publish route rail as part of the working desk", () => {
    render(React.createElement(StaffRecipientsContent));
    expect(document.querySelector(".case-ledger-page")).toBeTruthy();
    expect(document.querySelector(".case-route-rail")).toBeTruthy();
    expect(screen.getByText("Provider")).toBeTruthy();
    expect(screen.getByText("Verify destination")).toBeTruthy();
    expect(screen.getByText("Publish route")).toBeTruthy();
  });
});
