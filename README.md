# AFARI

> **The Operating System for Business Travel in Africa.**
> Trip request → approval → booking → expense → reconciliation, in one calm,
> intelligent flow. Two hours becomes two minutes.

This repository is the Phase 1 foundation of the AFARI platform — a Next.js 14
app implementing the full design system, every page in the spec, and a typed
mock data layer that mirrors the production PostgreSQL schema 1:1.

It is **not** wired to live GDS / payment / OCR providers yet — the
recommendation engine, policy engine, and OCR ingest run against in-memory
fixtures so the entire flow can be exercised end-to-end without external
services.

---

## Quick start

```bash
# Node 18.17+ recommended (use nvm if needed)
npm install
npm run dev
# → http://localhost:3000
```

```bash
npm run build          # production build (also type-checks)
npm run type-check     # strict TS check, no emit
npm run lint           # next lint
```

Copy `.env.example` to `.env.local` and fill in keys when integrating real
services.

For local Postgres + Redis (Phase 2+):

```bash
docker compose up -d
psql postgres://afari:afari@localhost:5432/afari
```

---

## What's in the box

### Public surface
| Route | Purpose |
| --- | --- |
| `/` | Marketing landing — hero, pillars, product tour, outcomes, coverage, footer |
| `/login` `/signup` `/forgot-password` `/reset-password` `/accept-invite` `/mfa` | Full split-screen auth flow with SSO scaffolding, six-digit TOTP MFA, locale selector |
| `/not-found` / `error.tsx` / `loading.tsx` | Branded 404, global error boundary, and loading state |

### HTTP API (`/api/v1/*`)
| Route | Purpose |
| --- | --- |
| `GET /api/v1/health` | Liveness probe |
| `POST /api/v1/trips/ai-parse` | Natural-language trip parser. Heuristic by default; upgrades to Claude `claude-sonnet-4-6` structured output when `ANTHROPIC_API_KEY` is set. |

The full REST surface is documented in `openapi.yaml` (OpenAPI 3.0) — the
shape is stable and already implemented by the mock store. Paths not yet
live in code return 404; each is tagged in the spec so integrations for
Phase 2+ slot in behind the same URLs.

### Employee experience
| Route | Purpose |
| --- | --- |
| `/home` | Calm hero with natural-language trip bar, next trip card, quick actions |
| `/trips` | Personal timeline of every trip |
| `/trips/new` | Trip request — natural language input + structured form + live policy check |
| `/trips/[id]` | Trip detail with itinerary, timeline, side panel actions |
| `/trips/[id]/book` | "Three options, not three hundred" — Best Balance / Fastest / Lowest Cost for flights and hotels |
| `/expenses` | Drop-zone for receipts, current report, history, AFARI explainer |
| `/wallet` `/settings` | Phase 5 stubs |

### Admin (Travel Manager) experience
| Route | Purpose |
| --- | --- |
| `/admin/dashboard` | The **Movement Dashboard** — KPIs, approval queue, live activity, AI insight, today's movement, upcoming travel, budgets, compliance |
| `/admin/approvals` | Approval queue with traveler context, AI history, one-tap actions |
| `/admin/trips` | All trips across the org with filter chips |
| `/admin/employees` | Team directory with roles, departments, managers |
| `/admin/policies` | Policy library (caps, cabins, advance booking, auto-approve thresholds) |
| `/admin/budgets` | Budget envelopes with pace, remaining, vs. prior quarter |
| `/admin/settings` | Org identity, integrations (Duffel, Amadeus, Paystack, QuickBooks, Slack, Anthropic), security toggles, plan |

### Finance experience
| Route | Purpose |
| --- | --- |
| `/finance/dashboard` | Spend at a glance — KPIs, stacked-bar by category, top routes, by department, reports awaiting payout |
| `/finance/expenses` | All expense reports with status, person, trip, amount |
| `/finance/reports` `/finance/reimbursements` `/finance/exports` | Phase-staged stubs |

---

## Architecture

