import { index, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
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
 * Payment requests are not payment processor records. They store a user-submitted
 * request and a private receipt reference that remains pending review until an
 * authorised administrator verifies the payment through an approved channel.
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
  status: mysqlEnum("status", ["pending_review", "verified", "rejected"]).notNull().default("pending_review"),
  reviewNote: text("reviewNote"),
  reviewedAt: timestamp("reviewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [index("payment_requests_user_created_idx").on(table.userId, table.createdAt)]);

export type PaymentRequest = typeof paymentRequests.$inferSelect;
export type InsertPaymentRequest = typeof paymentRequests.$inferInsert;
