"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getClients } from "@/lib/queries/clients";
import { createProposal } from "@/lib/queries/proposals";
import type { ClientRow } from "@/lib/queries/clients";
import type { ProposalSlide } from "@/lib/queries/proposals";
import { ArrowLeft } from "lucide-react";

function NewProposalForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedClient = searchParams.get("client") ?? "";

  const [clients, setClients] = useState<ClientRow[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [clientId, setClientId] = useState(preselectedClient);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    getClients().then((r) => {
      setClients(r.data ?? []);
      if (preselectedClient) setClientId(preselectedClient);
    });
  }, [preselectedClient]);

  async function handleGenerate() {
    const t = title.trim();
    const d = description.trim();
    if (!t || !d) {
      toast.error("Title and description are required");
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch("/api/proposals/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: t, description: d, clientId: clientId || null }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to generate proposal");
        setGenerating(false);
        return;
      }
      const slides = (data.slides ?? []) as ProposalSlide[];
      const projectCreationPayload = data.projectCreationPayload ?? {};
      const estimated_total = typeof data.estimated_total === "number" && Number.isFinite(data.estimated_total) ? data.estimated_total : null;

      const { data: proposal, error } = await createProposal({
        title: t,
        description: d,
        client_id: clientId || null,
        status: "draft",
        slides,
        generated_content: { projectCreationPayload },
        estimated_price: estimated_total,
        currency: "GBP",
      });
      if (error) {
        toast.error(error.message ?? "Failed to save proposal");
        setGenerating(false);
        return;
      }
      toast.success("Proposal created. You can edit slides and preview before sending.");
      if (proposal) router.push(`/proposals/${proposal.id}`);
      router.refresh();
    } catch {
      toast.error("Failed to generate proposal");
    } finally {
      setGenerating(false);
    }
  }

  const canGenerate = title.trim().length > 0 && description.trim().length > 0;

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/proposals"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--accent)]"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to proposals
        </Link>
      </div>

      <h1 className="text-2xl font-semibold mb-2">New proposal</h1>
      <p className="text-sm text-[var(--text-muted)] mb-6">
        Enter the project title and description. AI will generate a 9+ slide proposal; you can edit slides and add or remove slides, then preview before sending.
      </p>

      <div className="border border-[var(--border)] rounded-xl p-5 bg-[var(--bg-surface)] space-y-4">
        <Input
          label="Project title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Acme Corp Marketing Website"
          required
        />
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            Project description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the project: goals, audience, key requirements..."
            rows={5}
            className="w-full px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[var(--radius-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--border-active)] focus:outline-none transition-[var(--transition)] text-sm"
          />
          <p className="text-xs text-[var(--text-muted)] mt-1">
            The more detail you provide, the better the generated proposal.
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            Client (optional)
          </label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[var(--radius-card)] px-3 py-2 text-sm text-[var(--text-primary)]"
          >
            <option value="">No client</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <Button onClick={handleGenerate} disabled={!canGenerate || generating}>
          {generating ? "Generating…" : "Generate proposal"}
        </Button>
      </div>
    </main>
  );
}

export default function NewProposalPage() {
  return (
    <Suspense
      fallback={
        <main className="p-6">
          <div className="animate-pulse text-[var(--text-muted)]">Loading...</div>
        </main>
      }
    >
      <NewProposalForm />
    </Suspense>
  );
}
