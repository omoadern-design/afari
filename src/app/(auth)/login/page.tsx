import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Mail, Lock, Eye, ArrowRight, Shield } from "@/components/icons";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="animate-fade-in-up">
      <h1 className="font-display text-display-3 text-navy-800">
        Sign in
      </h1>
      <p className="mt-2 text-navy-500">
        New here?{" "}
        <Link
          href="/signup"
          className="text-terracotta-500 font-medium hover:underline underline-offset-4"
        >
          Create your workspace
        </Link>
      </p>

      <form className="mt-8 space-y-5" action="/home">
        <Input
          name="email"
          type="email"
          label="Work email"
          placeholder="you@yourcompany.com"
          autoComplete="email"
          iconLeft={<Mail size={16} />}
          required
        />
        <div>
          <Input
            name="password"
            type="password"
            label="Password"
            placeholder="••••••••••"
            autoComplete="current-password"
            iconLeft={<Lock size={16} />}
            iconRight={<Eye size={16} />}
            required
          />
          <div className="mt-2 flex items-center justify-between text-sm">
            <label className="inline-flex items-center gap-2 text-navy-600 cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-sand-300 text-terracotta-500 focus:ring-terracotta-400/30"
              />
              Remember me on this device
            </label>
            <Link
              href="/forgot-password"
              className="text-navy-600 hover:text-terracotta-500"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full" iconRight={<ArrowRight size={18} />}>
          Sign in
        </Button>
      </form>

      <div className="my-8 flex items-center gap-4 text-xs text-navy-400">
        <div className="h-px flex-1 bg-sand-200" />
        OR
        <div className="h-px flex-1 bg-sand-200" />
      </div>

      <div className="space-y-3">
        <SSOButton provider="Google Workspace" />
        <SSOButton provider="Microsoft 365" />
        <SSOButton provider="SAML / Okta / OneLogin" enterprise />
      </div>

      <div className="mt-10 flex items-center gap-2 text-xs text-navy-500">
        <Shield size={14} />
        Protected by enterprise-grade encryption · MFA available
      </div>
    </div>
  );
}

function SSOButton({ provider, enterprise }: { provider: string; enterprise?: boolean }) {
  return (
    <button
      type="button"
      className="w-full inline-flex items-center justify-between rounded-xl border border-sand-300 bg-white px-4 py-3 text-sm text-navy-800 hover:border-navy-300 hover:bg-sand-50 transition-colors"
    >
      <span className="font-medium">Continue with {provider}</span>
      <span className="text-xs text-navy-400">
        {enterprise ? "Enterprise SSO" : "OAuth"}
      </span>
    </button>
  );
}
