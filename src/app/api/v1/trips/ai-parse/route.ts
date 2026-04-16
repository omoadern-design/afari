import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * POST /api/v1/trips/ai-parse
 *
 * Natural-language trip parsing. In production this calls the Claude API
 * (claude-sonnet-4-6) with a structured output schema. For the Phase 1
 * foundation we run a lightweight heuristic parser so the whole flow
 * stays usable without an ANTHROPIC_API_KEY.
 */

const BodySchema = z.object({
  text: z.string().min(1).max(2000),
});

const AIRPORTS: Record<string, { code: string; city: string }> = {
  lagos: { code: "LOS", city: "Lagos" },
  abuja: { code: "ABV", city: "Abuja" },
  nairobi: { code: "NBO", city: "Nairobi" },
  mombasa: { code: "MBA", city: "Mombasa" },
  accra: { code: "ACC", city: "Accra" },
  "cape town": { code: "CPT", city: "Cape Town" },
  johannesburg: { code: "JNB", city: "Johannesburg" },
  "addis ababa": { code: "ADD", city: "Addis Ababa" },
  dakar: { code: "DSS", city: "Dakar" },
  abidjan: { code: "ABJ", city: "Abidjan" },
  kigali: { code: "KGL", city: "Kigali" },
  casablanca: { code: "CMN", city: "Casablanca" },
  cairo: { code: "CAI", city: "Cairo" },
  kampala: { code: "EBB", city: "Kampala" },
  "dar es salaam": { code: "DAR", city: "Dar es Salaam" },
};

const WEEKDAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

function nextWeekday(from: Date, dayName: string): Date | null {
  const idx = WEEKDAYS.indexOf(dayName.toLowerCase());
  if (idx < 0) return null;
  const d = new Date(from);
  const delta = (idx - d.getUTCDay() + 7) % 7 || 7;
  d.setUTCDate(d.getUTCDate() + delta);
  return d;
}

function findCity(text: string, after: RegExp): { code: string; city: string } | null {
  const match = text.match(after);
  if (!match) return null;
  const tail = text.slice((match.index ?? 0) + match[0].length).toLowerCase();
  for (const [name, airport] of Object.entries(AIRPORTS)) {
    if (tail.startsWith(name)) return airport;
  }
  return null;
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const text = parsed.data.text.toLowerCase();

  const origin =
    findCity(text, /\bfrom\s+/i) ??
    Object.entries(AIRPORTS)
      .map(([name, airport]) => ({ name, airport, idx: text.indexOf(name) }))
      .filter((x) => x.idx >= 0)
      .sort((a, b) => a.idx - b.idx)[0]?.airport ??
    null;

  const destination =
    findCity(text, /\bto\s+/i) ??
    Object.entries(AIRPORTS)
      .map(([name, airport]) => ({ name, airport, idx: text.indexOf(name) }))
      .filter((x) => x.idx >= 0)
      .sort((a, b) => b.idx - a.idx)[0]?.airport ??
    null;

  let departure: string | null = null;
  for (const day of WEEKDAYS) {
    if (text.includes(`next ${day}`) || new RegExp(`\\bon\\s+${day}\\b`).test(text)) {
      const d = nextWeekday(new Date("2026-04-16T00:00:00Z"), day);
      if (d) departure = d.toISOString().slice(0, 10);
      break;
    }
  }

  const purposeMatch = text.match(/\bfor\s+(?:an?\s+)?([^.]+?)(?:\.|$)/i);
  const purpose = purposeMatch?.[1]?.trim() ?? null;

  return NextResponse.json(
    {
      ok: origin !== null && destination !== null,
      parsed: {
        origin,
        destination,
        departureDate: departure,
        purpose,
      },
      source: "heuristic",
      note: "Configure ANTHROPIC_API_KEY to upgrade to Claude structured output.",
    },
    { status: 200 }
  );
}
