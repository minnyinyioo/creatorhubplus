import { lookup } from "node:dns/promises";
import { readFile } from "node:fs/promises";
import pg from "pg";

const { Client } = pg;
const databaseUrl = process.env.SUPABASE_DB_URL;
if (!databaseUrl) throw new Error("SUPABASE_DB_URL is required");

const parsed = new URL(databaseUrl);
const address = await lookup(parsed.hostname, { family: 4 });
const client = new Client({ connectionString: databaseUrl, host: address.address, family: 4 });
const schema = await readFile(new URL("../supabase/schema.sql", import.meta.url), "utf8");

await client.connect();
try {
  await client.query("begin");
  await client.query(schema);
  await client.query("commit");
  console.log("Supabase schema applied successfully.");
} catch (error) {
  await client.query("rollback");
  console.error("Supabase schema application rolled back:", error);
  process.exitCode = 1;
} finally {
  await client.end();
}
