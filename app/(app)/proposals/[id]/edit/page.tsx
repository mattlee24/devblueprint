"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditProposalPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  useEffect(() => {
    router.replace(`/proposals/${id}`);
  }, [id, router]);

  return (
    <main className="p-6">
      <div className="animate-pulse text-[var(--text-muted)]">Redirecting to whiteboard…</div>
    </main>
  );
}
