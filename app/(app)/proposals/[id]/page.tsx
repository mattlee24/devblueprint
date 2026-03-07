"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { getProposal, updateProposal, deleteProposal } from "@/lib/queries/proposals";
import type { ProposalRow, GeneratedProposalContent, ProposalSlide } from "@/lib/queries/proposals";
import { getProfile } from "@/lib/queries/profiles";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageContainer } from "@/components/layout/PageContainer";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { GeneratedProposalView } from "@/components/proposals/GeneratedProposalView";
import { ProposalDeckEditor } from "@/components/proposals/ProposalDeckEditor";
import { ProposalDeckPreview } from "@/components/proposals/ProposalDeckPreview";
import { formatDate } from "@/lib/utils";
import { Pencil, Check, X, FolderKanban, Trash2, Share2, Link2, Unlink, Presentation } from "lucide-react";

type ProposalWithClient = ProposalRow & { clients?: { id: string; name: string } | null };

export default function ProposalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === "string" && params.id.trim() ? params.id.trim() : null;
  const [proposal, setProposal] = useState<ProposalWithClient | null>(null);
  const [companyName, setCompanyName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    getProposal(id).then((res) => {
      setProposal((res.data ?? null) as ProposalWithClient | null);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    getProfile().then((r) => {
      if (r.data?.business_name) setCompanyName(r.data.business_name);
    });
  }, []);

  async function handleStatusUpdate(status: "agreed" | "declined") {
    const { error } = await updateProposal(id!, { status });
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
    const { error } = await deleteProposal(id!);
    setDeleteLoading(false);
    if (error) {
      toast.error(error.message ?? "Failed to delete proposal");
      return;
    }
    toast.success("Proposal deleted");
    router.push("/proposals");
    router.refresh();
  }

  async function handleSlidesSave(slides: ProposalSlide[]) {
    const { error } = await updateProposal(id!, { slides });
    if (error) {
      toast.error(error.message ?? "Failed to save slides");
      return;
    }
    setProposal((p) => (p ? { ...p, slides } : null));
  }

  async function handleEnableShare() {
    setShareLoading(true);
    try {
      const res = await fetch(`/api/proposals/${id!}/share`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to create share link");
        return;
      }
      const url = data.shareUrl ?? (typeof window !== "undefined" ? `${window.location.origin}/share/proposals/${data.shareToken}` : "");
      setShareUrl(url);
      setShareModalOpen(true);
      setProposal((p) => (p ? { ...p, share_enabled: true, share_token: data.shareToken } : null));
      toast.success("Share link created");
    } finally {
      setShareLoading(false);
    }
  }

  async function handleDisableShare() {
    setShareLoading(true);
    try {
      const res = await fetch(`/api/proposals/${id!}/share/disable`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Failed to disable link");
        return;
      }
      setShareUrl(null);
      setShareModalOpen(false);
      setProposal((p) => (p ? { ...p, share_enabled: false, share_token: null } : null));
      toast.success("Share link disabled");
    } finally {
      setShareLoading(false);
    }
  }

  function openShareModal() {
    if (proposal?.share_enabled && proposal?.share_token) {
      const url = typeof window !== "undefined" ? `${window.location.origin}/share/proposals/${proposal.share_token}` : "";
      setShareUrl(url);
      setShareModalOpen(true);
    } else {
      handleEnableShare();
    }
  }

  function copyShareLink() {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl).then(() => toast.success("Link copied to clipboard"));
    }
  }

  if (!id) {
    return (
      <main>
        <PageContainer>
          <p className="text-[var(--text-secondary)]">Proposal not found.</p>
          <Link href="/proposals" className="text-[var(--accent)] hover:underline mt-2 inline-block cursor-pointer">Back to proposals</Link>
        </PageContainer>
      </main>
    );
  }
  if (loading || !proposal) {
    return (
      <main>
        <PageContainer>
          <div className="animate-pulse text-[var(--text-muted)]">Loading...</div>
        </PageContainer>
      </main>
    );
  }

  const clientName = (proposal.clients as { name?: string } | null)?.name ?? "No client";
  const generated = proposal.generated_content as GeneratedProposalContent | null | undefined;
  const hasGenerated = generated && Object.keys(generated).length > 0;

  return (
    <main>
      <PageContainer>
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
            {proposal.status.replace(/\b\w/g, (c) => c.toUpperCase())}
          </Badge>
          {proposal.estimated_price != null && (
            <p className="text-sm text-[var(--text-secondary)] mt-2">
              Estimated price: {proposal.currency ?? "GBP"} {Number(proposal.estimated_price).toLocaleString()}
            </p>
          )}
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
          {(proposal.slides?.length ?? 0) > 0 && (
            <>
              <Button
                variant="secondary"
                onClick={() => setPreviewMode(true)}
                className="cursor-pointer"
              >
                <Presentation className="w-4 h-4 shrink-0" />
                Preview
              </Button>
              {proposal.share_enabled ? (
                <Button variant="secondary" onClick={openShareModal} disabled={shareLoading} className="cursor-pointer">
                  <Link2 className="w-4 h-4 shrink-0" />
                  Copy share link
                </Button>
              ) : (
                <Button variant="secondary" onClick={handleEnableShare} disabled={shareLoading} className="cursor-pointer">
                  <Share2 className="w-4 h-4 shrink-0" />
                  {shareLoading ? "Creating…" : "Send proposal / Share"}
                </Button>
              )}
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

      {proposal.description && (
        <section className="mb-8 max-w-3xl">
          <h2 className="text-sm font-semibold text-[var(--text-muted)] mb-2">
            Summary
          </h2>
          <p className="text-[var(--text-secondary)] whitespace-pre-wrap">{proposal.description}</p>
        </section>
      )}

      {previewMode && (proposal.slides?.length ?? 0) > 0 ? (
        <div className="relative">
          <ProposalDeckPreview
            slides={proposal.slides ?? []}
            title={proposal.title}
            onClose={() => setPreviewMode(false)}
            showCloseButton
            companyName={companyName || undefined}
            className="min-h-[500px]"
          />
        </div>
      ) : (
        <>
          <ProposalDeckEditor
            proposalId={id}
            slides={proposal.slides ?? []}
            onSlidesChange={handleSlidesSave}
          />
          {!proposal.slides?.length && hasGenerated && (
            <section className="mt-6 border border-[var(--border)] rounded-xl p-5 bg-[var(--bg-surface)] max-w-3xl">
              <h2 className="text-sm font-semibold text-[var(--text-muted)] mb-2">Legacy content</h2>
              <GeneratedProposalView content={generated!} />
            </section>
          )}
          {!proposal.slides?.length && !hasGenerated && (
            <p className="text-sm text-[var(--text-muted)] mt-4 max-w-3xl">
              Add slides above or use &quot;Create project from proposal&quot; to start a project with the title and description.
            </p>
          )}
        </>
      )}

      {shareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setShareModalOpen(false)}>
          <div
            className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--bg-surface)] p-6 max-w-md w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-2">Share proposal</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-3">
              Anyone with this link can view the proposal as a slide deck (read-only).
            </p>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                readOnly
                value={shareUrl ?? ""}
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)]"
              />
              <Button variant="secondary" onClick={copyShareLink} className="cursor-pointer shrink-0">
                <Link2 className="w-4 h-4 shrink-0" />
                Copy
              </Button>
            </div>
            <div className="flex justify-between">
              <Button variant="ghost" onClick={handleDisableShare} disabled={shareLoading} className="text-[var(--accent-red)] cursor-pointer">
                <Unlink className="w-4 h-4 shrink-0" />
                Disable link
              </Button>
              <Button variant="secondary" onClick={() => setShareModalOpen(false)} className="cursor-pointer">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

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
      </PageContainer>
    </main>
  );
}
