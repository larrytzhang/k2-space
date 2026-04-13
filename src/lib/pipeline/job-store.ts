/**
 * In-memory job store with pub/sub for SSE streaming.
 *
 * Uses a Map to store jobs and a listener registry so that the
 * SSE endpoint can subscribe to progress updates for a specific
 * job. A singleton instance is stored on `globalThis` to survive
 * Next.js hot-module reloads in development.
 */

import type { Job, JobProgress } from "./types";

/** Callback signature for job progress listeners. */
export type JobListener = (progress: JobProgress) => void;

/**
 * In-memory store for pipeline jobs.
 *
 * Provides CRUD operations on jobs and a publish/subscribe
 * mechanism so that SSE streams can receive real-time updates.
 *
 * @example
 * ```ts
 * const store = getJobStore();
 * store.set(job);
 * store.subscribe(job.id, (progress) => { ... });
 * store.notify(job.id, { status: "parsing" });
 * ```
 */
export class JobStore {
  /** Internal storage for jobs keyed by job ID. */
  private jobs: Map<string, Job> = new Map();

  /** Registered listeners keyed by job ID. */
  private listeners: Map<string, Set<JobListener>> = new Map();

  /**
   * Retrieve a job by its ID.
   *
   * @param id - The job ID to look up.
   * @returns The Job if found, or undefined.
   */
  get(id: string): Job | undefined {
    return this.jobs.get(id);
  }

  /**
   * Store or update a job.
   *
   * @param job - The job object to store.
   */
  set(job: Job): void {
    this.jobs.set(job.id, job);
  }

  /**
   * Subscribe to progress updates for a specific job.
   *
   * The listener is called each time `notify()` is invoked for
   * the given job ID. Returns an unsubscribe function that the
   * caller must invoke when the SSE connection closes.
   *
   * @param jobId - The job ID to subscribe to.
   * @param listener - Callback invoked with each progress event.
   * @returns An unsubscribe function.
   */
  subscribe(jobId: string, listener: JobListener): () => void {
    if (!this.listeners.has(jobId)) {
      this.listeners.set(jobId, new Set());
    }
    const listenerSet = this.listeners.get(jobId)!;
    listenerSet.add(listener);

    return () => {
      listenerSet.delete(listener);
      if (listenerSet.size === 0) {
        this.listeners.delete(jobId);
      }
    };
  }

  /**
   * Publish a progress update to all listeners for a given job.
   *
   * @param jobId - The job ID whose listeners should be notified.
   * @param progress - The progress snapshot to deliver.
   */
  notify(jobId: string, progress: JobProgress): void {
    const listenerSet = this.listeners.get(jobId);
    if (!listenerSet) return;
    for (const listener of listenerSet) {
      listener(progress);
    }
  }
}

/**
 * Augment globalThis so TypeScript knows about the singleton.
 * This prevents the store from being recreated on HMR in dev.
 */
const globalStore = globalThis as unknown as {
  __jobStore?: JobStore;
};

/**
 * Get the singleton JobStore instance.
 *
 * In development, Next.js hot-reloads modules which would
 * destroy the in-memory Map. Storing the instance on
 * `globalThis` ensures it persists across reloads.
 *
 * @returns The singleton JobStore.
 */
export function getJobStore(): JobStore {
  if (!globalStore.__jobStore) {
    globalStore.__jobStore = new JobStore();
  }
  return globalStore.__jobStore;
}
