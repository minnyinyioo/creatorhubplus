import { describe, expect, it } from "vitest";
import { libraryItemCreateSchema, libraryItemUpdateSchema } from "./workspaceLibrary";
import { workspaceSettingsUpdateSchema } from "./workspaceSettings";
import { workspaceTaskArchiveSchema } from "./workspaceTasks";

describe("workspace companion validation", () => {
  it("accepts a reusable library item", () => {
    expect(libraryItemCreateSchema.parse({ kind: "template", title: "Offer checklist", description: "A short checklist for reviewing an offer before sharing it." })).toMatchObject({ kind: "template", title: "Offer checklist" });
  });

  it("rejects a library item with insufficient context", () => {
    expect(() => libraryItemCreateSchema.parse({ kind: "guide", title: "Guide", description: "Too short" })).toThrow();
    expect(() => libraryItemUpdateSchema.parse({ id: 2, pinned: "yes" })).toThrow();
  });

  it("keeps settings within safe product limits", () => {
    expect(workspaceSettingsUpdateSchema.parse({ studioName: "My studio", focusLengthMinutes: 50 })).toEqual({ studioName: "My studio", focusLengthMinutes: 50 });
    expect(() => workspaceSettingsUpdateSchema.parse({ studioName: "A", focusLengthMinutes: 4 })).toThrow();
  });

  it("validates archive and restore actions", () => {
    expect(workspaceTaskArchiveSchema.parse({ id: 9, archived: true })).toEqual({ id: 9, archived: true });
    expect(() => workspaceTaskArchiveSchema.parse({ id: -1, archived: false })).toThrow();
  });
});
