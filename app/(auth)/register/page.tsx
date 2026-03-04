"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await signUp(email, password);
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="border border-[var(--border)] rounded p-6 bg-[var(--bg-surface)]">
      <h1 className="text-xl font-medium mb-1">DevBlueprint</h1>
      <p className="text-[var(--text-secondary)] text-sm mb-6">Create an account</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="text-[var(--accent-red)] text-sm">{" > ERROR: "}{error}</p>
        )}
        <div>
          <label htmlFor="email" className="block text-sm text-[var(--text-secondary)] mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border)] rounded text-[var(--text-primary)] focus:border-[var(--border-active)] focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm text-[var(--text-secondary)] mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border)] rounded text-[var(--text-primary)] focus:border-[var(--border-active)] focus:outline-none transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-[var(--accent-green)] text-[var(--bg-base)] font-medium rounded border-0 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>
      <p className="mt-4 text-sm text-[var(--text-secondary)]">
        Already have an account?{" "}
        <Link href="/login" className="text-[var(--accent-blue)] hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
