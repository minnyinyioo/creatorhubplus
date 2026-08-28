import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const publicDir = resolve(process.cwd(), "client/public");
const readPublicAsset = (name: string) => readFileSync(resolve(publicDir, name), "utf8");

describe("C+ Link browser and app icon system", () => {
  it("uses the compact C+ Link symbol for the primary favicon and Safari pinned tab", () => {
    const favicon = readPublicAsset("favicon.svg");
    const safariIcon = readPublicAsset("safari-pinned-tab.svg");

    for (const icon of [favicon, safariIcon]) {
      expect(icon).toContain("M45.6 18.2A20.5 20.5 0 1 0 45.6 45.8");
      expect(icon).toContain("M47 26.6V37.4M41.6 32H52.4");
      expect(icon).not.toContain("M11 47.5H20.5L32 17.5");
    }
  });

  it("keeps the app icon and browser declarations on the same C+ Link family", () => {
    const appIcon = readPublicAsset("icon-maskable.svg");
    const manifest = readPublicAsset("site.webmanifest");
    const index = readFileSync(resolve(process.cwd(), "client/index.html"), "utf8");

    expect(appIcon).toContain("M136.8 54.6A61.5 61.5 0 1 0 136.8 137.4");
    expect(manifest).toContain('"src": "/favicon.svg"');
    expect(manifest).toContain('"src": "/icon-maskable.svg"');
    expect(index).toContain('<link rel="icon" href="/favicon.svg"');
    expect(index).toContain('<link rel="apple-touch-icon" href="/icon-maskable.svg"');
  });
});
