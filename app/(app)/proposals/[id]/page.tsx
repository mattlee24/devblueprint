"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { getProposal, updateProposal, deleteProposal } from "@/lib/queries/proposals";
import type { ProposalRow } from "@/lib/queries/proposals";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatDate } from "@/lib/utils";
import { Pencil, Check, X, FolderKanban, Trash2 } from "lucide-react";

type ProposalWithClient = ProposalRow & { clients?: { id: string; name: string } | null };

export default function ProposalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [proposal, setProposal] = useState<ProposalWithClient | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    getProposal(id).then((res) => {
      setProposal((res.data ?? null) as ProposalWithClient | null);
      setLoading(false);
    });
  }, [id]);

  async function handleStatusUpdate(status: "agreed" | "declined") {
    const { error } = await updateProposal(id, { status });
    if (error) {
      toast.error(error.message ?? "Failed to update status");
      return;
    }
    toast.success(status === "agreed" ? "Marked as agreed" : "Marked as declined");
    setProposal((p) => (p ? { ...p, status } : null));
    router.refresh();
  }

  async function handleDelete() {
    setDeleteLoading(true);
    const { error } = await deleteProposal(id);
    setDeleteLoading(false);
    if (error) {
      toast.error(error.message ?? "Failed to delete proposal");
      return;
    }
    toast.success("Proposal deleted");
    router.push("/proposals");
    router.refresh();
  }

  if (loading || !proposal) {
    return (
      <main className="p-6">
        <div className="animate-pulse text-[var(--text-muted)]">Loading...</div>
      </main>
    );
  }

  const clientName = (proposal.clients as { name?: string } | null)?.name ?? "No client";

  return (
    <main className="p-6">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Proposals", href: "/proposals" },
          { label: proposal.title },
        ]}
        className="mb-4"
      />
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border)] pb-6 mb-6">
        <div>
          <h1 className="text-2xl font-semibold">{proposal.title}</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {clientName} · {formatDate(proposal.updated_at)}
          </p>
          <Badge
            variant={
              proposal.status === "agreed"
                ? "success"
                : proposal.status === "declined"
                  ? "danger"
                  : "default"
            }
            className="mt-2"
          >
            [{proposal.status.toUpperCase()}]
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/proposals/${id}/edit`}>
            <Button variant="ghost">
              <Pencil className="w-4 h-4 shrink-0" />
              Edit
            </Button>
          </Link>
          {proposal.status !== "agreed" && proposal.status !== "declined" && (
            <>
              <Button variant="secondary" onClick={() => handleStatusUpdate("agreed")}>
                <Check className="w-4 h-4 shrink-0" />
                Mark as agreed
              </Button>
              <Button variant="secondary" onClick={() => handleStatusUpdate("declined")}>
                <X className="w-4 h-4 shrink-0" />
                Mark as declined
              </Button>
            </>
          )}
          <Link href={`/projects/new?fromProposal=${id}`}>
            <Button>
              <FolderKanban className="w-4 h-4 shrink-0" />
              Create project from proposal
            </Button>
          </Link>
          <Button
            variant="ghost"
            onClick={() => setDeleteOpen(true)}
            className="text-[var(--accent-red)] hover:text-[var(--accent-red)]"
          >
            <Trash2 className="w-4 h-4 shrink-0" />
            Delete
          </Button>
        </div>
      </header>

      <div className="space-y-6 max-w-3xl">
        <section className="border border-[var(--border)] rounded-lg p-4">
          <h2 className="text-sm font-medium text-[var(--text-muted)] mb-2">Description</h2>
          <p className="text-[var(--text-secondary)] whitespace-pre-wrap">
            {proposal.description || "—"}
          </p>
        </section>
        <section className="border border-[var(--border)] rounded-lg p-4">
          <h2 className="text-sm font-medium text-[var(--text-muted)] mb-2">Type & stack</h2>
          <p className="capitalize text-[var(--text-secondary)]">{proposal.type.replace("_", " ")}</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {(proposal.stack ?? []).map((s) => (
              <span
                key={s}
                className="px-2 py-0.5 rounded border border-[var(--border)] text-sm"
              >
                {s}
              </span>
            ))}
          </div>
        </section>
        {proposal.target_audience && (
          <section className="border border-[var(--border)] rounded-lg p-4">
            <h2 className="text-sm font-medium text-[var(--text-muted)] mb-2">Target audience</h2>
            <p className="text-[var(--text-secondary)]">{proposal.target_audience}</p>
          </section>
        )}
        {(proposal.goals ?? []).length > 0 && (
          <section className="border border-[var(--border)] rounded-lg p-4">
            <h2 className="text-sm font-medium text-[var(--text-muted)] mb-2">Key goals</h2>
            <ul className="list-disc list-inside space-y-1 text-[var(--text-secondary)]">
              {(proposal.goals as string[]).map((g, i) => (
                <li key={i}>{g}</li>
              ))}
            </ul>
          </section>
        )}
        {proposal.constraints && (
          <section className="border border-[var(--border)] rounded-lg p-4">
            <h2 className="text-sm font-medium text-[var(--text-muted)] mb-2">Constraints</h2>
            <p className="text-[var(--text-secondary)] whitespace-pre-wrap">{proposal.constraints}</p>
          </section>
        )}
        {proposal.hourly_rate_override != null && (
          <section className="border border-[var(--border)] rounded-lg p-4">
            <h2 className="text-sm font-medium text-[var(--text-muted)] mb-2">Hourly rate override</h2>
            <p className="text-[var(--text-secondary)]">{proposal.hourly_rate_override}</p>
          </section>
        )}
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete proposal"
        message={`Delete "${proposal.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleteLoading}
      />
    </main>
  );
}
