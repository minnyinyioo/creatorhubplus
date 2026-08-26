// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NotificationMenu } from "./DashboardLayout";

vi.stubGlobal("React", React);

describe("notification menu rendered interaction", () => {
  it("opens, invokes bulk-read, and hides the unread badge after the count clears", async () => {
    const onMarkAll = vi.fn();
    const onMarkRead = vi.fn();
    const onNavigate = vi.fn();
    const props = {
      unreadCount: 2,
      notifications: [{ id: 1, title: "Clarification needed", message: "Upload the complete receipt.", readAt: null, createdAt: new Date("2026-08-26T00:00:00Z") }],
      isLoading: false,
      isError: false,
      isMarkingAll: false,
      onMarkRead,
      onMarkAll,
      onNavigate,
    };
    const view = render(React.createElement(NotificationMenu, props));
    const trigger = screen.getByRole("button", { name: "2 unread review notifications" });
    fireEvent.pointerDown(trigger, { button: 0 });
    await waitFor(() => expect(screen.getByText("Clarification needed")).toBeTruthy());
    fireEvent.click(screen.getByRole("button", { name: "Mark all as read" }));
    expect(onMarkAll).toHaveBeenCalledOnce();
    cleanup();
    render(React.createElement(NotificationMenu, { ...props, unreadCount: 0, notifications: [{ ...props.notifications[0], readAt: new Date("2026-08-26T00:01:00Z") }] }));
    expect(screen.getByRole("button", { name: "Review notifications" })).toBeTruthy();
    expect(screen.queryByText("2 unread")).toBeNull();
  });
});
