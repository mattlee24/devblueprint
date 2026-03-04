"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { getClient, updateClient } from "@/lib/queries/clients";
import { ClientForm } from "@/components/clients/ClientForm";
import type { ClientRow } from "@/lib/queries/clients";

export default function EditClientPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [data, setData] = useState<Partial<ClientRow>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getClient(id).then((res) => {
      setData(res.data ?? {});
      setLoading(false);
    });
  }, [id]);

  async function handleSubmit() {
    const { error } = await updateClient(id, data);
    if (error) {
      toast.error(error.message ?? "Failed to save client");
      return;
    }
    toast.success("Client updated");
    router.push(`/clients/${id}`);
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
    <main className="p-6">
      <Link href={`/clients/${id}`} className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] mb-4 inline-block">
        ← Back to client
      </Link>
      <h1 className="text-2xl font-semibold mb-6">Edit Client</h1>
      <ClientForm data={data} onChange={setData} submitLabel="Save" onSubmit={handleSubmit} />
    </main>
  );
}
