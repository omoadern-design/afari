import type { FlightSearchResult, HotelSearchResult, CarSearchResult } from "@/types/travel";

// Seeded pseudo-random for deterministic results
function seededRand(seed: string, index: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  h = h ^ index;
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
  return Math.abs((h ^ (h >>> 16)) >>> 0) / 0xffffffff;
}

const AIRLINES = ["Kenya Airways", "Ethiopian Airlines", "RwandAir", "South African Airways", "EgyptAir", "Arik Air", "Air Maroc", "Emirates"];
const HOTEL_BRANDS = ["Marriott", "Hilton", "Hyatt", "IHG", "Westin", "Sheraton", "Hampton Inn", "Courtyard", "Aloft", "W Hotels"];
const CAR_COMPANIES = ["Hertz", "Enterprise", "Avis", "Budget", "National", "Dollar", "Thrifty", "Alamo"];
const CAR_CLASSES = ["ECONOMY", "COMPACT", "MIDSIZE", "FULLSIZE", "SUV", "LUXURY"];
const CAR_MODELS = {
  ECONOMY: ["Toyota Corolla", "Honda Civic", "Hyundai Elantra"],
  COMPACT: ["Ford Focus", "Chevy Cruze", "VW Jetta"],
  MIDSIZE: ["Toyota Camry", "Honda Accord", "Nissan Altima"],
  FULLSIZE: ["Ford Fusion", "Chevy Malibu", "Chrysler 300"],
  SUV: ["Ford Explorer", "Toyota Highlander", "Honda Pilot"],
  LUXURY: ["BMW 5 Series", "Mercedes E-Class", "Audi A6"],
};

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers?: number;
  advanceDays?: number;
}

export interface HotelSearchParams {
  city: string;
  checkIn: string;
  checkOut: string;
  guests?: number;
}

export interface CarSearchParams {
  location: string;
  pickupDate: string;
  dropoffDate: string;
}

export function searchFlights(params: FlightSearchParams): FlightSearchResult[] {
  const seed = `${params.origin}-${params.destination}-${params.departureDate}`;
  const basePrice = 200 + seededRand(seed, 0) * 600;
  const advanceDays = params.advanceDays ?? 14;

  // Last-minute flights cost more
  const urgencyMultiplier = advanceDays < 3 ? 1.8 : advanceDays < 7 ? 1.3 : 1.0;

  const results: FlightSearchResult[] = [];

  const flights = [
    { airline: AIRLINES[Math.floor(seededRand(seed, 1) * AIRLINES.length)], stops: 0, durationMult: 1.0,  priceMult: 1.0,  label: "BEST_BALANCE" as const },
    { airline: AIRLINES[Math.floor(seededRand(seed, 2) * AIRLINES.length)], stops: 0, durationMult: 0.85, priceMult: 1.15, label: "FASTEST"      as const },
    { airline: AIRLINES[Math.floor(seededRand(seed, 3) * AIRLINES.length)], stops: 1, durationMult: 1.5,  priceMult: 0.78, label: "LOWEST_COST"  as const },
    { airline: AIRLINES[Math.floor(seededRand(seed, 4) * AIRLINES.length)], stops: 1, durationMult: 1.8,  priceMult: 0.82, label: null },
    { airline: AIRLINES[Math.floor(seededRand(seed, 5) * AIRLINES.length)], stops: 2, durationMult: 2.2,  priceMult: 0.70, label: null },
  ];

  const cabinClasses: Array<"ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST"> = [
    "ECONOMY", "ECONOMY", "ECONOMY", "PREMIUM_ECONOMY", "BUSINESS"
  ];
  const cabinMultipliers = [1.0, 1.0, 0.85, 1.6, 3.2];

  flights.forEach((flight, i) => {
    const cabin = cabinClasses[i];
    const mult = cabinMultipliers[i];
    const price = Math.round(basePrice * urgencyMultiplier * mult * flight.durationMult * flight.priceMult);
    const duration = Math.round((120 + seededRand(seed, i + 10) * 300) * flight.durationMult);
    const depHour = 6 + Math.floor(seededRand(seed, i + 20) * 14);
    const depMin = Math.floor(seededRand(seed, i + 30) * 4) * 15;
    const arrivalMinutes = depHour * 60 + depMin + duration;
    const arrHour = Math.floor(arrivalMinutes / 60) % 24;
    const arrMin = arrivalMinutes % 60;

    results.push({
      id: `FL-${seed}-${i}`,
      airline: flight.airline,
      flightNumber: `${flight.airline.substring(0, 2).toUpperCase()}${Math.floor(1000 + seededRand(seed, i + 40) * 9000)}`,
      origin: params.origin.toUpperCase(),
      destination: params.destination.toUpperCase(),
      departureTime: `${String(depHour).padStart(2, "0")}:${String(depMin).padStart(2, "0")}`,
      arrivalTime: `${String(arrHour).padStart(2, "0")}:${String(arrMin).padStart(2, "0")}`,
      duration,
      stops: flight.stops,
      cabinClass: cabin,
      price,
      currency: "USD",
      policyResult: "IN_POLICY", // will be set by policy engine in API route
      policyViolations: [],
      seatsLeft: Math.floor(1 + seededRand(seed, i + 50) * 9),
      recommendationType: flight.label,
      isRecommended: flight.label === "BEST_BALANCE",
      aiReason: flight.label === "BEST_BALANCE" ? "Non-stop flight with strong on-time record and best overall value"
              : flight.label === "FASTEST" ? "Fastest option — arrives earliest with shortest travel time"
              : flight.label === "LOWEST_COST" ? "Lowest fare option — one stop but significant savings"
              : undefined,
    });
  });

  return results.sort((a, b) => a.price - b.price);
}

