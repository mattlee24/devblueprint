import { createClient } from "@/lib/supabase/client";

export interface TaskCommentRow {
  id: string;
  task_id: string;
  user_id: string;
  parent_id: string | null;
  body: string;
  created_at: string;
}

export interface TaskCommentWithAuthor extends TaskCommentRow {
  author_display_name: string | null;
}

export async function getCommentsByTask(
  taskId: string
): Promise<{ data: TaskCommentWithAuthor[] | null; error: Error | null }> {
  const supabase = createClient();
  const { data: comments, error } = await supabase
    .from("task_comments")
    .select("*")
    .eq("task_id", taskId)
    .order("created_at", { ascending: true });
  if (error) return { data: null, error: error as Error };
  if (!comments?.length) return { data: [], error: null };
  const userIds = [...new Set((comments as TaskCommentRow[]).map((c) => c.user_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name")
    .in("id", userIds);
  const profileMap = new Map(
    (profiles ?? []).map((p: { id: string; display_name: string | null }) => [p.id, p.display_name])
  );
  const withAuthor: TaskCommentWithAuthor[] = (comments as TaskCommentRow[]).map((c) => ({
    ...c,
    author_display_name: profileMap.get(c.user_id) ?? null,
  }));
  return { data: withAuthor, error: null };
}

export async function createTaskComment(
  taskId: string,
  body: string,
  parentId?: string | null
): Promise<{ data: TaskCommentRow | null; error: Error | null }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error("Not authenticated") };
  const insert: { task_id: string; user_id: string; body: string; parent_id?: string | null } = {
    task_id: taskId,
    user_id: user.id,
    body: body.trim(),
  };
  if (parentId != null && parentId !== "") insert.parent_id = parentId;
  const { data, error } = await supabase
    .from("task_comments")
    .insert(insert)
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

export interface TaskCommentTree extends TaskCommentWithAuthor {
  replies: TaskCommentTree[];
}

/** Build a tree from flat comments (roots have parent_id null, replies nested). */
export function buildCommentTree(comments: TaskCommentWithAuthor[]): TaskCommentTree[] {
  const byId = new Map<string, TaskCommentTree>();
  comments.forEach((c) => byId.set(c.id, { ...c, replies: [] }));
  const roots: TaskCommentTree[] = [];
  comments.forEach((c) => {
    const node = byId.get(c.id)!;
    if (c.parent_id == null) {
      roots.push(node);
    } else {
      const parent = byId.get(c.parent_id);
      if (parent) parent.replies.push(node);
      else roots.push(node);
    }
  });
  roots.forEach((r) => r.replies.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()));
  roots.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  return roots;
}
