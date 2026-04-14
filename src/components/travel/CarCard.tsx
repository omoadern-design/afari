"use client";

import { Car, MapPin, Sparkles, AlertTriangle, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PolicyBadge } from "@/components/travel/PolicyBadge";
import { cn, formatCurrency } from "@/lib/utils";
import type { CarSearchResult } from "@/types/travel";

interface CarCardProps {
  car: CarSearchResult;
  days: number;
  onBook: (car: CarSearchResult) => void;
}

const CLASS_VARIANTS: Record<string, string> = {
  ECONOMY: "bg-green-100 text-green-700",
  COMPACT: "bg-blue-100 text-blue-700",
  MIDSIZE: "bg-indigo-100 text-indigo-700",
  FULLSIZE: "bg-purple-100 text-purple-700",
  SUV: "bg-orange-100 text-orange-700",
  LUXURY: "bg-amber-100 text-amber-700",
};

const CLASS_LABELS: Record<string, string> = {
  ECONOMY: "Economy",
  COMPACT: "Compact",
  MIDSIZE: "Midsize",
  FULLSIZE: "Full Size",
  SUV: "SUV",
  LUXURY: "Luxury",
};

export function CarCard({ car, days, onBook }: CarCardProps) {
  const isBlocked = car.policyResult === "BLOCKED";
  const totalCost = car.dailyRate * days;
  const showViolationSummary =
    car.policyViolations.length > 0 &&
    (car.policyResult === "REQUIRES_APPROVAL" ||
      car.policyResult === "OUT_OF_POLICY" ||
      car.policyResult === "BLOCKED");

  const classColor = CLASS_VARIANTS[car.carClass.toUpperCase()] ?? "bg-slate-100 text-slate-700";
  const classLabel = CLASS_LABELS[car.carClass.toUpperCase()] ?? car.carClass;

  return (
    <Card
      className={cn(
        "relative transition-shadow hover:shadow-md",
        car.isRecommended && "ring-2 ring-blue-500",
        isBlocked && "opacity-75"
      )}
    >
      {car.isRecommended && (
        <div className="absolute -top-2.5 left-4 flex items-center gap-1 rounded-full bg-blue-600 px-2.5 py-0.5 text-xs font-medium text-white shadow-sm">
          <Sparkles className="h-3 w-3" />
          Recommended
        </div>
      )}

      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
              <Car className="h-5 w-5 text-slate-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{car.rentalCompany}</p>
              <p className="text-xs text-slate-500">{car.model}</p>
            </div>
          </div>
          <PolicyBadge
            result={car.policyResult}
            violations={car.policyViolations}
            size="sm"
          />
        </div>

        {/* Car class badge */}
        <div className="mt-3">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
              classColor
            )}
          >
            {classLabel}
          </span>
        </div>

        {/* Pickup location */}
        <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{car.pickupLocation}</span>
        </div>

        {/* Features */}
        {car.features.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
            {car.features.map((feature) => (
              <div key={feature} className="flex items-center gap-1 text-xs text-slate-600">
                <Check className="h-3 w-3 text-emerald-500" />
                {feature}
              </div>
            ))}
          </div>
        )}

        {/* AI reason */}
        {car.aiReason && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-blue-600">
            <Sparkles className="h-3 w-3" />
            {car.aiReason}
          </p>
        )}

        {/* Violation summary */}
        {showViolationSummary && (
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-2.5">
            <div className="flex items-start gap-1.5">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
              <div>
                <p className="text-xs font-medium text-amber-800">
                  {car.policyResult === "REQUIRES_APPROVAL"
                    ? "Requires manager approval"
                    : car.policyResult === "BLOCKED"
                    ? "Blocked by policy"
                    : "Outside policy limits"}
                </p>
                {car.policyViolations[0] && (
                  <p className="mt-0.5 text-xs text-amber-700">{car.policyViolations[0]}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Pricing & book */}
        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold text-slate-900">
              {formatCurrency(totalCost, car.currency)}
            </p>
            <p className="text-xs text-slate-500">
              {formatCurrency(car.dailyRate, car.currency)}/day &middot; {days}{" "}
              {days === 1 ? "day" : "days"}
            </p>
          </div>
          <Button
            onClick={() => onBook(car)}
            disabled={isBlocked}
            variant={isBlocked ? "secondary" : "default"}
            size="sm"
          >
            {isBlocked ? "Blocked" : "Select Car"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
