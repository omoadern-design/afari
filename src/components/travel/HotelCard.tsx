"use client";

import { Star, MapPin, Users, Sparkles, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PolicyBadge } from "@/components/travel/PolicyBadge";
import { cn, formatCurrency } from "@/lib/utils";
import type { HotelSearchResult } from "@/types/travel";

interface HotelCardProps {
  hotel: HotelSearchResult;
  nights: number;
  onBook: (hotel: HotelSearchResult) => void;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            "h-3.5 w-3.5",
            i < rating ? "fill-amber-400 text-amber-400" : "fill-slate-100 text-[#d4d4d4]"
          )}
        />
      ))}
    </div>
  );
}

function ReviewScore({ score, count }: { score: number; count: number }) {
  const label =
    score >= 9.0
      ? "Exceptional"
      : score >= 8.5
      ? "Excellent"
      : score >= 8.0
      ? "Very Good"
      : score >= 7.0
      ? "Good"
      : "Fair";

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex h-7 w-10 items-center justify-center rounded-lg bg-[#f0f0f0] text-xs font-bold text-white">
        {score.toFixed(1)}
      </div>
      <div>
        <p className="text-xs font-medium text-[#0a0a0a]">{label}</p>
        <p className="text-xs text-[#a3a3a3]">{count.toLocaleString()} reviews</p>
      </div>
    </div>
  );
}

export function HotelCard({ hotel, nights, onBook }: HotelCardProps) {
  const isBlocked = hotel.policyResult === "BLOCKED";
  const totalPrice = hotel.nightlyRate * nights;
  const showViolationSummary =
    hotel.policyViolations.length > 0 &&
    (hotel.policyResult === "REQUIRES_APPROVAL" ||
      hotel.policyResult === "OUT_OF_POLICY" ||
      hotel.policyResult === "BLOCKED");

  return (
    <Card
      className={cn(
        "relative transition-shadow hover:shadow-md",
        hotel.isRecommended && "ring-2 ring-[#0a0a0a]",
        isBlocked && "opacity-75"
      )}
    >
      {hotel.isRecommended && (
        <div className="absolute -top-2.5 left-4 flex items-center gap-1 rounded-full bg-[#f0f0f0] px-2.5 py-0.5 text-xs font-medium text-white shadow-sm">
          <Sparkles className="h-3 w-3" />
          Recommended
        </div>
      )}

      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-[#0a0a0a]">{hotel.name}</h3>
            <StarRating rating={hotel.rating} />
          </div>
          <PolicyBadge
            result={hotel.policyResult}
            violations={hotel.policyViolations}
            size="sm"
          />
        </div>

        {/* Address & distance */}
        <div className="mt-2 flex items-center gap-1 text-xs text-[#737373]">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{hotel.address}</span>
          {hotel.distanceFromCenter && (
            <>
              <span className="mx-1 text-[#d4d4d4]">·</span>
              <span className="shrink-0 text-[#a3a3a3]">{hotel.distanceFromCenter}</span>
            </>
          )}
        </div>

        {/* Review score */}
        <div className="mt-3">
          <ReviewScore score={hotel.reviewScore} count={hotel.reviewCount} />
        </div>

        {/* Room type */}
        <div className="mt-3">
          <Badge variant="secondary">{hotel.roomType}</Badge>
        </div>

        {/* Amenities */}
        {hotel.amenities.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {hotel.amenities.slice(0, 5).map((amenity) => (
              <span
                key={amenity}
                className="rounded-full bg-[#f0f0f0] px-2 py-0.5 text-xs text-[#737373]"
              >
                {amenity}
              </span>
            ))}
            {hotel.amenities.length > 5 && (
              <span className="rounded-full bg-[#f0f0f0] px-2 py-0.5 text-xs text-[#a3a3a3]">
                +{hotel.amenities.length - 5} more
              </span>
            )}
          </div>
        )}

        {/* AI reason */}
        {hotel.aiReason && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-[#0a0a0a]">
            <Sparkles className="h-3 w-3" />
            {hotel.aiReason}
          </p>
        )}

        {/* Violation summary */}
        {showViolationSummary && (
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-2.5">
            <div className="flex items-start gap-1.5">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
              <div>
                <p className="text-xs font-medium text-amber-800">
                  {hotel.policyResult === "REQUIRES_APPROVAL"
                    ? "Requires manager approval"
                    : hotel.policyResult === "BLOCKED"
                    ? "Blocked by policy"
                    : "Outside policy limits"}
                </p>
                {hotel.policyViolations[0] && (
                  <p className="mt-0.5 text-xs text-amber-700">{hotel.policyViolations[0]}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Price & book */}
        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold text-[#0a0a0a]">
              {formatCurrency(totalPrice, hotel.currency)}
            </p>
            <p className="text-xs text-[#737373]">
              {formatCurrency(hotel.nightlyRate, hotel.currency)}/night &middot; {nights}{" "}
              {nights === 1 ? "night" : "nights"}
            </p>
          </div>
          <Button
            onClick={() => onBook(hotel)}
            disabled={isBlocked}
            variant={isBlocked ? "secondary" : "default"}
            size="sm"
          >
            {isBlocked ? "Blocked" : "Select Hotel"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
