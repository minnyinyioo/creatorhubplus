import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import React from "react";
import { TechField } from "./TechField";

describe("TechField", () => {
  it("renders an inert decorative background layer", () => {
    const markup = renderToString(React.createElement(TechField));
    expect(markup).toContain('class="tech-field"');
    expect(markup).toContain('aria-hidden="true"');
  });
});
