"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { createClientRecord } from "@/lib/queries/clients";
import { ClientForm } from "@/components/clients/ClientForm";
import type { ClientRow } from "@/lib/queries/clients";

export default function NewClientPage() {
  const router = useRouter();
  const [data, setData] = useState<Partial<ClientRow>>({
    name: "",
    company: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    notes: "",
    status: "active",
    hourly_rate: null,
    currency: "GBP",
    avatar_colour: "#00ff88",
  });

  async function handleSubmit() {
    const res = await createClientRecord(data as Parameters<typeof createClientRecord>[0]);
    if (res.error) {
      toast.error(res.error.message ?? "Failed to create client");
      return;
    }
    toast.success("Client created");
    router.push(`/clients/${res.data?.id}`);
    router.refresh();
  }

  return (
    <main className="p-6">
      <Link href="/clients" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-blue)] mb-4 inline-block">
        ← Back to clients
      </Link>
      <h1 className="text-2xl font-semibold mb-6">New Client</h1>
      <ClientForm data={data} onChange={setData} submitLabel="Create client" onSubmit={handleSubmit} />
    </main>
  );
}
