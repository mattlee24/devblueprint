"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { getClients } from "@/lib/queries/clients";
import { createInvoice } from "@/lib/queries/invoices";
import { generateInvoiceNumber } from "@/lib/utils";
import type { ClientRow } from "@/lib/queries/clients";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";

function NewInvoiceForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedClient = searchParams.get("client") ?? "";
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [clientId, setClientId] = useState(preselectedClient);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getClients().then((res) => {
      setClients(res.data ?? []);
      if (preselectedClient) setClientId(preselectedClient);
      setLoading(false);
    });
  }, [preselectedClient]);

  async function handleCreate() {
    if (!clientId) return;
    const res = await createInvoice({
      client_id: clientId,
      invoice_number: generateInvoiceNumber(1),
      status: "draft",
    });
    if (res.error) {
      toast.error(res.error.message ?? "Failed to create invoice");
      return;
    }
    if (res.data) {
      toast.success("Invoice created");
      router.push(`/invoices/${res.data.id}`);
      router.refresh();
    }
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
      <Link href="/invoices" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] mb-4 inline-block">
        ← Back to invoices
      </Link>
      <h1 className="text-2xl font-semibold mb-6">New Invoice</h1>
      <div className="max-w-md space-y-4">
        <Select
          label="Client"
          options={clients.map((c) => ({ value: c.id, label: c.name }))}
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          placeholder="Select client"
        />
        <Button onClick={handleCreate} disabled={!clientId}>
          Create draft invoice
        </Button>
      </div>
    </main>
  );
}

export default function NewInvoicePage() {
  return (
    <Suspense fallback={
      <main className="p-6">
        <div className="animate-pulse text-[var(--text-muted)]">Loading...</div>
      </main>
    }>
      <NewInvoiceForm />
    </Suspense>
  );
}
