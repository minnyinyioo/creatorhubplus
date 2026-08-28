import type { Express } from "express";
import { storageGetSignedUrl } from "../storage";
import { ENV } from "./env";

const migratedPrefixes = ["payment-proofs/", "invoices/"];

export function registerStorageProxy(app: Express) {
  app.get("/manus-storage/*", async (req, res) => {
    const key = (req.params as Record<string, string>)[0];
    if (!key) {
      res.status(400).send("Missing storage key");
      return;
    }

    try {
      if (migratedPrefixes.some(prefix => key.startsWith(prefix))) {
        const url = await storageGetSignedUrl(key);
        res.set("Cache-Control", "private, no-store");
        res.redirect(307, url);
        return;
      }

      // Legacy public brand/payment assets remain readable during the cutover.
      // User receipts and invoices never use this branch.
      if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
        res.status(404).send("Legacy asset unavailable");
        return;
      }
      const forgeUrl = new URL("v1/storage/presign/get", ENV.forgeApiUrl.replace(/\/+$/, "") + "/");
      forgeUrl.searchParams.set("path", key);
      const forgeResp = await fetch(forgeUrl, { headers: { Authorization: `Bearer ${ENV.forgeApiKey}` } });
      if (!forgeResp.ok) {
        res.status(404).send("Asset not found");
        return;
      }
      const { url } = (await forgeResp.json()) as { url?: string };
      if (!url) {
        res.status(404).send("Asset not found");
        return;
      }
      res.set("Cache-Control", "public, max-age=3600");
      res.redirect(307, url);
    } catch (error) {
      console.error("[StorageProxy] Storage error:", error);
      res.status(502).send("Storage backend error");
    }
  });
}
