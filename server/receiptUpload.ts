import type { Express, NextFunction, Request, Response } from "express";
import multer from "multer";
import { sdk } from "./_core/sdk";
import {
  allowedReceiptTypes,
  createPaymentRequest,
  MAX_RECEIPT_BYTES,
  paymentRequestFieldsSchema,
  paymentServiceLabels,
} from "./paymentRequests";
import { createPaymentNotification } from "./paymentNotifications";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_RECEIPT_BYTES,
    files: 1,
    fields: 8,
    parts: 10,
    fieldSize: 32 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    if (!allowedReceiptTypes.includes(file.mimetype as (typeof allowedReceiptTypes)[number])) {
      callback(new Error("Receipt must be a PNG, JPG, WEBP or PDF file."));
      return;
    }
    callback(null, true);
  },
});

async function requireAuthenticated(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await sdk.authenticateRequest(req);
    res.locals.authenticatedUser = user;
    next();
  } catch {
    res.status(401).json({ message: "Sign in before submitting a payment proof." });
  }
}

function runUploadMiddleware(req: Request, res: Response, next: NextFunction) {
  upload.single("receipt")(req, res, error => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      res.status(413).json({ message: "Receipt must be no larger than 10 MB." });
      return;
    }

    res.status(400).json({ message: error instanceof Error ? error.message : "Unable to read the receipt upload." });
  });
}

export function registerReceiptUploadRoute(app: Express) {
  app.post("/api/payment-requests/receipt", requireAuthenticated, runUploadMiddleware, async (req, res) => {
    try {
      const parsed = paymentRequestFieldsSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ message: "Check the payment details and try again.", details: parsed.error.flatten() });
        return;
      }

      if (!req.file) {
        res.status(400).json({ message: "Choose a receipt image or PDF before submitting." });
        return;
      }

      const user = res.locals.authenticatedUser as { id: number };
      const result = await createPaymentRequest(user.id, parsed.data, {
        buffer: req.file.buffer,
        mimetype: req.file.mimetype,
        originalname: req.file.originalname,
        size: req.file.size,
      });
      await createPaymentNotification({
        userId: user.id,
        kind: "submitted",
        orderNumber: result.orderNumber,
        serviceLabel: paymentServiceLabels[parsed.data.serviceKey],
      });
      res.status(201).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save this payment request.";
      res.status(400).json({ message });
    }
  });
}
