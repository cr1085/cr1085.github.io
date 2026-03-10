// ============================================================
// example-tasks.js — Sample tasks and plugin examples
// Shows how to add new capabilities to the agent
// ============================================================

/**
 * PLUGIN ARCHITECTURE
 * -------------------
 * Every "plugin" is a plain object with:
 *   name:        unique identifier (snake_case)
 *   description: what it does (shown to the LLM)
 *   schema:      expected args (for documentation / validation)
 *   run(args):   async function that does the work
 *
 * Register with:  AgentPlugin.register(myPlugin)
 */

export class AgentPlugin {
  static _registry = {};

  static register(plugin) {
    if (!plugin.name || !plugin.run) throw new Error("Plugin must have name + run");
    AgentPlugin._registry[plugin.name] = plugin;
    console.log(`[Plugin] Registered: ${plugin.name}`);
  }

  static get(name) { return AgentPlugin._registry[name]; }

  static all() { return Object.values(AgentPlugin._registry); }

  static async run(name, args) {
    const p = AgentPlugin.get(name);
    if (!p) throw new Error(`Plugin not found: ${name}`);
    return p.run(args);
  }
}

// ── Built-in example plugins ──────────────────────────────

/**
 * Plugin: word_count
 * Simple text analysis — counts words, sentences, paragraphs
 */
AgentPlugin.register({
  name: "word_count",
  description: "Count words, sentences, and paragraphs in text.",
  schema: { text: "string" },
  async run({ text }) {
    const words     = text.trim().split(/\s+/).length;
    const sentences = (text.match(/[.!?]+/g) || []).length;
    const paragraphs = text.split(/\n\n+/).length;
    return { words, sentences, paragraphs };
  },
});

/**
 * Plugin: url_check
 * Verifies if a URL is reachable (HEAD request)
 */
AgentPlugin.register({
  name: "url_check",
  description: "Check if a URL returns a successful HTTP status.",
  schema: { url: "string" },
  async run({ url }) {
    try {
      const res = await fetch(url, { method: "HEAD", mode: "no-cors" });
      return { reachable: true, status: res.status || "opaque" };
    } catch {
      return { reachable: false };
    }
  },
});

/**
 * Plugin: list_sorter
 * Sorts and deduplicates a list of items
 */
AgentPlugin.register({
  name: "list_sorter",
  description: "Sort and deduplicate a list of strings.",
  schema: { items: "string[]", order: "asc|desc" },
  async run({ items, order = "asc" }) {
    const unique = [...new Set(items)];
    unique.sort((a, b) => order === "asc" ? a.localeCompare(b) : b.localeCompare(a));
    return { sorted: unique, count: unique.length };
  },
});

/**
 * Plugin: json_transform
 * Applies a key-pick or flatten operation to a JSON object
 */
AgentPlugin.register({
  name: "json_transform",
  description: "Pick specific keys from a JSON object.",
  schema: { data: "object", keys: "string[]" },
  async run({ data, keys }) {
    const result = {};
    keys.forEach(k => { if (k in data) result[k] = data[k]; });
    return result;
  },
});

// ── Example task configurations ───────────────────────────

export const EXAMPLE_TASKS = [
  {
    title:          "Research: Open Source LLMs 2024",
    goal:           "Find and summarise the top 5 open-source LLMs released in 2024 with their key features.",
    description:    "Focus on models that can run locally on consumer hardware.",
    priority:       3,
    max_iterations: 6,
    context: {
      format:    "bullet list",
      max_items: 5,
    },
  },
  {
    title:          "Write a product description",
    goal:           "Write a compelling product description for an AI-powered task manager app, max 150 words.",
    description:    "Target audience: small business owners. Tone: professional but approachable.",
    priority:       5,
    max_iterations: 3,
    context: {
      product_name: "TaskFlow AI",
      tone:         "professional",
    },
  },
  {
    title:          "Analyse competitor features",
    goal:           "Create a comparison table of features for: Notion, Linear, and Asana.",
    description:    "Focus on: task management, AI features, pricing, and integrations.",
    priority:       4,
    max_iterations: 5,
    context: {
      output_format: "markdown table",
    },
  },
  {
    title:          "Generate weekly meeting agenda",
    goal:           "Create a 1-hour team meeting agenda for a software development team's weekly sync.",
    priority:       7,
    max_iterations: 2,
    context: {
      team_size:    6,
      meeting_type: "weekly_sync",
      duration_min: 60,
    },
  },
];

// ── How to run examples (for docs) ───────────────────────

/*
USAGE IN FRONTEND:

import { EXAMPLE_TASKS } from './example-tasks.js';
import { createTask }    from './supabase-client.js';

// Create all example tasks
for (const task of EXAMPLE_TASKS) {
  await createTask(task);
}


CREATING YOUR OWN PLUGIN:

import { AgentPlugin } from './example-tasks.js';

AgentPlugin.register({
  name: "my_custom_tool",
  description: "Does something awesome.",
  schema: { input: "string" },
  async run({ input }) {
    // your logic here
    return { result: input.toUpperCase() };
  },
});

// Now the agent can call: { "action": "my_custom_tool", "args": { "input": "hello" } }
*/
