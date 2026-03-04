"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { getProposal, updateProposal } from "@/lib/queries/proposals";
import type { ProposalRow, GeneratedProposalContent } from "@/lib/queries/proposals";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getClients } from "@/lib/queries/clients";
import type { ClientRow } from "@/lib/queries/clients";

export default function EditProposalPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [clientId, setClientId] = useState("");
  const [estimatedPrice, setEstimatedPrice] = useState("");
  const [currency, setCurrency] = useState("GBP");
  const [submitting, setSubmitting] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    async function load() {
      const [pRes, cRes] = await Promise.all([getProposal(id), getClients()]);
      setClients(cRes.data ?? []);
      const p = pRes.data as ProposalRow | null;
      if (p) {
        setTitle(p.title);
        setDescription(p.description ?? "");
        setClientId(p.client_id ?? "");
        setEstimatedPrice(p.estimated_price != null ? String(p.estimated_price) : "");
        setCurrency(p.currency ?? "GBP");
      }
      setLoading(false);
    }
    load();
  }, [id]);

  async function handleSubmit(status?: "draft" | "sent") {
    const t = title.trim();
    const d = description.trim();
    if (!t || !d) {
      toast.error("Title and description are required");
      return;
    }
    setSubmitting(true);
    setRegenerating(true);

    let generated: GeneratedProposalContent = {};
    try {
      const res = await fetch("/api/proposals/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: t, description: d }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to regenerate proposal");
        setSubmitting(false);
        setRegenerating(false);
        return;
      }
      generated = data.generated ?? {};
    } catch {
      toast.error("Failed to regenerate proposal");
      setSubmitting(false);
      setRegenerating(false);
      return;
    }

    setRegenerating(false);
    const numPrice = estimatedPrice.trim() ? parseFloat(estimatedPrice) : null;
    const priceValue = numPrice !== null && Number.isFinite(numPrice) ? numPrice : null;
    const updates = {
      title: t,
      description: d,
      client_id: clientId || null,
      generated_content: Object.keys(generated).length > 0 ? generated : null,
      estimated_price: priceValue,
      currency: currency || "GBP",
      ...(status && { status }),
    };
    const { error } = await updateProposal(id, updates);
    setSubmitting(false);
    if (error) {
      toast.error(error.message ?? "Failed to save proposal");
      return;
    }
    toast.success(status ? (status === "sent" ? "Proposal sent" : "Draft saved") : "Proposal updated");
    router.push(`/proposals/${id}`);
    router.refresh();
  }

  if (loading) {
    return (
      <main className="p-6">
        <div className="animate-pulse text-[var(--text-muted)]">Loading...</div>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href={`/proposals/${id}`}
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)]"
        >
          ← Back to proposal
        </Link>
      </div>
      <h1 className="text-2xl font-semibold mb-2">Edit proposal</h1>
      <p className="text-sm text-[var(--text-muted)] mb-6">
        Update the project title and description. Saving will regenerate the full proposal document.
      </p>

      <div className="space-y-5">
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
            placeholder="Describe the project..."
            rows={6}
            className="w-full px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[var(--radius-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--border-active)] focus:outline-none transition-[var(--transition)]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            Client (optional)
          </label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-[var(--radius-card)] px-3 py-2 text-sm"
          >
            <option value="">No client</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            Estimated price (optional)
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min={0}
              step={1}
              value={estimatedPrice}
              onChange={(e) => setEstimatedPrice(e.target.value)}
              placeholder="e.g. 12500"
              className="flex-1 px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[var(--radius-card)] text-sm"
            />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-20 px-2 py-2 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[var(--radius-card)] text-sm"
            >
              <option value="GBP">GBP</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-8">
        <Button
          variant="secondary"
          onClick={() => handleSubmit()}
          disabled={submitting || !title.trim() || !description.trim()}
        >
          {regenerating ? "Regenerating..." : "Save changes"}
        </Button>
        <Button
          variant="secondary"
          onClick={() => handleSubmit("draft")}
          disabled={submitting || !title.trim() || !description.trim()}
        >
          Save as draft
        </Button>
        <Button
          onClick={() => handleSubmit("sent")}
          disabled={submitting || !title.trim() || !description.trim()}
        >
          Save & send
        </Button>
      </div>
    </main>
  );
}
