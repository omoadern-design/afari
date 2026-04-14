import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  evaluateFlightPolicy,
  evaluateHotelPolicy,
  evaluateCarPolicy,
  evaluateExpensePolicy,
} from "@/lib/policy-engine";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { type, params } = body;

  const policies = await prisma.policy.findMany({
    where: { isActive: true },
    orderBy: { priority: "desc" },
  });

  let result;
  switch (type) {
    case "FLIGHT":
      result = evaluateFlightPolicy(params, policies);
      break;
    case "HOTEL":
      result = evaluateHotelPolicy(params, policies);
      break;
    case "CAR":
      result = evaluateCarPolicy(params, policies);
      break;
    case "EXPENSE":
      result = evaluateExpensePolicy(params, policies);
      break;
    default:
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  return NextResponse.json(result);
}
