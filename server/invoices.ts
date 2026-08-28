import { and, desc, eq } from "drizzle-orm";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { invoices, paymentRequests, users } from "../drizzle/schema";
import { getDb } from "./db";
import { storagePut, storageGetSignedUrl } from "./storage";

const COMPANY_NAME = "CreatorHubPlus";
const COMPANY_TAGLINE = "Creator services and payment records";
const COMPANY_EMAIL = "support@creatorhubplus.com";
const INVOICE_DISCLAIMER = "This electronic invoice confirms a payment request marked as verified by CreatorHubPlus. Keep it for your records.";

export function buildInvoiceNumber(orderNumber: string, issuedAt = new Date()) {
  const date = issuedAt.toISOString().slice(0, 10).replace(/-/g, "");
  const orderSuffix = orderNumber.replace(/[^A-Za-z0-9]/g, "").slice(-12).toUpperCase();
  return `INV-${date}-${orderSuffix}`;
}

function drawBrandMark(page: ReturnType<PDFDocument["addPage"]>) {
  page.drawLine({ start: { x: 52, y: 744 }, end: { x: 76, y: 744 }, thickness: 5, color: rgb(0.04, 0.31, 0.29) });
  page.drawLine({ start: { x: 64, y: 744 }, end: { x: 64, y: 758 }, thickness: 5, color: rgb(0.17, 0.43, 0.86) });
  page.drawCircle({ x: 64, y: 764, size: 4, color: rgb(0.96, 0.49, 0.28) });
}

export async function createInvoicePdf(input: {
  invoiceNumber: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string | null;
  serviceLabel: string;
  paymentMethod: string;
  amountMmk: number;
  issuedAt: Date;
}) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const teal = rgb(0.04, 0.31, 0.29);
  const blue = rgb(0.17, 0.43, 0.86);
  const ink = rgb(0.10, 0.13, 0.18);
  const muted = rgb(0.38, 0.42, 0.48);
  const line = rgb(0.86, 0.88, 0.91);
  const issuedDate = input.issuedAt.toLocaleDateString("en-GB", { timeZone: "UTC" });

  drawBrandMark(page);
  page.drawText(COMPANY_NAME, { x: 88, y: 756, size: 20, font: bold, color: teal });
  page.drawText(COMPANY_TAGLINE, { x: 88, y: 739, size: 9, font: regular, color: muted });
  page.drawText("ELECTRONIC INVOICE", { x: 350, y: 758, size: 14, font: bold, color: blue });
  page.drawText(input.invoiceNumber, { x: 350, y: 740, size: 9, font: regular, color: muted });
  page.drawLine({ start: { x: 52, y: 712 }, end: { x: 543, y: 712 }, thickness: 1, color: line });

  page.drawText("BILL TO", { x: 52, y: 680, size: 9, font: bold, color: blue });
  page.drawText(input.customerName, { x: 52, y: 658, size: 14, font: bold, color: ink });
  if (input.customerEmail) page.drawText(input.customerEmail, { x: 52, y: 641, size: 10, font: regular, color: muted });
  page.drawText(`Issued: ${issuedDate}`, { x: 385, y: 658, size: 10, font: regular, color: ink });
  page.drawText(`Order: ${input.orderNumber}`, { x: 385, y: 641, size: 10, font: regular, color: muted });

  page.drawRectangle({ x: 52, y: 548, width: 491, height: 52, color: teal });
  page.drawText("DESCRIPTION", { x: 68, y: 579, size: 9, font: bold, color: rgb(1, 1, 1) });
  page.drawText("PAYMENT METHOD", { x: 330, y: 579, size: 9, font: bold, color: rgb(1, 1, 1) });
  page.drawText("AMOUNT", { x: 470, y: 579, size: 9, font: bold, color: rgb(1, 1, 1) });
  page.drawText(input.serviceLabel, { x: 68, y: 566, size: 10, font: regular, color: rgb(1, 1, 1) });
  page.drawText(input.paymentMethod, { x: 330, y: 566, size: 10, font: regular, color: rgb(1, 1, 1) });
  page.drawText(`${input.amountMmk.toLocaleString()} MMK`, { x: 446, y: 566, size: 10, font: bold, color: rgb(1, 1, 1) });

  page.drawText("TOTAL", { x: 390, y: 500, size: 11, font: bold, color: muted });
  page.drawText(`${input.amountMmk.toLocaleString()} MMK`, { x: 390, y: 474, size: 22, font: bold, color: teal });
  page.drawLine({ start: { x: 52, y: 442 }, end: { x: 543, y: 442 }, thickness: 1, color: line });
  page.drawText("PAYMENT STATUS", { x: 52, y: 412, size: 9, font: bold, color: blue });
  page.drawText("VERIFIED", { x: 52, y: 389, size: 14, font: bold, color: teal });
  page.drawText(INVOICE_DISCLAIMER, { x: 52, y: 342, size: 9, font: regular, color: muted, maxWidth: 470, lineHeight: 14 });
  page.drawText(COMPANY_EMAIL, { x: 52, y: 76, size: 9, font: regular, color: muted });
  page.drawText("CreatorHubPlus · Please retain this document for your records", { x: 52, y: 58, size: 9, font: regular, color: muted });

  return Buffer.from(await pdf.save());
}

