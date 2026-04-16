// Lightweight read-only API over the mock store. Mirrors the shape of the
// real REST endpoints documented in §5 of the spec so views can later be
// swapped to fetch() without changing component code.

import {
  approvals,
  budgets,
  currentUserId,
  expenseReports,
  notifications,
  org,
  policies,
  trips,
  users,
} from "./data";
import type { Trip, User } from "./types";

export const store = {
  org,
  currentUser: () => users.find((u) => u.id === currentUserId)!,
  users: () => users,
  user: (id: string) => users.find((u) => u.id === id),
  manager: (u: User) => (u.managerId ? users.find((x) => x.id === u.managerId) : undefined),

  trips: () => [...trips].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  trip: (id: string) => trips.find((t) => t.id === id),
  tripsForUser: (userId: string) =>
    trips
      .filter((t) => t.travelerId === userId)
      .sort((a, b) => a.departureDate.localeCompare(b.departureDate)),
  upcomingTrips: () =>
    trips
      .filter((t) => ["approved", "booked", "in_progress"].includes(t.status))
      .sort((a, b) => a.departureDate.localeCompare(b.departureDate)),
  travelersInTransit: () => trips.filter((t) => t.status === "in_progress"),

  approvals: () => approvals,
  pendingApprovals: () =>
    approvals.filter((a) => a.status === "pending"),
  pendingApprovalsForUser: (userId: string) =>
    approvals.filter((a) => a.status === "pending" && a.approverId === userId),

  expenseReports: () => expenseReports,
  expenseReport: (id: string) => expenseReports.find((r) => r.id === id),
  expenseReportsForUser: (userId: string) =>
    expenseReports.filter((r) => r.userId === userId),

  policies: () => policies,
  policy: (id: string) => policies.find((p) => p.id === id),

  budgets: () => budgets,

  notifications: () => notifications,
  notificationsForUser: (userId: string) =>
    notifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
};

// Aggregate helpers used by dashboards.

export function spendByCategory() {
  const totals: Record<string, number> = {
    flight: 0,
    hotel: 0,
    meals: 0,
    ground_transport: 0,
    other: 0,
  };
  for (const r of expenseReports) {
    for (const e of r.expenses) {
      totals[e.category] = (totals[e.category] ?? 0) + e.amountBaseCurrency;
    }
  }
  // Add committed-but-not-yet-expensed flight/hotel costs.
  for (const t of trips) {
    if (t.flight) totals.flight += t.flight.cost;
    if (t.hotel) totals.hotel += t.hotel.totalCost;
  }
  return totals;
}

export function spendByDepartment() {
  const out: Record<string, number> = {};
  for (const t of trips) {
    const u = users.find((x) => x.id === t.travelerId);
    if (!u) continue;
    out[u.department] = (out[u.department] ?? 0) + (t.actualCost ?? t.estimatedCost);
  }
  return out;
}

export function topRoutes() {
  const m = new Map<string, { route: string; count: number; spend: number }>();
  for (const t of trips) {
    const key = `${t.originAirport} → ${t.destinationAirport}`;
    const cur = m.get(key) ?? { route: key, count: 0, spend: 0 };
    cur.count += 1;
    cur.spend += t.actualCost ?? t.estimatedCost;
    m.set(key, cur);
  }
  return Array.from(m.values()).sort((a, b) => b.spend - a.spend);
}

export function policyComplianceRate(): {
  compliant: number;
  total: number;
  rate: number;
} {
  const total = trips.length;
  const compliant = trips.filter((t) => t.policyCompliant).length;
  return { compliant, total, rate: total === 0 ? 1 : compliant / total };
}

export function totalSpendThisQuarter(): number {
  return budgets.reduce((s, b) => s + b.spent, 0);
}

export function estimatedTimeSavedHours(): number {
  // Heuristic: every coordinated trip saves ~1h45m versus the legacy
  // WhatsApp/email/portal chain. Used for marketing surfaces.
  return Math.round(trips.length * 1.75);
}

