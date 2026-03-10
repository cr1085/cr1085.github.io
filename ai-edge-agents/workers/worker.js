// ============================================================
// worker.js — Task Queue Worker
// Polls Supabase for pending tasks and runs them via agent-core
//
// Usage (browser):  loaded automatically by the Worker tab
// Usage (Node):     node workers/worker.js
// ============================================================

import { getSupabase } from "../frontend/js/supabase-client.js";
import { runTask }       from "../agent/core/agent-core.js";

class TaskWorker {
  constructor() {
    this.running    = false;
    this.currentJob = null;
    this.pollTimer  = null;
    this.stats = { processed: 0, succeeded: 0, failed: 0, startedAt: null };
  }

  // ── Start / Stop ────────────────────────────────────────────

  start() {
    if (this.running) return;
    this.running = true;
    this.stats.startedAt = new Date();
    console.log(`[Worker] Started — polling every ${ATA_CONFIG.agent.pollIntervalMs}ms`);
    this._poll();
  }

  stop() {
    this.running = false;
    if (this.pollTimer) clearTimeout(this.pollTimer);
    console.log("[Worker] Stopped");
  }

  getStatus() {
    return {
      running:    this.running,
      currentJob: this.currentJob,
      stats:      this.stats,
      uptime:     this.stats.startedAt
        ? Math.floor((Date.now() - this.stats.startedAt) / 1000) + "s"
        : null,
    };
  }

  // ── Poll loop ───────────────────────────────────────────────

  async _poll() {
    if (!this.running) return;

    try {
      const task = await this._claimNextTask();
      if (task) {
        await this._processTask(task);
      }
    } catch (err) {
      console.error("[Worker] Poll error:", err);
    }

    if (this.running) {
      this.pollTimer = setTimeout(() => this._poll(), ATA_CONFIG.agent.pollIntervalMs);
    }
  }

  // ── Claim a pending task (atomic-ish with status update) ────

  async _claimNextTask() {
    const supabase = getSupabase();

    // Get highest-priority pending task (lowest priority number = most urgent)
    const { data: tasks, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("status", "pending")
      .or("scheduled_at.is.null,scheduled_at.lte." + new Date().toISOString())
      .order("priority", { ascending: true })
      .order("created_at", { ascending: true })
      .limit(1);

    if (error) { console.error("[Worker] Query error:", error); return null; }
    if (!tasks || tasks.length === 0) return null;

    const task = tasks[0];

    // Optimistic claim — mark as running before we actually start
    const { error: claimError } = await supabase
      .from("tasks")
      .update({ status: "running", started_at: new Date().toISOString() })
      .eq("id", task.id)
      .eq("status", "pending"); // only claim if still pending (prevents double-run)

    if (claimError) return null;

    console.log(`[Worker] Claimed task: ${task.id} — "${task.title}"`);
    return task;
  }

  // ── Process a single task ───────────────────────────────────

  async _processTask(task) {
    this.currentJob = { id: task.id, title: task.title, startedAt: new Date() };
    this.stats.processed++;

    try {
      console.log(`[Worker] Running task: "${task.title}"`);
      const result = await runTask(task);

      if (result.status === "completed") {
        this.stats.succeeded++;
        console.log(`[Worker] ✓ Task completed: "${task.title}"`);
      } else {
        this.stats.failed++;
        console.warn(`[Worker] ✗ Task failed: "${task.title}"`);
      }
    } catch (err) {
      this.stats.failed++;
      console.error(`[Worker] Unhandled error in task "${task.title}":`, err);

      // Safety net: mark as failed if runTask itself threw
      await getSupabase()
        .from("tasks")
        .update({ status: "failed", error_message: err.message, completed_at: new Date().toISOString() })
        .eq("id", task.id);
    } finally {
      this.currentJob = null;
    }
  }
}

// ── Singleton export ──────────────────────────────────────────

export const worker = new TaskWorker();

// Auto-start when this module is loaded (can be disabled)
// worker.start();  // uncomment to auto-start on load
