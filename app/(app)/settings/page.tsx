"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/AuthProvider";
import { getProfile, upsertProfile } from "@/lib/queries/profiles";
import type { ProfileRow } from "@/lib/queries/profiles";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Partial<ProfileRow>>({});
  const [loading, setLoading] = useState(true);
  const [seedLoading, setSeedLoading] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);
  const [seedAllLoading, setSeedAllLoading] = useState(false);
  const [seedAllMessage, setSeedAllMessage] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);

  useEffect(() => {
    getProfile().then((res) => {
      setProfile(res.data ?? {});
      setLoading(false);
    });
  }, []);

  async function handleSave() {
    const { error } = await upsertProfile(profile);
    if (error) {
      toast.error(error.message ?? "Failed to save profile");
      return;
    }
    toast.success("Profile saved");
  }

  async function handleSeedClients() {
    setSeedLoading(true);
    setSeedMessage(null);
    try {
      const res = await fetch("/api/seed/clients", { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        const msg = json.error ?? "Failed to seed clients";
        setSeedMessage(msg);
        toast.error(msg);
        return;
      }
      const msg = `Created ${json.count} dummy clients.`;
      setSeedMessage(msg);
      toast.success(msg);
    } catch {
      setSeedMessage("Request failed.");
    } finally {
      setSeedLoading(false);
    }
  }

  async function handleSeedAll() {
    setSeedAllLoading(true);
    setSeedAllMessage(null);
    try {
      const res = await fetch("/api/seed/all", { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        const msg = json.error ?? "Failed to seed data";
        setSeedAllMessage(msg);
        toast.error(msg);
        return;
      }
      const msg = `Created: ${json.clients} clients, ${json.projects} projects, ${json.timeLogs} time logs, ${json.invoices} invoices. Refresh the app to see them.`;
      setSeedAllMessage(msg);
      toast.success("Demo data created");
    } catch {
      setSeedAllMessage("Request failed.");
    } finally {
      setSeedAllLoading(false);
    }
  }

  async function handleDeleteAccount() {
    setDeleteLoading(true);
    setDeleteMessage(null);
    try {
      const res = await fetch("/api/account/delete", { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        const msg = json.error ?? "Failed to delete account.";
        setDeleteMessage(msg);
        toast.error(msg);
        return;
      }
      toast.success("Account deleted");
      await signOut();
      router.push("/login");
      router.refresh();
    } catch {
      setDeleteMessage("Request failed.");
    } finally {
      setDeleteLoading(false);
    }
  }

  if (loading) {
    return (
      <PageContainer>
        <div className="animate-pulse text-[var(--text-muted)]">Loading...</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title="Settings" description="Manage your profile and preferences." icon={Settings} />

      <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader title="Profile" titleClassName="uppercase tracking-widest text-neutral-400" />
        <CardContent>
        <div className="space-y-4">
          <Input
            label="Display name"
            value={profile.display_name ?? ""}
            onChange={(e) => setProfile((p) => ({ ...p, display_name: e.target.value }))}
          />
          <p className="text-sm text-[var(--text-muted)]">
            Email (from auth): {user?.email ?? "—"}
          </p>
        </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Business info (for invoices)" titleClassName="uppercase tracking-widest text-neutral-400" />
        <CardContent>
        <div className="space-y-4">
          <Input
            label="Company logo (URL)"
            type="url"
            placeholder="https://…"
            value={profile.logo_path ?? ""}
            onChange={(e) => setProfile((p) => ({ ...p, logo_path: e.target.value || null }))}
          />
          <p className="text-xs text-[var(--text-muted)]">Public image URL for your logo. Shown on invoices. Leave empty for no logo.</p>
          <Input
            label="Business name"
            value={profile.business_name ?? ""}
            onChange={(e) => setProfile((p) => ({ ...p, business_name: e.target.value }))}
          />
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Address</label>
            <textarea
              value={profile.business_address ?? ""}
              onChange={(e) => setProfile((p) => ({ ...p, business_address: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[var(--radius-card)] text-[var(--text-primary)]"
            />
          </div>
          <Input
            label="Business email"
            value={profile.business_email ?? ""}
            onChange={(e) => setProfile((p) => ({ ...p, business_email: e.target.value }))}
          />
          <Input
            label="Business phone"
            value={profile.business_phone ?? ""}
            onChange={(e) => setProfile((p) => ({ ...p, business_phone: e.target.value }))}
          />
          <Input
            label="Tax / VAT number"
            value={profile.tax_number ?? ""}
            onChange={(e) => setProfile((p) => ({ ...p, tax_number: e.target.value }))}
          />
        </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Defaults" titleClassName="uppercase tracking-widest text-neutral-400" />
        <CardContent>
        <div className="space-y-4">
          <Input
            label="Default currency"
            value={profile.default_currency ?? "GBP"}
            onChange={(e) => setProfile((p) => ({ ...p, default_currency: e.target.value }))}
          />
          <Input
            label="Default hourly rate"
            type="number"
            value={profile.default_hourly_rate ?? ""}
            onChange={(e) => setProfile((p) => ({ ...p, default_hourly_rate: e.target.value ? parseFloat(e.target.value) : null }))}
          />
          <Input
            label="Default tax rate (%)"
            type="number"
            value={profile.default_tax_rate ?? ""}
            onChange={(e) => setProfile((p) => ({ ...p, default_tax_rate: e.target.value ? parseFloat(e.target.value) : 0 }))}
          />
        </div>
        <div className="flex gap-2 pt-2">
          <Button onClick={handleSave} className="cursor-pointer">Save changes</Button>
        </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Demo data" titleClassName="uppercase tracking-widest text-neutral-400" />
        <CardContent>
        <p className="text-sm text-[var(--text-muted)] mb-4">
          Add sample data to your account. &quot;Seed all&quot; creates clients, projects, tasks, time logs, and invoices.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={handleSeedAll}
            disabled={seedAllLoading}
          >
            {seedAllLoading ? "Seeding…" : "Seed all dummy data"}
          </Button>
          <Button
            variant="ghost"
            onClick={handleSeedClients}
            disabled={seedLoading}
          >
            {seedLoading ? "Seeding…" : "Seed clients only"}
          </Button>
        </div>
        {(seedAllMessage || seedMessage) && (
          <p className="text-sm mt-2 text-[var(--accent)] max-w-xl">
            {seedAllMessage ?? seedMessage}
          </p>
        )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Danger zone" titleClassName="uppercase tracking-widest text-neutral-400" />
        <CardContent>
        <p className="text-sm text-[var(--text-muted)] mb-4">
          Delete your account and all data. This cannot be undone.
        </p>
        <Button variant="danger" onClick={() => setDeleteOpen(true)}>
          Delete account
        </Button>
        {deleteMessage && (
          <p className="text-sm mt-2 text-[var(--accent-red)]">{deleteMessage}</p>
        )}
        </CardContent>
      </Card>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Delete account"
        message="This will permanently delete your account and all associated data (clients, projects, tasks, time logs, invoices, and profile). This cannot be undone."
        confirmLabel="Delete account"
        variant="danger"
        loading={deleteLoading}
      />
    </PageContainer>
  );
}
