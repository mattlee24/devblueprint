import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Proposal ID required" }, { status: 400 });
  }

  const { data: proposal } = await supabase
    .from("proposals")
    .select("id, user_id")
    .eq("id", id)
    .single();

  if (!proposal || proposal.user_id !== user.id) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  const { error: updateError } = await supabase
    .from("proposals")
    .update({
      share_enabled: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json(
      { error: updateError.message ?? "Failed to disable sharing" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
