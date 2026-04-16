import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { ArrowRight } from "@/components/icons";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <header className="container-page py-6">
        <Logo />
      </header>
      <main className="flex-1 container-page flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-xs uppercase tracking-[0.2em] text-navy-500">
            404 · Off the map
          </div>
          <h1 className="mt-3 font-display text-display-2 text-navy-800">
            Lost in transit.
          </h1>
          <p className="mt-3 text-navy-600">
            The page you're looking for either moved on, or never made it
            to the gate.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button href="/" iconRight={<ArrowRight size={16} />}>
              Back to home
            </Button>
            <Button href="/admin/dashboard" variant="outline">
              Movement Dashboard
            </Button>
          </div>
          <Link
            href="/home"
            className="mt-6 block text-sm text-terracotta-500 hover:underline"
          >
            …or open your travel home
          </Link>
        </div>
      </main>
    </div>
  );
}
