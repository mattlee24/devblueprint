"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { getClients } from "@/lib/queries/clients";
import { createProposal } from "@/lib/queries/proposals";
import type { ClientRow } from "@/lib/queries/clients";
import type { ProposalSlide } from "@/lib/queries/proposals";
import { ArrowLeft, Sparkles } from "lucide-react";

type ToneOption = "professional" | "friendly" | "technical";

function NewProposalForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedClient = searchParams.get("client") ?? "";

  const [clients, setClients] = useState<ClientRow[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [clientId, setClientId] = useState(preselectedClient);
  const [tone, setTone] = useState<ToneOption>("professional");
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
        body: JSON.stringify({ title: t, description: d, clientId: clientId || null, tone }),
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
  const descLength = description.length;

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <Link
        href="/proposals"
        className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 transition mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to proposals
      </Link>

      <h1 className="text-2xl font-semibold font-mono text-neutral-900 mb-1">New proposal</h1>
      <p className="text-sm text-neutral-500 mb-8">
        Enter the project title and description. AI will generate a 9+ slide proposal; you can edit slides and add or remove slides, then preview before sending.
      </p>

      <div className="rounded-xl border border-neutral-200 bg-white p-8 space-y-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
            Project title
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Acme Corp Marketing Website"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
            Project description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the project: goals, audience, key requirements..."
            rows={5}
            className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-teal-400 focus:border-transparent focus:bg-white outline-none transition"
          />
          <p className="text-xs text-neutral-400 italic mt-1">
            The more detail you provide, the better the generated proposal.
          </p>
          <p className="text-xs text-neutral-400 text-right mt-1">
            {descLength} character{descLength !== 1 ? "s" : ""}
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
            Client (optional)
          </label>
          <Select
            options={[{ value: "", label: "No client" }, ...clients.map((c) => ({ value: c.id, label: c.name }))]}
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            placeholder="Select client"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
            Tone (optional)
          </label>
          <div className="flex flex-wrap gap-2">
            {(["professional", "friendly", "technical"] as const).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setTone(opt)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  tone === opt
                    ? "bg-teal-500 text-white border-teal-500"
                    : "border-neutral-200 text-neutral-600 hover:border-neutral-400"
                }`}
              >
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2">
          <Button
            className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-2"
            onClick={handleGenerate}
            disabled={!canGenerate || generating}
          >
            <Sparkles className="w-4 h-4" />
            {generating ? "Generating…" : "Generate proposal"}
          </Button>
          <p className="text-xs text-neutral-400 text-center mt-2">
            AI will generate a 9+ slide proposal · Review before sending
          </p>
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
          <div className="animate-pulse text-neutral-500">Loading...</div>
        </main>
      }
    >
      <NewProposalForm />
    </Suspense>
  );
}
