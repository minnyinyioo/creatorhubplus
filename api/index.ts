import type { VercelRequest, VercelResponse } from "@vercel/node";
// @ts-ignore - dist/index.js is the production server bundle produced by
// `pnpm build` (esbuild, ESM); it intentionally ships without a .d.ts.
import { createApp } from "../dist/index.js";

const appPromise = createApp();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const app = await appPromise;
  return app(req, res);
}