# Afari — Corporate Travel & Expense Management

AI-powered corporate travel booking and expense management platform. Book in-policy travel seamlessly, route out-of-policy requests through approval workflows, and give finance full spend visibility.

**Inspired by:** Navan, TravelPerk, SAP Concur, AmexGBT, Ramp.

---

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Admin | `admin@acme.com` | `admin123` |
| Finance | `finance@acme.com` | `finance123` |
| Manager | `sarah.manager@acme.com` | `password123` |
| Employee | `alice@acme.com` | `password123` |

---

## Local development

```bash
# 1. Install dependencies
npm install

# 2. Copy and fill in environment variables
cp .env.example .env

# 3. Run database migrations
npx prisma migrate dev

# 4. Seed with demo data
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts

# 5. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploy to Vercel

SQLite can't be used on Vercel's serverless runtime. Use **Turso** (hosted libsql) — the adapter is already installed, only the connection URL changes.

### Step 1 — Create a Turso database

```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Log in (creates a free account)
turso auth login

# Create a database
turso db create afari-prod

# Get the connection URL and auth token
turso db show afari-prod --url      # → libsql://<db>.turso.io
turso db tokens create afari-prod   # → <auth-token>
```

Your `DATABASE_URL` will be:
```
libsql://<db-name>-<org>.turso.io?authToken=<auth-token>
```

### Step 2 — Deploy to Vercel

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Link and deploy
vercel

# Follow the prompts:
#   Set up and deploy → Y
#   Which scope → your account
#   Link to existing project → N (new project)
#   Project name → afari (or anything)
#   Directory → ./  (current dir)
```

### Step 3 — Set environment variables

In the Vercel dashboard → Project → Settings → Environment Variables, add:

| Name | Value |
|---|---|
| `DATABASE_URL` | `libsql://<db>.turso.io?authToken=<token>` |
| `NEXTAUTH_SECRET` | output of `openssl rand -base64 32` |
| `NEXTAUTH_URL` | your Vercel deployment URL e.g. `https://afari.vercel.app` |

Or set them via CLI:

```bash
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
```

### Step 4 — Run migrations & seed on Turso

```bash
# Point your local env at the Turso DB temporarily
export DATABASE_URL="libsql://<db>.turso.io?authToken=<token>"

# Apply the schema
npx prisma migrate deploy

# Seed demo data
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
```

### Step 5 — Redeploy

```bash
vercel --prod
```

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Database | SQLite (dev) / Turso libsql (prod) |
| ORM | Prisma 7 + `@prisma/adapter-libsql` |
| Auth | NextAuth.js v5 (credentials + JWT) |
| Styling | Tailwind CSS v4 |
| Charts | Recharts |
| Icons | Lucide React |
| UI primitives | Radix UI |
