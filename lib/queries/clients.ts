import { createClient } from "@/lib/supabase/client";

export interface ClientRow {
  id: string;
  user_id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  notes: string | null;
  status: string;
  hourly_rate: number | null;
  currency: string;
  avatar_colour: string;
  created_at: string;
  updated_at: string;
}

export interface ClientInsert {
  user_id: string;
  name: string;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  address?: string | null;
  notes?: string | null;
  status?: string;
  hourly_rate?: number | null;
  currency?: string;
  avatar_colour?: string;
}

export async function getClients(): Promise<{ data: ClientRow[] | null; error: Error | null }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("name");
  return { data: data as ClientRow[] | null, error: error as Error | null };
}

export async function getClient(
  id: string
): Promise<{ data: ClientRow | null; error: Error | null }> {
  const supabase = createClient();
  const { data, error } = await supabase.from("clients").select("*").eq("id", id).single();
  return { data: data as ClientRow | null, error: error as Error | null };
}

export async function createClientRecord(
  insert: ClientInsert
): Promise<{ data: ClientRow | null; error: Error | null }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error("Not authenticated") };
  const { data, error } = await supabase
    .from("clients")
    .insert({ ...insert, user_id: user.id })
    .select()
    .single();
  return { data: data as ClientRow | null, error: error as Error | null };
}

export async function updateClient(
  id: string,
  updates: Partial<ClientInsert>
): Promise<{ data: ClientRow | null; error: Error | null }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("clients")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  return { data: data as ClientRow | null, error: error as Error | null };
}

export async function deleteClient(
  id: string
): Promise<{ error: Error | null }> {
  const supabase = createClient();
  const { error } = await supabase.from("clients").delete().eq("id", id);
  return { error: error as Error | null };
}
