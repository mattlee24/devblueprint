import { createClient } from "@/lib/supabase/client";

export interface TimeLogRow {
  id: string;
  user_id: string;
  client_id: string | null;
  project_id: string | null;
  description: string;
  hours: number;
  billable: boolean;
  hourly_rate: number | null;
  currency: string;
  logged_date: string;
  invoice_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface TimeLogInsert {
  user_id?: string;
  client_id?: string | null;
  project_id?: string | null;
  description: string;
  hours: number;
  billable?: boolean;
  hourly_rate?: number | null;
  currency?: string;
  logged_date?: string;
  invoice_id?: string | null;
}

export async function getTimeLogs(filters?: {
  clientId?: string;
  projectId?: string;
  from?: string;
  to?: string;
  billableOnly?: boolean;
}): Promise<{ data: TimeLogRow[] | null; error: Error | null }> {
  const supabase = createClient();
  let q = supabase.from("time_logs").select("*, clients(name), projects(title)").order("logged_date", { ascending: false });
  if (filters?.clientId) q = q.eq("client_id", filters.clientId);
  if (filters?.projectId) q = q.eq("project_id", filters.projectId);
  if (filters?.from) q = q.gte("logged_date", filters.from);
  if (filters?.to) q = q.lte("logged_date", filters.to);
  if (filters?.billableOnly) q = q.eq("billable", true);
  const { data, error } = await q;
  return { data: data as TimeLogRow[] | null, error: error as Error | null };
}

export async function createTimeLog(
  insert: TimeLogInsert
): Promise<{ data: TimeLogRow | null; error: Error | null }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error("Not authenticated") };
  const { data, error } = await supabase
    .from("time_logs")
    .insert({ ...insert, user_id: user.id })
    .select()
    .single();
  return { data: data as TimeLogRow | null, error: error as Error | null };
}

export async function updateTimeLog(
  id: string,
  updates: Partial<TimeLogInsert>
): Promise<{ data: TimeLogRow | null; error: Error | null }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("time_logs")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  return { data: data as TimeLogRow | null, error: error as Error | null };
}

export async function deleteTimeLog(id: string): Promise<{ error: Error | null }> {
  const supabase = createClient();
  const { error } = await supabase.from("time_logs").delete().eq("id", id);
  return { error: error as Error | null };
}