export async function issueInvoiceForVerifiedPayment(paymentRequestId: number) {
  const db = await getDb();
  if (!db) throw new Error("Invoice records are temporarily unavailable.");

  const existing = await db.select().from(invoices).where(eq(invoices.paymentRequestId, paymentRequestId)).limit(1);
  if (existing[0]) return existing[0];

  const rows = await db.select({
    id: paymentRequests.id,
    userId: paymentRequests.userId,
    orderNumber: paymentRequests.orderNumber,
    serviceLabel: paymentRequests.serviceLabel,
    payerName: paymentRequests.payerName,
    paymentMethod: paymentRequests.paymentMethod,
    amountMmk: paymentRequests.amountMmk,
    status: paymentRequests.status,
    customerEmail: users.email,
  }).from(paymentRequests).leftJoin(users, eq(paymentRequests.userId, users.id)).where(eq(paymentRequests.id, paymentRequestId)).limit(1);
  const request = rows[0];
  if (!request) throw new Error("Payment request not found.");
  if (request.status !== "verified") throw new Error("An invoice can only be issued for a verified payment.");

  const issuedAt = new Date();
  const invoiceNumber = buildInvoiceNumber(request.orderNumber, issuedAt);
  const pdf = await createInvoicePdf({
    invoiceNumber,
    orderNumber: request.orderNumber,
    customerName: request.payerName,
    customerEmail: request.customerEmail,
    serviceLabel: request.serviceLabel ?? "CreatorHubPlus service",
    paymentMethod: request.paymentMethod,
    amountMmk: request.amountMmk,
    issuedAt,
  });
  const uploaded = await storagePut(`invoices/${invoiceNumber}.pdf`, pdf, "application/pdf");

  try {
    await db.insert(invoices).values({
      paymentRequestId: request.id,
      userId: request.userId,
      invoiceNumber,
      orderNumber: request.orderNumber,
      serviceLabel: request.serviceLabel ?? "CreatorHubPlus service",
      customerName: request.payerName,
      customerEmail: request.customerEmail,
      paymentMethod: request.paymentMethod,
      amountMmk: request.amountMmk,
      pdfStorageKey: uploaded.key,
      pdfUrl: uploaded.url,
      issuedAt,
    });
  } catch (error) {
    const raced = await db.select().from(invoices).where(eq(invoices.paymentRequestId, paymentRequestId)).limit(1);
    if (raced[0]) return raced[0];
    throw error;
  }

  const created = await db.select().from(invoices).where(eq(invoices.paymentRequestId, paymentRequestId)).limit(1);
  if (!created[0]) throw new Error("Invoice was not persisted.");
  return created[0];
}

export async function listInvoicesForUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Invoice records are temporarily unavailable.");
  return db.select({
    id: invoices.id,
    invoiceNumber: invoices.invoiceNumber,
    orderNumber: invoices.orderNumber,
    serviceLabel: invoices.serviceLabel,
    customerName: invoices.customerName,
    paymentMethod: invoices.paymentMethod,
    amountMmk: invoices.amountMmk,
    currency: invoices.currency,
    status: invoices.status,
    issuedAt: invoices.issuedAt,
  }).from(invoices).where(eq(invoices.userId, userId)).orderBy(desc(invoices.issuedAt));
}

export async function getInvoiceDownloadUrl(userId: number, invoiceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Invoice records are temporarily unavailable.");
  const rows = await db.select({ storageKey: invoices.pdfStorageKey, invoiceNumber: invoices.invoiceNumber })
    .from(invoices)
    .where(and(eq(invoices.id, invoiceId), eq(invoices.userId, userId)))
    .limit(1);
  const invoice = rows[0];
  if (!invoice) return null;
  return { invoiceNumber: invoice.invoiceNumber, url: await storageGetSignedUrl(invoice.storageKey) };
}

export const invoiceCompany = { COMPANY_NAME, COMPANY_EMAIL, INVOICE_DISCLAIMER };
