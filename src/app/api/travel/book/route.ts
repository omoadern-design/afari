import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { evaluateFlightPolicy, evaluateHotelPolicy, evaluateCarPolicy } from "@/lib/policy-engine";
import type { FlightBookingData, HotelBookingData, CarBookingData } from "@/types/travel";

interface BookRequestBody {
  type: "FLIGHT" | "HOTEL" | "CAR";
  data: FlightBookingData | HotelBookingData | CarBookingData;
  totalAmount: number;
  purpose?: string;
  justification?: string;
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: BookRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { type, data, totalAmount, purpose, justification } = body;

  if (!type || !data || totalAmount == null) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Fetch active policies for re-evaluation
  const policies = await prisma.policy.findMany({
    where: { isActive: true },
    orderBy: { priority: "desc" },
  });

  // Re-evaluate policy at booking time
  let policyResult: string = "IN_POLICY";
  let policyViolations: string[] = [];

  if (type === "FLIGHT") {
    const fd = data as FlightBookingData;
    const today = new Date();
    const depDate = new Date(fd.departureDate);
    const advanceDays = Math.max(
      0,
      Math.floor((depDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    );
    const { result, violations } = evaluateFlightPolicy(
      {
        price: totalAmount / (fd.passengers || 1),
        cabinClass: fd.cabinClass,
        origin: fd.origin,
        destination: fd.destination,
        duration: fd.duration,
        advanceDays,
        stops: fd.stops,
      },
      policies
    );
    policyResult = result;
    policyViolations = violations;
  } else if (type === "HOTEL") {
    const hd = data as HotelBookingData;
    const { result, violations } = evaluateHotelPolicy(
      {
        nightlyRate: hd.nightlyRate,
        nights: hd.nights,
        city: hd.city,
      },
      policies
    );
    policyResult = result;
    policyViolations = violations;
  } else if (type === "CAR") {
    const cd = data as CarBookingData;
    const { result, violations } = evaluateCarPolicy(
      {
        dailyRate: cd.dailyRate,
        days: cd.days,
        carClass: cd.carClass,
      },
      policies
    );
    policyResult = result;
    policyViolations = violations;
  } else {
    return NextResponse.json({ error: "Invalid booking type" }, { status: 400 });
  }

  // Block if policy says so
  if (policyResult === "BLOCKED") {
    return NextResponse.json(
      {
        error: "This booking is blocked by company policy",
        policyResult,
        policyViolations,
      },
      { status: 400 }
    );
  }

  // Determine initial booking status
  const bookingStatus =
    policyResult === "REQUIRES_APPROVAL" ? "PENDING_APPROVAL" : "CONFIRMED";

  // Determine dates for the booking record
  let startDate: Date | undefined;
  let endDate: Date | undefined;
  let flightData: string | undefined;
  let hotelData: string | undefined;
  let carData: string | undefined;

  if (type === "FLIGHT") {
    const fd = data as FlightBookingData;
    startDate = new Date(fd.departureDate);
    endDate = fd.returnDate ? new Date(fd.returnDate) : startDate;
    flightData = JSON.stringify(fd);
  } else if (type === "HOTEL") {
    const hd = data as HotelBookingData;
    startDate = new Date(hd.checkIn);
    endDate = new Date(hd.checkOut);
    hotelData = JSON.stringify(hd);
  } else if (type === "CAR") {
    const cd = data as CarBookingData;
    startDate = new Date(cd.pickupDate);
    endDate = new Date(cd.dropoffDate);
    carData = JSON.stringify(cd);
  }

  // Fetch the first active policy to attach
  const primaryPolicy = policies[0];

  // Create booking record
  const booking = await prisma.booking.create({
    data: {
      userId: session.user.id,
      policyId: primaryPolicy?.id ?? null,
      type,
      status: bookingStatus,
      policyResult,
      policyViolations: policyViolations.length > 0 ? JSON.stringify(policyViolations) : null,
      totalAmount,
      currency: "USD",
      purpose: purpose ?? null,
      justification: justification ?? null,
      confirmationRef: `AF-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      bookedAt: new Date(),
      startDate: startDate ?? null,
      endDate: endDate ?? null,
      flightData: flightData ?? null,
      hotelData: hotelData ?? null,
      carData: carData ?? null,
    },
  });

  // Create approval request if needed
  if (policyResult === "REQUIRES_APPROVAL") {
    const managerId = session.user.managerId ?? null;
    await prisma.approvalRequest.create({
      data: {
        requesterId: session.user.id,
        subjectType: "BOOKING",
        status: "PENDING",
        currentApproverId: managerId,
        bookingId: booking.id,
        dueAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
      },
    });
  }

  return NextResponse.json(
    {
      bookingId: booking.id,
      status: booking.status,
      policyResult,
      confirmationRef: booking.confirmationRef,
    },
    { status: 201 }
  );
}
