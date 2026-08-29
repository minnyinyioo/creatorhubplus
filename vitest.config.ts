import { defineConfig } from "vitest/config";
import path from "path";

const templateRoot = path.resolve(import.meta.dirname);

export default defineConfig({
  root: templateRoot,
  resolve: {
    alias: {
      "@": path.resolve(templateRoot, "client", "src"),
      "@shared": path.resolve(templateRoot, "shared"),
      "@assets": path.resolve(templateRoot, "attached_assets"),
    },
  },
  test: {
    environment: "node",
    include: ["server/**/*.test.ts", "server/**/*.spec.ts", "client/**/*.test.ts", "client/**/*.spec.ts"],
    // client/src/lib/supabase.ts constructs the browser client at import time,
    // which throws without a URL. Placeholder public values let client suites
    // run on machines without deployment env vars. They are intentionally NOT
    // real credentials: server/supabase.credentials.test.ts is a live smoke
    // test and still requires the deployment environment's real values.
    env: {
      VITE_SUPABASE_URL: "https://placeholder.supabase.co",
      VITE_SUPABASE_PUBLISHABLE_KEY: "public-placeholder-anon-key",
    },
  },
});
