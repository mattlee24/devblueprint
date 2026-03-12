"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ProposalDeckPreview } from "@/components/proposals/ProposalDeckPreview";
import { normalizeSlides, type ProposalSlide, type RawProposalSlide } from "@/lib/queries/proposals";

export default function ShareProposalPage() {
  const params = useParams();
  const token = params.token as string | undefined;
  const [data, setData] = useState<{ title: string; slides: ProposalSlide[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!token) {
      setError(true);
      setLoading(false);
      return;
    }
    let cancelled = false;
    fetch(`/api/proposals/share/${encodeURIComponent(token)}`)
      .then((res) => {
        if (cancelled) return;
        if (!res.ok) {
          setError(true);
          setLoading(false);
          return;
        }
        return res.json();
      })
      .then((json) => {
        if (cancelled || !json) return;
        const slides = normalizeSlides((json.slides ?? []) as RawProposalSlide[]);
        setData({ title: json.title ?? "Proposal", slides });
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[var(--bg-base)]">
        <p className="text-[var(--text-muted)]">Loading proposal…</p>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[var(--bg-base)]">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Proposal not found</h1>
          <p className="text-[var(--text-muted)] mt-2">
            This link may be invalid or sharing has been disabled.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-[var(--proposal-canvas-bg,#F9F7F4)]">
      <header className="shrink-0 border-b border-[#E8E8E8] bg-white px-4 py-3">
        <h1 className="text-lg font-semibold text-[var(--text-primary)] truncate">
          {data.title}
        </h1>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">
          View-only · Use arrows or buttons to move between slides
        </p>
      </header>
      <div className="flex-1 min-h-0 p-4 flex flex-col">
        <ProposalDeckPreview
          slides={data.slides}
          title={data.title}
          className="flex-1 min-h-[400px]"
        />
      </div>
    </main>
  );
}
