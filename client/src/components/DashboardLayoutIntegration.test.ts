// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  markAll: vi.fn(),
  listInvalidate: vi.fn(),
  unreadInvalidate: vi.fn(),
}));

vi.mock("@/const", () => ({ startLogin: vi.fn() }));
vi.mock("@/hooks/useMobile", () => ({ useIsMobile: () => false }));
vi.mock("@/components/DashboardLayoutSkeleton", () => ({ DashboardLayoutSkeleton: () => React.createElement("div", null, "Loading") }));
vi.mock("@/_core/hooks/useAuth", () => ({ useAuth: () => ({ user: { name: "Test User", email: "test@example.com" }, loading: false, logout: vi.fn() }) }));
vi.mock("wouter", () => ({ useLocation: () => ["/account", vi.fn()] }));
vi.mock("@/lib/trpc", () => ({
  trpc: {
    paymentNotification: {
      listMine: { useQuery: () => ({ data: [{ id: 1, title: "Review update", message: "Your request was verified.", readAt: null, createdAt: new Date("2026-08-26T00:00:00Z") }], isLoading: false, isError: false }) },
      unreadCount: { useQuery: () => ({ data: 1, isLoading: false, isError: false }) },
      markRead: { useMutation: () => ({ mutate: vi.fn() }) },
      markAllRead: { useMutation: ({ onSuccess }: { onSuccess?: () => void }) => ({ mutate: () => { state.markAll(); onSuccess?.(); } }) },
    },
    useUtils: () => ({ paymentNotification: { listMine: { invalidate: state.listInvalidate }, unreadCount: { invalidate: state.unreadInvalidate } } }),
  },
}));
vi.mock("@/components/ui/sidebar", () => {
  const passthrough = ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) => React.createElement("div", props, children);
  return {
    Sidebar: passthrough,
    SidebarContent: passthrough,
    SidebarFooter: passthrough,
    SidebarHeader: passthrough,
    SidebarInset: passthrough,
    SidebarMenu: passthrough,
    SidebarMenuItem: passthrough,
    SidebarProvider: passthrough,
    SidebarTrigger: (props: Record<string, unknown>) => React.createElement("button", { ...props, type: "button" }),
    SidebarMenuButton: ({ children, onClick, ...props }: { children?: React.ReactNode; onClick?: () => void; [key: string]: unknown }) => React.createElement("button", { ...props, type: "button", onClick }, children),
    useSidebar: () => ({ state: "expanded", toggleSidebar: vi.fn() }),
  };
});
vi.mock("@/components/ui/avatar", () => ({ Avatar: ({ children }: { children?: React.ReactNode }) => React.createElement("div", null, children), AvatarFallback: ({ children }: { children?: React.ReactNode }) => React.createElement("span", null, children) }));
vi.mock("./ui/button", () => ({ Button: ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) => React.createElement("button", props, children) }));

vi.stubGlobal("React", React);
let DashboardLayout: React.ComponentType<{ children: React.ReactNode }>;

beforeAll(async () => {
  ({ default: DashboardLayout } = await import("./DashboardLayout"));
});

describe("DashboardLayout notification wiring", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders the shared C+ Link Logo in the protected workspace shell", () => {
    const view = render(React.createElement(DashboardLayout, null, React.createElement("div", null, "Account content")));

    const wordmark = view.container.querySelector(".creatorhubplus-logo__words");
    expect(view.container.querySelector(".creatorhubplus-logo")).toBeTruthy();
    expect(view.container.querySelector(".creatorhubplus-cmark")).toBeTruthy();
    expect(wordmark?.getAttribute("data-wordmark")).toBe("creatorhubplus");
  });

  it("calls the protected bulk-read mutation and invalidates both notification caches", async () => {
    render(React.createElement(DashboardLayout, null, React.createElement("div", null, "Account content")));
    fireEvent.pointerDown(screen.getByRole("button", { name: "1 unread review notifications" }), { button: 0 });
    await waitFor(() => expect(screen.getByText("Review update")).toBeTruthy());
    fireEvent.click(screen.getByRole("button", { name: "Mark all as read" }));
    expect(state.markAll).toHaveBeenCalledOnce();
    expect(state.listInvalidate).toHaveBeenCalledOnce();
    expect(state.unreadInvalidate).toHaveBeenCalledOnce();
  });
});
