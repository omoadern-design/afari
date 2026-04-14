export type PolicyResult = "IN_POLICY" | "OUT_OF_POLICY" | "REQUIRES_APPROVAL" | "BLOCKED";

export interface FlightBookingData {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  airline: string;
  flightNumber: string;
  cabinClass: "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST";
  duration: number; // minutes
  stops: number;
  passengers: number;
  isRoundTrip: boolean;
  departureTime: string;
  arrivalTime: string;
  returnFlightNumber?: string;
}

export interface HotelBookingData {
  hotelName: string;
  address: string;
  city: string;
  country: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  roomType: string;
  nightlyRate: number;
  rating: number; // stars
  amenities?: string[];
}

export interface CarBookingData {
  rentalCompany: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  dropoffDate: string;
  days: number;
  carClass: string; // ECONOMY | COMPACT | MIDSIZE | FULLSIZE | SUV | LUXURY
  dailyRate: number;
  model?: string;
}

export interface FlightSearchResult {
  id: string;
  airline: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: number;
  stops: number;
  cabinClass: "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST";
  price: number;
  currency: string;
  policyResult: PolicyResult;
  policyViolations: string[];
  seatsLeft?: number;
  isRecommended?: boolean;
  aiReason?: string;
  recommendationType?: "BEST_BALANCE" | "FASTEST" | "LOWEST_COST" | null;
}

export interface HotelSearchResult {
  id: string;
  name: string;
  address: string;
  city: string;
  rating: number;
  reviewScore: number;
  reviewCount: number;
  nightlyRate: number;
  currency: string;
  roomType: string;
  amenities: string[];
  imageUrl?: string;
  policyResult: PolicyResult;
  policyViolations: string[];
  isRecommended?: boolean;
  aiReason?: string;
  distanceFromCenter?: string;
}

export interface CarSearchResult {
  id: string;
  rentalCompany: string;
  carClass: string;
  model: string;
  dailyRate: number;
  currency: string;
  pickupLocation: string;
  features: string[];
  policyResult: PolicyResult;
  policyViolations: string[];
  isRecommended?: boolean;
  aiReason?: string;
}
