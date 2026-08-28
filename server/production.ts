import express, { type Express } from "express";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./_core/oauth";
import { registerStorageProxy } from "./_core/storageProxy";
import { appRouter } from "./routers";
import { createContext } from "./_core/context";
import { registerReceiptUploadRoute } from "./receiptUpload";

type AppWithHttpServer = Express & { httpServer?: ReturnType<typeof createServer> };

/**
 * Production-only Express app for Vercel Functions.
 * This entry intentionally does not import Vite, so the serverless bundle
 * cannot execute Rollup's optional native dependency at request time.
 */
export async function createApp(): Promise<AppWithHttpServer> {
  const app = express() as AppWithHttpServer;
  const httpServer = createServer(app);

  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ limit: "100kb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  registerReceiptUploadRoute(app);
  app.use("/api/trpc", createExpressMiddleware({ router: appRouter, createContext }));

  app.httpServer = httpServer;
  return app;
}

if (!process.env.VERCEL && process.env.NODE_ENV === "production") {
  createApp().then(app => {
    const port = Number.parseInt(process.env.PORT || "3000", 10);
    const httpServer = app.httpServer ?? createServer(app);
    httpServer.listen(port, () => console.log(`Production server running on port ${port}`));
  }).catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
}
