import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const indexSource = readFileSync(new URL("./_core/index.ts", import.meta.url), "utf8");
const viteSource = readFileSync(new URL("./_core/vite.ts", import.meta.url), "utf8");

describe("Vite HMR proxy configuration", () => {
  it("does not expose an internal preview port to the HMR client", () => {
    expect(indexSource).toContain("const port = await findAvailablePort(preferredPort)");
    expect(indexSource).toContain("const app = await createApp()");
    expect(viteSource).toContain("hmr: { server }");
    expect(viteSource).not.toContain("clientPort");
  });

  it("shares the HTTP server used by Express and Vite", () => {
    expect(indexSource).toContain("const httpServer = createServer(app)");
    expect(indexSource).toContain("await setupVite(app, httpServer)");
    expect(indexSource).toContain("httpServer.listen(port");
  });
});
