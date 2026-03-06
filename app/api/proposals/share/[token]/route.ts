import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

/** Public read-only: fetch proposal by share token. No auth; no write operations. Uses service role to bypass RLS when token is valid. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return NextResponse.json(
      { error: "Share lookup not configured" },
      { status: 503 }
    );
  }

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  const { data: row, error } = await admin
    .from("proposals")
    .select("id, title, slides, share_enabled, share_token")
    .eq("share_token", token)
    .eq("share_enabled", true)
    .single();

  if (error || !row) {
    return NextResponse.json({ error: "Not found or sharing disabled" }, { status: 404 });
  }

  return NextResponse.json({
    id: row.id,
    title: row.title,
    slides: row.slides ?? [],
  });
}
