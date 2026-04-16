import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Lock, ArrowRight, Sparkles } from "@/components/icons";

export const metadata: Metadata = { title: "Join your team" };

export default function AcceptInvitePage() {
  return (
    <div className="animate-fade-in-up">
      <div className="inline-flex items-center gap-2 rounded-full bg-terracotta-50 px-3 py-1 text-xs text-terracotta-700 font-medium">
        <Sparkles size={12} /> Invitation from Baobab Energy Group
      </div>
      <h1 className="mt-6 font-display text-display-3 text-navy-800">
        Welcome to AFARI, Femi.
      </h1>
      <p className="mt-2 text-navy-500">
        Set a password and you're in. We'll take you straight to your home
        screen.
      </p>

      <form className="mt-8 space-y-5" action="/home">
        <Input label="Email" defaultValue="femi.adeyemi@baobab.co" disabled />
        <Input
          type="password"
          label="Create password"
          placeholder="At least 10 characters"
          iconLeft={<Lock size={16} />}
          required
        />
        <Button type="submit" size="lg" className="w-full" iconRight={<ArrowRight size={18} />}>
          Join the team
        </Button>
      </form>

      <p className="mt-10 text-sm text-navy-500">
        Not you?{" "}
        <Link href="#" className="text-terracotta-500 hover:underline">
          Decline this invitation
        </Link>
      </p>
    </div>
  );
}
