// ============================================================
// supabase-client.js — Thin wrapper around the Supabase JS SDK
// ============================================================

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

let _client = null;

export function getSupabase() {
  if (_client) return _client;
  _client = createClient(ATA_CONFIG.supabase.url, ATA_CONFIG.supabase.anonKey, {
    auth: { persistSession: true },
  });
  return _client;
}

// ── Auth helpers ──────────────────────────────────────────────

export async function signUp(email, password) {
  const { data, error } = await getSupabase().auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signIn(email, password) {
  const { data, error } = await getSupabase().auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  await getSupabase().auth.signOut();
}

export async function getSession() {
  const { data } = await getSupabase().auth.getSession();
  return data.session;
}

export function onAuthChange(callback) {
  return getSupabase().auth.onAuthStateChange((_event, session) => callback(session));
}

// ── Task helpers ──────────────────────────────────────────────

export async function createTask(payload) {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");

  const { data, error } = await getSupabase()
    .from("tasks")
    .insert({ ...payload, user_id: session.user.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getTasks(filters = {}) {
  let query = getSupabase()
    .from("tasks")
    .select("*, task_runs(count), task_logs(count)")
    .order("priority", { ascending: true })
    .order("created_at", { ascending: false });

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.limit)  query = query.limit(filters.limit);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getTask(taskId) {
  const { data, error } = await getSupabase()
    .from("tasks")
    .select("*")
    .eq("id", taskId)
    .single();
  if (error) throw error;
  return data;
}

export async function updateTask(taskId, updates) {
  const { data, error } = await getSupabase()
    .from("tasks")
    .update(updates)
    .eq("id", taskId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function cancelTask(taskId) {
  return updateTask(taskId, { status: "cancelled" });
}

// ── Logs helpers ──────────────────────────────────────────────

export async function getTaskLogs(taskId, limit = 100) {
  const { data, error } = await getSupabase()
    .from("task_logs")
    .select("*")
    .eq("task_id", taskId)
    .order("created_at", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return data;
}

// ── Real-time subscriptions ───────────────────────────────────

export function subscribeToTasks(callback) {
  return getSupabase()
    .channel("tasks-changes")
    .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, callback)
    .subscribe();
}

export function subscribeToLogs(taskId, callback) {
  return getSupabase()
    .channel(`logs-${taskId}`)
    .on("postgres_changes", {
      event: "INSERT",
      schema: "public",
      table: "task_logs",
      filter: `task_id=eq.${taskId}`,
    }, callback)
    .subscribe();
}

// ── Memory helpers ────────────────────────────────────────────

export async function saveMemory({ taskId, key, value, memoryType = "fact" }) {
  const session = await getSession();
  const { data, error } = await getSupabase()
    .from("agent_memory")
    .upsert({
      user_id:     session.user.id,
      task_id:     taskId,
      key,
      value,
      memory_type: memoryType,
      updated_at:  new Date().toISOString(),
    }, { onConflict: "user_id,key" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function recallMemory(keyword, limit = 10) {
  const { data, error } = await getSupabase()
    .from("agent_memory")
    .select("*")
    .or(`key.ilike.%${keyword}%,value::text.ilike.%${keyword}%`)
    .order("relevance", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}
