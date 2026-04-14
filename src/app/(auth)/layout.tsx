import { Compass } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
            <Compass className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-2xl font-bold text-white tracking-tight">afari</span>
            <span className="ml-2 text-sm text-blue-300">travel & expense</span>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
