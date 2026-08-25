import { describe, expect, it } from "vitest";
import { buildTimerUpdateInput, formatFocusTime, getTimerResumeSeconds, normalizeTimerSeconds, toggleMoveState } from "./Workspace";

describe("Workspace focus interactions", () => {
  it("formats focus time with stable minute and second padding", () => {
    expect(formatFocusTime(50 * 60)).toBe("50:00");
    expect(formatFocusTime(65)).toBe("01:05");
    expect(formatFocusTime(-1)).toBe("00:00");
  });

  it("normalizes timer values before persistence", () => {
    expect(normalizeTimerSeconds(42.9)).toBe(42);
    expect(normalizeTimerSeconds(-8)).toBe(0);
    expect(formatFocusTime(normalizeTimerSeconds(0))).toBe("00:00");
  });

  it("uses zero as the persisted value when a focused session completes", () => {
    expect(buildTimerUpdateInput(7, 0)).toEqual({ id: 7, timerSeconds: 0 });
    expect(formatFocusTime(0)).toBe("00:00");
  });

  it("builds a lifecycle payload from the latest timer value", () => {
    expect(buildTimerUpdateInput(7, 842.8)).toEqual({ id: 7, timerSeconds: 842 });
  });

  it("resumes from persisted zero or a saved timer value after reload", () => {
    expect(getTimerResumeSeconds(0, 50)).toBe(0);
    expect(getTimerResumeSeconds(842, 50)).toBe(842);
    expect(getTimerResumeSeconds(undefined, 50)).toBe(3000);
  });

  it("adds an unfinished move to the completed set", () => {
    expect(toggleMoveState([], "Read the two audience replies")).toEqual(["Read the two audience replies"]);
  });

  it("removes a completed move when it is selected again", () => {
    expect(toggleMoveState(["Read the two audience replies", "Name the first downloadable asset"], "Read the two audience replies")).toEqual(["Name the first downloadable asset"]);
  });
});
