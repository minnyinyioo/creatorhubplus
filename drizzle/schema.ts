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
  paymentMethod: varchar("paymentMethod", { length: 40 }).notNull(),
  payerName: varchar("payerName", { length: 120 }).notNull(),
  accountHint: varchar("accountHint", { length: 8 }),
  amountMmk: int("amountMmk").notNull(),
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
]);

export type PaymentRequest = typeof paymentRequests.$inferSelect;
export type InsertPaymentRequest = typeof paymentRequests.$inferInsert;

/**
 * Staff-managed verified merchant destinations. Empty or inactive rows are not
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
