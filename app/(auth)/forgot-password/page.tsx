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
      <>
        <h2 className="text-2xl font-semibold font-mono text-neutral-900 mb-1">Check your email</h2>
        <p className="text-sm text-neutral-500 mb-6">
          If an account exists for {email}, you will receive an email with a link to reset your password.
        </p>
        <Link
          href="/login"
          className="block w-full bg-teal-500 hover:bg-teal-600 text-white font-medium py-2.5 rounded-lg text-center transition"
        >
          Back to sign in
        </Link>
      </>
    );
  }

  return (
    <>
      <h2 className="text-2xl font-semibold font-mono text-neutral-900 mb-1">Reset password</h2>
      <p className="text-sm text-neutral-500 mb-8">
        Enter your email and we&apos;ll send you a link to reset your password.
      </p>
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <p className="text-red-600 text-sm">Something went wrong. Please try again.</p>
        )}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-neutral-600 mb-1.5">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-teal-400 focus:border-transparent focus:bg-white outline-none transition"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-teal-500 hover:bg-teal-600 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2"
        >
          {loading ? "Sending…" : "Send reset link"}
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
