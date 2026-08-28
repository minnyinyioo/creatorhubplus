import { lookup } from "node:dns/promises";
import mysql from "mysql2/promise";
import { createClient } from "@supabase/supabase-js";
import pg from "pg";

const { Client } = pg;

const sourceUrl = process.env.DATABASE_URL;
const targetUrl = process.env.SUPABASE_DB_URL;
const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!sourceUrl || !targetUrl || !supabaseUrl || !serviceRoleKey) {
  throw new Error("DATABASE_URL, SUPABASE_DB_URL, SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
}

const source = await mysql.createConnection(sourceUrl);
const targetUrlObject = new URL(targetUrl);
const targetAddress = await lookup(targetUrlObject.hostname, { family: 4 });
const target = new Client({ connectionString: targetUrl, host: targetAddress.address, family: 4 });
const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const legacyFiles = new Map();

const tables = [
  {
    name: "users",
    columns: ["id", "openId", "name", "email", "loginMethod", "role", "createdAt", "updatedAt", "lastSignedIn"],
  },
  {
    name: "payment_service_catalog",
    columns: ["id", "serviceKey", "serviceLabel", "priceMmk", "priceLabel", "isActive", "updatedByUserId", "createdAt", "updatedAt"],
    source: "payment_service_catalog",
    booleans: ["isActive"],
  },
  {
    name: "payment_requests",
    columns: ["id", "userId", "requestCode", "orderNumber", "paymentMethod", "serviceKey", "serviceLabel", "payerName", "accountHint", "amountMmk", "quotedAmountMmk", "paymentReference", "receiptStorageKey", "receiptUrl", "receiptName", "receiptContentType", "status", "reviewNote", "reviewedByUserId", "reviewedAt", "createdAt"],
  },
  {
    name: "payment_notifications",
    columns: ["id", "userId", "paymentRequestId", "kind", "title", "message", "readAt", "createdAt"],
  },
  {
    name: "invoices",
    columns: ["id", "paymentRequestId", "userId", "invoiceNumber", "orderNumber", "serviceLabel", "customerName", "customerEmail", "paymentMethod", "amountMmk", "currency", "status", "pdfStorageKey", "pdfUrl", "complianceNote", "issuedAt", "createdAt"],
  },
  {
    name: "merchant_recipients",
    columns: ["id", "paymentMethod", "providerLabel", "kind", "accountName", "accountIdentifier", "instructions", "qrUrl", "qrStorageKey", "isActive", "createdAt", "updatedAt"],
    booleans: ["isActive"],
  },
  {
    name: "support_cases",
    columns: ["id", "userId", "caseCode", "serviceKey", "serviceLabel", "platformName", "issueSummary", "details", "status", "staffNote", "reviewedByUserId", "reviewedAt", "createdAt", "updatedAt"],
  },
  {
    name: "workspace_tasks",
    columns: ["id", "userId", "viewKey", "title", "durationMinutes", "completed", "archived", "timerSeconds", "sortOrder", "createdAt", "updatedAt"],
    booleans: ["completed", "archived"],
  },
  {
    name: "workspace_library_items",
    columns: ["id", "userId", "title", "kind", "description", "pinned", "createdAt", "updatedAt"],
    booleans: ["pinned"],
  },
  {
    name: "workspace_settings",
    columns: ["id", "userId", "studioName", "focusLengthMinutes", "updatedAt"],
  },
];

function normalizeRow(row, table) {
  const copy = { ...row };
  for (const key of table.booleans ?? []) copy[key] = Boolean(copy[key]);
  return copy;
}

function quoteIdentifier(identifier) {
  return `"${identifier.replaceAll('"', '""')}"`;
}

function quoteMySqlIdentifier(identifier) {
  return "`" + identifier.replaceAll("`", "``") + "`";
}

async function readSourceRows(table) {
  const sourceTable = table.source ?? table.name;
  const [rows] = await source.query(`select * from ${quoteMySqlIdentifier(sourceTable)}`);
  return rows.map(row => normalizeRow(row, table));
}

async function upsertRows(table, rows) {
  if (rows.length === 0) return 0;
  const columns = table.columns;
  const placeholders = rows.map((_, rowIndex) => `(${columns.map((_, columnIndex) => `$${rowIndex * columns.length + columnIndex + 1}`).join(", ")})`).join(", ");
  const values = rows.flatMap(row => columns.map(column => row[column] ?? null));
  const updates = columns.filter(column => column !== "id").map(column => `${quoteIdentifier(column)} = excluded.${quoteIdentifier(column)}`).join(", ");
  const sql = `insert into public.${quoteIdentifier(table.name)} (${columns.map(quoteIdentifier).join(", ")}) values ${placeholders} on conflict (${quoteIdentifier("id")}) do update set ${updates}`;
  await target.query(sql, values);
  return rows.length;
}

async function copyLegacyFile(key, contentType = "application/octet-stream") {
  if (!key || legacyFiles.has(key)) return legacyFiles.get(key);
  const forgeUrl = process.env.BUILT_IN_FORGE_API_URL?.replace(/\/+$/, "");
  const forgeKey = process.env.BUILT_IN_FORGE_API_KEY;
  if (!forgeUrl || !forgeKey) throw new Error("Legacy Forge storage credentials are required for historical file migration");
  const presign = new URL("v1/storage/presign/get", forgeUrl + "/");
  presign.searchParams.set("path", key);
  const signedResponse = await fetch(presign, { headers: { Authorization: `Bearer ${forgeKey}` } });
  if (!signedResponse.ok) throw new Error(`Legacy file presign failed for ${key}: ${signedResponse.status}`);
  const signed = await signedResponse.json();
  const fileResponse = await fetch(signed.url);
  if (!fileResponse.ok) throw new Error(`Legacy file download failed for ${key}: ${fileResponse.status}`);
  const bytes = Buffer.from(await fileResponse.arrayBuffer());
  const { error } = await admin.storage.from("creatorhubplus-private").upload(key, bytes, { contentType, upsert: true, cacheControl: "3600" });
  if (error) throw error;
  const result = { key, bytes: bytes.length };
  legacyFiles.set(key, result);
  return result;
}

async function ensureAuthUser(email, name) {
  if (!email) return null;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { name: name ?? "" },
  });
  if (!error && data.user) return data.user.id;
  if (!error || !/already|exists|registered/i.test(error.message)) throw error;

  for (let page = 1; page <= 20; page += 1) {
    const result = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (result.error) throw result.error;
    const match = result.data.users.find(user => user.email?.toLowerCase() === email.toLowerCase());
    if (match) return match.id;
    if (result.data.users.length < 1000) break;
  }
  throw new Error(`Could not map existing Supabase Auth user for ${email}`);
}

