import { createClient } from "@/lib/supabase/client";

export interface SubtaskRow {
  id: string;
  task_id: string;
  title: string;
  completed: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface SubtaskInsert {
  task_id: string;
  title: string;
  completed?: boolean;
  position?: number;
}

export async function getSubtasksByTask(
  taskId: string
): Promise<{ data: SubtaskRow[] | null; error: Error | null }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("subtasks")
    .select("*")
    .eq("task_id", taskId)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });
  return { data: data as SubtaskRow[] | null, error: error as Error | null };
}

export async function createSubtask(
  taskId: string,
  insert: { title: string; position?: number }
): Promise<{ data: SubtaskRow | null; error: Error | null }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("subtasks")
    .insert({
      task_id: taskId,
      title: insert.title,
      position: insert.position ?? 0,
    })
    .select()
    .single();
  return { data: data as SubtaskRow | null, error: error as Error | null };
}

export async function updateSubtask(
  id: string,
  updates: Partial<Pick<SubtaskRow, "title" | "completed" | "position">>
): Promise<{ data: SubtaskRow | null; error: Error | null }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("subtasks")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  return { data: data as SubtaskRow | null, error: error as Error | null };
}

export async function deleteSubtask(id: string): Promise<{ error: Error | null }> {
  const supabase = createClient();
  const { error } = await supabase.from("subtasks").delete().eq("id", id);
  return { error: error as Error | null };
}