```
src/
├── app/                          # Next.js 14 App Router
│   ├── (auth)/                   # Split-screen auth layout group
│   ├── admin/                    # Travel manager surface
│   ├── finance/                  # Finance surface
│   ├── trips/                    # Employee trip flow + dynamic [id] routes
│   ├── home/ expenses/ wallet/   # Employee shell pages
│   ├── settings/                 # Employee profile
│   ├── globals.css               # Design tokens, hairlines, hero gradient, ping animation
│   ├── layout.tsx                # Root HTML, fonts (Inter + Fraunces)
│   ├── not-found.tsx             # Branded 404
│   └── page.tsx                  # Marketing landing
├── components/
│   ├── icons.tsx                 # 30+ inline SVG icons (1.6px stroke, lucide-style)
│   ├── ui/                       # Primitives — Button, Card, Input, Badge, Avatar, Logo, StatusPill
│   └── shell/                    # AppShell, PageHeader, role-specific nav, Stub
└── lib/
    ├── cn.ts                     # tailwind-merge + clsx
    ├── format.ts                 # Money, dates, durations, relative time
    └── mock/                     # Typed in-memory store mirroring the PG schema
        ├── types.ts              # 1:1 with §3 of the spec
        ├── data.ts               # Seed: org, users, trips, approvals, expenses, policies, budgets
        └── store.ts              # Read API + smart booking + analytics helpers
```

### Design system

- **Palette** — Navy `#0B1F3A` (clarity), Terracotta `#D97449` (warmth), Sand
  `#F4F2EA` background, Emerald / Amber / Ruby semantics.
- **Typography** — `Inter` for UI, `Fraunces` for editorial display.
- **Motion** — Single ease curve `cubic-bezier(0.16, 1, 0.3, 1)`, 200–300ms,
  no overshoots. Subtle `ping` for "in transit" indicators only.
- **UX rules** — One primary action per screen. Progressive disclosure.
  Status always visible. Mobile-first.

### Mock data layer

The shape of `src/lib/mock/types.ts` matches §3 of the spec exactly.
Swapping it for Prisma + Postgres is a one-file change in
`src/lib/mock/store.ts` — every page already reads through that surface.

Demo seed:

- **Organization:** Baobab Energy Group (Nigeria, USD base, "growth" plan)
- **8 users** across 4 roles (admin, manager, finance, employee)
- **7 trips** across every status (draft → completed)
- **3 approvals** (2 pending, 1 approved with reason)
- **2 expense reports** (1 submitted, 1 reimbursed)
- **2 policies** (default + manager) and **4 quarterly budgets**

---

## Roadmap mapping

| Phase | Status in this repo |
| --- | --- |
| **1 — Foundation** (auth, org/user, schema, trip CRUD, dashboard shell, policies) | UI complete, schema modeled, mocked store |
| **2 — Core flow** (request → approve → book + GDS, itinerary, notifications) | UI complete; integration scaffolding (Duffel / Amadeus envs) ready |
| **3 — Expenses** (receipt OCR, categorization, reports, finance dashboard) | UI complete; OCR is mocked |
| **4 — Intelligence** (NL trip parsing, smart recommendations, anomaly) | UI complete; AI parser prepared for Claude `claude-sonnet-4-6` structured output |
| **5 — Scale** (mobile, SSO/SAML, GL sync, multi-currency settlement) | Stubs and integration cards in `/admin/settings` |

---

## Compliance & posture

The product copy and security toggles reflect the non-functional requirements
in §9: SOC 2 Type II, GDPR, NDPR, POPIA, PCI DSS, AES-256 at rest for PII,
JWT access (15m) + rotating refresh (30d), zxcvbn password strength, 5-attempt
rate limit + 10-attempt lockout, WCAG 2.1 AA targets, 99.9% uptime SLA.

---

## CI / tooling

- **GitHub Actions** (`.github/workflows/ci.yml`) runs `type-check`, `lint`,
  and `build` on every push and PR against `main`.
- **Docker Compose** (`docker-compose.yml`) starts Postgres 15 and Redis 7
  for local dev. The Next.js app runs on the host for hot-reload.
- **OpenAPI 3.0** spec lives in `openapi.yaml`.

## License

© AFARI Technologies Ltd. All rights reserved.
