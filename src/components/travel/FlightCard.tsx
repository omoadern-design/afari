"use client";

import { Plane, Clock, Users, Star, AlertTriangle, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PolicyBadge } from "@/components/travel/PolicyBadge";
import { cn, formatCurrency, formatDuration } from "@/lib/utils";
import type { FlightSearchResult } from "@/types/travel";

interface FlightCardProps {
  flight: FlightSearchResult;
  onBook: (flight: FlightSearchResult) => void;
}

const CABIN_LABELS: Record<string, string> = {
  ECONOMY: "Economy",
  PREMIUM_ECONOMY: "Premium Economy",
  BUSINESS: "Business",
  FIRST: "First Class",
};

const AIRLINE_COLORS: Record<string, string> = {
  United: "bg-[#f0f0f0]",
  Delta: "bg-red-600",
  American: "bg-slate-700",
  Southwest: "bg-yellow-500",
  JetBlue: "bg-[#f0f0f0]",
  Alaska: "bg-teal-600",
  Spirit: "bg-yellow-400",
  Frontier: "bg-green-500",
};

export function FlightCard({ flight, onBook }: FlightCardProps) {
  const isBlocked = flight.policyResult === "BLOCKED";
  const showViolationSummary =
    flight.policyViolations.length > 0 &&
    (flight.policyResult === "REQUIRES_APPROVAL" || flight.policyResult === "OUT_OF_POLICY" || flight.policyResult === "BLOCKED");

  const airlineColor = AIRLINE_COLORS[flight.airline] ?? "bg-[#f7f7f7]0";
  const initials = flight.airline.substring(0, 2).toUpperCase();

  return (
    <Card
      className={cn(
        "relative transition-shadow hover:shadow-md",
        flight.isRecommended && "ring-2 ring-[#0a0a0a]",
        isBlocked && "opacity-75"
      )}
    >
      {flight.isRecommended && (
        <div className="absolute -top-2.5 left-4 flex items-center gap-1 rounded-full bg-[#f0f0f0] px-2.5 py-0.5 text-xs font-medium text-white shadow-sm">
          <Sparkles className="h-3 w-3" />
          Recommended
        </div>
      )}

      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          {/* Airline logo + flight info */}
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white",
                airlineColor
              )}
            >
              {initials}
            </div>
            <div>
              <p className="text-sm font-semibold text-[#0a0a0a]">{flight.airline}</p>
              <p className="text-xs text-[#737373]">{flight.flightNumber}</p>
            </div>
          </div>

          {/* Policy badge */}
          <PolicyBadge
            result={flight.policyResult}
            violations={flight.policyViolations}
            size="sm"
          />
        </div>

        {/* Route & times */}
        <div className="mt-4 flex items-center gap-2">
          <div className="text-center">
            <p className="text-xl font-bold text-[#0a0a0a]">{flight.departureTime}</p>
            <p className="text-sm font-medium text-[#737373]">{flight.origin}</p>
          </div>

          <div className="flex flex-1 flex-col items-center gap-1">
            <p className="text-xs text-[#a3a3a3]">{formatDuration(flight.duration)}</p>
            <div className="relative flex w-full items-center">
              <div className="h-px flex-1 bg-slate-200" />
              <Plane className="mx-1 h-3.5 w-3.5 rotate-90 text-[#a3a3a3]" />
              <div className="h-px flex-1 bg-slate-200" />
            </div>
            <div className="flex items-center gap-1">
              {flight.stops === 0 ? (
                <Badge variant="success" className="text-xs">Nonstop</Badge>
              ) : (
                <Badge variant="warning" className="text-xs">
                  {flight.stops} {flight.stops === 1 ? "stop" : "stops"}
                </Badge>
              )}
            </div>
          </div>

          <div className="text-center">
            <p className="text-xl font-bold text-[#0a0a0a]">{flight.arrivalTime}</p>
            <p className="text-sm font-medium text-[#737373]">{flight.destination}</p>
          </div>
        </div>

        {/* Meta row */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge variant="secondary">
            {CABIN_LABELS[flight.cabinClass] ?? flight.cabinClass}
          </Badge>
          {flight.seatsLeft !== undefined && flight.seatsLeft <= 5 && (
            <Badge variant="destructive">
              {flight.seatsLeft} seat{flight.seatsLeft !== 1 ? "s" : ""} left
            </Badge>
          )}
          <div className="flex items-center gap-1 text-xs text-[#a3a3a3]">
            <Clock className="h-3 w-3" />
            {formatDuration(flight.duration)}
          </div>
        </div>

        {/* AI reason */}
        {flight.aiReason && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-[#0a0a0a]">
            <Sparkles className="h-3 w-3" />
            {flight.aiReason}
          </p>
        )}

        {/* Violation summary */}
        {showViolationSummary && (
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-2.5">
            <div className="flex items-start gap-1.5">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
              <div>
                <p className="text-xs font-medium text-amber-800">
                  {flight.policyResult === "REQUIRES_APPROVAL"
                    ? "Requires manager approval"
                    : flight.policyResult === "BLOCKED"
                    ? "Blocked by policy"
                    : "Outside policy limits"}
                </p>
                {flight.policyViolations[0] && (
                  <p className="mt-0.5 text-xs text-amber-700">{flight.policyViolations[0]}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Price & book */}
        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-[#0a0a0a]">
              {formatCurrency(flight.price, flight.currency)}
            </p>
            <p className="text-xs text-[#737373]">per person</p>
          </div>
          <Button
            onClick={() => onBook(flight)}
            disabled={isBlocked}
            variant={isBlocked ? "secondary" : "default"}
            size="sm"
          >
            {isBlocked ? "Blocked" : "Select Flight"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
