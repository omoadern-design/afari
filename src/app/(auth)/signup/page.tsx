"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Loader2, Eye, EyeOff, AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";

const DEPARTMENTS = [
  "Engineering",
  "Sales",
  "Marketing",
  "Finance",
  "Operations",
  "Human Resources",
  "Legal",
  "Product",
  "Design",
  "Customer Success",
  "Executive",
  "Other",
];

const INPUT_CLASS =
  "w-full rounded-lg border border-[#e5e5e5] bg-[#f7f7f7] px-3.5 py-2.5 text-sm text-[#16161D] placeholder:text-[#b0b0b0] transition-all focus:border-[#7400CC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7400CC]/15";

const LABEL_CLASS = "mb-1.5 block text-xs font-semibold uppercase tracking-widest text-[#737373]";

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const labels = ["Weak", "Fair", "Good", "Strong"];
  const colors = ["bg-red-400", "bg-amber-400", "bg-[#FFAA00]", "bg-[#7400CC]"];

  return (
    <div className="mt-1.5 space-y-1">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all ${i < score ? colors[score - 1] : "bg-[#e5e5e5]"}`}
          />
        ))}
      </div>
      <p className="text-[11px] text-[#a3a3a3]">
        {labels[score - 1] ?? "Too short"} — {score < 4 ? "add uppercase, numbers, or symbols" : "great password!"}
      </p>
    </div>
  );
}

export default function SignUpPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    department: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword]   = useState(false);
  const [isLoading, setIsLoading]         = useState(false);
  const [error, setError]                 = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          department: form.department,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Registration failed. Please try again.");
        setIsLoading(false);
        return;
      }

      // Auto sign-in after registration
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (!result || result.error) {
        window.location.assign("/login");
      } else {
        window.location.assign("/dashboard");
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-[#e8e8e8] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.07)] p-8">
      {/* Header */}
      <div className="mb-7">
        <h2 className="text-[1.4rem] font-bold tracking-tight text-[#16161D]">Create your account</h2>
        <p className="mt-1.5 text-sm text-[#737373]">Start managing corporate travel for your team</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full name */}
        <div>
          <label htmlFor="name" className={LABEL_CLASS}>Full name</label>
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            placeholder="Ada Okonkwo"
            required
            autoComplete="name"
            className={INPUT_CLASS}
          />
        </div>

        {/* Work email */}
        <div>
          <label htmlFor="email" className={LABEL_CLASS}>Work email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@company.com"
            required
            autoComplete="email"
            className={INPUT_CLASS}
          />
        </div>

        {/* Department */}
        <div>
          <label htmlFor="department" className={LABEL_CLASS}>Department</label>
          <select
            id="department"
            name="department"
            value={form.department}
            onChange={handleChange}
            required
            className={INPUT_CLASS}
          >
            <option value="">Select your department</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className={LABEL_CLASS}>Password</label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              placeholder="Min. 8 characters"
              required
              autoComplete="new-password"
              className={`${INPUT_CLASS} pr-11`}
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
          <PasswordStrength password={form.password} />
        </div>

        {/* Confirm password */}
        <div>
          <label htmlFor="confirmPassword" className={LABEL_CLASS}>Confirm password</label>
          <div className="relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
              autoComplete="new-password"
              className={`${INPUT_CLASS} pr-11`}
            />
            {form.confirmPassword && form.password === form.confirmPassword && (
              <CheckCircle2 className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7400CC]" />
            )}
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
            <><Loader2 className="h-4 w-4 animate-spin" /> Creating account…</>
          ) : (
            <>Create account <ArrowRight className="h-4 w-4" /></>
          )}
        </button>
      </form>

      {/* Sign in link */}
      <p className="mt-5 text-center text-sm text-[#737373]">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-[#7400CC] hover:underline">
          Sign in
        </Link>
      </p>

      {/* Terms */}
      <p className="mt-4 text-center text-[11px] text-[#b0b0b0]">
        By creating an account you agree to AFARI&apos;s{" "}
        <span className="text-[#7400CC]">Terms of Service</span> and{" "}
        <span className="text-[#7400CC]">Privacy Policy</span>.
      </p>
    </div>
  );
}
