import { AfariLogo } from "@/components/icons/AfariLogo";
import { Plane, Receipt, BarChart3, Shield } from "lucide-react";

const features = [
  { icon: <Plane className="h-4 w-4" />,     title: "Book travel in seconds",          desc: "Flights, hotels, and cars — in-policy, instantly confirmed." },
  { icon: <Receipt className="h-4 w-4" />,   title: "Expense management, simplified",   desc: "Submit receipts, track reimbursements, flag anomalies with AI." },
  { icon: <BarChart3 className="h-4 w-4" />, title: "Full spend visibility",            desc: "Real-time dashboards and ROI analytics for finance teams." },
  { icon: <Shield className="h-4 w-4" />,    title: "Automatic policy enforcement",     desc: "Configurable rules with multi-level approval workflows." },
];

function ParabolaArches() {
  return (
    <svg
      className="absolute inset-x-0 top-0 w-full"
      viewBox="0 0 440 380"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="arch-a" x1="0" y1="0" x2="440" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFAA00" />
          <stop offset="1" stopColor="#7400CC" />
        </linearGradient>
        <linearGradient id="arch-b" x1="440" y1="0" x2="0" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFAA00" />
          <stop offset="1" stopColor="#7400CC" />
        </linearGradient>
      </defs>
      {/* Outermost arch */}
      <path d="M -80 380 Q 220 -130 520 380" stroke="url(#arch-a)" strokeWidth="1.5" fill="none" opacity="0.25" />
      {/* Outer arch */}
      <path d="M -20 380 Q 220 -50 480 380"  stroke="url(#arch-b)" strokeWidth="1.5" fill="none" opacity="0.35" />
      {/* Main arch */}
      <path d="M 40 380 Q 220 30 400 380"    stroke="url(#arch-a)" strokeWidth="2"   fill="none" opacity="0.55" />
      {/* Inner arch */}
      <path d="M 90 380 Q 220 110 350 380"   stroke="url(#arch-b)" strokeWidth="1.5" fill="none" opacity="0.45" />
      {/* Innermost arch */}
      <path d="M 135 380 Q 220 190 305 380"  stroke="url(#arch-a)" strokeWidth="1"   fill="none" opacity="0.35" />
      {/* Orange glow dot at apex */}
      <circle cx="220" cy="28" r="3" fill="#FFAA00" opacity="0.7" />
      <circle cx="220" cy="28" r="8" fill="#FFAA00" opacity="0.15" />
      {/* Purple glow dot at right */}
      <circle cx="400" cy="380" r="4" fill="#7400CC" opacity="0.5" />
      <circle cx="40"  cy="380" r="4" fill="#FFAA00" opacity="0.5" />
    </svg>
  );
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-white">
      {/* ── Left — Navan-themed brand panel ── */}
      <div className="relative hidden overflow-hidden lg:flex lg:w-[46%] flex-col justify-between bg-[#16161D] px-12 py-10">
        <ParabolaArches />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <AfariLogo size={38} variant="dark" />
          <div className="leading-none">
            <p className="text-[17px] font-bold tracking-tight text-white">AFARI</p>
            <p className="text-[11px] text-white/40 mt-0.5 tracking-wide">Work Smart. Travel Easy.</p>
          </div>
        </div>

        {/* Hero copy */}
        <div className="relative z-10 space-y-9">
          <div>
            <h1 className="text-[2.1rem] font-bold leading-tight text-white">
              The coordination layer for corporate movement in Africa.
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-white/50">
              From Lagos to Nairobi. Booking, approvals, and spend analytics — all in one place.
            </p>
          </div>

          <ul className="space-y-5">
            {features.map((f) => (
              <li key={f.title} className="flex gap-3.5">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/5 text-[#FFAA00]">
                  {f.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{f.title}</p>
                  <p className="text-xs leading-relaxed text-white/40">{f.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom bar — orange + purple pill */}
        <div className="relative z-10 flex items-center justify-between">
          <p className="text-[11px] text-white/20">© 2026 AFARI Inc. All rights reserved.</p>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#FFAA00]" />
            <span className="h-2 w-2 rounded-full bg-[#7400CC]" />
          </div>
        </div>
      </div>

      {/* ── Right — form panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-[#fafafa] px-6 py-12">
        {/* Mobile logo */}
        <div className="mb-8 flex flex-col items-center gap-2 lg:hidden">
          <AfariLogo size={44} variant="dark" />
          <p className="text-[11px] tracking-widest font-bold text-[#16161D] uppercase">AFARI</p>
        </div>
        <div className="w-full max-w-[380px]">{children}</div>
      </div>
    </div>
  );
}