await target.connect();
const report = { tables: {}, authMapped: 0, authMissingEmail: 0 };
try {
  await target.query("begin");
  for (const table of tables) {
    const rows = await readSourceRows(table);
    report.tables[table.name] = await upsertRows(table, rows);
    for (const row of rows) {
      for (const [field, typeField] of [["receiptStorageKey", "receiptContentType"], ["pdfStorageKey", null], ["qrStorageKey", null]]) {
        if (row[field]) legacyFiles.set(row[field], { key: row[field], contentType: row[typeField] ?? "application/octet-stream" });
      }
    }
  }

  const filesToCopy = [...legacyFiles.values()];
  legacyFiles.clear();
  report.files = { attempted: filesToCopy.length, copied: 0, bytes: 0 };
  for (const file of filesToCopy) {
    const copied = await copyLegacyFile(file.key, file.contentType);
    report.files.copied += 1;
    report.files.bytes += copied.bytes;
  }

  const userRows = await readSourceRows(tables[0]);
  for (const user of userRows) {
    const authUserId = await ensureAuthUser(user.email, user.name);
    if (!authUserId) {
      report.authMissingEmail += 1;
      continue;
    }
    await target.query('update public.users set "authUserId" = $1, "loginMethod" = $2 where id = $3', [authUserId, "supabase_magic_link", user.id]);
    report.authMapped += 1;
  }
  await target.query("commit");
  console.log(JSON.stringify({ ok: true, report }, null, 2));
} catch (error) {
  await target.query("rollback");
  console.error("Supabase migration rolled back:", error);
  process.exitCode = 1;
} finally {
  await source.end();
  await target.end();
}
