import { Logo } from "@/components/ui/Logo";

export default function Loading() {
  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center">
      <Logo />
      <div className="mt-8 flex items-center gap-2 text-sm text-navy-500">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-terracotta-400 animate-pulse-soft" />
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-terracotta-400 animate-pulse-soft [animation-delay:200ms]" />
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-terracotta-400 animate-pulse-soft [animation-delay:400ms]" />
        <span className="ml-2">Coordinating…</span>
      </div>
    </div>
  );
}
