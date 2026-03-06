import { createClient } from "@/lib/supabase/client";

export interface TaskRow {
  id: string;
  project_id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  category: string;
  effort: string;
  position: number;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskInsert {
  project_id: string;
  user_id?: string;
  title: string;
  description?: string | null;
  status?: string;
  priority?: string;
  category?: string;
  effort?: string;
  position?: number;
  due_date?: string | null;
}

export type TaskWithProject = TaskRow & { projects?: { id: string; title: string } | null };

export async function getTasksByProject(
  projectId: string
): Promise<{ data: TaskRow[] | null; error: Error | null }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("project_id", projectId)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });
  return { data: data as TaskRow[] | null, error: error as Error | null };
}

export async function getTask(
  id: string
): Promise<{ data: TaskRow | null; error: Error | null }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", id)
    .single();
  return { data: data as TaskRow | null, error: error as Error | null };
}

/** Tasks not yet done (todo, in_progress, in_review) for the current user, with project info. */
export async function getUpcomingTasks(limit = 15): Promise<{ data: TaskWithProject[] | null; error: Error | null }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [], error: null };
  const { data, error } = await supabase
    .from("tasks")
    .select("*, projects(id, title)")
    .eq("user_id", user.id)
    .in("status", ["backlog", "todo", "in_progress", "in_review"])
    .order("position", { ascending: true })
    .order("updated_at", { ascending: false })
    .limit(limit);
  return { data: data as TaskWithProject[] | null, error: error as Error | null };
}

export async function createTask(
  insert: TaskInsert
): Promise<{ data: TaskRow | null; error: Error | null }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error("Not authenticated") };
  const { data, error } = await supabase
    .from("tasks")
    .insert({ ...insert, user_id: user.id })
    .select()
    .single();
  return { data: data as TaskRow | null, error: error as Error | null };
}

export async function updateTask(
  id: string,
  updates: Partial<TaskInsert>
): Promise<{ data: TaskRow | null; error: Error | null }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  return { data: data as TaskRow | null, error: error as Error | null };
}

export async function deleteTask(id: string): Promise<{ error: Error | null }> {
  const supabase = createClient();
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  return { error: error as Error | null };
}

export async function reorderTasks(
  updates: { id: string; status: string; position: number }[]
): Promise<{ error: Error | null }> {
  const supabase = createClient();
  for (const u of updates) {
    const { error } = await supabase
      .from("tasks")
      .update({ status: u.status, position: u.position })
      .eq("id", u.id);
    if (error) return { error: error as Error };
  }
  return { error: null };
}
