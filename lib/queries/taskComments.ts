import { createClient } from "@/lib/supabase/client";

export interface TaskCommentRow {
  id: string;
  task_id: string;
  user_id: string;
  body: string;
  created_at: string;
}

export async function getCommentsByTask(
  taskId: string
): Promise<{ data: TaskCommentRow[] | null; error: Error | null }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("task_comments")
    .select("*")
    .eq("task_id", taskId)
    .order("created_at", { ascending: true });
  return { data: data as TaskCommentRow[] | null, error: error as Error | null };
}

export async function createTaskComment(
  taskId: string,
  body: string
): Promise<{ data: TaskCommentRow | null; error: Error | null }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error("Not authenticated") };
  const { data, error } = await supabase
    .from("task_comments")
    .insert({ task_id: taskId, user_id: user.id, body: body.trim() })
    .select()
    .single();
  return { data: data as TaskCommentRow | null, error: error as Error | null };
}

export async function deleteTaskComment(
  id: string
): Promise<{ error: Error | null }> {
  const supabase = createClient();
  const { error } = await supabase.from("task_comments").delete().eq("id", id);
  return { error: error as Error | null };
}
