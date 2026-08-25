import { describe, expect, it } from "vitest";
import { formatFocusTime, toggleMoveState } from "./Workspace";

describe("Workspace focus interactions", () => {
  it("formats focus time with stable minute and second padding", () => {
    expect(formatFocusTime(50 * 60)).toBe("50:00");
    expect(formatFocusTime(65)).toBe("01:05");
    expect(formatFocusTime(-1)).toBe("00:00");
  });

  it("adds an unfinished move to the completed set", () => {
    expect(toggleMoveState([], "Read the two audience replies")).toEqual(["Read the two audience replies"]);
  });

  it("removes a completed move when it is selected again", () => {
    expect(toggleMoveState(["Read the two audience replies", "Name the first downloadable asset"], "Read the two audience replies")).toEqual(["Name the first downloadable asset"]);
  });
});
