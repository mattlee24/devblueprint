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
import { ArrowLeft } from "lucide-react";

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

  const bannerStyle = bannerUrl.trim()
    ? { backgroundImage: `url(${bannerUrl.trim()})`, backgroundSize: "cover", backgroundPosition: "center" }
    : { background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)" };

  const typeLabel = type.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const statusLabel = status.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const selectedClient = clients.find((c) => c.id === clientId);

  if (loading || !project) {
    return (
      <main className="p-6">
        <div className="animate-pulse text-neutral-500">Loading...</div>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <Link
        href={`/projects/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 transition mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to project
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold font-mono text-neutral-900 mb-6">Edit project</h1>

          <div className="space-y-6">
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3">
                Basics
              </h2>
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
                hideClient
              />
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Client
                  </label>
                  <Select
                    options={[{ value: "", label: "No client" }, ...clients.map((c) => ({ value: c.id, label: c.name }))]}
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Status
                  </label>
                  <Select
                    options={STATUS_OPTIONS}
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3 mt-6">
                Appearance (optional)
              </h2>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
                Banner image URL
              </label>
              <Input
                placeholder="https://example.com/banner.jpg"
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
              />
              <p className="text-xs text-neutral-400 mt-1">
                Leave empty to use the gradient. Paste an image URL to override.
              </p>
            </section>

            <div className="flex gap-2 pt-4 border-t border-neutral-100">
              <Button onClick={handleSave} disabled={saving} className="bg-teal-500 hover:bg-teal-600 text-white">
                {saving ? "Saving…" : "Save changes"}
              </Button>
              <Link href={`/projects/${id}`}>
                <Button variant="secondary">Cancel</Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="lg:sticky lg:top-6 h-fit">
          <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 px-4 pt-3 pb-1">
              Preview
            </p>
            <div
              className="h-24 w-full"
              style={bannerStyle}
            />
            <div className="p-4">
              <h3 className="text-base font-semibold font-mono text-neutral-900 truncate">
                {title || "Project name"}
              </h3>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700">
                  {typeLabel}
                </span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700">
                  {statusLabel}
                </span>
              </div>
              {selectedClient && (
                <p className="text-sm text-teal-500 mt-2">{selectedClient.name}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
