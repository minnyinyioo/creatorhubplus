import { and, asc, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { workspaceLibraryItems } from "../drizzle/schema";
import { getDb } from "./db";

export const libraryKindSchema = z.enum(["template", "guide", "prompt"]);
export const libraryItemCreateSchema = z.object({
  title: z.string().trim().min(2).max(180),
  kind: libraryKindSchema,
  description: z.string().trim().min(10).max(2000),
});
export const libraryItemUpdateSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().trim().min(2).max(180).optional(),
  description: z.string().trim().min(10).max(2000).optional(),
  pinned: z.boolean().optional(),
});
export const libraryItemDeleteSchema = z.object({ id: z.number().int().positive() });
export type LibraryItemCreateInput = z.infer<typeof libraryItemCreateSchema>;
export type LibraryItemUpdateInput = z.infer<typeof libraryItemUpdateSchema>;

const DEFAULT_LIBRARY = [
  { title: "Three-part lesson outline", kind: "template" as const, description: "A small structure for turning one useful idea into a clear, teachable sequence." },
  { title: "Offer boundary check", kind: "guide" as const, description: "A short review to make sure the promise, audience and next step stay easy to understand." },
  { title: "Audience reply prompt", kind: "prompt" as const, description: "Ask one specific question that reveals where a reader is stuck without collecting sensitive information." },
];

async function seedLibrary(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Library is temporarily unavailable.");
  await db.insert(workspaceLibraryItems).values(DEFAULT_LIBRARY.map((item) => ({ ...item, userId })));
}

export async function listLibraryItems(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Library is temporarily unavailable.");
  let rows = await db.select().from(workspaceLibraryItems).where(eq(workspaceLibraryItems.userId, userId)).orderBy(desc(workspaceLibraryItems.pinned), asc(workspaceLibraryItems.updatedAt));
  if (!rows.length) {
    await seedLibrary(userId);
    rows = await db.select().from(workspaceLibraryItems).where(eq(workspaceLibraryItems.userId, userId)).orderBy(desc(workspaceLibraryItems.pinned), asc(workspaceLibraryItems.updatedAt));
  }
  return rows;
}

export async function createLibraryItem(userId: number, input: LibraryItemCreateInput) {
  const db = await getDb();
  if (!db) throw new Error("Library is temporarily unavailable.");
  const parsed = libraryItemCreateSchema.parse(input);
  const result = await db.insert(workspaceLibraryItems).values({ userId, ...parsed });
  return { id: Number(result[0].insertId) };
}

export async function updateLibraryItem(userId: number, input: LibraryItemUpdateInput) {
  const db = await getDb();
  if (!db) throw new Error("Library is temporarily unavailable.");
  const parsed = libraryItemUpdateSchema.parse(input);
  const updates: Partial<typeof workspaceLibraryItems.$inferInsert> = {};
  if (parsed.title !== undefined) updates.title = parsed.title;
  if (parsed.description !== undefined) updates.description = parsed.description;
  if (parsed.pinned !== undefined) updates.pinned = parsed.pinned ? 1 : 0;
  if (!Object.keys(updates).length) return { success: true as const, id: parsed.id };
  const result = await db.update(workspaceLibraryItems).set(updates).where(and(eq(workspaceLibraryItems.id, parsed.id), eq(workspaceLibraryItems.userId, userId)));
  if (result[0].affectedRows === 0) throw new Error("Library item not found.");
  return { success: true as const, id: parsed.id };
}

export async function deleteLibraryItem(userId: number, id: number) {
  const db = await getDb();
  if (!db) throw new Error("Library is temporarily unavailable.");
  const parsed = libraryItemDeleteSchema.parse({ id });
  const result = await db.delete(workspaceLibraryItems).where(and(eq(workspaceLibraryItems.id, parsed.id), eq(workspaceLibraryItems.userId, userId)));
  if (result[0].affectedRows === 0) throw new Error("Library item not found.");
  return { success: true as const, id: parsed.id };
}
