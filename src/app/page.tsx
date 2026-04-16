import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Logo } from "@/components/ui/Logo";
import { Badge } from "@/components/ui/Badge";
import {
  ArrowRight,
  Sparkles,
  Plane,
  Receipt,
  Wallet,
  Shield,
  Compass,
  Globe,
  Check,
  Building,
} from "@/components/icons";

export default function MarketingHome() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <SiteHeader />
      <Hero />
      <TrustBar />
      <Pillars />
      <ProductTour />
      <Outcomes />
      <Cities />
      <Testimonial />
      <FinalCTA />
      <SiteFooter />
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="container-page flex items-center justify-between py-6">
      <Logo />
      <nav className="hidden md:flex items-center gap-8 text-sm text-navy-700">
        <Link href="#product" className="hover:text-terracotta-500 transition-colors">
          Product
        </Link>
        <Link href="#outcomes" className="hover:text-terracotta-500 transition-colors">
          Outcomes
        </Link>
        <Link href="#cities" className="hover:text-terracotta-500 transition-colors">
          Coverage
        </Link>
        <Link href="/admin/dashboard" className="hover:text-terracotta-500 transition-colors">
          Live demo
        </Link>
      </nav>
      <div className="flex items-center gap-3">
        <Button href="/login" variant="ghost" size="sm">
          Sign in
        </Button>
        <Button href="/signup" size="sm" iconRight={<ArrowRight size={16} />}>
          Start
        </Button>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero-gradient relative overflow-hidden">
      <div className="container-page pt-16 pb-28 lg:pt-24 lg:pb-36 relative">
        <div className="max-w-3xl">
          <Badge tone="terracotta" className="mb-6">
            <Sparkles size={12} /> Built for African business movement
          </Badge>
          <h1 className="font-display text-display-1 text-balance text-navy-800">
            Calm in the middle of <em className="not-italic text-terracotta-500">chaos.</em>
          </h1>
          <p className="mt-6 text-xl lg:text-2xl text-navy-700/85 max-w-2xl text-pretty leading-relaxed">
            AFARI is the operating system for business travel in Africa.
            Trip request to approval to booking to expense — one coordinated flow.
            <span className="block mt-2 text-navy-600/75">
              Two hours becomes two minutes.
            </span>
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button href="/signup" size="lg" iconRight={<ArrowRight />}>
              Start in 2 minutes
            </Button>
            <Button href="/admin/dashboard" size="lg" variant="outline">
              See the live demo
            </Button>
          </div>
          <p className="mt-6 text-sm text-navy-500">
            No card needed · 30 days free · SOC 2, GDPR, NDPR, POPIA aligned
          </p>
        </div>

        {/* Floating product preview */}
        <div className="hidden lg:block absolute right-[-3rem] top-20 w-[36rem]">
          <HeroPreview />
        </div>
      </div>
    </section>
  );
}

function HeroPreview() {
  return (
    <div className="relative animate-fade-in-up">
      <div className="absolute -top-6 -left-6 glass rounded-2xl border border-white/60 p-4 shadow-lift w-72">
        <div className="flex items-center gap-2 text-xs font-medium text-navy-600">
          <Sparkles size={14} className="text-terracotta-500" /> AFARI just understood
        </div>
        <div className="mt-2 text-sm text-navy-800 font-medium">
          “Lagos to Nairobi next Tuesday for a client meeting”
        </div>
        <div className="mt-3 grid grid-cols-3 gap-1 text-[11px]">
          <Pill>LOS → NBO</Pill>
          <Pill>Apr 21</Pill>
          <Pill>Within policy</Pill>
        </div>
      </div>

      <Card className="rounded-3xl shadow-lift overflow-hidden">
        <div className="bg-navy-800 px-6 py-5 text-white flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest text-white/60">
              Movement Dashboard
            </div>
            <div className="font-display text-2xl mt-0.5">Today</div>
          </div>
          <Badge tone="terracotta" dot>
            7 in transit
          </Badge>
        </div>
        <div className="p-6 space-y-4">
          <Row
            city="LOS → NBO"
            who="Femi Adeyemi"
            note="Boarded · seat 24F"
            tone="terracotta"
          />
          <Row
            city="JNB → CPT"
            who="Naledi Khumalo"
            note="Landed 11:24 GMT+2"
            tone="emerald"
          />
          <Row
            city="ACC → ABJ"
            who="Kojo Ansah"
            note="Awaiting approval"
            tone="amber"
          />
          <div className="border-t border-sand-200 pt-4 flex items-center justify-between">
            <span className="text-sm text-navy-600">Pending approvals</span>
            <span className="font-display text-2xl text-navy-800">3</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center justify-center rounded-md bg-white/70 border border-sand-200 px-2 py-1 text-navy-700 font-medium">
      {children}
    </span>
  );
}

