import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { Shield, ArrowRight } from "@/components/icons";

export const metadata: Metadata = { title: "Two-factor authentication" };

export default function MfaPage() {
  return (
    <div className="animate-fade-in-up">
      <div className="inline-flex items-center gap-2 rounded-full bg-navy-50 px-3 py-1 text-xs text-navy-700 font-medium">
        <Shield size={12} /> Extra step · admin session
      </div>
      <h1 className="mt-6 font-display text-display-3 text-navy-800">
        Enter your six-digit code
      </h1>
      <p className="mt-2 text-navy-500">
        We sent a code to your authenticator app. It expires in 30 seconds.
      </p>

      <form className="mt-8 space-y-6" action="/admin/dashboard">
        <div>
          <label className="block text-sm font-medium text-navy-700 mb-2 tracking-tight">
            Verification code
          </label>
          <div className="flex gap-2" role="group" aria-label="Six digit code">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <input
                key={i}
                type="text"
                inputMode="numeric"
                maxLength={1}
                pattern="[0-9]"
                aria-label={`Digit ${i + 1}`}
                className="h-14 w-full text-center font-display text-2xl rounded-xl border border-sand-300 bg-white focus:border-terracotta-400 focus:ring-2 focus:ring-terracotta-400/20 outline-none"
              />
            ))}
          </div>
          <p className="mt-2 text-xs text-navy-500">
            Can't access your authenticator?{" "}
            <Link href="#" className="text-terracotta-500 hover:underline">
              Use a backup code
            </Link>
          </p>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          iconRight={<ArrowRight size={18} />}
        >
          Verify &amp; continue
        </Button>
      </form>

      <p className="mt-10 text-xs text-navy-500">
        Didn't ask for this?{" "}
        <Link href="/login" className="text-terracotta-500 hover:underline">
          Cancel sign-in
        </Link>
      </p>
    </div>
  );
}
