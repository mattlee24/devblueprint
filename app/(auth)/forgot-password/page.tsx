"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="w-full max-w-[400px] mx-auto border border-[var(--border)] rounded-[var(--radius-lg)] bg-[var(--surface)] p-8 shadow-[var(--shadow-card)]">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-1">Check your email</h1>
        <p className="text-[var(--text-secondary)] text-sm mb-6">
          If an account exists for {email}, you will receive an email with a link to reset your password.
        </p>
        <Link
          href="/login"
          className="block w-full py-2.5 px-4 text-center text-[var(--accent-foreground)] font-medium rounded-[var(--radius-md)] hover:opacity-90 transition-opacity"
          style={{ background: "var(--gradient-accent)" }}
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[400px] mx-auto border border-[var(--border)] rounded-[var(--radius-lg)] bg-[var(--surface)] p-8 shadow-[var(--shadow-card)]">
      <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-1">Reset password</h1>
      <p className="text-[var(--text-secondary)] text-sm mb-8">
        Enter your email and we&apos;ll send you a link to reset your password.
      </p>
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
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 text-[var(--accent-foreground)] font-medium rounded-[var(--radius-md)] border-0 hover:opacity-90 transition-opacity disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
          style={{ background: "var(--gradient-accent)" }}
        >
          {loading ? "Sending…" : "Send reset link"}
        </button>
      </form>
      <p className="mt-6 text-sm text-center text-[var(--text-secondary)]">
        <Link href="/login" className="text-[var(--accent)] hover:underline font-medium">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
