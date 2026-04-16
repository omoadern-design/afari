"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { ArrowRight } from "@/components/icons";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production this would forward to Sentry / Datadog.
    // eslint-disable-next-line no-console
    console.error("[AFARI] unhandled error", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <header className="container-page py-6">
        <Logo />
      </header>
      <main className="flex-1 container-page flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-xs uppercase tracking-[0.2em] text-navy-500">
            Something slipped
          </div>
          <h1 className="mt-3 font-display text-display-2 text-navy-800">
            We took a wrong turn.
          </h1>
          <p className="mt-3 text-navy-600">
            The issue is on our side. We've noted it. Try again, or head back
            to somewhere calm.
          </p>
          {error.digest && (
            <p className="mt-3 text-xs text-navy-500 font-mono">
              Trace · {error.digest}
            </p>
          )}
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button onClick={reset} iconRight={<ArrowRight size={16} />}>
              Try again
            </Button>
            <Button href="/" variant="outline">
              Back to home
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
