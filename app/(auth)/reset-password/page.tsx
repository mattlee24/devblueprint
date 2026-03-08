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
      <>
        <h2 className="text-2xl font-semibold font-mono text-neutral-900 mb-2">Password updated</h2>
        <p className="text-sm text-neutral-500 mb-6">
          Your password has been reset. Redirecting you to sign in…
        </p>
        <Link href="/login" className="text-teal-500 hover:text-teal-700 font-medium">
          Sign in now
        </Link>
      </>
    );
  }

  return (
    <>
      <h2 className="text-2xl font-semibold font-mono text-neutral-900 mb-1">Set new password</h2>
      <p className="text-sm text-neutral-500 mb-8">
        Enter your new password below.
      </p>
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-neutral-600 mb-1.5">
            New password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-teal-400 focus:border-transparent focus:bg-white outline-none transition"
          />
          <p className="text-xs text-neutral-400 mt-1">At least 6 characters</p>
        </div>
        <div>
          <label htmlFor="confirm" className="block text-sm font-medium text-neutral-600 mb-1.5">
            Confirm password
          </label>
          <input
            id="confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={6}
            className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-teal-400 focus:border-transparent focus:bg-white outline-none transition"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-teal-500 hover:bg-teal-600 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2"
        >
          {loading ? "Updating…" : "Update password"}
        </button>
      </form>
      <p className="mt-6 text-sm text-center text-neutral-500">
        <Link href="/login" className="text-teal-500 hover:text-teal-700 font-medium">
          Back to sign in
        </Link>
      </p>
    </>
  );
}
