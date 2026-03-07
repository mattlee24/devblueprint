"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function EditProposalPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === "string" && params.id.trim() ? params.id.trim() : null;

  useEffect(() => {
    if (id) router.replace(`/proposals/${id}`);
  }, [id, router]);

  if (!id) {
    return (
      <main className="p-6">
        <p className="text-[var(--text-secondary)]">Proposal not found.</p>
        <Link href="/proposals" className="text-[var(--accent)] hover:underline mt-2 inline-block">Back to proposals</Link>
      </main>
    );
  }

  return (
    <main className="p-6">
      <div className="animate-pulse text-[var(--text-muted)]">Redirecting to whiteboard…</div>
    </main>
  );
}
