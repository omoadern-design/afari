import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Shield, Plus, Check, X, Plane, Hotel, Car, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default async function PoliciesPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const policies = await prisma.policy.findMany({
    orderBy: [{ isActive: "desc" }, { priority: "desc" }],
    include: {
      _count: { select: { bookings: true, expenses: true } },
    },
  });

  return (
    <div className="px-4 py-5 sm:px-6 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#0a0a0a]">Travel Policies</h1>
          <p className="text-[#737373] text-sm mt-0.5">
            Define rules that govern employee travel and expense behavior
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-[#0a0a0a] px-4 py-2 text-sm font-medium text-white hover:bg-[#262626]">
          <Plus className="h-4 w-4" />
          New Policy
        </button>
      </div>

      {policies.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#e5e5e5] bg-white p-12 text-center">
          <Shield className="h-10 w-10 text-[#d4d4d4] mx-auto mb-3" />
          <p className="text-[#737373]">No policies configured</p>
          <p className="text-sm text-[#a3a3a3] mt-1">Create your first travel policy to start enforcing rules</p>
        </div>
      ) : (
        <div className="space-y-4">
          {policies.map((policy) => (
            <div
              key={policy.id}
              className="rounded-xl border border-[#e5e5e5] bg-white shadow-sm overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0f0f0]">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f0f0f0]">
                    <Shield className="h-4 w-4 text-[#0a0a0a]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#0a0a0a]">{policy.name}</h3>
                    {policy.description && (
                      <p className="text-xs text-[#737373]">{policy.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#a3a3a3]">
                    {policy._count.bookings} bookings · {policy._count.expenses} expenses
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      policy.isActive
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-[#f0f0f0] text-[#737373]"
                    }`}
                  >
                    {policy.isActive ? "Active" : "Inactive"}
                  </span>
                  <button className="text-xs text-[#0a0a0a] hover:underline">Edit</button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-0 divide-x divide-[#f0f0f0] lg:grid-cols-4">
                {/* Flight rules */}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2.5">
                    <Plane className="h-3.5 w-3.5 text-[#a3a3a3]" />
                    <span className="text-xs font-semibold text-[#737373] uppercase tracking-wide">Flights</span>
                  </div>
                  <div className="space-y-1.5">
                    {policy.flightMaxPrice && (
                      <PolicyRule label="Max price" value={formatCurrency(policy.flightMaxPrice)} />
                    )}
                    <PolicyRule
                      label="Business class"
                      value={policy.flightCabinBusiness ? "Allowed" : "Not allowed"}
                      positive={policy.flightCabinBusiness}
                    />
                    {policy.flightAdvanceDays && (
                      <PolicyRule label="Book in advance" value={`≥ ${policy.flightAdvanceDays} days`} />
                    )}
                  </div>
                </div>

                {/* Hotel rules */}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2.5">
                    <Hotel className="h-3.5 w-3.5 text-[#a3a3a3]" />
                    <span className="text-xs font-semibold text-[#737373] uppercase tracking-wide">Hotels</span>
                  </div>
                  <div className="space-y-1.5">
                    {policy.hotelMaxNightlyRate ? (
                      <PolicyRule label="Max rate/night" value={formatCurrency(policy.hotelMaxNightlyRate)} />
                    ) : (
                      <p className="text-xs text-[#a3a3a3]">No limits set</p>
                    )}
                  </div>
                </div>

                {/* Car rules */}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2.5">
                    <Car className="h-3.5 w-3.5 text-[#a3a3a3]" />
                    <span className="text-xs font-semibold text-[#737373] uppercase tracking-wide">Cars</span>
                  </div>
                  <div className="space-y-1.5">
                    {policy.carMaxDailyRate ? (
                      <PolicyRule label="Max rate/day" value={formatCurrency(policy.carMaxDailyRate)} />
                    ) : (
                      <p className="text-xs text-[#a3a3a3]">No limits set</p>
                    )}
                  </div>
                </div>

                {/* Expense rules */}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2.5">
                    <DollarSign className="h-3.5 w-3.5 text-[#a3a3a3]" />
                    <span className="text-xs font-semibold text-[#737373] uppercase tracking-wide">Expenses</span>
                  </div>
                  <div className="space-y-1.5">
                    {policy.mealDailyLimit && (
                      <PolicyRule label="Meal daily limit" value={formatCurrency(policy.mealDailyLimit)} />
                    )}
                    {policy.entertainmentLimit && (
                      <PolicyRule label="Entertainment" value={formatCurrency(policy.entertainmentLimit)} />
                    )}
                    {policy.approvalThreshold && (
                      <PolicyRule label="Approval threshold" value={`> ${formatCurrency(policy.approvalThreshold)}`} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PolicyRule({
  label,
  value,
  positive,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-[#737373]">{label}</span>
      <span
        className={`text-xs font-medium ${
          positive === true
            ? "text-emerald-600"
            : positive === false
            ? "text-red-500"
            : "text-[#0a0a0a]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
