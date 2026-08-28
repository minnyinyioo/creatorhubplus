import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import React from "react";
import { BURMESE_WELCOME_MESSAGE, DigitalRain, RAIN_WAVE_AMPLITUDE } from "./DigitalRain";

describe("DigitalRain", () => {
  it("renders a decorative canvas outside the accessibility tree", () => {
    const markup = renderToString(React.createElement(DigitalRain));
    expect(markup).toContain('class="digital-rain"');
    expect(markup).toContain('aria-hidden="true"');
  });

  it("uses the requested Burmese welcome message for the visual-only code stream", () => {
    expect(BURMESE_WELCOME_MESSAGE).toBe("မင်္ဂလာပါ၊ ကြိုဆိုပါတယ်");
    expect(RAIN_WAVE_AMPLITUDE).toBeGreaterThan(0);
  });
});
