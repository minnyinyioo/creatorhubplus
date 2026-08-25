import { eq } from "drizzle-orm";
import { z } from "zod";
import { workspaceSettings } from "../drizzle/schema";
import { getDb } from "./db";

export const workspaceSettingsUpdateSchema = z.object({
  studioName: z.string().trim().min(2).max(120),
  focusLengthMinutes: z.number().int().min(5).max(180),
});
export type WorkspaceSettingsUpdateInput = z.infer<typeof workspaceSettingsUpdateSchema>;

const DEFAULT_SETTINGS: WorkspaceSettingsUpdateInput = { studioName: "My studio", focusLengthMinutes: 50 };

export async function getWorkspaceSettings(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Project settings are temporarily unavailable.");
  const rows = await db.select().from(workspaceSettings).where(eq(workspaceSettings.userId, userId)).limit(1);
  if (rows[0]) return rows[0];
  await db.insert(workspaceSettings).values({ userId, ...DEFAULT_SETTINGS });
  const created = await db.select().from(workspaceSettings).where(eq(workspaceSettings.userId, userId)).limit(1);
  return created[0];
}

export async function updateWorkspaceSettings(userId: number, input: WorkspaceSettingsUpdateInput) {
  const db = await getDb();
  if (!db) throw new Error("Project settings are temporarily unavailable.");
  const parsed = workspaceSettingsUpdateSchema.parse(input);
  await db.insert(workspaceSettings).values({ userId, ...parsed }).onDuplicateKeyUpdate({ set: parsed });
  return { success: true as const, ...parsed };
}
