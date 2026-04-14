"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const EXPENSE_CATEGORIES = [
  { value: "MEALS", label: "Meals & Dining" },
  { value: "LODGING", label: "Lodging" },
  { value: "AIRFARE", label: "Airfare" },
  { value: "GROUND_TRANSPORT", label: "Ground Transport" },
  { value: "OFFICE_SUPPLIES", label: "Office Supplies" },
  { value: "ENTERTAINMENT", label: "Entertainment" },
  { value: "COMMUNICATION", label: "Communication" },
  { value: "CONFERENCE", label: "Conference & Training" },
  { value: "OTHER", label: "Other" },
] as const;

const CURRENCIES = [
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
  { value: "GBP", label: "GBP" },
  { value: "CAD", label: "CAD" },
] as const;

// Soft policy preview thresholds (client-side hint only)
const CATEGORY_SOFT_LIMITS: Record<string, number> = {
  MEALS: 75,
  ENTERTAINMENT: 150,
  LODGING: 300,
  AIRFARE: 800,
  GROUND_TRANSPORT: 100,
  OFFICE_SUPPLIES: 200,
  COMMUNICATION: 100,
  CONFERENCE: 500,
  OTHER: 200,
};

interface FormState {
  category: string;
  amount: string;
  currency: string;
  date: string;
  description: string;
  merchantName: string;
  merchantCity: string;
  notes: string;
  receiptUrl: string;
}

interface FieldErrors {
  category?: string;
  amount?: string;
  date?: string;
  description?: string;
}

function getTodayDate(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function shouldShowPolicyHint(category: string, amount: string): boolean {
  const limit = CATEGORY_SOFT_LIMITS[category];
  if (!limit || !amount) return false;
  const parsed = parseFloat(amount);
  return !isNaN(parsed) && parsed > limit;
}

function getPolicyHintMessage(category: string, amount: string): string {
  const parsed = parseFloat(amount);
  if (isNaN(parsed)) return "";
  const limit = CATEGORY_SOFT_LIMITS[category];
  const categoryLabel =
    EXPENSE_CATEGORIES.find((c) => c.value === category)?.label ?? category;
  return `${categoryLabel} expenses over $${limit} typically require manager approval.`;
}

export default function NewExpensePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [form, setForm] = useState<FormState>({
    category: "",
    amount: "",
    currency: "USD",
    date: getTodayDate(),
    description: "",
    merchantName: "",
    merchantCity: "",
    notes: "",
    receiptUrl: "",
  });

  const showPolicyHint =
    form.category !== "" && shouldShowPolicyHint(form.category, form.amount);

  const handleChange = useCallback(
    (field: keyof FormState) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
        setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
        setServerError(null);
      },
    []
  );

  function validate(): boolean {
    const errors: FieldErrors = {};

    if (!form.category) {
      errors.category = "Please select a category.";
    }

    const parsedAmount = parseFloat(form.amount);
    if (!form.amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      errors.amount = "Please enter a valid amount greater than 0.";
    }

    if (!form.date) {
      errors.date = "Please select a transaction date.";
    }

    if (!form.description.trim()) {
      errors.description = "Please enter a description.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setServerError(null);

    try {
      const payload = {
        category: form.category,
        amount: parseFloat(form.amount),
        currency: form.currency,
        transactionDate: form.date,
        description: form.description.trim(),
        merchantName: form.merchantName.trim() || undefined,
        merchantCity: form.merchantCity.trim() || undefined,
        notes: form.notes.trim() || undefined,
        receiptUrl: form.receiptUrl.trim() || undefined,
      };

      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setServerError(data.error ?? `Request failed (${res.status})`);
        return;
      }

      router.push("/expenses");
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/expenses"
          className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Expenses
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Submit New Expense</h1>
        <p className="mt-1 text-sm text-slate-500">
          Fill in the details below. Expenses above policy thresholds will be routed for approval.
        </p>
      </div>

      {/* Server error */}
      {serverError && (
        <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="divide-y divide-slate-100">
            {/* Category */}
            <div className="p-5">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={form.category}
                onChange={handleChange("category")}
                disabled={isSubmitting}
                className={cn(
                  "flex h-9 w-full rounded-lg border bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50",
                  fieldErrors.category
                    ? "border-red-400 focus-visible:ring-red-400"
                    : "border-slate-200"
                )}
              >
                <option value="">Select a category...</option>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              {fieldErrors.category && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.category}</p>
              )}
            </div>

            {/* Amount + Currency */}
            <div className="p-5">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Amount <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={handleChange("amount")}
                    disabled={isSubmitting}
                    className={cn(
                      fieldErrors.amount && "border-red-400 focus-visible:ring-red-400"
                    )}
                  />
                </div>
                <select
                  value={form.currency}
                  onChange={handleChange("currency")}
                  disabled={isSubmitting}
                  className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              {fieldErrors.amount && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.amount}</p>
              )}

              {/* Policy hint */}
              {showPolicyHint && (
                <div className="mt-2.5 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-700">
                  <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                  <span>{getPolicyHintMessage(form.category, form.amount)}</span>
                </div>
              )}
            </div>

            {/* Transaction Date */}
            <div className="p-5">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Transaction Date <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={form.date}
                onChange={handleChange("date")}
                disabled={isSubmitting}
                max={getTodayDate()}
                className={cn(fieldErrors.date && "border-red-400 focus-visible:ring-red-400")}
              />
              {fieldErrors.date && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.date}</p>
              )}
            </div>

            {/* Description */}
            <div className="p-5">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Description <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="Brief description of the expense"
                value={form.description}
                onChange={handleChange("description")}
                disabled={isSubmitting}
                maxLength={255}
                className={cn(
                  fieldErrors.description && "border-red-400 focus-visible:ring-red-400"
                )}
              />
              {fieldErrors.description && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.description}</p>
              )}
            </div>

            {/* Merchant Name */}
            <div className="p-5">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Merchant Name
              </label>
              <Input
                type="text"
                placeholder="e.g. Delta Airlines, Marriott, Uber"
                value={form.merchantName}
                onChange={handleChange("merchantName")}
                disabled={isSubmitting}
                maxLength={255}
              />
            </div>

            {/* Merchant City */}
            <div className="p-5">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Merchant City
              </label>
              <Input
                type="text"
                placeholder="e.g. New York, London"
                value={form.merchantCity}
                onChange={handleChange("merchantCity")}
                disabled={isSubmitting}
                maxLength={100}
              />
            </div>

            {/* Receipt URL */}
            <div className="p-5">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Receipt URL
              </label>
              <Input
                type="url"
                placeholder="https://... (link to receipt image or document)"
                value={form.receiptUrl}
                onChange={handleChange("receiptUrl")}
                disabled={isSubmitting}
              />
              <p className="mt-1 text-xs text-slate-400">
                Paste a link to your receipt. File upload coming soon.
              </p>
            </div>

            {/* Notes */}
            <div className="p-5">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Additional Notes
              </label>
              <Textarea
                placeholder="Business purpose, attendees, or any additional context..."
                value={form.notes}
                onChange={handleChange("notes")}
                disabled={isSubmitting}
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 flex items-center justify-end gap-3">
          <Link href="/expenses">
            <Button type="button" variant="outline" disabled={isSubmitting}>
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Expense"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
