import { createClient } from "@/lib/supabase/client";

export interface TaskAttachmentRow {
  id: string;
  task_id: string;
  user_id: string;
  storage_path: string;
  filename: string;
  content_type: string | null;
  byte_size: number | null;
  created_at: string;
}

export async function getAttachmentsByTask(
  taskId: string
): Promise<{ data: TaskAttachmentRow[] | null; error: Error | null }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("task_attachments")
    .select("*")
    .eq("task_id", taskId)
    .order("created_at", { ascending: true });
  return { data: (data ?? null) as TaskAttachmentRow[] | null, error: error as Error | null };
}

export interface TaskAttachmentInsert {
  storage_path: string;
  filename: string;
  content_type?: string | null;
  byte_size?: number | null;
}

export async function createTaskAttachment(
  taskId: string,
  payload: TaskAttachmentInsert
): Promise<{ data: TaskAttachmentRow | null; error: Error | null }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error("Not authenticated") };
  const { data, error } = await supabase
    .from("task_attachments")
    .insert({
      task_id: taskId,
      user_id: user.id,
      storage_path: payload.storage_path,
      filename: payload.filename,
      content_type: payload.content_type ?? null,
      byte_size: payload.byte_size ?? null,
    })
    .select()
    .single();
  return { data: data as TaskAttachmentRow | null, error: error as Error | null };
}

export async function deleteTaskAttachment(
  id: string
): Promise<{ error: Error | null }> {
  const supabase = createClient();
  const { error } = await supabase.from("task_attachments").delete().eq("id", id);
  return { error: error as Error | null };
}

/** Get a signed URL for downloading/viewing an attachment (e.g. storage_path from TaskAttachmentRow). */
export async function getAttachmentSignedUrl(
  storagePath: string,
  expiresIn = 3600
): Promise<{ data: string | null; error: Error | null }> {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from("task-attachments")
    .createSignedUrl(storagePath, expiresIn);
  return { data: data?.signedUrl ?? null, error: error as Error | null };
}
