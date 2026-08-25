import { TRPCError } from "@trpc/server";
import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";
import { workspaceTasks } from "../drizzle/schema";
import { getDb } from "./db";

export const WORKSPACE_VIEW_KEYS = ["Today", "Orbit", "Rhythm", "Offers"] as const;
export const workspaceViewKeySchema = z.enum(WORKSPACE_VIEW_KEYS);

export const workspaceTaskCreateSchema = z.object({
  viewKey: workspaceViewKeySchema,
  title: z.string().trim().min(2).max(180),
  durationMinutes: z.number().int().min(1).max(240).default(25),
});

export const workspaceTaskUpdateSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().trim().min(2).max(180).optional(),
  durationMinutes: z.number().int().min(1).max(240).optional(),
  completed: z.boolean().optional(),
  timerSeconds: z.number().int().min(0).max(86400).optional(),
});

export const workspaceTaskDeleteSchema = z.object({ id: z.number().int().positive() });
export const workspaceTaskArchiveSchema = z.object({ id: z.number().int().positive(), archived: z.boolean() });

export type WorkspaceTaskCreateInput = z.infer<typeof workspaceTaskCreateSchema>;
export type WorkspaceTaskUpdateInput = z.infer<typeof workspaceTaskUpdateSchema>;

const DEFAULT_TASKS: Record<(typeof WORKSPACE_VIEW_KEYS)[number], Array<{ title: string; durationMinutes: number }>> = {
  Today: [
    { title: "Read the two audience replies", durationMinutes: 12 },
    { title: "Cut the lesson outline to three parts", durationMinutes: 25 },
    { title: "Name the first downloadable asset", durationMinutes: 18 },
  ],
  Orbit: [
    { title: "Confirm the offer boundary", durationMinutes: 15 },
    { title: "Draft the preview page", durationMinutes: 30 },
    { title: "Choose one channel for first release", durationMinutes: 20 },
  ],
  Rhythm: [
    { title: "Pull the source note", durationMinutes: 12 },
    { title: "Add one useful example", durationMinutes: 20 },
    { title: "Set the re-use path", durationMinutes: 15 },
  ],
  Offers: [
    { title: "Name the collection", durationMinutes: 10 },
    { title: "Place the first template", durationMinutes: 25 },
    { title: "Write the one-sentence promise", durationMinutes: 15 },
  ],
};

async function seedDefaultTasks(userId: number, viewKey: (typeof WORKSPACE_VIEW_KEYS)[number]) {
  const db = await getDb();
  if (!db) throw new Error("Workspace tasks are temporarily unavailable.");
  await db.insert(workspaceTasks).values(DEFAULT_TASKS[viewKey].map((task, index) => ({
    userId,
    viewKey,
    title: task.title,
    durationMinutes: task.durationMinutes,
    timerSeconds: task.durationMinutes * 60,
    sortOrder: index,
  })));
}

export async function listWorkspaceTasks(userId: number, viewKey?: (typeof WORKSPACE_VIEW_KEYS)[number]) {
  const db = await getDb();
  if (!db) throw new Error("Workspace tasks are temporarily unavailable.");
  const condition = viewKey
    ? and(eq(workspaceTasks.userId, userId), eq(workspaceTasks.viewKey, viewKey), eq(workspaceTasks.archived, 0))
    : and(eq(workspaceTasks.userId, userId), eq(workspaceTasks.archived, 0));
  let rows = await db.select().from(workspaceTasks).where(condition).orderBy(asc(workspaceTasks.sortOrder), asc(workspaceTasks.createdAt));
  if (viewKey && rows.length === 0) {
    const anyTasks = await db.select({ id: workspaceTasks.id }).from(workspaceTasks).where(and(eq(workspaceTasks.userId, userId), eq(workspaceTasks.viewKey, viewKey))).limit(1);
    if (!anyTasks.length) {
      await seedDefaultTasks(userId, viewKey);
      rows = await db.select().from(workspaceTasks).where(condition).orderBy(asc(workspaceTasks.sortOrder), asc(workspaceTasks.createdAt));
    }
  }
  return rows;
}

