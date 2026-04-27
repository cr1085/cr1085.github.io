// ============================================================
// agent-core.js — The brain of the Autonomous Task Agent
// Runs in the browser (Worker tab) or as a standalone Node script
// ============================================================

import { getSupabase, getSession, saveMemory, recallMemory } from "../frontend/js/supabase-client.js";

// ── Logger ────────────────────────────────────────────────────

class AgentLogger {
  constructor(taskId, runId) {
    this.taskId = taskId;
    this.runId  = runId;
  }

  async _write(level, message, payload = null) {
    const entry = { task_id: this.taskId, run_id: this.runId, level, message, payload };
    console[level === "error" ? "error" : "log"](`[${level.toUpperCase()}] ${message}`, payload || "");

    await getSupabase().from("task_logs").insert(entry);
  }

  debug(msg, p)   { return this._write("debug",   msg, p); }
  info(msg, p)    { return this._write("info",    msg, p); }
  warn(msg, p)    { return this._write("warn",    msg, p); }
  error(msg, p)   { return this._write("error",   msg, p); }
  success(msg, p) { return this._write("success", msg, p); }
}

// ── Tool Registry ─────────────────────────────────────────────

const TOOLS = {
  // Summarise text
  text_summary: async ({ text }) => {
    const words = text.split(" ");
    return words.length > 80 ? words.slice(0, 80).join(" ") + "…" : text;
  },

  // Split a task into subtasks (returns an array of strings)
  task_splitter: async ({ goal }) => {
    return [
      `Research: gather information about "${goal}"`,
      `Plan: outline steps to achieve "${goal}"`,
      `Execute: carry out the plan`,
      `Review: verify the result matches "${goal}"`,
    ];
  },

  // Persist a fact to agent memory
  memory_store: async ({ taskId, key, value }) => {
    await saveMemory({ taskId, key, value: { data: value }, memoryType: "fact" });
    return `Stored memory: ${key}`;
  },

  // Recall relevant memories
  memory_recall: async ({ keyword }) => {
    const memories = await recallMemory(keyword);
    return memories.map(m => `[${m.key}]: ${JSON.stringify(m.value)}`).join("\n");
  },

  // Basic HTTP GET (CORS must be enabled on target)
  http_request: async ({ url, method = "GET", body = null }) => {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    return { status: res.status, body: text.slice(0, 2000) }; // cap at 2k chars
  },

  // Simple JS eval (sandboxed via Function constructor — use with care)
  code_runner: async ({ code }) => {
    try {
      // eslint-disable-next-line no-new-func
      const fn = new Function("return (async () => { " + code + " })()");
      const result = await fn();
      return String(result);
    } catch (err) {
      return `Error: ${err.message}`;
    }
  },
};

async function invokeTool(name, args, log) {
  if (!TOOLS[name]) {
    await log.warn(`Unknown tool: ${name}`);
    return `Tool "${name}" not found.`;
  }
  await log.info(`Invoking tool: ${name}`, args);
  try {
    const result = await TOOLS[name](args);
    await log.info(`Tool result: ${name}`, { result });
    return result;
  } catch (err) {
    await log.error(`Tool failed: ${name}`, { error: err.message });
    return `Tool error: ${err.message}`;
  }
}

// ── LLM Caller ───────────────────────────────────────────────