function Row({
  city,
  who,
  note,
  tone,
}: {
  city: string;
  who: string;
  note: string;
  tone: "terracotta" | "emerald" | "amber";
}) {
  const dotColor =
    tone === "terracotta"
      ? "bg-terracotta-400"
      : tone === "emerald"
      ? "bg-emerald"
      : "bg-amber";
  return (
    <div className="flex items-center gap-3">
      <span className={`h-2 w-2 rounded-full ${dotColor}`} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-navy-800">{city}</div>
        <div className="text-xs text-navy-500 truncate">{who} · {note}</div>
      </div>
      <ArrowRight size={14} className="text-navy-400" />
    </div>
  );
}

function TrustBar() {
  return (
    <section className="container-page py-10 border-y border-sand-200">
      <div className="flex flex-wrap items-center justify-between gap-6 text-navy-500">
        <span className="text-xs uppercase tracking-[0.2em]">
          Trusted by teams moving across the continent
        </span>
        <div className="flex flex-wrap items-center gap-x-10 gap-y-3 text-navy-700 font-display text-lg">
          <span>Baobab Energy</span>
          <span>Kasi Fintech</span>
          <span>Sahara Logistics</span>
          <span>Olokun Marine</span>
          <span>Kilimanjaro Capital</span>
          <span>Asante Health</span>
        </div>
      </div>
    </section>
  );
}