export async function listArchivedWorkspaceTasks(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Workspace tasks are temporarily unavailable.");
  return db.select().from(workspaceTasks).where(and(eq(workspaceTasks.userId, userId), eq(workspaceTasks.archived, 1))).orderBy(asc(workspaceTasks.updatedAt));
}

export async function archiveWorkspaceTask(userId: number, input: { id: number; archived: boolean }) {
  const db = await getDb();
  if (!db) throw new Error("Workspace tasks are temporarily unavailable.");
  const parsed = workspaceTaskArchiveSchema.parse(input);
  const result = await db.update(workspaceTasks).set({ archived: parsed.archived ? 1 : 0 }).where(and(eq(workspaceTasks.id, parsed.id), eq(workspaceTasks.userId, userId)));
  if (result[0].affectedRows === 0) throw new TRPCError({ code: "NOT_FOUND", message: "Workspace task not found." });
  return { success: true as const, id: parsed.id, archived: parsed.archived };
}

export async function createWorkspaceTask(userId: number, input: WorkspaceTaskCreateInput) {
  const db = await getDb();
  if (!db) throw new Error("Workspace tasks are temporarily unavailable.");
  const parsed = workspaceTaskCreateSchema.parse(input);
  const existing = await db.select({ sortOrder: workspaceTasks.sortOrder }).from(workspaceTasks)
    .where(and(eq(workspaceTasks.userId, userId), eq(workspaceTasks.viewKey, parsed.viewKey)))
    .orderBy(asc(workspaceTasks.sortOrder), asc(workspaceTasks.createdAt));
  const sortOrder = existing.length ? Math.max(...existing.map((task) => task.sortOrder)) + 1 : 0;
  const result = await db.insert(workspaceTasks).values({
    userId,
    viewKey: parsed.viewKey,
    title: parsed.title,
    durationMinutes: parsed.durationMinutes,
    timerSeconds: parsed.durationMinutes * 60,
    sortOrder,
  });
  return { id: Number(result[0].insertId), viewKey: parsed.viewKey, title: parsed.title, durationMinutes: parsed.durationMinutes };
}

export async function updateWorkspaceTask(userId: number, input: WorkspaceTaskUpdateInput) {
  const db = await getDb();
  if (!db) throw new Error("Workspace tasks are temporarily unavailable.");
  const parsed = workspaceTaskUpdateSchema.parse(input);
  const updateSet: Partial<typeof workspaceTasks.$inferInsert> = {};
  if (parsed.title !== undefined) updateSet.title = parsed.title;
  if (parsed.durationMinutes !== undefined) updateSet.durationMinutes = parsed.durationMinutes;
  if (parsed.completed !== undefined) updateSet.completed = parsed.completed ? 1 : 0;
  if (parsed.timerSeconds !== undefined) updateSet.timerSeconds = parsed.timerSeconds;
  if (!Object.keys(updateSet).length) throw new TRPCError({ code: "BAD_REQUEST", message: "Provide at least one task field to update." });
  const result = await db.update(workspaceTasks).set(updateSet).where(and(eq(workspaceTasks.id, parsed.id), eq(workspaceTasks.userId, userId)));
  if (result[0].affectedRows === 0) throw new TRPCError({ code: "NOT_FOUND", message: "Workspace task not found." });
  return { success: true as const, id: parsed.id };
}

export async function deleteWorkspaceTask(userId: number, id: number) {
  const db = await getDb();
  if (!db) throw new Error("Workspace tasks are temporarily unavailable.");
  const parsed = workspaceTaskDeleteSchema.parse({ id });
  const result = await db.delete(workspaceTasks).where(and(eq(workspaceTasks.id, parsed.id), eq(workspaceTasks.userId, userId)));
  if (result[0].affectedRows === 0) throw new TRPCError({ code: "NOT_FOUND", message: "Workspace task not found." });
  return { success: true as const, id: parsed.id };
}
