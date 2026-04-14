import { Compass, Plane, Receipt, BarChart3, Shield } from "lucide-react";

const features = [
  {
    icon: <Plane className="h-4 w-4" />,
    title: "Smart travel booking",
    desc: "Book flights, hotels, and cars — in-policy, instantly.",
  },
  {
    icon: <Receipt className="h-4 w-4" />,
    title: "Effortless expense management",
    desc: "Submit, track, and reimburse expenses with AI anomaly detection.",
  },
  {
    icon: <BarChart3 className="h-4 w-4" />,
    title: "Full finance visibility",
    desc: "Real-time spend dashboards, budget tracking, and ROI analytics.",
  },
  {
    icon: <Shield className="h-4 w-4" />,
    title: "Policy enforcement",
    desc: "Automatic compliance checks with configurable approval workflows.",
  },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between bg-[#0b1d35] px-12 py-10">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1dbd80]">
            <Compass className="h-5 w-5 text-white" />
          </div>
          <div className="leading-none">
            <span className="text-xl font-bold tracking-tight text-white">afari</span>
            <span className="ml-2 text-xs font-medium text-[#8da0bb]">travel &amp; expense</span>
          </div>
        </div>

        {/* Hero copy */}
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold leading-snug text-white">
              The smarter way to manage <span className="text-[#1dbd80]">corporate travel</span> and expenses.
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[#8da0bb]">
              One platform for booking, approvals, and finance analytics — powered by AI, built for modern teams.
            </p>
          </div>

          <ul className="space-y-5">
            {features.map((f) => (
              <li key={f.title} className="flex gap-3.5">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#1dbd80]/15 text-[#1dbd80]">
                  {f.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{f.title}</p>
                  <p className="text-xs leading-relaxed text-[#8da0bb]">{f.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <p className="text-xs text-[#4a5e80]">
          Inspired by Navan · TravelPerk · SAP Concur · Ramp
        </p>
      </div>

      {/* ── Right panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-white px-6 py-10">
        {/* Mobile logo */}
        <div className="mb-8 flex items-center gap-2.5 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#1dbd80]">
            <Compass className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-[#0c1d3d]">afari</span>
        </div>
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
