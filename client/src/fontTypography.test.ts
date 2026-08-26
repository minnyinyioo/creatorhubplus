import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { getDocumentLocale } from "./App";

describe("Myanmar typography contract", () => {
  const css = readFileSync(resolve(process.cwd(), "client/src/index.css"), "utf8");

  it("activates Burmese locale only for Burmese routes or explicit locale query", () => {
    expect(getDocumentLocale("/my")).toBe("my");
    expect(getDocumentLocale("/my/terms")).toBe("my");
    expect(getDocumentLocale("/account", "?lang=my")).toBe("my");
    expect(getDocumentLocale("/account", "?lang=en")).toBe("en");
    expect(getDocumentLocale("/account")).toBe("en");
  });

  it("loads the selected Burmese font families from Google Fonts", () => {
    expect(css).toContain("family=Padauk:wght@400;700");
    expect(css).toContain("family=Noto+Serif+Myanmar:wght@400;500;600;700");
  });

  it("scopes readable Burmese body and display stacks to Myanmar surfaces", () => {
    expect(css).toContain('.my-site{font-family:"Padauk","Noto Sans Myanmar","Manrope",sans-serif}');
    expect(css).toContain('.my-site .hero-copy-payout h1');
    expect(css).toContain('html[lang="my"] .dashboard-layout-shell');
    expect(css).toContain('font-family:"Noto Serif Myanmar","Noto Sans Myanmar","Padauk",serif');
  });
});
