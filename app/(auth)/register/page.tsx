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
    <div className="w-full max-w-[400px] mx-auto border border-[var(--border)] rounded-[var(--radius-lg)] bg-[var(--surface)] p-8 shadow-[var(--shadow-card)]">
      <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-1">DevBlueprint</h1>
      <p className="text-[var(--text-secondary)] text-sm mb-8">Create your account</p>
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <p className="text-[var(--accent-red)] text-sm">Something went wrong. Please try again.</p>
        )}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-md)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-[var(--transition)]"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-3 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-md)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-[var(--transition)]"
          />
          <p className="text-xs text-[var(--text-muted)] mt-1">At least 6 characters</p>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 text-[var(--accent-foreground)] font-medium rounded-[var(--radius-md)] border-0 hover:opacity-90 transition-opacity disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
          style={{ background: "var(--gradient-accent)" }}
        >
          {loading ? "Creating account…" : "Register"}
        </button>
      </form>
      <p className="mt-6 text-sm text-center text-[var(--text-secondary)]">
        Already have an account?{" "}
        <Link href="/login" className="text-[var(--accent)] hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}
