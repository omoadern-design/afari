import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Lock, ArrowRight } from "@/components/icons";

export const metadata: Metadata = { title: "Reset password" };

export default function ResetPasswordPage() {
  return (
    <div className="animate-fade-in-up">
      <h1 className="font-display text-display-3 text-navy-800">
        Set a new password
      </h1>
      <p className="mt-2 text-navy-500">
        Choose something strong — AFARI checks strength with zxcvbn.
      </p>
      <form className="mt-8 space-y-5" action="/login">
        <Input
          type="password"
          label="New password"
          placeholder="At least 10 characters"
          iconLeft={<Lock size={16} />}
          required
        />
        <Input
          type="password"
          label="Confirm password"
          placeholder="Type it again"
          iconLeft={<Lock size={16} />}
          required
        />
        <Button type="submit" size="lg" className="w-full" iconRight={<ArrowRight size={18} />}>
          Reset password
        </Button>
      </form>
      <p className="mt-10 text-sm text-navy-500">
        Changed your mind?{" "}
        <Link href="/login" className="text-terracotta-500 hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
