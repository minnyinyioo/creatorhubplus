import { index, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Payment requests are user-submitted records. Receipt bytes are kept in object
 * storage; this table stores only the private storage reference and review audit data.
 */
export const paymentRequests = mysqlTable("payment_requests", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  requestCode: varchar("requestCode", { length: 32 }).notNull().unique(),
  orderNumber: varchar("orderNumber", { length: 32 }).notNull().unique(),
  paymentMethod: varchar("paymentMethod", { length: 40 }).notNull(),
  serviceKey: varchar("serviceKey", { length: 40 }),
  serviceLabel: varchar("serviceLabel", { length: 160 }),
  payerName: varchar("payerName", { length: 120 }).notNull(),
  accountHint: varchar("accountHint", { length: 8 }),
  amountMmk: int("amountMmk").notNull(),
  quotedAmountMmk: int("quotedAmountMmk"),
  paymentReference: varchar("paymentReference", { length: 100 }),
  receiptStorageKey: text("receiptStorageKey").notNull(),
  receiptUrl: text("receiptUrl").notNull(),
  receiptName: varchar("receiptName", { length: 255 }).notNull(),
  receiptContentType: varchar("receiptContentType", { length: 80 }).notNull(),
  status: mysqlEnum("status", ["pending_review", "clarification_requested", "verified", "rejected"]).notNull().default("pending_review"),
  reviewNote: text("reviewNote"),
  reviewedByUserId: int("reviewedByUserId").references(() => users.id, { onDelete: "set null" }),
  reviewedAt: timestamp("reviewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("payment_requests_user_created_idx").on(table.userId, table.createdAt),
  index("payment_requests_status_created_idx").on(table.status, table.createdAt),
  index("payment_requests_service_created_idx").on(table.serviceKey, table.createdAt),
]);

export type PaymentRequest = typeof paymentRequests.$inferSelect;
export type InsertPaymentRequest = typeof paymentRequests.$inferInsert;

/** Staff-managed service pricing. A null price means the service requires a quote. */
export const paymentServiceCatalog = mysqlTable("payment_service_catalog", {
  id: int("id").autoincrement().primaryKey(),
  serviceKey: varchar("serviceKey", { length: 40 }).notNull().unique(),
  serviceLabel: varchar("serviceLabel", { length: 160 }).notNull(),
  priceMmk: int("priceMmk"),
  priceLabel: varchar("priceLabel", { length: 120 }).notNull().default("Quote required"),
  isActive: int("isActive").notNull().default(1),
  updatedByUserId: int("updatedByUserId").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PaymentServiceCatalog = typeof paymentServiceCatalog.$inferSelect;
export type InsertPaymentServiceCatalog = typeof paymentServiceCatalog.$inferInsert;

/** In-app user notifications generated from payment-review events. */
export const paymentNotifications = mysqlTable("payment_notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  paymentRequestId: int("paymentRequestId").references(() => paymentRequests.id, { onDelete: "cascade" }),
  kind: mysqlEnum("kind", ["submitted", "clarification_requested", "verified", "rejected"]).notNull(),
  title: varchar("title", { length: 160 }).notNull(),
  message: text("message").notNull(),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("payment_notifications_user_read_created_idx").on(table.userId, table.readAt, table.createdAt),
]);

export type PaymentNotification = typeof paymentNotifications.$inferSelect;
export type InsertPaymentNotification = typeof paymentNotifications.$inferInsert;

/** Issued electronic invoices created only after a payment request is verified. */
export const invoices = mysqlTable("invoices", {
  id: int("id").autoincrement().primaryKey(),
  paymentRequestId: int("paymentRequestId").notNull().unique().references(() => paymentRequests.id, { onDelete: "cascade" }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  invoiceNumber: varchar("invoiceNumber", { length: 40 }).notNull().unique(),
  orderNumber: varchar("orderNumber", { length: 32 }).notNull(),
  serviceLabel: varchar("serviceLabel", { length: 160 }).notNull(),
  customerName: varchar("customerName", { length: 120 }).notNull(),
  customerEmail: varchar("customerEmail", { length: 320 }),
  paymentMethod: varchar("paymentMethod", { length: 40 }).notNull(),
  amountMmk: int("amountMmk").notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("MMK"),
  status: mysqlEnum("status", ["issued", "voided"]).notNull().default("issued"),
  pdfStorageKey: text("pdfStorageKey").notNull(),
  pdfUrl: text("pdfUrl").notNull(),
  complianceNote: varchar("complianceNote", { length: 500 }).notNull().default("This electronic invoice confirms a payment request marked as verified by CreatorHubPlus. Keep it for your records."),
  issuedAt: timestamp("issuedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("invoices_user_issued_idx").on(table.userId, table.issuedAt),
  index("invoices_order_idx").on(table.orderNumber),
]);

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

/**
 * Staff-managed verified merchant destinations.
 Empty or inactive rows are not
 * shown to applicants, so onboarding can happen without publishing placeholders.
 */
export const merchantRecipients = mysqlTable("merchant_recipients", {
  id: int("id").autoincrement().primaryKey(),
  paymentMethod: varchar("paymentMethod", { length: 40 }).notNull().unique(),
  providerLabel: varchar("providerLabel", { length: 80 }).notNull(),
  kind: varchar("kind", { length: 20 }).notNull(),
  accountName: varchar("accountName", { length: 160 }).notNull(),
  accountIdentifier: varchar("accountIdentifier", { length: 160 }).notNull(),
  instructions: text("instructions").notNull(),
  qrUrl: text("qrUrl"),
  qrStorageKey: text("qrStorageKey"),
  isActive: int("isActive").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MerchantRecipient = typeof merchantRecipients.$inferSelect;
export type InsertMerchantRecipient = typeof merchantRecipients.$inferInsert;

/**
 * Authenticated support cases created from the public intake path. The table stores
 * only the issue details needed for a support handoff; no passwords, PINs or payment credentials.
 */
export const supportCases = mysqlTable("support_cases", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  caseCode: varchar("caseCode", { length: 32 }).notNull().unique(),
  serviceKey: varchar("serviceKey", { length: 40 }).notNull(),
  serviceLabel: varchar("serviceLabel", { length: 160 }).notNull(),
  platformName: varchar("platformName", { length: 100 }).notNull(),
  issueSummary: varchar("issueSummary", { length: 180 }).notNull(),
  details: text("details").notNull(),
  status: mysqlEnum("status", ["open", "clarification_requested", "resolved", "closed"]).notNull().default("open"),
  staffNote: text("staffNote"),
  reviewedByUserId: int("reviewedByUserId").references(() => users.id, { onDelete: "set null" }),
  reviewedAt: timestamp("reviewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index("support_cases_user_created_idx").on(table.userId, table.createdAt),
  index("support_cases_status_created_idx").on(table.status, table.createdAt),
]);

export type SupportCase = typeof supportCases.$inferSelect;
export type InsertSupportCase = typeof supportCases.$inferInsert;

/**
 * Personal Workspace tasks. The task text and focus-session seconds are scoped to
 * the authenticated owner and kept independent from public case records.
 */
export const workspaceTasks = mysqlTable("workspace_tasks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  viewKey: mysqlEnum("viewKey", ["Today", "Orbit", "Rhythm", "Offers"]).notNull().default("Today"),
  title: varchar("title", { length: 180 }).notNull(),
  durationMinutes: int("durationMinutes").notNull().default(25),
  completed: int("completed").notNull().default(0),
  archived: int("archived").notNull().default(0),
  timerSeconds: int("timerSeconds").notNull().default(0),
  sortOrder: int("sortOrder").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index("workspace_tasks_user_view_order_idx").on(table.userId, table.viewKey, table.sortOrder),
]);

export type WorkspaceTask = typeof workspaceTasks.$inferSelect;
export type InsertWorkspaceTask = typeof workspaceTasks.$inferInsert;

/** Reusable personal templates and notes kept in the user's library. */
export const workspaceLibraryItems = mysqlTable("workspace_library_items", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 180 }).notNull(),
  kind: mysqlEnum("kind", ["template", "guide", "prompt"]).notNull().default("template"),
  description: text("description").notNull(),
  pinned: int("pinned").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index("workspace_library_user_pinned_idx").on(table.userId, table.pinned, table.updatedAt),
]);

export type WorkspaceLibraryItem = typeof workspaceLibraryItems.$inferSelect;
export type InsertWorkspaceLibraryItem = typeof workspaceLibraryItems.$inferInsert;

/** Personal studio preferences used by Workspace and its companion pages. */
export const workspaceSettings = mysqlTable("workspace_settings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  studioName: varchar("studioName", { length: 120 }).notNull().default("My studio"),
  focusLengthMinutes: int("focusLengthMinutes").notNull().default(50),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WorkspaceSetting = typeof workspaceSettings.$inferSelect;
export type InsertWorkspaceSetting = typeof workspaceSettings.$inferInsert;