function Pillars() {
  const items = [
    {
      icon: <Compass size={22} />,
      title: "One coordinated flow",
      body:
        "Request, approve, book, expense, reconcile — all in one place. No more inboxes, group chats, or spreadsheets.",
    },
    {
      icon: <Sparkles size={22} />,
      title: "Intelligent by default",
      body:
        "Natural-language trip requests. Three curated booking options instead of a hundred. Receipts that file themselves.",
    },
    {
      icon: <Shield size={22} />,
      title: "Policy that breathes",
      body:
        "Travel policy enforced quietly in the background. Suggest alternatives, not blocks. Visible, fair, audit-ready.",
    },
    {
      icon: <Globe size={22} />,
      title: "Built for African movement",
      body:
        "Multi-currency settlement. Local payment rails. Inventory across continental carriers. Offline mid-trip.",
    },
  ];
  return (
    <section className="container-page py-24" id="product">
      <div className="max-w-2xl">
        <Badge tone="navy">Why AFARI</Badge>
        <h2 className="mt-4 font-display text-display-2 text-navy-800 text-balance">
          A coordination layer, not a feature pile.
        </h2>
        <p className="mt-4 text-lg text-navy-600 leading-relaxed">
          AFARI is opinionated about what business travel should feel like.
          Clear, guided, in control — one step away from action.
        </p>
      </div>
      <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {items.map((it) => (
          <Card key={it.title} className="p-6 h-full">
            <div className="h-10 w-10 rounded-xl bg-terracotta-50 text-terracotta-500 flex items-center justify-center">
              {it.icon}
            </div>
            <h3 className="mt-4 font-display text-xl text-navy-800">{it.title}</h3>
            <p className="mt-2 text-[0.95rem] text-navy-600 leading-relaxed">{it.body}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}

function ProductTour() {
  const steps = [
    {
      kicker: "Step 01",
      title: "Speak the trip into existence.",
      body:
        "Type or dictate “Lagos to Nairobi next Tuesday for a client meeting.” AFARI parses intent, runs the policy check, and assembles a clean draft.",
      icon: <Sparkles size={20} />,
    },
    {
      kicker: "Step 02",
      title: "One-tap approval.",
      body:
        "The right manager gets a clear, calm card on email, push, and WhatsApp. Approve, suggest an alternative, or decline — in a single tap.",
      icon: <Check size={20} />,
    },
    {
      kicker: "Step 03",
      title: "Three options, not three hundred.",
      body:
        "Best Balance. Fastest. Lowest Cost. Curated against policy, your meeting schedule, and frequent flyer alignment. Book in seconds.",
      icon: <Plane size={20} />,
    },
    {
      kicker: "Step 04",
      title: "Expenses file themselves.",
      body:
        "Snap a receipt. AFARI extracts merchant, amount, currency, and category, converts at the day's FX, and files it to the right report.",
      icon: <Receipt size={20} />,
    },
  ];
  return (
    <section className="bg-sand-50 border-y border-sand-200">
      <div className="container-page py-24">
        <div className="max-w-2xl mb-14">
          <Badge tone="terracotta">The flow</Badge>
          <h2 className="mt-4 font-display text-display-2 text-navy-800 text-balance">
            From “I need to travel” to “I'm on the plane” in four taps.
          </h2>
        </div>
        <ol className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {steps.map((s, i) => (
            <li
              key={s.title}
              className="rounded-2xl bg-white border border-sand-200 p-7 shadow-soft"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.2em] text-navy-500">
                  {s.kicker}
                </span>
                <span className="h-9 w-9 rounded-full bg-navy-50 text-navy-700 flex items-center justify-center">
                  {s.icon}
                </span>
              </div>
              <h3 className="mt-6 font-display text-2xl text-navy-800 text-balance">
                {s.title}
              </h3>
              <p className="mt-3 text-navy-600 leading-relaxed">{s.body}</p>
              <div className="mt-6 h-px bg-sand-200" />
              <div className="mt-4 text-sm text-navy-500">
                {i === 0 && "Powered by structured Claude output."}
                {i === 1 && "Magic-link signed JWT, expires in 24h."}
                {i === 2 && "Ranked across price, time, policy, preferences."}
                {i === 3 && "Receipt OCR via Textract or Document AI."}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Outcomes() {
  const stats = [
    { kpi: "94%", label: "fewer touchpoints per trip", body: "From 23 actions across email, WhatsApp, and portals → down to 4." },
    { kpi: "2 min", label: "median trip-to-booking time", body: "Replaces a typical 2-hour coordination thread." },
    { kpi: "12%", label: "average travel spend reduction", body: "From smarter ranking, policy automation, and preferred rates." },
    { kpi: "100%", label: "policy compliance visibility", body: "Every trip scored against policy in real time. Full audit trail." },
  ];
  return (
    <section className="container-page py-24" id="outcomes">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <Badge tone="navy">Outcomes</Badge>
          <h2 className="mt-4 font-display text-display-2 text-navy-800 text-balance">
            Move people faster.<br />
            Spend smarter. Sleep better.
          </h2>
          <p className="mt-5 text-lg text-navy-600 leading-relaxed">
            AFARI isn't measured by clicks. It's measured by the meetings made,
            the approvals not chased, and the finance teams that close the
            month without late nights.
          </p>
          <div className="mt-8 flex gap-4">
            <Button href="/signup" iconRight={<ArrowRight size={16} />}>
              Get started
            </Button>
            <Button href="/admin/dashboard" variant="outline">
              Tour the dashboard
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {stats.map((s) => (
            <Card key={s.label} className="p-6">
              <div className="font-display text-4xl text-terracotta-500">
                {s.kpi}
              </div>
              <div className="mt-1 text-sm font-medium text-navy-700">{s.label}</div>
              <div className="mt-3 text-sm text-navy-500 leading-relaxed">{s.body}</div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function Cities() {
  const cities = [
    "Lagos", "Nairobi", "Cape Town", "Accra", "Johannesburg", "Casablanca",
    "Addis Ababa", "Dar es Salaam", "Dakar", "Abidjan", "Kigali", "Cairo",
    "Kampala", "Lusaka", "Maputo", "Algiers",
  ];
  return (
    <section className="bg-navy-800 text-white" id="cities">
      <div className="container-page py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <Badge tone="terracotta">Coverage</Badge>
            <h2 className="mt-4 font-display text-display-2 text-balance">
              Continental by design.
            </h2>
            <p className="mt-5 text-lg text-white/75 leading-relaxed max-w-md">
              AFARI integrates with regional GDS inventory, African payment
              rails, and local mobile networks for in-trip notifications —
              including offline fallback for poor-connectivity stretches.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-white/70">
              <Globe size={16} />
              <span>16+ hubs · 54 markets · 4 languages</span>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {cities.map((c) => (
              <div
                key={c}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 hover:bg-white/[0.07] transition-colors"
              >
                <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                  Hub
                </div>
                <div className="font-display text-lg mt-1">{c}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Testimonial() {
  return (
    <section className="container-page py-24">
      <Card className="p-10 lg:p-16 bg-sand-50 border-sand-200">
        <div className="max-w-3xl">
          <div className="text-terracotta-500 text-5xl font-display leading-none">"</div>
          <p className="font-display text-2xl lg:text-3xl text-navy-800 leading-snug text-balance">
            We used to chase 14 emails to send one engineer to Naivasha.
            Now Zuri types one sentence on her phone in the taxi.
            By the time she's home, the trip is approved and booked.
          </p>
          <div className="mt-8 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-navy-800 text-white flex items-center justify-center font-medium">
              AO
            </div>
            <div>
              <div className="font-medium text-navy-800">Amaka Okafor</div>
              <div className="text-sm text-navy-500">Head of Travel · Baobab Energy Group</div>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="container-page pb-24">
      <div className="rounded-3xl bg-gradient-to-br from-navy-800 to-navy-900 text-white p-10 lg:p-16 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(circle at 80% 0%, rgba(217,116,73,0.4), transparent 50%)",
          }}
        />
        <div className="relative">
          <h2 className="font-display text-display-2 text-balance max-w-2xl">
            Ready to remove the friction?
          </h2>
          <p className="mt-4 text-lg text-white/75 max-w-xl">
            Spin up your AFARI workspace, invite your team, and run your first
            trip end-to-end in under 10 minutes.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button href="/signup" size="lg" iconRight={<ArrowRight />}>
              Create your workspace
            </Button>
            <Button href="/login" size="lg" variant="outline" className="bg-transparent text-white border-white/30 hover:bg-white/10 hover:border-white/60">
              Sign in
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-sand-200">
      <div className="container-page py-12 grid grid-cols-2 md:grid-cols-5 gap-8 text-sm">
        <div className="col-span-2">
          <Logo />
          <p className="mt-4 text-navy-500 max-w-xs leading-relaxed">
            AFARI is the operating system for business travel in Africa.
          </p>
          <div className="mt-6 flex items-center gap-2 text-xs text-navy-500">
            <Building size={14} /> Lagos · Nairobi · Cape Town
          </div>
        </div>
        <div>
          <div className="font-medium text-navy-800 mb-3">Product</div>
          <ul className="space-y-2 text-navy-500">
            <li><Link href="/admin/dashboard" className="hover:text-terracotta-500">Movement Dashboard</Link></li>
            <li><Link href="/home" className="hover:text-terracotta-500">Trip flow</Link></li>
            <li><Link href="/expenses" className="hover:text-terracotta-500">Expenses</Link></li>
            <li><Link href="/finance/dashboard" className="hover:text-terracotta-500">Finance</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-medium text-navy-800 mb-3">Company</div>
          <ul className="space-y-2 text-navy-500">
            <li>About</li>
            <li>Careers</li>
            <li>Press</li>
            <li>Contact</li>
          </ul>
        </div>
        <div>
          <div className="font-medium text-navy-800 mb-3">Compliance</div>
          <ul className="space-y-2 text-navy-500 flex flex-col">
            <span className="inline-flex items-center gap-1.5"><Shield size={14}/> SOC 2 Type II</span>
            <span className="inline-flex items-center gap-1.5"><Wallet size={14}/> PCI DSS</span>
            <span className="inline-flex items-center gap-1.5"><Shield size={14}/> GDPR · NDPR · POPIA</span>
          </ul>
        </div>
      </div>
      <div className="border-t border-sand-200">
        <div className="container-page py-6 flex items-center justify-between text-xs text-navy-500">
          <span>© {new Date().getFullYear()} AFARI Technologies Ltd.</span>
          <span>Made with care across the continent.</span>
        </div>
      </div>
    </footer>
  );
}
