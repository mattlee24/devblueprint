import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { randomUUID } from "crypto";

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
    .select("id, user_id, share_token, share_enabled")
    .eq("id", id)
    .single();

  if (!proposal || proposal.user_id !== user.id) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  const shareToken = proposal.share_token ?? randomUUID();
  const { error: updateError } = await supabase
    .from("proposals")
    .update({
      share_token: shareToken,
      share_enabled: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json(
      { error: updateError.message ?? "Failed to enable sharing" },
      { status: 500 }
    );
  }

  const baseUrl =
    typeof process.env.NEXT_PUBLIC_APP_URL === "string" &&
    process.env.NEXT_PUBLIC_APP_URL.length > 0
      ? process.env.NEXT_PUBLIC_APP_URL
      : typeof window !== "undefined"
        ? window.location.origin
        : "";
  const shareUrl = baseUrl
    ? `${baseUrl.replace(/\/$/, "")}/share/proposals/${shareToken}`
    : `${shareToken}`;

  return NextResponse.json({
    shareToken,
    shareUrl,
  });
}
