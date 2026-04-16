"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Mail, CheckCircle2, AlertCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [sent, setSent]         = useState(false);
  const [error, setError]       = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed");
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-[#e8e8e8] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.07)] p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircle2 className="h-7 w-7 text-emerald-600" />
        </div>
        <h2 className="text-lg font-bold text-[#16161D]">Check your inbox</h2>
        <p className="mt-2 text-sm text-[#737373]">
          If <span className="font-medium text-[#16161D]">{email}</span> is registered, you'll receive a password reset link within a few minutes.
        </p>
        <p className="mt-4 text-xs text-[#a3a3a3]">
          Didn't get it? Check your spam folder or{" "}
          <button
            onClick={() => { setSent(false); setEmail(""); }}
            className="font-medium text-[#7400CC] hover:underline"
          >
            try again
          </button>.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[#7400CC] hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#e8e8e8] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.07)] p-8">
      {/* Back */}
      <Link
        href="/login"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-[#737373] hover:text-[#16161D] transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to sign in
      </Link>

      {/* Header */}
      <div className="mb-7">
        <h2 className="text-[1.4rem] font-bold tracking-tight text-[#16161D]">Forgot your password?</h2>
        <p className="mt-1.5 text-sm text-[#737373]">
          Enter your work email and we'll send a reset link valid for 1 hour.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-[#737373]">
            Work email
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#b0b0b0]" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              placeholder="you@company.com"
              required
              className="w-full rounded-lg border border-[#e5e5e5] bg-[#f7f7f7] pl-10 pr-3.5 py-2.5 text-sm text-[#16161D] placeholder:text-[#b0b0b0] transition-all focus:border-[#7400CC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7400CC]/15"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#FFAA00] px-4 py-2.5 text-sm font-bold text-[#16161D] transition-all hover:bg-[#e09900] focus:outline-none focus:ring-2 focus:ring-[#FFAA00] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>
          ) : (
            "Send reset link"
          )}
        </button>
      </form>
    </div>
  );
}
