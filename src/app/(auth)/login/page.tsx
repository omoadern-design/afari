"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff, AlertCircle, ChevronRight } from "lucide-react";

const demoAccounts = [
  { label: "Admin", role: "ADMIN", email: "admin@acme.com", password: "admin123" },
  { label: "Finance", role: "FINANCE", email: "finance@acme.com", password: "finance123" },
  { label: "Manager", role: "MANAGER", email: "sarah.manager@acme.com", password: "password123" },
  { label: "Employee", role: "EMPLOYEE", email: "alice@acme.com", password: "password123" },
];

const roleColors: Record<string, string> = {
  ADMIN: "bg-purple-100 text-purple-700",
  FINANCE: "bg-emerald-100 text-emerald-700",
  MANAGER: "bg-blue-100 text-blue-700",
  EMPLOYEE: "bg-slate-100 text-slate-600",
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

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
    <div>
      {/* Header */}
      <div className="mb-7">
        <h2 className="text-2xl font-bold text-[#0c1d3d]">Welcome back</h2>
        <p className="mt-1 text-sm text-[#6b7a99]">
          Sign in to your workspace to continue
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[#0c1d3d]">
            Work email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            required
            className="w-full rounded-lg border border-[#e5e9f0] bg-[#f4f6f9] px-3.5 py-2.5 text-sm text-[#0c1d3d] placeholder:text-[#9aa3b5] transition-colors focus:border-[#1dbd80] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1dbd80]/20"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-[#0c1d3d]">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full rounded-lg border border-[#e5e9f0] bg-[#f4f6f9] px-3.5 py-2.5 pr-11 text-sm text-[#0c1d3d] placeholder:text-[#9aa3b5] transition-colors focus:border-[#1dbd80] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1dbd80]/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8da0bb] hover:text-[#0c1d3d] transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-[#1dbd80] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#19a870] focus:outline-none focus:ring-2 focus:ring-[#1dbd80] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in…
            </>
          ) : (
            <>
              Sign in
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      {/* Demo accounts */}
      <div className="mt-8">
        <div className="mb-3 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#e5e9f0]" />
          <span className="text-xs font-medium text-[#9aa3b5]">demo accounts</span>
          <div className="h-px flex-1 bg-[#e5e9f0]" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {demoAccounts.map((account) => (
            <button
              key={account.email}
              onClick={() => fillDemo(account)}
              className="group flex items-center justify-between rounded-lg border border-[#e5e9f0] bg-white px-3 py-2.5 text-left transition-all hover:border-[#1dbd80]/40 hover:shadow-sm"
            >
              <div>
                <p className="text-xs font-semibold text-[#0c1d3d]">{account.label}</p>
                <p className="text-[11px] text-[#9aa3b5]">{account.email.split("@")[0]}</p>
              </div>
              <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${roleColors[account.role]}`}>
                {account.role.charAt(0) + account.role.slice(1).toLowerCase()}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
