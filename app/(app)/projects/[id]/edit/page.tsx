"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { getProject, updateProject } from "@/lib/queries/projects";
import { getClients } from "@/lib/queries/clients";
import type { ProjectRow } from "@/lib/queries/projects";
import type { ClientRow } from "@/lib/queries/clients";
import type { ProjectType } from "@/lib/types";
import { StepIdentity } from "@/components/wizard/StepIdentity";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";

const TYPE_OPTIONS: { value: ProjectType; label: string }[] = [
  { value: "website", label: "Website" },
  { value: "web_application", label: "Web Application" },
  { value: "mobile_app", label: "Mobile App" },
  { value: "api", label: "API or Backend" },
  { value: "cli", label: "CLI Tool" },
  { value: "other", label: "Other" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "on_hold", label: "On hold" },
  { value: "completed", label: "Completed" },
  { value: "archived", label: "Archived" },
];

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [project, setProject] = useState<ProjectRow | null>(null);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<ProjectType>("website");
  const [clientId, setClientId] = useState("");
  const [status, setStatus] = useState("active");
  const [bannerUrl, setBannerUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([getProject(id), getClients()]).then(([pRes, cRes]) => {
      if (pRes.data) {
        setProject(pRes.data);
        setTitle(pRes.data.title);
        setDescription(pRes.data.description ?? "");
        setType(pRes.data.type as ProjectType);
        setClientId(pRes.data.client_id ?? "");
        setStatus(pRes.data.status);
        setBannerUrl(pRes.data.banner_url ?? "");
      }
      setClients(cRes.data ?? []);
      setLoading(false);
    });
  }, [id]);

  async function handleSave() {
    if (!project) return;
    setSaving(true);
    const { error } = await updateProject(project.id, {
      title: title.trim(),
      description: description.trim() || null,
      type,
      client_id: clientId || null,
      status,
      banner_url: bannerUrl.trim() || null,
    });
    setSaving(false);
    if (error) {
      toast.error(error.message ?? "Failed to save project");
      return;
    }
    toast.success("Project updated");
    router.push(`/projects/${project.id}`);
    router.refresh();
  }

  if (loading || !project) {
    return (
      <main className="p-6">
        <div className="animate-pulse text-[var(--text-muted)]">Loading...</div>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-2xl">
      <Link href={`/projects/${id}`} className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] mb-4 inline-block">
        ← Back to project
      </Link>
      <h1 className="text-2xl font-semibold mb-6">Edit project</h1>
      <div className="space-y-6">
        <StepIdentity
          title={title}
          description={description}
          type={type}
          clientId={clientId}
          onTitleChange={setTitle}
          onDescriptionChange={setDescription}
          onTypeChange={setType}
          onClientChange={setClientId}
          clients={clients}
        />
        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1">Status</label>
          <Select
            options={STATUS_OPTIONS}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1">
            Banner image URL (optional)
          </label>
          <Input
            placeholder="https://example.com/banner.jpg"
            value={bannerUrl}
            onChange={(e) => setBannerUrl(e.target.value)}
          />
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Leave empty to use the auto-generated gradient. Paste an image URL to override.
          </p>
        </div>
      </div>
      <div className="flex gap-2 mt-8">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
        <Link href={`/projects/${id}`}>
          <Button variant="secondary">Cancel</Button>
        </Link>
      </div>
    </main>
  );
}
