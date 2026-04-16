"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Eye, EyeOff, AlertCircle, ArrowRight } from "lucide-react";

const demoAccounts = [
  { label: "Admin",    role: "ADMIN",    email: "admin@acme.com",         password: "admin123"    },
  { label: "Finance",  role: "FINANCE",  email: "finance@acme.com",       password: "finance123"  },
  { label: "Manager",  role: "MANAGER",  email: "sarah.manager@acme.com", password: "password123" },
  { label: "Employee", role: "EMPLOYEE", email: "alice@acme.com",         password: "password123" },
];

const ROLE_COLORS: Record<string, string> = {
  ADMIN:    "bg-[#7400CC] text-white",
  FINANCE:  "bg-[#FFAA00] text-[#16161D]",
  MANAGER:  "bg-[#16161D] text-white",
  EMPLOYEE: "bg-[#e5e5e5] text-[#16161D]",
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const [error, setError]               = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    const result = await signIn("credentials", { email, password, redirect: false });
    setIsLoading(false);
    if (result?.error) {
      setError("Invalid email or password. Please try again.");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  function fillDemo(account: { email: string; password: string }) {
    setEmail(account.email);
    setPassword(account.password);
    setError("");
  }

  return (
    <div className="rounded-2xl border border-[#e8e8e8] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.07)] p-8">
      {/* Header */}
      <div className="mb-7">
        <h2 className="text-[1.4rem] font-bold tracking-tight text-[#16161D]">Welcome back</h2>
        <p className="mt-1.5 text-sm text-[#737373]">Sign in to your AFARI workspace</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-[#737373]">
            Work email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            placeholder="you@company.com"
            required
            className="w-full rounded-lg border border-[#e5e5e5] bg-[#f7f7f7] px-3.5 py-2.5 text-sm text-[#16161D] placeholder:text-[#b0b0b0] transition-all focus:border-[#7400CC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7400CC]/15"
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-widest text-[#737373]">
              Password
            </label>
            <button type="button" className="text-xs font-medium text-[#7400CC] hover:underline">
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              placeholder="••••••••"
              required
              className="w-full rounded-lg border border-[#e5e5e5] bg-[#f7f7f7] px-3.5 py-2.5 pr-11 text-sm text-[#16161D] placeholder:text-[#b0b0b0] transition-all focus:border-[#7400CC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7400CC]/15"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#b0b0b0] hover:text-[#16161D] transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
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
          disabled={isLoading}
          className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-[#FFAA00] px-4 py-2.5 text-sm font-bold text-[#16161D] transition-all hover:bg-[#e09900] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[#FFAA00] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</>
          ) : (
            <>Sign in <ArrowRight className="h-4 w-4" /></>
          )}
        </button>
      </form>

      {/* Sign up link */}
      <p className="mt-5 text-center text-sm text-[#737373]">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-semibold text-[#7400CC] hover:underline">
          Create one
        </Link>
      </p>

      {/* Demo accounts */}
      <div className="mt-6">
        <div className="mb-3 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#ebebeb]" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[#b0b0b0]">try a demo account</span>
          <div className="h-px flex-1 bg-[#ebebeb]" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {demoAccounts.map((account) => (
            <button
              key={account.email}
              onClick={() => fillDemo(account)}
              className="flex items-center justify-between rounded-lg border border-[#ebebeb] bg-[#fafafa] px-3 py-2.5 text-left transition-all hover:border-[#7400CC]/30 hover:bg-white hover:shadow-sm"
            >
              <div>
                <p className="text-xs font-semibold text-[#16161D]">{account.label}</p>
                <p className="text-[11px] text-[#a3a3a3]">{account.email.split("@")[0]}</p>
              </div>
              <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${ROLE_COLORS[account.role]}`}>
                {account.role.charAt(0) + account.role.slice(1).toLowerCase()}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
