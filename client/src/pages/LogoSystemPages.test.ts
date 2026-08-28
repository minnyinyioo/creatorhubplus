import React, { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("wouter", () => ({
  Link: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => createElement("a", { href, ...props }, children),
  useLocation: () => ["/", vi.fn()],
}));
vi.mock("@/_core/hooks/useAuth", () => ({ useAuth: () => ({ isAuthenticated: false }) }));
vi.mock("@/lib/useSiteLocale", () => ({ useSiteLocale: vi.fn() }));
vi.mock("@/components/CaseIntakeDialog", () => ({ default: () => null }));
vi.mock("@/const", () => ({ startLogin: vi.fn() }));

vi.stubGlobal("React", React);

const { default: Home } = await import("./Home");
const { default: Privacy } = await import("./Privacy");
const { default: Terms } = await import("./Terms");

describe("C+ Link Logo system page adoption", () => {
  it("renders the shared Logo and compact mark on the English public home page", () => {
    const english = renderToStaticMarkup(createElement(Home));

    for (const html of [english]) {
      expect(html).toContain("creatorhubplus-logo");
      expect(html).toContain("creatorhubplus-cmark");
      expect(html).toContain('data-wordmark="creatorhubplus"');
      expect(html).not.toContain('data-wordmark="creatorhub+plus"');
      expect(html).not.toContain('src="/favicon.svg"');
    }
  });

  it("renders the shared Logo on each English privacy and terms route", () => {
    const pages = [Privacy, Terms];

    pages.forEach(Page => {
      const html = renderToStaticMarkup(createElement(Page));
      expect(html).toContain("creatorhubplus-logo");
      expect(html).toContain("creatorhubplus-cmark");
      expect(html).toContain('data-wordmark="creatorhubplus"');
      expect(html).not.toContain('data-wordmark="creatorhub+plus"');
    });
  });
});
