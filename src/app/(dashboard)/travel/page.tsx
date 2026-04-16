"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plane, Hotel, Car, Search, Loader2, CheckCircle, AlertCircle, X
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FlightCard } from "@/components/travel/FlightCard";
import { HotelCard } from "@/components/travel/HotelCard";
import { CarCard } from "@/components/travel/CarCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { FlightSearchResult, HotelSearchResult, CarSearchResult } from "@/types/travel";

// ─── Types ────────────────────────────────────────────────────────────────────
type BookableItem =
  | { kind: "flight"; item: FlightSearchResult }
  | { kind: "hotel"; item: HotelSearchResult }
  | { kind: "car"; item: CarSearchResult };

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function TravelPage() {
  const router = useRouter();

  // Flight search state
  const [flightForm, setFlightForm] = useState({
    origin: "",
    destination: "",
    departureDate: "",
    returnDate: "",
    cabin: "ECONOMY",
    passengers: "1",
  });

  // Hotel search state
  const [hotelForm, setHotelForm] = useState({
    city: "",
    checkIn: "",
    checkOut: "",
    guests: "1",
  });

  // Car search state
  const [carForm, setCarForm] = useState({
    location: "",
    pickupDate: "",
    dropoffDate: "",
  });

  // Results
  const [flightResults, setFlightResults] = useState<FlightSearchResult[] | null>(null);
  const [hotelResults, setHotelResults] = useState<HotelSearchResult[] | null>(null);
  const [carResults, setCarResults] = useState<CarSearchResult[] | null>(null);

  // UI state
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [bookingItem, setBookingItem] = useState<BookableItem | null>(null);
  const [justification, setJustification] = useState("");
  const [purpose, setPurpose] = useState("");
  const [booking, setBooking] = useState(false);
  const [bookSuccess, setBookSuccess] = useState(false);
  const [bookError, setBookError] = useState("");

  // ─── Search handlers ─────────────────────────────────────────────────────────
  async function searchFlights(e: React.FormEvent) {
    e.preventDefault();
    setSearching(true);
    setSearchError("");
    setFlightResults(null);
    try {
      const today = new Date();
      const dep = new Date(flightForm.departureDate);
      const advanceDays = Math.floor((dep.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const res = await fetch("/api/travel/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "FLIGHT",
          params: {
            origin: flightForm.origin,
            destination: flightForm.destination,
            departureDate: flightForm.departureDate,
            returnDate: flightForm.returnDate || undefined,
            passengers: parseInt(flightForm.passengers),
            advanceDays: Math.max(0, advanceDays),
            cabin: flightForm.cabin,
          },
        }),
      });
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setFlightResults(data);
    } catch {
      setSearchError("Unable to search flights. Please try again.");
    } finally {
      setSearching(false);
    }
  }

  async function searchHotels(e: React.FormEvent) {
    e.preventDefault();
    setSearching(true);
    setSearchError("");
    setHotelResults(null);
    try {
      const res = await fetch("/api/travel/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "HOTEL",
          params: {
            city: hotelForm.city,
            checkIn: hotelForm.checkIn,
            checkOut: hotelForm.checkOut,
            guests: parseInt(hotelForm.guests),
          },
        }),
      });
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setHotelResults(data);
    } catch {
      setSearchError("Unable to search hotels. Please try again.");
    } finally {
      setSearching(false);
    }
  }

  async function searchCars(e: React.FormEvent) {
    e.preventDefault();
    setSearching(true);
    setSearchError("");
    setCarResults(null);
    try {
      const res = await fetch("/api/travel/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "CAR",
          params: {
            location: carForm.location,
            pickupDate: carForm.pickupDate,
            dropoffDate: carForm.dropoffDate,
          },
        }),
      });
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setCarResults(data);
    } catch {
      setSearchError("Unable to search cars. Please try again.");
    } finally {
      setSearching(false);
    }
  }

  // ─── Booking ──────────────────────────────────────────────────────────────────
  function handleBook(item: BookableItem["item"], kind: "flight" | "hotel" | "car") {
    setBookingItem({ kind, item } as BookableItem);
    setJustification("");
    setPurpose("");
    setBookError("");
    setBookSuccess(false);
  }

  const needsJustification =
    bookingItem &&
    (bookingItem.item.policyResult === "REQUIRES_APPROVAL" ||
      bookingItem.item.policyResult === "OUT_OF_POLICY");

  async function confirmBooking() {
    if (!bookingItem) return;
    if (needsJustification && !justification.trim()) {
      setBookError("Please provide a business justification for this out-of-policy booking.");
      return;
    }
    setBooking(true);
    setBookError("");

    const { kind, item } = bookingItem;
    let body: any = { purpose, justification };

    if (kind === "flight") {
      const f = item as FlightSearchResult;
      body.type = "FLIGHT";
      body.totalAmount = f.price;
      body.data = {
        origin: f.origin,
        destination: f.destination,
        departureDate: flightForm.departureDate,
        returnDate: flightForm.returnDate || undefined,
        airline: f.airline,
        flightNumber: f.flightNumber,
        cabinClass: f.cabinClass,
        duration: f.duration,
        stops: f.stops,
        passengers: parseInt(flightForm.passengers),
        isRoundTrip: !!flightForm.returnDate,
        departureTime: f.departureTime,
        arrivalTime: f.arrivalTime,
      };
    } else if (kind === "hotel") {
      const h = item as HotelSearchResult;
      const checkIn = new Date(hotelForm.checkIn);
      const checkOut = new Date(hotelForm.checkOut);
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      body.type = "HOTEL";
      body.totalAmount = h.nightlyRate * nights;
      body.data = {
        hotelName: h.name,
        address: h.address,
        city: h.city,
        country: "USA",
        checkIn: hotelForm.checkIn,
        checkOut: hotelForm.checkOut,
        nights,
        roomType: h.roomType,
        nightlyRate: h.nightlyRate,
        rating: h.rating,
        amenities: h.amenities,
      };
    } else {
      const c = item as CarSearchResult;
      const pickup = new Date(carForm.pickupDate);
      const dropoff = new Date(carForm.dropoffDate);
      const days = Math.ceil((dropoff.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24));
      body.type = "CAR";
      body.totalAmount = c.dailyRate * days;
      body.data = {
        rentalCompany: c.rentalCompany,
        pickupLocation: c.pickupLocation,
        dropoffLocation: c.pickupLocation,
        pickupDate: carForm.pickupDate,
        dropoffDate: carForm.dropoffDate,
        days,
        carClass: c.carClass,
        dailyRate: c.dailyRate,
        model: c.model,
      };
    }

    try {
      const res = await fetch("/api/travel/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setBookError(data.error ?? "Booking failed. Please try again.");
      } else {
        setBookSuccess(true);
        setTimeout(() => {
          setBookingItem(null);
          router.push("/dashboard");
        }, 2000);
      }
    } catch {
      setBookError("Network error. Please try again.");
    } finally {
      setBooking(false);
    }
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  const today = new Date().toISOString().split("T")[0];

  function hotelNights() {
    if (!hotelForm.checkIn || !hotelForm.checkOut) return 0;
    const diff =
      (new Date(hotelForm.checkOut).getTime() - new Date(hotelForm.checkIn).getTime()) /
      (1000 * 60 * 60 * 24);
    return Math.max(0, Math.ceil(diff));
  }

  function carDays() {
    if (!carForm.pickupDate || !carForm.dropoffDate) return 0;
    const diff =
      (new Date(carForm.dropoffDate).getTime() - new Date(carForm.pickupDate).getTime()) /
      (1000 * 60 * 60 * 24);
    return Math.max(0, Math.ceil(diff));
  }

  return (
    <div className="px-4 py-5 sm:px-6 max-w-6xl mx-auto">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-[#0a0a0a]">Plan a Trip</h1>
        <p className="text-[#737373] text-sm mt-0.5">
          Search and book flights, hotels, and cars across Africa and beyond
        </p>
      </div>

      <Tabs defaultValue="flights">
        <TabsList className="mb-5">
          <TabsTrigger value="flights" className="gap-2">
            <Plane className="h-4 w-4" />
            Flights
          </TabsTrigger>
          <TabsTrigger value="hotels" className="gap-2">
            <Hotel className="h-4 w-4" />
            Hotels
          </TabsTrigger>
          <TabsTrigger value="cars" className="gap-2">
            <Car className="h-4 w-4" />
            Car Rentals
          </TabsTrigger>
        </TabsList>

        {/* ── Flights ─────────────────────────────────────────────── */}
        <TabsContent value="flights">
          <div className="rounded-xl border border-[#e5e5e5] bg-white p-5 shadow-sm mb-5">
            <form onSubmit={searchFlights} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 items-end">
              <div>
                <label className="label">From</label>
                <Input
                  placeholder="LOS, Lagos..."
                  value={flightForm.origin}
                  onChange={(e) => setFlightForm((f) => ({ ...f, origin: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="label">To</label>
                <Input
                  placeholder="NBO, Nairobi..."
                  value={flightForm.destination}
                  onChange={(e) => setFlightForm((f) => ({ ...f, destination: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="label">Departure</label>
                <Input
                  type="date"
                  min={today}
                  value={flightForm.departureDate}
                  onChange={(e) => setFlightForm((f) => ({ ...f, departureDate: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="label">Return (optional)</label>
                <Input
                  type="date"
                  min={flightForm.departureDate || today}
                  value={flightForm.returnDate}
                  onChange={(e) => setFlightForm((f) => ({ ...f, returnDate: e.target.value }))}
                />
              </div>
              <div>
                <label className="label">Cabin Class</label>
                <Select value={flightForm.cabin} onValueChange={(v) => setFlightForm((f) => ({ ...f, cabin: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ECONOMY">Economy</SelectItem>
                    <SelectItem value="PREMIUM_ECONOMY">Premium Economy</SelectItem>
                    <SelectItem value="BUSINESS">Business</SelectItem>
                    <SelectItem value="FIRST">First Class</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="label">Passengers</label>
                <Select value={flightForm.passengers} onValueChange={(v) => setFlightForm((f) => ({ ...f, passengers: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <SelectItem key={n} value={String(n)}>{n} passenger{n > 1 ? "s" : ""}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
                <Button type="submit" disabled={searching} className="w-full sm:w-auto gap-2">
                  {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  {searching ? "Searching..." : "Search Flights"}
                </Button>
              </div>
            </form>
          </div>

          {searchError && <ErrorBanner message={searchError} />}

          {searching && <SearchSkeleton count={4} />}

          {flightResults && !searching && (
            <div>
              <p className="text-sm text-[#737373] mb-3">
                {flightResults.length} flight{flightResults.length !== 1 ? "s" : ""} found
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                {flightResults.map((f) => (
                  <FlightCard
                    key={f.id}
                    flight={f}
                    onBook={(item) => handleBook(item, "flight")}
                  />
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* ── Hotels ──────────────────────────────────────────────── */}
        <TabsContent value="hotels">
          <div className="rounded-xl border border-[#e5e5e5] bg-white p-5 shadow-sm mb-5">
            <form onSubmit={searchHotels} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 items-end">
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="label">City</label>
                <Input
                  placeholder="Nairobi, Lagos, Accra..."
                  value={hotelForm.city}
                  onChange={(e) => setHotelForm((f) => ({ ...f, city: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="label">Check-in</label>
                <Input
                  type="date"
                  min={today}
                  value={hotelForm.checkIn}
                  onChange={(e) => setHotelForm((f) => ({ ...f, checkIn: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="label">Check-out</label>
                <Input
                  type="date"
                  min={hotelForm.checkIn || today}
                  value={hotelForm.checkOut}
                  onChange={(e) => setHotelForm((f) => ({ ...f, checkOut: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="label">Guests</label>
                <Select value={hotelForm.guests} onValueChange={(v) => setHotelForm((f) => ({ ...f, guests: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4].map((n) => (
                      <SelectItem key={n} value={String(n)}>{n} guest{n > 1 ? "s" : ""}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
                <Button type="submit" disabled={searching} className="w-full sm:w-auto gap-2">
                  {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  {searching ? "Searching..." : "Search Hotels"}
                </Button>
              </div>
            </form>
          </div>

          {searchError && <ErrorBanner message={searchError} />}
          {searching && <SearchSkeleton count={3} />}

          {hotelResults && !searching && (
            <div>
              <p className="text-sm text-[#737373] mb-3">
                {hotelResults.length} hotel{hotelResults.length !== 1 ? "s" : ""} found
                {hotelNights() > 0 && ` · ${hotelNights()} night${hotelNights() !== 1 ? "s" : ""}`}
              </p>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {hotelResults.map((h) => (
                  <HotelCard
                    key={h.id}
                    hotel={h}
                    nights={hotelNights()}
                    onBook={(item) => handleBook(item, "hotel")}
                  />
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* ── Cars ────────────────────────────────────────────────── */}
        <TabsContent value="cars">
          <div className="rounded-xl border border-[#e5e5e5] bg-white p-5 shadow-sm mb-5">
            <form onSubmit={searchCars} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 items-end">
              <div>
                <label className="label">Pick-up Location</label>
                <Input
                  placeholder="Nairobi, Lagos..."
                  value={carForm.location}
                  onChange={(e) => setCarForm((f) => ({ ...f, location: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="label">Pick-up Date</label>
                <Input
                  type="date"
                  min={today}
                  value={carForm.pickupDate}
                  onChange={(e) => setCarForm((f) => ({ ...f, pickupDate: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="label">Drop-off Date</label>
                <Input
                  type="date"
                  min={carForm.pickupDate || today}
                  value={carForm.dropoffDate}
                  onChange={(e) => setCarForm((f) => ({ ...f, dropoffDate: e.target.value }))}
                  required
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
                <Button type="submit" disabled={searching} className="w-full sm:w-auto gap-2">
                  {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  {searching ? "Searching..." : "Search Cars"}
                </Button>
              </div>
            </form>
          </div>

          {searchError && <ErrorBanner message={searchError} />}
          {searching && <SearchSkeleton count={4} />}

          {carResults && !searching && (
            <div>
              <p className="text-sm text-[#737373] mb-3">
                {carResults.length} vehicle{carResults.length !== 1 ? "s" : ""} found
                {carDays() > 0 && ` · ${carDays()} day${carDays() !== 1 ? "s" : ""}`}
              </p>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {carResults.map((c) => (
                  <CarCard
                    key={c.id}
                    car={c}
                    days={carDays()}
                    onBook={(item) => handleBook(item, "car")}
                  />
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ── Booking Confirmation Dialog ───────────────────────────── */}
      <Dialog open={!!bookingItem} onOpenChange={(open) => !open && setBookingItem(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {bookSuccess
                ? "Booking Submitted!"
                : needsJustification
                ? "Justification Required"
                : "Confirm Booking"}
            </DialogTitle>
            <DialogDescription>
              {bookSuccess
                ? undefined
                : needsJustification
                ? "This booking is outside of policy. Provide a business justification for your manager to review."
                : "Review and confirm your booking details."}
            </DialogDescription>
          </DialogHeader>

          {bookSuccess ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle className="h-7 w-7 text-emerald-600" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-[#0a0a0a]">
                  {bookingItem?.item.policyResult === "REQUIRES_APPROVAL"
                    ? "Sent for Approval"
                    : "Booking Confirmed!"}
                </p>
                <p className="text-sm text-[#737373] mt-1">
                  {bookingItem?.item.policyResult === "REQUIRES_APPROVAL"
                    ? "Your manager will be notified to review this booking."
                    : "Your booking is confirmed. Redirecting to dashboard..."}
                </p>
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-[#0a0a0a] mb-1.5">
                  Trip Purpose
                </label>
                <Input
                  placeholder="e.g. Client meeting, Conference, Team offsite..."
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                />
              </div>

              {needsJustification && (
                <div>
                  <label className="block text-sm font-medium text-[#0a0a0a] mb-1.5">
                    Business Justification <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    placeholder="Explain why this out-of-policy booking is necessary..."
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                    rows={3}
                  />
                </div>
              )}

              {bookError && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {bookError}
                </div>
              )}

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setBookingItem(null)}
                  disabled={booking}
                >
                  Cancel
                </Button>
                <Button onClick={confirmBooking} disabled={booking}>
                  {booking ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" />Processing...</>
                  ) : needsJustification ? (
                    "Submit for Approval"
                  ) : (
                    "Confirm Booking"
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <style jsx>{`
        .label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.375rem;
        }
      `}</style>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function SearchSkeleton({ count }: { count: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-[#e5e5e5] bg-white p-4 animate-pulse"
        >
          <div className="flex justify-between mb-4">
            <div className="flex gap-3">
              <div className="h-10 w-10 rounded-lg bg-slate-200" />
              <div className="space-y-1.5">
                <div className="h-4 w-24 rounded bg-slate-200" />
                <div className="h-3 w-16 rounded bg-[#f0f0f0]" />
              </div>
            </div>
            <div className="h-5 w-20 rounded-full bg-slate-200" />
          </div>
          <div className="flex justify-between items-center mb-4">
            <div className="h-6 w-16 rounded bg-slate-200" />
            <div className="h-3 w-24 rounded bg-[#f0f0f0]" />
            <div className="h-6 w-16 rounded bg-slate-200" />
          </div>
          <div className="flex justify-between items-center">
            <div className="h-8 w-20 rounded bg-slate-200" />
            <div className="h-8 w-24 rounded bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      {message}
    </div>
  );
}
