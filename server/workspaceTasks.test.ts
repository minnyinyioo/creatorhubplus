import { describe, expect, it } from "vitest";
import { workspaceTaskCreateSchema, workspaceTaskDeleteSchema, workspaceTaskUpdateSchema } from "./workspaceTasks";

describe("workspace task validation", () => {
  it("accepts a valid task payload and applies the default duration", () => {
    expect(workspaceTaskCreateSchema.parse({ viewKey: "Today", title: "Write the opening" })).toMatchObject({
      viewKey: "Today",
      title: "Write the opening",
      durationMinutes: 25,
    });
  });

  it("rejects unsupported views and overly long durations", () => {
    expect(() => workspaceTaskCreateSchema.parse({ viewKey: "Unknown", title: "Write", durationMinutes: 25 })).toThrow();
    expect(() => workspaceTaskCreateSchema.parse({ viewKey: "Today", title: "Write the opening", durationMinutes: 241 })).toThrow();
  });

  it("allows safe completion and timer updates but rejects invalid identifiers", () => {
    expect(workspaceTaskUpdateSchema.parse({ id: 4, completed: true, timerSeconds: 900 })).toMatchObject({ id: 4, completed: true, timerSeconds: 900 });
    expect(() => workspaceTaskDeleteSchema.parse({ id: 0 })).toThrow();
  });
});
