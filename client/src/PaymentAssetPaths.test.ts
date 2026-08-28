import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const publicDir = resolve(process.cwd(), "client/public");
const homeSource = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
const globalStyles = readFileSync(resolve(process.cwd(), "client/src/index.css"), "utf8");
const bangkokBankSvg = readFileSync(resolve(publicDir, "payment-logos", "bangkokbank-official.svg"), "utf8");

const paymentAssets = [
  "kbzpay.webp",
  "wavepay-appicon.jpg",
  "ayapay.png",
  "kbzbank.png",
  "ayabank.png",
  "bangkokbank-official.svg",
  "kasikornbank-official.png",
];

describe("payment rail assets", () => {
  it("ships every payment logo inside the deployable public directory", () => {
    for (const asset of paymentAssets) {
      expect(existsSync(resolve(publicDir, "payment-logos", asset))).toBe(true);
    }
  });

  it("uses repository-relative paths instead of Manus storage URLs", () => {
    expect(homeSource).toContain("/payment-logos/kbzpay.webp");
    expect(homeSource).toContain("/payment-logos/wavepay-appicon.jpg");
    expect(homeSource).toContain("/payment-logos/ayapay.png");
    expect(homeSource).toContain("/payment-logos/kbzbank.png");
    expect(homeSource).toContain("/payment-logos/ayabank.png");
    expect(homeSource).toContain("/payment-logos/bangkokbank-official.svg");
    expect(homeSource).toContain("/payment-logos/kasikornbank-official.png");
    expect(homeSource).not.toMatch(/\/manus-storage\/(?:kbz|wave|aya|bangkok|kasikorn)/i);
  });

  it("uses orange type and a blue Bangkok Bank asset", () => {
    expect(globalStyles).toContain("--type-orange:");
    expect(globalStyles).toContain("color:var(--type-orange)");
    expect(bangkokBankSvg).toContain("#0057A8");
    expect(bangkokBankSvg).not.toContain("#fff");
  });
});

export { paymentAssets };

// Keep this test file side-effect free; all assertions are static and run in Vitest.
void paymentAssets;
