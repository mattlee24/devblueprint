"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getClients } from "@/lib/queries/clients";
import { createProposal } from "@/lib/queries/proposals";
import { GeneratedProposalView } from "@/components/proposals/GeneratedProposalView";
import type { ClientRow } from "@/lib/queries/clients";
import type { GeneratedProposalContent } from "@/lib/queries/proposals";
import { ArrowLeft, Pencil, Eye } from "lucide-react";

const CURRENCY_OPTIONS = [
  { value: "GBP", label: "GBP" },
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
];

function NewProposalForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedClient = searchParams.get("client") ?? "";

  const [clients, setClients] = useState<ClientRow[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [clientId, setClientId] = useState(preselectedClient);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  type Step = "form" | "preview";
  const [step, setStep] = useState<Step>("form");
  const [generatedContent, setGeneratedContent] = useState<GeneratedProposalContent | null>(null);
  const [estimatedPrice, setEstimatedPrice] = useState<string>("");
  const [currency, setCurrency] = useState<string>("GBP");
  const [previewEditMode, setPreviewEditMode] = useState(false);

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
        body: JSON.stringify({ title: t, description: d }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to generate proposal");
        setGenerating(false);
        return;
      }
      const generated = (data.generated ?? {}) as GeneratedProposalContent;
      setGeneratedContent(generated);
      if (typeof data.estimated_total === "number" && Number.isFinite(data.estimated_total)) {
        setEstimatedPrice(String(data.estimated_total));
      } else {
        setEstimatedPrice("");
      }
      setStep("preview");
      setPreviewEditMode(false);
    } catch {
      toast.error("Failed to generate proposal");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSaveDraftOrSend(status: "draft" | "sent") {
    const t = title.trim();
    const d = description.trim();
    if (!t || !d) {
      toast.error("Title and description are required");
      return;
    }
    if (!generatedContent || Object.keys(generatedContent).length === 0) {
      toast.error("Generate the proposal first");
      return;
    }
    setSaving(true);
    const numPrice = estimatedPrice.trim() ? parseFloat(estimatedPrice) : null;
    const priceValue = numPrice !== null && Number.isFinite(numPrice) ? numPrice : null;
    const { data: proposal, error } = await createProposal({
      title: t,
      description: d,
      client_id: clientId || null,
      status,
      generated_content: generatedContent,
      estimated_price: priceValue,
      currency: currency || "GBP",
    });
    setSaving(false);
    if (error) {
      toast.error(error.message ?? "Failed to save proposal");
      return;
    }
    toast.success(status === "sent" ? "Proposal sent" : "Proposal saved as draft");
    if (proposal) router.push(`/proposals/${proposal.id}`);
    router.refresh();
  }

  const canGenerate = title.trim().length > 0 && description.trim().length > 0;

  return (
    <main className="p-6 max-w-6xl mx-auto">
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
        Enter the project title and description. Generate a full professional proposal, then preview and edit before saving or sending.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
        {/* Left column: form (and in preview, summary + estimated price) */}
        <div className="space-y-6">
          <div className="border border-[var(--border)] rounded-xl p-5 bg-[var(--bg-surface)]">
            <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-4">
              Project details
            </h2>
            <div className="space-y-4">
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
            </div>
          </div>

          {step === "preview" && (
            <div className="border border-[var(--border)] rounded-xl p-5 bg-[var(--bg-surface)]">
              <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-3">
                Estimated price
              </h2>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={estimatedPrice}
                  onChange={(e) => setEstimatedPrice(e.target.value)}
                  placeholder="e.g. 12500"
                  className="flex-1 px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[var(--radius-card)] text-[var(--text-primary)] text-sm"
                />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-20 px-2 py-2 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[var(--radius-card)] text-sm"
                >
                  {CURRENCY_OPTIONS.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Editable before saving. Pre-filled from AI when available.
              </p>
            </div>
          )}

          {step === "form" && (
            <div className="flex gap-3">
              <Button
                onClick={handleGenerate}
                disabled={!canGenerate || generating}
              >
                {generating ? "Generating…" : "Generate proposal"}
              </Button>
            </div>
          )}

          {step === "preview" && (
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" onClick={() => setStep("form")}>
                <ArrowLeft className="w-4 h-4 shrink-0" />
                Back to form
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleSaveDraftOrSend("draft")}
                disabled={saving}
              >
                {saving ? "Saving…" : "Save as draft"}
              </Button>
              <Button onClick={() => handleSaveDraftOrSend("sent")} disabled={saving}>
                {saving ? "Sending…" : "Send proposal"}
              </Button>
            </div>
          )}
        </div>

        {/* Right column: preview (after generate) or placeholder */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          {step === "form" && (
            <div className="border border-dashed border-[var(--border)] rounded-xl p-8 bg-[var(--bg-elevated)]/50 text-center text-[var(--text-muted)] text-sm">
              <p>Fill in the project details and click <strong>Generate proposal</strong> to create a draft. You can then preview and edit the content before saving or sending.</p>
            </div>
          )}

          {step === "preview" && generatedContent && (
            <div className="border border-[var(--border)] rounded-xl bg-[var(--bg-surface)] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--bg-elevated)]">
                <span className="text-sm font-medium text-[var(--text-muted)]">
                  Proposal preview
                </span>
                <Button
                  variant="ghost"
                  className="text-sm"
                  onClick={() => setPreviewEditMode((e) => !e)}
                >
                  {previewEditMode ? (
                    <>
                      <Eye className="w-3.5 h-3.5 shrink-0" />
                      Preview
                    </>
                  ) : (
                    <>
                      <Pencil className="w-3.5 h-3.5 shrink-0" />
                      Edit content
                    </>
                  )}
                </Button>
              </div>
              <div className="p-4 max-h-[70vh] overflow-y-auto">
                <GeneratedProposalView
                  content={generatedContent}
                  editable={previewEditMode}
                  onContentChange={previewEditMode ? setGeneratedContent : undefined}
                />
              </div>
            </div>
          )}
        </div>
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
