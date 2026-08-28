import React, { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("wouter", () => ({
  Link: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => createElement("a", { href, ...props }, children),
}));
vi.mock("@/_core/hooks/useAuth", () => ({ useAuth: () => ({ isAuthenticated: false, loading: false }) }));
vi.mock("@/const", () => ({ startLogin: vi.fn() }));
vi.mock("@/lib/trpc", () => ({
  trpc: {
    paymentCatalog: { list: { useQuery: () => ({ data: [], isLoading: false, isError: false }) } },
    paymentRequest: {
      recipient: { useQuery: () => ({ data: null, isLoading: false, error: null }) },
      listMine: { useQuery: () => ({ data: [], isLoading: false, isError: false }) },
    },
    useUtils: () => ({ paymentRequest: { listMine: { invalidate: vi.fn() } } }),
  },
}));

vi.stubGlobal("React", React);
const { default: PaymentRequest } = await import("./PaymentRequest");

describe("PaymentRequest Open Bridge Logo adoption", () => {
  it("renders the shared Logo system in the payment route header", () => {
    const html = renderToStaticMarkup(createElement(PaymentRequest));

    expect(html).toContain("payment-brand");
    expect(html).toContain("creatorhubplus-logo");
    expect(html).toContain("creatorhubplus-cmark");
    expect(html).toContain('data-wordmark="creatorhubplus"');
    expect(html).not.toContain('data-wordmark="creatorhub+plus"');
    expect(html).not.toContain('src="/favicon.svg"');
  });
});
