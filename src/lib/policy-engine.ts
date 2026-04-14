import type { Policy } from "@prisma/client";
import type { PolicyResult } from "@/types/travel";

interface PolicyEvalResult {
  result: PolicyResult;
  violations: string[];
}

interface FlightParams {
  price: number;
  cabinClass: string;
  origin: string;
  destination: string;
  duration?: number; // minutes
  advanceDays?: number;
  stops?: number;
}

interface HotelParams {
  nightlyRate: number;
  nights?: number;
  city?: string;
  chainName?: string;
}

interface CarParams {
  dailyRate: number;
  days?: number;
  carClass?: string;
}

interface ExpenseParams {
  amount: number;
  category: string;
  merchantName?: string;
  date?: Date;
}

export function evaluateFlightPolicy(
  params: FlightParams,
  policies: Policy[]
): PolicyEvalResult {
  const violations: string[] = [];
  let worst: PolicyResult = "IN_POLICY";

  const bump = (r: PolicyResult) => {
    const order = ["IN_POLICY", "OUT_OF_POLICY", "REQUIRES_APPROVAL", "BLOCKED"];
    if (order.indexOf(r) > order.indexOf(worst)) worst = r;
  };

  for (const policy of policies) {
    // Max price check
    if (policy.flightMaxPrice && params.price > policy.flightMaxPrice) {
      const overBy = ((params.price - policy.flightMaxPrice) / policy.flightMaxPrice * 100).toFixed(0);
      violations.push(
        `Flight price $${params.price} exceeds policy limit of $${policy.flightMaxPrice} (${overBy}% over)`
      );
      bump(params.price > policy.flightMaxPrice * 1.5 ? "BLOCKED" : "REQUIRES_APPROVAL");
    }

    // Cabin class check
    if (
      (params.cabinClass === "BUSINESS" || params.cabinClass === "FIRST") &&
      !policy.flightCabinBusiness
    ) {
      violations.push(
        `${params.cabinClass} class is not permitted by policy. Economy class required.`
      );
      bump("REQUIRES_APPROVAL");
    }

    // Advance booking check
    if (policy.flightAdvanceDays && params.advanceDays !== undefined) {
      if (params.advanceDays < policy.flightAdvanceDays) {
        violations.push(
          `Booking made ${params.advanceDays} days in advance. Policy requires at least ${policy.flightAdvanceDays} days.`
        );
        bump("REQUIRES_APPROVAL");
      }
    }

    // Duration check
    if (policy.flightMaxDuration && params.duration !== undefined) {
      const durationHours = Math.round(params.duration / 60);
      if (durationHours > policy.flightMaxDuration) {
        violations.push(
          `Flight duration ${durationHours}h exceeds policy maximum of ${policy.flightMaxDuration}h.`
        );
        bump("OUT_OF_POLICY");
      }
    }
  }

  return { result: worst, violations };
}

export function evaluateHotelPolicy(
  params: HotelParams,
  policies: Policy[]
): PolicyEvalResult {
  const violations: string[] = [];
  let worst: PolicyResult = "IN_POLICY";

  const bump = (r: PolicyResult) => {
    const order = ["IN_POLICY", "OUT_OF_POLICY", "REQUIRES_APPROVAL", "BLOCKED"];
    if (order.indexOf(r) > order.indexOf(worst)) worst = r;
  };

  for (const policy of policies) {
    if (policy.hotelMaxNightlyRate && params.nightlyRate > policy.hotelMaxNightlyRate) {
      const overBy = ((params.nightlyRate - policy.hotelMaxNightlyRate) / policy.hotelMaxNightlyRate * 100).toFixed(0);
      violations.push(
        `Hotel rate $${params.nightlyRate}/night exceeds policy limit of $${policy.hotelMaxNightlyRate}/night (${overBy}% over)`
      );
      bump(params.nightlyRate > policy.hotelMaxNightlyRate * 1.4 ? "BLOCKED" : "REQUIRES_APPROVAL");
    }
  }

  return { result: worst, violations };
}

export function evaluateCarPolicy(
  params: CarParams,
  policies: Policy[]
): PolicyEvalResult {
  const violations: string[] = [];
  let worst: PolicyResult = "IN_POLICY";

  const bump = (r: PolicyResult) => {
    const order = ["IN_POLICY", "OUT_OF_POLICY", "REQUIRES_APPROVAL", "BLOCKED"];
    if (order.indexOf(r) > order.indexOf(worst)) worst = r;
  };

  for (const policy of policies) {
    if (policy.carMaxDailyRate && params.dailyRate > policy.carMaxDailyRate) {
      violations.push(
        `Car rental $${params.dailyRate}/day exceeds policy limit of $${policy.carMaxDailyRate}/day`
      );
      bump("REQUIRES_APPROVAL");
    }

    if (policy.carAllowedClasses && params.carClass) {
      try {
        const allowed: string[] = JSON.parse(policy.carAllowedClasses);
        if (!allowed.includes(params.carClass.toUpperCase())) {
          violations.push(
            `${params.carClass} class vehicle is not permitted. Allowed: ${allowed.join(", ")}`
          );
          bump("REQUIRES_APPROVAL");
        }
      } catch {
        // ignore parse errors
      }
    }
  }

  return { result: worst, violations };
}

export function evaluateExpensePolicy(
  params: ExpenseParams,
  policies: Policy[]
): PolicyEvalResult {
  const violations: string[] = [];
  let worst: PolicyResult = "IN_POLICY";

  const bump = (r: PolicyResult) => {
    const order = ["IN_POLICY", "OUT_OF_POLICY", "REQUIRES_APPROVAL", "BLOCKED"];
    if (order.indexOf(r) > order.indexOf(worst)) worst = r;
  };

  for (const policy of policies) {
    // General approval threshold
    if (policy.approvalThreshold && params.amount > policy.approvalThreshold) {
      violations.push(
        `Expense amount $${params.amount} exceeds approval threshold of $${policy.approvalThreshold}`
      );
      bump("REQUIRES_APPROVAL");
    }

    // Meals
    if (params.category === "MEALS" && policy.mealDailyLimit) {
      if (params.amount > policy.mealDailyLimit) {
        violations.push(
          `Meal expense $${params.amount} exceeds daily limit of $${policy.mealDailyLimit}`
        );
        bump("REQUIRES_APPROVAL");
      }
    }

    // Entertainment
    if (params.category === "ENTERTAINMENT" && policy.entertainmentLimit) {
      if (params.amount > policy.entertainmentLimit) {
        violations.push(
          `Entertainment expense $${params.amount} exceeds policy limit of $${policy.entertainmentLimit}`
        );
        bump("REQUIRES_APPROVAL");
      }
    }
  }

  return { result: worst, violations };
}
