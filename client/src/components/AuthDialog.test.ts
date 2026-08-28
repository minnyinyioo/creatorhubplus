import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const component = readFileSync(new URL("./AuthDialog.tsx", import.meta.url), "utf8");
const stylesheet = readFileSync(new URL("../index.css", import.meta.url), "utf8");

describe("Magic Link auth feedback", () => {
  it("exposes explicit sending, success, error, and retry states", () => {
    expect(component).toContain('type AuthStatus = "idle" | "sending" | "sent" | "error"');
    expect(component).toContain("Sending your secure link");
    expect(component).toContain("Check your inbox.");
    expect(component).toContain('role="alert"');
    expect(component).toContain('type="button" onClick={retry}');
  });

  it("uses a visible spinner with reduced-motion support", () => {
    expect(component).toContain("Loader2");
    expect(component).toContain("auth-dialog-spinner");
    expect(stylesheet).toContain("@keyframes auth-dialog-spin");
    expect(stylesheet).toContain("@media(prefers-reduced-motion:reduce){.auth-dialog-spinner{animation:none}}");
  });
});
