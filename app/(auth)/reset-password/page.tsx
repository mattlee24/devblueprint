"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace("/login?redirectTo=/reset-password");
      }
    });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSuccess(true);
    setTimeout(() => router.push("/login?reset=success"), 2000);
  }

  if (success) {
    return (
      <div className="w-full max-w-[400px] mx-auto border border-[var(--border)] rounded-[var(--radius-card)] bg-[var(--bg-surface)] p-8 shadow-sm text-center">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-2">Password updated</h1>
        <p className="text-[var(--text-secondary)] text-sm mb-6">
          Your password has been reset. Redirecting you to sign in…
        </p>
        <Link
          href="/login"
          className="text-[var(--accent)] hover:underline font-medium"
        >
          Sign in now
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[400px] mx-auto border border-[var(--border)] rounded-[var(--radius-card)] bg-[var(--bg-surface)] p-8 shadow-sm">
      <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-1">Set new password</h1>
      <p className="text-[var(--text-secondary)] text-sm mb-8">
        Enter your new password below.
      </p>
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <p className="text-[var(--accent-red)] text-sm">{error}</p>
        )}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
            New password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-3 py-2.5 bg-[var(--bg-base)] border border-[var(--border)] rounded-[var(--radius-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--border-active)] focus:outline-none transition-[var(--transition)]"
          />
          <p className="text-xs text-[var(--text-muted)] mt-1">At least 6 characters</p>
        </div>
        <div>
          <label htmlFor="confirm" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
            Confirm password
          </label>
          <input
            id="confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={6}
            className="w-full px-3 py-2.5 bg-[var(--bg-base)] border border-[var(--border)] rounded-[var(--radius-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--border-active)] focus:outline-none transition-[var(--transition)]"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-[var(--accent)] text-[var(--accent-foreground)] font-medium rounded-[var(--radius-card)] border-0 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? "Updating…" : "Update password"}
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
