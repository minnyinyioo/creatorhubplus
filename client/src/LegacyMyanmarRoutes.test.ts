import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { getDocumentLocale } from "./App";

describe("legacy Myanmar public routes", () => {
  const appSource = readFileSync(resolve(process.cwd(), "client/src/App.tsx"), "utf8");

  it("maps every retired Myanmar public route to the English-home redirect", () => {
    expect(appSource).toContain('<Route path={"/my"} component={LegacyMyanmarRedirect} />');
    expect(appSource).toContain('<Route path={"/my/privacy"} component={LegacyMyanmarRedirect} />');
    expect(appSource).toContain('<Route path={"/my/terms"} component={LegacyMyanmarRedirect} />');
    expect(appSource).toContain('setLocation("/", { replace: true })');
  });

  it("never selects the retired Myanmar document locale", () => {
    expect(getDocumentLocale("/my")).toBe("en");
    expect(getDocumentLocale("/my/privacy")).toBe("en");
    expect(getDocumentLocale("/my/terms")).toBe("en");
  });
});
