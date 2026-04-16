// Domain types — mirrored 1:1 with the Phase 1 PostgreSQL schema so the
// mock store can be swapped for a real backend without changes upstream.

export type Role = "admin" | "manager" | "employee" | "finance";

export type TripStatus =
  | "draft"
  | "pending_approval"
  | "approved"
  | "declined"
  | "booking"
  | "booked"
  | "in_progress"
  | "completed"
  | "cancelled";

export type ExpenseStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "reimbursed"
  | "rejected";

export type ExpenseCategory =
  | "flight"
  | "hotel"
  | "meals"
  | "ground_transport"
  | "other";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  countryCode: string;
  baseCurrency: string;
  timezone: string;
  billingPlan: "starter" | "growth" | "enterprise";
}

export interface User {
  id: string;
  organizationId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  department: string;
  jobTitle: string;
  managerId?: string | null;
  countryCode: string;
}

export interface FlightBooking {
  id: string;
  tripId: string;
  pnr: string;
  airlineCode: string;
  airlineName: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTime: string;
  arrivalTime: string;
  cabinClass: "economy" | "premium_economy" | "business" | "first";
  seat?: string;
  cost: number;
  currency: string;
  ticketNumber: string;
  status: "confirmed" | "cancelled" | "pending";
}

export interface HotelBooking {
  id: string;
  tripId: string;
  hotelName: string;
  hotelAddress: string;
  city: string;
  countryCode: string;
  checkInDate: string;
  checkOutDate: string;
  roomType: string;
  nights: number;
  nightlyRate: number;
  totalCost: number;
  currency: string;
  confirmationNumber: string;
  status: "confirmed" | "cancelled" | "pending";
}

export interface GroundBooking {
  id: string;
  tripId: string;
  type: "airport_transfer" | "car_rental" | "rail";
  provider: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupTime: string;
  cost: number;
  currency: string;
  confirmationNumber: string;
  status: "confirmed" | "cancelled" | "pending";
}

export interface Trip {
  id: string;
  reference: string;
  organizationId: string;
  travelerId: string;
  requesterId: string;
  purpose: string;
  originCity: string;
  originAirport: string;
  destinationCity: string;
  destinationAirport: string;
  departureDate: string;
  returnDate?: string | null;
  status: TripStatus;
  estimatedCost: number;
  actualCost?: number;
  currency: string;
  policyCompliant: boolean;
  policyViolations?: string[];
  costCenter?: string;
  projectCode?: string;
  notes?: string;
  createdAt: string;
  flight?: FlightBooking;
  hotel?: HotelBooking;
  ground?: GroundBooking;
}

export interface Approval {
  id: string;
  tripId: string;
  approverId: string;
  status: "pending" | "approved" | "declined" | "suggested_alternative";
  decisionReason?: string;
  decidedAt?: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  reportId: string;
  tripId?: string;
  userId: string;
  category: ExpenseCategory;
  merchant: string;
  amount: number;
  currency: string;
  amountBaseCurrency: number;
  expenseDate: string;
  description?: string;
  receiptUrl?: string;
  policyCompliant: boolean;
  policyViolationReason?: string;
}

export interface ExpenseReport {
  id: string;
  reference: string;
  tripId: string;
  userId: string;
  status: ExpenseStatus;
  totalAmount: number;
  currency: string;
  submittedAt?: string;
  approvedAt?: string;
  reimbursedAt?: string;
  expenses: Expense[];
}

export interface Policy {
  id: string;
  organizationId: string;
  name: string;
  appliesToRole?: Role | null;
  appliesToDepartment?: string | null;
  maxFlightDomestic: number;
  maxFlightRegional: number;
  maxFlightIntl: number;
  maxHotelPerNight: number;
  maxDailyMeals: number;
  allowedCabinClasses: string[];
  advanceBookingDays: number;
  requiresApprovalAbove: number;
  autoApproveUnder: number;
}

export interface Budget {
  id: string;
  organizationId: string;
  name: string;
  scope: "organization" | "department" | "project" | "user";
  scopeName: string;
  period: "monthly" | "quarterly" | "annual";
  amount: number;
  currency: string;
  startDate: string;
  endDate: string;
  spent: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
  createdAt: string;
  readAt?: string;
}
