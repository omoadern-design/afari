import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Mail, ArrowLeft, ArrowRight } from "@/components/icons";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <div className="animate-fade-in-up">
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 text-sm text-navy-500 hover:text-terracotta-500"
      >
        <ArrowLeft size={14} /> Back to sign in
      </Link>
      <h1 className="mt-6 font-display text-display-3 text-navy-800">
        Forgot your password?
      </h1>
      <p className="mt-2 text-navy-500">
        Enter your work email. We'll send a single-use reset link valid for one
        hour.
      </p>

      <form className="mt-8 space-y-5" action="/login">
        <Input
          name="email"
          type="email"
          label="Work email"
          placeholder="you@yourcompany.com"
          iconLeft={<Mail size={16} />}
          required
        />
        <Button type="submit" size="lg" className="w-full" iconRight={<ArrowRight size={18} />}>
          Send reset link
        </Button>
      </form>

      <p className="mt-10 text-sm text-navy-500">
        Need help?{" "}
        <Link href="#" className="text-terracotta-500 hover:underline">
          Talk to support
        </Link>
        .
      </p>
    </div>
  );
}
