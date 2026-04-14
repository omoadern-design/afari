import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  searchFlights,
  searchHotels,
  searchCars,
  type FlightSearchParams,
  type HotelSearchParams,
  type CarSearchParams,
} from "@/lib/mock-travel-api";
import {
  evaluateFlightPolicy,
  evaluateHotelPolicy,
  evaluateCarPolicy,
} from "@/lib/policy-engine";
import type { FlightSearchResult, HotelSearchResult, CarSearchResult } from "@/types/travel";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { type: string; params: Record<string, unknown> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { type, params } = body;
  if (!type || !params) {
    return NextResponse.json({ error: "Missing type or params" }, { status: 400 });
  }

  // Fetch active policies
  const policies = await prisma.policy.findMany({
    where: { isActive: true },
    orderBy: { priority: "desc" },
  });

  if (type === "FLIGHT") {
    const flightParams = params as unknown as FlightSearchParams;
    const results: FlightSearchResult[] = searchFlights(flightParams);

    // Calculate advance days for policy evaluation
    const today = new Date();
    const depDate = new Date(flightParams.departureDate);
    const advanceDays = Math.max(
      0,
      Math.floor((depDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    );

    const annotated = results.map((flight) => {
      const { result, violations } = evaluateFlightPolicy(
        {
          price: flight.price,
          cabinClass: flight.cabinClass,
          origin: flight.origin,
          destination: flight.destination,
          duration: flight.duration,
          advanceDays,
          stops: flight.stops,
        },
        policies
      );
      return { ...flight, policyResult: result, policyViolations: violations };
    });

    return NextResponse.json(annotated);
  }

  if (type === "HOTEL") {
    const hotelParams = params as unknown as HotelSearchParams;
    const results: HotelSearchResult[] = searchHotels(hotelParams);

    const checkIn = new Date(hotelParams.checkIn);
    const checkOut = new Date(hotelParams.checkOut);
    const nights = Math.max(
      1,
      Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    );

    const annotated = results.map((hotel) => {
      const { result, violations } = evaluateHotelPolicy(
        {
          nightlyRate: hotel.nightlyRate,
          nights,
          city: hotel.city,
        },
        policies
      );
      return { ...hotel, policyResult: result, policyViolations: violations };
    });

    return NextResponse.json(annotated);
  }

  if (type === "CAR") {
    const carParams = params as unknown as CarSearchParams;
    const results: CarSearchResult[] = searchCars(carParams);

    const pickup = new Date(carParams.pickupDate);
    const dropoff = new Date(carParams.dropoffDate);
    const days = Math.max(
      1,
      Math.ceil((dropoff.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24))
    );

    const annotated = results.map((car) => {
      const { result, violations } = evaluateCarPolicy(
        {
          dailyRate: car.dailyRate,
          days,
          carClass: car.carClass,
        },
        policies
      );
      return { ...car, policyResult: result, policyViolations: violations };
    });

    return NextResponse.json(annotated);
  }

  return NextResponse.json({ error: `Unknown search type: ${type}` }, { status: 400 });
}
