import { AfariLogo } from "@/components/icons/AfariLogo";
import { Plane, Receipt, BarChart3, Shield } from "lucide-react";

const features = [
  { icon: <Plane className="h-4 w-4" />,    title: "Book travel in seconds",       desc: "Flights, hotels, and cars — in-policy, instantly confirmed." },
  { icon: <Receipt className="h-4 w-4" />,  title: "Expense management, simplified", desc: "Submit receipts, track reimbursements, flag anomalies with AI." },
  { icon: <BarChart3 className="h-4 w-4" />, title: "Full spend visibility",         desc: "Real-time dashboards and ROI analytics for finance teams." },
  { icon: <Shield className="h-4 w-4" />,   title: "Automatic policy enforcement",  desc: "Configurable rules with multi-level approval workflows." },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* ── Left — brand panel ── */}
      <div className="hidden lg:flex lg:w-[44%] flex-col justify-between bg-[#0a0a0a] px-12 py-10">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <AfariLogo size={38} variant="dark" />
          <div className="leading-none">
            <p className="text-[17px] font-bold tracking-tight text-white">afari</p>
            <p className="text-[11px] text-white/40 mt-0.5 tracking-wide">Work Smart. Travel Easy.</p>
          </div>
        </div>

        {/* Hero */}
        <div className="space-y-9">
          <div>
            <h1 className="text-[2rem] font-bold leading-tight text-white">
              The smarter way to manage corporate travel and expenses.
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-white/50">
              One platform for booking, approvals, and finance analytics — built for modern teams.
            </p>
          </div>

          <ul className="space-y-5">
            {features.map((f) => (
              <li key={f.title} className="flex gap-3.5">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 text-white/60">
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

        <p className="text-[11px] text-white/20">© 2026 Afari Inc. All rights reserved.</p>
      </div>

      {/* ── Right — form panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-[#f7f7f7] px-6 py-12">
        {/* Mobile logo */}
        <div className="mb-8 flex flex-col items-center gap-2 lg:hidden">
          <AfariLogo size={44} variant="dark" />
          <p className="text-xs text-[#737373] tracking-wide">Work Smart. Travel Easy.</p>
        </div>
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
