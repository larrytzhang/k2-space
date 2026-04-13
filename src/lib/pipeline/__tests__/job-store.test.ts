import { describe, it, expect, vi, beforeEach } from "vitest";
import { JobStore } from "../job-store";
import type { Job, JobProgress } from "../types";

/**
 * Helper to create a minimal Job for testing.
 *
 * @param id - Optional job ID override.
 * @returns A Job with default values.
 */
function createTestJob(id = "job-1"): Job {
  return {
    id,
    filename: "test.pdf",
    status: "pending",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    result: null,
    error: null,
  };
}

describe("JobStore", () => {
  let store: JobStore;

  beforeEach(() => {
    store = new JobStore();
  });

  describe("get / set", () => {
    it("returns undefined for a non-existent job", () => {
      expect(store.get("nonexistent")).toBeUndefined();
    });

    it("stores and retrieves a job by ID", () => {
      const job = createTestJob();
      store.set(job);
      expect(store.get("job-1")).toEqual(job);
    });

    it("overwrites an existing job with the same ID", () => {
      const job = createTestJob();
      store.set(job);

      const updated: Job = { ...job, status: "parsing" };
      store.set(updated);

      expect(store.get("job-1")?.status).toBe("parsing");
    });

    it("stores multiple jobs independently", () => {
      const job1 = createTestJob("job-1");
      const job2 = createTestJob("job-2");
      store.set(job1);
      store.set(job2);

      expect(store.get("job-1")?.id).toBe("job-1");
      expect(store.get("job-2")?.id).toBe("job-2");
    });
  });

  describe("subscribe / notify", () => {
    it("delivers progress updates to a subscriber", () => {
      const listener = vi.fn();
      store.subscribe("job-1", listener);

      const progress: JobProgress = { status: "parsing" };
      store.notify("job-1", progress);

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(progress);
    });

    it("delivers updates to multiple subscribers", () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      store.subscribe("job-1", listener1);
      store.subscribe("job-1", listener2);

      const progress: JobProgress = { status: "structuring" };
      store.notify("job-1", progress);

      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
    });

    it("does not deliver updates for a different job ID", () => {
      const listener = vi.fn();
      store.subscribe("job-1", listener);

      store.notify("job-2", { status: "parsing" });

      expect(listener).not.toHaveBeenCalled();
    });

    it("does nothing when notifying with no subscribers", () => {
      // Should not throw
      expect(() =>
        store.notify("no-subs", { status: "parsing" })
      ).not.toThrow();
    });
  });

  describe("unsubscribe", () => {
    it("stops delivering updates after unsubscribe", () => {
      const listener = vi.fn();
      const unsubscribe = store.subscribe("job-1", listener);

      store.notify("job-1", { status: "parsing" });
      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();

      store.notify("job-1", { status: "structuring" });
      expect(listener).toHaveBeenCalledTimes(1); // Still 1, not 2
    });

    it("removes the listener set when the last subscriber leaves", () => {
      const listener = vi.fn();
      const unsubscribe = store.subscribe("job-1", listener);

      unsubscribe();

      // Notifying should be a no-op — the listener set is cleaned up
      store.notify("job-1", { status: "completed" });
      expect(listener).not.toHaveBeenCalled();
    });

    it("only removes the specific listener, not others", () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      const unsub1 = store.subscribe("job-1", listener1);
      store.subscribe("job-1", listener2);

      unsub1();

      store.notify("job-1", { status: "parsing" });
      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).toHaveBeenCalledTimes(1);
    });
  });
});
