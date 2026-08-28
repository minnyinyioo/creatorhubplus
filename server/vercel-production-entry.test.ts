import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");

function readProjectFile(relativePath: string) {
  return fs.readFileSync(path.join(projectRoot, relativePath), "utf8");
}

describe("Vercel production entry", () => {
  it("builds the production-only server bundle at the API import path", () => {
    const packageJson = JSON.parse(readProjectFile("package.json")) as {
      scripts: { build: string };
    };
    const apiEntry = readProjectFile("api/index.ts");

    expect(packageJson.scripts.build).toContain("esbuild server/production.ts");
    expect(packageJson.scripts.build).toContain("--outfile=dist/index.js");
    expect(apiEntry).toContain('from "../dist/index.js"');
  });

  it("keeps Vite out of the production server entry", () => {
    const productionEntry = readProjectFile("server/production.ts");

    expect(productionEntry).not.toContain("from \"vite\"");
    expect(productionEntry).not.toContain("setupVite");
    expect(productionEntry).not.toContain("serveStatic");
  });
});
