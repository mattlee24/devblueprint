"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/dashboard";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <>
      <h2 className="text-2xl font-semibold font-mono text-neutral-900 mb-1">Sign in</h2>
      <p className="text-sm text-neutral-500 mb-8">Welcome back</p>
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
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-neutral-600">
              Password
            </label>
            <Link href="/forgot-password" className="text-xs text-teal-500 hover:text-teal-700 font-medium">
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-teal-400 focus:border-transparent focus:bg-white outline-none transition"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-teal-500 hover:bg-teal-600 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="mt-6 text-sm text-center text-neutral-500">
        No account?{" "}
        <Link href="/register" className="text-teal-500 hover:text-teal-700 font-medium">
          Register
        </Link>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-neutral-200 rounded w-1/3" />
          <div className="h-4 bg-neutral-100 rounded w-2/3" />
          <div className="h-10 bg-neutral-100 rounded" />
          <div className="h-10 bg-neutral-100 rounded" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