async function callLLM(messages) {
  const cfg = ATA_CONFIG.llm;
  const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${cfg.apiKey}`,
    },
    body: JSON.stringify({
      model:       cfg.model,
      max_tokens:  cfg.maxTokens,
      temperature: cfg.temperature,
      messages,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`LLM API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

// ── Planner ───────────────────────────────────────────────────

async function planTask(task, memories) {
  const memoryContext = memories.length
    ? "Relevant memories:\n" + memories.map(m => `- ${m.key}: ${JSON.stringify(m.value)}`).join("\n")
    : "No prior memories.";

  const systemPrompt = `You are an autonomous task agent. Your job is to achieve goals step-by-step.
Available tools: ${Object.keys(TOOLS).join(", ")}.
Respond ONLY as valid JSON: { "thoughts": "...", "action": "tool_name", "args": {...}, "done": false }
Set done=true and action=null when the task is complete.`;

  const userPrompt = `Goal: ${task.goal || task.title}
Description: ${task.description || ""}
Context: ${JSON.stringify(task.context || {})}
${memoryContext}

What is your next action?`;

  const raw = await callLLM([
    { role: "system", content: systemPrompt },
    { role: "user",   content: userPrompt },
  ]);

  // Strip possible markdown fences
  const clean = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

// ── Main Agent Loop ───────────────────────────────────────────

export async function runTask(task) {
  const supabase = getSupabase();
  const startedAt = new Date().toISOString();

  // Mark task as running
  await supabase.from("tasks").update({ status: "running", started_at: startedAt }).eq("id", task.id);

  let iteration = 0;
  const maxIterations = task.max_iterations || ATA_CONFIG.agent.maxIterations;
  let lastResult = null;
  let taskCompleted = false;

  while (iteration < maxIterations && !taskCompleted) {
    iteration++;

    // Create a run record
    const { data: run } = await supabase.from("task_runs").insert({
      task_id: task.id,
      iteration,
      status: "running",
      input: { context: task.context },
      started_at: new Date().toISOString(),
    }).select().single();

    const log = new AgentLogger(task.id, run.id);
    await log.info(`Starting iteration ${iteration}/${maxIterations}`);

    try {
      // Recall relevant memories
      const memories = await recallMemory(task.title, ATA_CONFIG.agent.memoryLimit);

      // Plan next step (skip LLM if no API key configured)
      let plan;
      if (ATA_CONFIG.llm.apiKey && ATA_CONFIG.llm.apiKey !== "YOUR_LLM_API_KEY") {
        plan = await planTask(task, memories);
      } else {
        // Fallback: simple built-in plan without LLM
        plan = await fallbackPlan(task, iteration, log);
      }

      await log.info("Agent plan", plan);

      if (plan.done) {
        taskCompleted = true;
        lastResult = { thoughts: plan.thoughts, iterations: iteration };
        await log.success("Task completed by agent decision");
      } else if (plan.action) {
        const toolResult = await invokeTool(plan.action, { ...plan.args, taskId: task.id }, log);
        lastResult = toolResult;

        // Auto-store significant results in memory
        await saveMemory({
          taskId: task.id,
          key: `iter_${iteration}_${plan.action}`,
          value: { result: toolResult },
          memoryType: "tool_output",
        });
      }

      // Update run as completed
      await supabase.from("task_runs").update({
        status:   "completed",
        output:   { plan, result: lastResult },
        ended_at: new Date().toISOString(),
      }).eq("id", run.id);

    } catch (err) {
      await log.error(`Iteration ${iteration} failed`, { error: err.message });
      await supabase.from("task_runs").update({
        status:   "failed",
        output:   { error: err.message },
        ended_at: new Date().toISOString(),
      }).eq("id", run.id);
    }

    // Small delay between iterations
    if (!taskCompleted) await sleep(1000);
  }

  // Final task update
  const finalStatus = taskCompleted ? "completed" : "failed";
  const finalLog = new AgentLogger(task.id, null);

  await supabase.from("tasks").update({
    status:       finalStatus,
    result:       { output: lastResult, total_iterations: iteration },
    error_message: finalStatus === "failed" ? "Max iterations reached without completion" : null,
    completed_at: new Date().toISOString(),
  }).eq("id", task.id);

  await finalLog[finalStatus === "completed" ? "success" : "error"](
    `Task ${finalStatus} after ${iteration} iteration(s)`
  );

  return { status: finalStatus, result: lastResult, iterations: iteration };
}

// ── Fallback Plan (no LLM) ────────────────────────────────────

async function fallbackPlan(task, iteration, log) {
  await log.info("No LLM configured — using rule-based fallback");

  const steps = [
    { action: "task_splitter", args: { goal: task.goal || task.title }, done: false },
    { action: "memory_store",  args: { key: "task_title", value: task.title }, done: false },
    { action: null, thoughts: "Completed rule-based execution", done: true },
  ];

  const step = steps[Math.min(iteration - 1, steps.length - 1)];
  return { thoughts: `Fallback step ${iteration}`, ...step };
}

// ── Utils ─────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export { TOOLS, invokeTool, AgentLogger };
