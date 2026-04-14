"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff, AlertCircle, ArrowRight } from "lucide-react";

const demoAccounts = [
  { label: "Admin",    role: "ADMIN",    email: "admin@acme.com",           password: "admin123"   },
  { label: "Finance",  role: "FINANCE",  email: "finance@acme.com",         password: "finance123" },
  { label: "Manager",  role: "MANAGER",  email: "sarah.manager@acme.com",   password: "password123"},
  { label: "Employee", role: "EMPLOYEE", email: "alice@acme.com",           password: "password123"},
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading]     = useState(false);
  const [error, setError]             = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    const result = await signIn("credentials", { email, password, redirect: false });
    setIsLoading(false);
    if (result?.error) {
      setError("Invalid email or password.");
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
    <div className="rounded-2xl border border-[#e5e5e5] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#0a0a0a]">Sign in</h2>
        <p className="mt-1 text-sm text-[#737373]">Welcome back to your workspace</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#737373]">
            Work email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            required
            className="w-full rounded-lg border border-[#e5e5e5] bg-[#f7f7f7] px-3.5 py-2.5 text-sm text-[#0a0a0a] placeholder:text-[#a3a3a3] transition-colors focus:border-[#0a0a0a] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0a0a0a]/10"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#737373]">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full rounded-lg border border-[#e5e5e5] bg-[#f7f7f7] px-3.5 py-2.5 pr-11 text-sm text-[#0a0a0a] placeholder:text-[#a3a3a3] transition-colors focus:border-[#0a0a0a] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0a0a0a]/10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#a3a3a3] hover:text-[#0a0a0a] transition-colors"
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
          className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-[#0a0a0a] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#262626] focus:outline-none focus:ring-2 focus:ring-[#0a0a0a] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            <><Loader2 className="h-4 w-4 animate-spin" />Signing in…</>
          ) : (
            <>Sign in <ArrowRight className="h-4 w-4" /></>
          )}
        </button>
      </form>

      {/* Demo accounts */}
      <div className="mt-7">
        <div className="mb-3 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#e5e5e5]" />
          <span className="text-[11px] font-medium uppercase tracking-wider text-[#a3a3a3]">try a demo account</span>
          <div className="h-px flex-1 bg-[#e5e5e5]" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {demoAccounts.map((account) => (
            <button
              key={account.email}
              onClick={() => fillDemo(account)}
              className="flex items-center justify-between rounded-lg border border-[#e5e5e5] bg-[#f7f7f7] px-3 py-2.5 text-left transition-all hover:border-[#0a0a0a]/20 hover:bg-white hover:shadow-sm"
            >
              <div>
                <p className="text-xs font-semibold text-[#0a0a0a]">{account.label}</p>
                <p className="text-[11px] text-[#a3a3a3]">{account.email.split("@")[0]}</p>
              </div>
              <span className="rounded-md bg-[#0a0a0a] px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {account.role.charAt(0) + account.role.slice(1).toLowerCase()}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
