import { beforeEach, describe, expect, it, vi } from "vitest";

const { getDbMock } = vi.hoisted(() => ({ getDbMock: vi.fn() }));
vi.mock("./db", () => ({ getDb: getDbMock }));

import { countUnreadPaymentNotifications, listPaymentNotificationsForUser, markAllPaymentNotificationsRead, markPaymentNotificationRead } from "./paymentNotifications";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function userContext(id: number | null): TrpcContext {
  return {
    user: id === null ? null : { id, openId: `user-${id}`, email: `user-${id}@example.com`, name: "Applicant", loginMethod: "test", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function containsScalar(value: unknown, target: number, seen = new Set<object>()): boolean {
  if (value === target) return true;
  if (!value || typeof value !== "object") return false;
  if (seen.has(value)) return false;
  seen.add(value);
  return Object.values(value as Record<string, unknown>).some((child) => containsScalar(child, target, seen));
}

function createFakeDb(rows: unknown[] = [], affectedRows = 1) {
  const insertValues = vi.fn().mockResolvedValue(undefined);
  const updateWhere = vi.fn().mockResolvedValue([{ affectedRows }]);
  const whereResult = Object.assign([...rows], {
    orderBy: vi.fn(() => ({ limit: vi.fn().mockResolvedValue(rows) })),
  });
  const fakeDb = {
    insert: vi.fn(() => ({ values: insertValues })),
    select: vi.fn(() => ({ from: vi.fn(() => ({ where: vi.fn(() => whereResult) })) })),
    update: vi.fn(() => ({ set: vi.fn(() => ({ where: updateWhere })) })),
  };
  return { fakeDb, insertValues, updateWhere };
}

describe("payment notification persistence", () => {
  beforeEach(() => vi.clearAllMocks());

  it("lists and counts notifications for the authenticated user query", async () => {
    const rows = [{ id: 4, userId: 8, kind: "verified", title: "Payment verified", message: "Done", readAt: null, createdAt: new Date() }];
    const { fakeDb } = createFakeDb(rows);
    getDbMock.mockResolvedValue(fakeDb);
    expect(await listPaymentNotificationsForUser(8)).toEqual(rows);
    expect(await countUnreadPaymentNotifications(8)).toBe(1);
  });

  it("protects list and read procedures behind the authenticated user context", async () => {
    const rows = [{ id: 4, userId: 8, kind: "verified", title: "Payment verified", message: "Done", readAt: null, createdAt: new Date() }];
    const { fakeDb } = createFakeDb(rows, 1);
    getDbMock.mockResolvedValue(fakeDb);
    const caller = appRouter.createCaller(userContext(8));
    await expect(caller.paymentNotification.listMine()).resolves.toEqual(rows);
    await expect(caller.paymentNotification.markRead({ id: 4 })).resolves.toMatchObject({ success: true });
    const anonymous = appRouter.createCaller(userContext(null));
    await expect(anonymous.paymentNotification.listMine()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("does not expose or mutate another user’s notification", async () => {
    const rows = [{ id: 4, userId: 8, kind: "verified", title: "Payment verified", message: "Done", readAt: null, createdAt: new Date() }];
    const updateWhere = vi.fn(async (condition: unknown) => [{ affectedRows: containsScalar(condition, 8) ? 1 : 0 }]);
    const where = vi.fn((condition: unknown) => {
      const scopedRows = containsScalar(condition, 8) ? rows : [];
      return Object.assign([...scopedRows], { orderBy: vi.fn(() => ({ limit: vi.fn().mockResolvedValue(scopedRows) })) });
    });
    const fakeDb = {
      select: vi.fn(() => ({ from: vi.fn(() => ({ where })) })),
      update: vi.fn(() => ({ set: vi.fn(() => ({ where: updateWhere })) })),
    };
    getDbMock.mockResolvedValue(fakeDb);
    const owner = appRouter.createCaller(userContext(8));
    const otherUser = appRouter.createCaller(userContext(99));

    await expect(owner.paymentNotification.listMine()).resolves.toEqual(rows);
    await expect(owner.paymentNotification.markRead({ id: 4 })).resolves.toMatchObject({ updated: true });
    await expect(otherUser.paymentNotification.listMine()).resolves.toEqual([]);
    await expect(otherUser.paymentNotification.markRead({ id: 4 })).resolves.toMatchObject({ updated: false });
  });

  it("updates only the requested read state and supports mark-all", async () => {
    const { fakeDb, updateWhere } = createFakeDb([], 1);
    getDbMock.mockResolvedValue(fakeDb);
    await expect(markPaymentNotificationRead(8, 4)).resolves.toMatchObject({ success: true, updated: true });
    await expect(markAllPaymentNotificationsRead(8)).resolves.toEqual({ success: true });
    expect(updateWhere).toHaveBeenCalledTimes(2);
  });
});
