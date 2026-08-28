import React, { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const queryState = { data: [] as unknown[], isLoading: false, isError: false };
const mutation = { mutate: vi.fn(), isPending: false };

vi.mock("wouter", () => ({
  Link: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => createElement("a", { href, ...props }, children),
}));
vi.mock("@/_core/hooks/useAuth", () => ({ useAuth: () => ({ isAuthenticated: false }) }));
vi.mock("@/const", () => ({ startLogin: vi.fn() }));
vi.mock("@/lib/trpc", () => ({
  trpc: {
    workspaceTask: {
      list: { useQuery: () => queryState },
      create: { useMutation: () => mutation },
      update: { useMutation: () => mutation },
      delete: { useMutation: () => mutation },
      archive: { useMutation: () => mutation },
    },
    workspaceSettings: { get: { useQuery: () => ({ data: { focusLengthMinutes: 50 }, isLoading: false, isError: false }) } },
    useUtils: () => ({ workspaceTask: { list: { invalidate: vi.fn() }, listArchived: { invalidate: vi.fn() } } }),
  },
}));

vi.stubGlobal("React", React);
const { default: Workspace } = await import("./Workspace");

describe("Workspace creatorhubplus wordmark", () => {
  it("renders the shared top-bar Logo without a text plus sign", () => {
    const html = renderToStaticMarkup(createElement(Workspace));

    expect(html).toContain("workspace-crumb-logo");
    expect(html).toContain('data-wordmark="creatorhubplus"');
    expect(html).not.toContain('data-wordmark="creatorhub+plus"');
  });
});