// Curated "smart" booking options surfaced by the recommendation engine.
// Real implementation would rank GDS results against policy + traveler prefs.

export type SmartFlightOption = {
  id: string;
  label: "Best balance" | "Fastest" | "Lowest cost";
  airlineCode: string;
  airlineName: string;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  stops: number;
  cabinClass: string;
  cost: number;
  currency: string;
  policyCompliant: boolean;
  why: string;
};

export function smartFlightOptions(trip: Trip): SmartFlightOption[] {
  // Anchored to the trip's departure date for plausible times.
  const dep = new Date(trip.departureDate + "T00:00:00Z");
  const t = (h: number, m: number) => {
    const d = new Date(dep);
    d.setUTCHours(h, m, 0, 0);
    return d.toISOString();
  };
  return [
    {
      id: "opt_balance",
      label: "Best balance",
      airlineCode: "ET",
      airlineName: "Ethiopian Airlines",
      flightNumber: "ET912",
      departureTime: t(7, 40),
      arrivalTime: t(13, 25),
      durationMinutes: 5 * 60 + 45,
      stops: 1,
      cabinClass: "economy",
      cost: 642,
      currency: "USD",
      policyCompliant: true,
      why: "Lands before your 14:30 client meeting with 70 minutes buffer. 18% under policy ceiling.",
    },
    {
      id: "opt_fastest",
      label: "Fastest",
      airlineCode: "KQ",
      airlineName: "Kenya Airways",
      flightNumber: "KQ533",
      departureTime: t(9, 10),
      arrivalTime: t(13, 50),
      durationMinutes: 4 * 60 + 40,
      stops: 0,
      cabinClass: "economy",
      cost: 845,
      currency: "USD",
      policyCompliant: true,
      why: "Direct, shortest total travel time. Tight 40-minute buffer to your meeting.",
    },
    {
      id: "opt_cheapest",
      label: "Lowest cost",
      airlineCode: "RW",
      airlineName: "RwandAir",
      flightNumber: "WB448",
      departureTime: t(6, 5),
      arrivalTime: t(15, 30),
      durationMinutes: 9 * 60 + 25,
      stops: 1,
      cabinClass: "economy",
      cost: 498,
      currency: "USD",
      policyCompliant: true,
      why: "Cheapest compliant option. Arrives after your meeting — would need to reschedule.",
    },
  ];
}

export type SmartHotelOption = {
  id: string;
  label: "Best balance" | "Closest" | "Lowest cost";
  name: string;
  neighborhood: string;
  rating: number;
  nightlyRate: number;
  currency: string;
  walkToMeeting: string;
  policyCompliant: boolean;
  why: string;
};

export function smartHotelOptions(trip: Trip): SmartHotelOption[] {
  void trip;
  return [
    {
      id: "h_balance",
      label: "Best balance",
      name: "Sankara Nairobi",
      neighborhood: "Westlands",
      rating: 4.6,
      nightlyRate: 198,
      currency: "USD",
      walkToMeeting: "8 min walk",
      policyCompliant: true,
      why: "10% under policy. Walking distance to the Safaricom HQ. Strong reviews from your team.",
    },
    {
      id: "h_closest",
      label: "Closest",
      name: "Villa Rosa Kempinski",
      neighborhood: "Westlands",
      rating: 4.8,
      nightlyRate: 285,
      currency: "USD",
      walkToMeeting: "4 min walk",
      policyCompliant: false,
      why: "Closest to meeting, but $65 over policy ceiling. Requires manager justification.",
    },
    {
      id: "h_cheapest",
      label: "Lowest cost",
      name: "Trademark Hotel",
      neighborhood: "Village Market",
      rating: 4.4,
      nightlyRate: 134,
      currency: "USD",
      walkToMeeting: "18 min drive",
      policyCompliant: true,
      why: "39% below ceiling. Further from meeting — add 35 minutes for ground transport.",
    },
  ];
}
