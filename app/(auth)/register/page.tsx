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
    <>
      <h2 className="text-2xl font-semibold font-mono text-neutral-900 mb-1">Create account</h2>
      <p className="text-sm text-neutral-500 mb-8">Register for DevBlueprint</p>
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
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-neutral-600 mb-1.5">
            Password
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
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-teal-500 hover:bg-teal-600 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2"
        >
          {loading ? "Creating account…" : "Register"}
        </button>
      </form>
      <p className="mt-6 text-sm text-center text-neutral-500">
        Already have an account?{" "}
        <Link href="/login" className="text-teal-500 hover:text-teal-700 font-medium">
          Sign in
        </Link>
      </p>
    </>
  );
}
