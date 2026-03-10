// ============================================================
// scripts/seed.js — Seeds the database with example tasks
// Run: node scripts/seed.js  (requires config env vars)
// ============================================================

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import { EXAMPLE_TASKS } from "../agent/tools/example-tasks.js";

const SUPABASE_URL     = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const TEST_EMAIL       = process.env.SEED_EMAIL;
const TEST_PASSWORD    = process.env.SEED_PASSWORD;

const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function seed() {
  console.log("Signing in as test user…");
  const { data: { session }, error: authError } = await sb.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });
  if (authError) { console.error("Auth error:", authError.message); process.exit(1); }

  const userId = session.user.id;
  console.log("Seeding tasks for user:", userId);

  for (const task of EXAMPLE_TASKS) {
    const { data, error } = await sb
      .from("tasks")
      .insert({ ...task, user_id: userId })
      .select()
      .single();

    if (error) console.error("  ✗", task.title, error.message);
    else       console.log("  ✓", data.id, task.title);
  }

  console.log("\nDone! Open the dashboard to see your example tasks.");
  process.exit(0);
}

seed();
