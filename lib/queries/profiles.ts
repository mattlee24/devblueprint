import { createClient } from "@/lib/supabase/client";

export interface ProfileRow {
  id: string;
  display_name: string | null;
  business_name: string | null;
  business_address: string | null;
  business_email: string | null;
  business_phone: string | null;
  tax_number: string | null;
  logo_path: string | null;
  default_currency: string;
  default_hourly_rate: number | null;
  default_tax_rate: number;
  created_at: string;
  updated_at: string;
}

export async function getProfile(): Promise<{ data: ProfileRow | null; error: Error | null }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error("Not authenticated") };
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  return { data: data as ProfileRow | null, error: error as Error | null };
}

export async function upsertProfile(
  updates: Partial<Omit<ProfileRow, "id" | "created_at" | "updated_at">>
): Promise<{ data: ProfileRow | null; error: Error | null }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error("Not authenticated") };
  const { data, error } = await supabase
    .from("profiles")
    .upsert({ id: user.id, ...updates }, { onConflict: "id" })
    .select()
    .single();
  return { data: data as ProfileRow | null, error: error as Error | null };
}
