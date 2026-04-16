import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Shield, Globe } from "@/components/icons";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-paper">
      {/* Left — branded panel */}
      <aside className="relative hidden lg:flex flex-col justify-between bg-navy-800 text-white p-12 overflow-hidden">
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(circle at 20% 20%, rgba(217,116,73,0.35), transparent 55%), radial-gradient(circle at 80% 80%, rgba(46,79,132,0.5), transparent 55%), linear-gradient(160deg, #06132A 0%, #0B1F3A 100%)",
          }}
        />
        <Logo variant="light" />
        <div className="relative max-w-md">
          <p className="text-xs uppercase tracking-[0.2em] text-white/60 mb-4">
            From the operating system for African business movement
          </p>
          <p className="font-display text-4xl leading-tight text-balance">
            Welcome back. <br />
            Let's <span className="text-terracotta-300">move.</span>
          </p>
          <p className="mt-6 text-white/70 leading-relaxed">
            Trip request to approval to booking to expense — one coordinated
            flow. Two hours becomes two minutes.
          </p>
        </div>

        <div className="relative flex flex-col gap-3 text-sm text-white/60">
          <div className="flex items-center gap-3">
            <Globe size={16} />
            <span>16 hubs · Lagos · Nairobi · Cape Town · Accra · Dakar</span>
          </div>
          <div className="flex items-center gap-3">
            <Shield size={16} />
            <span>SOC 2 Type II · GDPR · NDPR · POPIA · PCI DSS</span>
          </div>
        </div>
      </aside>

      {/* Right — form */}
      <main className="flex flex-col">
        <div className="flex items-center justify-between px-8 py-6 lg:hidden">
          <Logo />
        </div>
        <div className="flex-1 flex items-center justify-center px-6 py-10 lg:py-16">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>
        <footer className="px-8 py-6 text-xs text-navy-500 flex items-center justify-between">
          <select
            className="bg-transparent text-navy-500 outline-none cursor-pointer"
            aria-label="Language"
            defaultValue="en"
          >
            <option value="en">English</option>
            <option value="fr">Français</option>
            <option value="pt">Português</option>
            <option value="sw">Kiswahili</option>
          </select>
          <Link href="/" className="hover:text-terracotta-500">
            ← Back to afari.travel
          </Link>
        </footer>
      </main>
    </div>
  );
}
