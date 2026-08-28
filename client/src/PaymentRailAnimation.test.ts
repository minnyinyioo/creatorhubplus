import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const stylesheet = readFileSync(new URL("./index.css", import.meta.url), "utf8");

describe("payment method rail animation", () => {
  it("keeps a continuous loop, hover pause, and reduced-motion fallback", () => {
    expect(stylesheet).toContain("@keyframes payment-rail-loop");
    expect(stylesheet).toContain("animation:payment-rail-loop 14s linear infinite!important");
    expect(stylesheet).toContain(".payment-rail-window:hover .payment-rail-track,.payment-rail-window:focus-within .payment-rail-track{animation-play-state:paused!important}");
    expect(stylesheet).toContain(".payment-rail-track{animation:none!important;transform:none!important}");
  });
});
