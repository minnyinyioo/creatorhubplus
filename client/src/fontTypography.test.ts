import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { getDocumentLocale } from "./App";

describe("English-only locale contract", () => {
  const css = readFileSync(resolve(process.cwd(), "client/src/index.css"), "utf8");

  it("keeps document language English for current and legacy language URLs", () => {
    expect(getDocumentLocale("/my")).toBe("en");
    expect(getDocumentLocale("/my/terms")).toBe("en");
    expect(getDocumentLocale("/account", "?lang=my")).toBe("en");
    expect(getDocumentLocale("/account", "?lang=en")).toBe("en");
    expect(getDocumentLocale("/account")).toBe("en");
  });

  it("uses the commercial-friendly handwritten book-page system", () => {
    expect(css).toContain("family=Kalam");
    expect(css).toContain("--book-paper:");
    expect(css).toContain("font-family:\"Kalam\",\"Comic Sans MS\",cursive!important");
    expect(css).toContain(".digital-rain,.tech-field{display:none!important}");
    expect(css).toContain("--book-teal:#243b63");
    expect(css).toContain("--brand-teal:#243b63");
    expect(css).toContain(".payout-site .quiet-button,.payout-site .hero-rule");
  });

  it("does not request Burmese font assets", () => {
    const retiredFontQueryFragments = [
      "family=P" + "adauk",
      "family=Noto+Sans+" + "Myanmar",
      "family=Noto+Serif+" + "Myanmar",
    ];
    retiredFontQueryFragments.forEach((fragment) => expect(css).not.toContain(fragment));
  });
});
