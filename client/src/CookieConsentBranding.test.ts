import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const indexHtml = readFileSync(new URL("../index.html", import.meta.url), "utf8");

describe("CookieConsent branding", () => {
  it("keeps the CreatorHubPlus powered-by C+ Link footer in the consent modal", () => {
    expect(indexHtml).toContain('footer: \'<div class="cc-powered-by"');
    expect(indexHtml).toContain('aria-label="Powered by CreatorHubPlus"');
    expect(indexHtml).toContain("creatorhubplus");
  });

  it("keeps the privacy policy link and consent actions intact", () => {
    expect(indexHtml).toContain('class="cc-link">Privacy Policy</a>');
    expect(indexHtml).toContain("acceptAllBtn: 'Accept all'");
    expect(indexHtml).toContain("acceptNecessaryBtn: 'Reject all'");
    expect(indexHtml).toContain("showPreferencesBtn: 'Manage preferences'");
  });
});
