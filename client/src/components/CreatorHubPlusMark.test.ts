import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CreatorHubPlusLockup, CreatorHubPlusMark } from "./CreatorHubPlusMark";

describe("CreatorHubPlus C+ Link mark", () => {
  it("renders an accessible standalone mark with the C arc and plus sign", () => {
    const html = renderToStaticMarkup(createElement(CreatorHubPlusMark, { label: "CreatorHubPlus C plus Link" }));

    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="CreatorHubPlus C plus Link"');
    expect(html).toContain("creatorhubplus-cmark__arc");
    expect(html).toContain("creatorhubplus-cmark__plus");
  });

  it("supports the inverse lockup for dark surfaces and an operational descriptor", () => {
    const html = renderToStaticMarkup(createElement(CreatorHubPlusLockup, { descriptor: "PAYOUT BRIDGE", tone: "inverse" }));

    expect(html).toContain("creatorhubplus-logo--inverse");
    expect(html).toContain("creatorhubplus-cmark--inverse");
    expect(html).toContain('data-wordmark="creatorhubplus"');
    expect(html).toContain("<span>creatorhub</span><strong>plus</strong>");
    expect(html).not.toContain("<b>+</b>");
    expect(html).toContain("PAYOUT BRIDGE");
  });
});
