import "dotenv/config";
import express, { type Express } from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { registerReceiptUploadRoute } from "../receiptUpload";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => server.close(() => resolve(true)));
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port += 1) {
    if (await isPortAvailable(port)) return port;
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

type AppWithHttpServer = Express & { httpServer?: ReturnType<typeof createServer> };

export async function createApp(): Promise<AppWithHttpServer> {
  const app = express() as AppWithHttpServer;
  const httpServer = createServer(app);
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ limit: "100kb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  registerReceiptUploadRoute(app);
  app.use("/api/trpc", createExpressMiddleware({ router: appRouter, createContext }));

  if (process.env.NODE_ENV === "development" && !process.env.VERCEL) {
    await setupVite(app, httpServer);
  } else {
    serveStatic(app);
  }
  app.httpServer = httpServer;
  return app;
}

async function startServer() {
  const preferredPort = Number.parseInt(process.env.PORT || "3000", 10);
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  const app = await createApp();
  const httpServer = app.httpServer ?? createServer(app);
  httpServer.listen(port, () => console.log(`Server running on http://localhost:${port}/`));
}

if (!process.env.VERCEL) startServer().catch(console.error);