export function searchHotels(params: HotelSearchParams): HotelSearchResult[] {
  const seed = `${params.city}-${params.checkIn}`;
  const checkIn = new Date(params.checkIn);
  const checkOut = new Date(params.checkOut);
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

  const results: HotelSearchResult[] = [];
  const HOTEL_AMENITIES = ["WiFi", "Gym", "Pool", "Breakfast", "Parking", "Spa", "Bar", "Restaurant"];

  for (let i = 0; i < 6; i++) {
    const stars = 2 + Math.floor(seededRand(seed, i) * 4);
    const baseRate = stars * 45 + seededRand(seed, i + 10) * 80;
    const nightlyRate = Math.round(baseRate);
    const reviewScore = 7.0 + seededRand(seed, i + 20) * 3.0;
    const amenityCount = 2 + Math.floor(seededRand(seed, i + 30) * 5);
    const amenities = HOTEL_AMENITIES.slice(0, amenityCount);
    const brand = HOTEL_BRANDS[Math.floor(seededRand(seed, i + 40) * HOTEL_BRANDS.length)];
    const distance = (0.2 + seededRand(seed, i + 50) * 4.8).toFixed(1);

    results.push({
      id: `HT-${seed}-${i}`,
      name: `${brand} ${params.city}`,
      address: `${Math.floor(100 + seededRand(seed, i + 60) * 900)} ${["Main St", "Business Ave", "Corporate Blvd", "Commerce Dr"][i % 4]}`,
      city: params.city,
      rating: stars,
      reviewScore: Math.round(reviewScore * 10) / 10,
      reviewCount: Math.floor(200 + seededRand(seed, i + 70) * 2000),
      nightlyRate,
      currency: "USD",
      roomType: i < 3 ? "Standard Room" : i < 5 ? "Deluxe Room" : "Suite",
      amenities,
      policyResult: "IN_POLICY",
      policyViolations: [],
      isRecommended: i === 0,
      aiReason: i === 0 ? `Best-rated hotel within budget for ${nights} night stay` : undefined,
      distanceFromCenter: `${distance} mi from center`,
    });
  }

  return results.sort((a, b) => a.nightlyRate - b.nightlyRate);
}

export function searchCars(params: CarSearchParams): CarSearchResult[] {
  const seed = `${params.location}-${params.pickupDate}`;
  const pickup = new Date(params.pickupDate);
  const dropoff = new Date(params.dropoffDate);
  const days = Math.ceil((dropoff.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24));

  const results: CarSearchResult[] = [];
  const BASE_RATES: Record<string, number> = {
    ECONOMY: 35,
    COMPACT: 45,
    MIDSIZE: 60,
    FULLSIZE: 75,
    SUV: 95,
    LUXURY: 150,
  };

  CAR_CLASSES.forEach((carClass, i) => {
    const company = CAR_COMPANIES[Math.floor(seededRand(seed, i) * CAR_COMPANIES.length)];
    const baseRate = BASE_RATES[carClass];
    const dailyRate = Math.round(baseRate * (0.9 + seededRand(seed, i + 10) * 0.3));
    const models = CAR_MODELS[carClass as keyof typeof CAR_MODELS];
    const model = models[Math.floor(seededRand(seed, i + 20) * models.length)];

    results.push({
      id: `CR-${seed}-${i}`,
      rentalCompany: company,
      carClass,
      model,
      dailyRate,
      currency: "USD",
      pickupLocation: params.location,
      features: ["A/C", "Automatic", ...(carClass === "SUV" ? ["4WD"] : []), ...(carClass === "LUXURY" ? ["GPS", "Heated Seats"] : [])],
      policyResult: "IN_POLICY",
      policyViolations: [],
      isRecommended: carClass === "COMPACT",
      aiReason: carClass === "COMPACT" ? `Best value for ${days}-day rental within policy` : undefined,
    });
  });

  return results.sort((a, b) => a.dailyRate - b.dailyRate);
}
