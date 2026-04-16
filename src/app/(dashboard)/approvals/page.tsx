"use client";

import { useEffect, useState, useCallback } from "react";
import { CheckCircle, XCircle, Clock, AlertTriangle, CheckCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatCurrency, formatDate, timeAgo, initials } from "@/lib/utils";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ApprovalUser {
  id: string;
  name: string;
  email: string;
  department: string;
  avatarUrl?: string | null;
}

interface ApprovalBooking {
  id: string;
  type: string;
  totalAmount: number;
  currency: string;
  policyResult: string;
  policyViolations?: string | null;
  purpose?: string | null;
  justification?: string | null;
  createdAt: string;
  user: ApprovalUser;
}

interface ApprovalExpense {
  id: string;
  category: string;
  amount: number;
  currency: string;
  description: string;
  policyResult: string;
  policyViolations?: string | null;
  notes?: string | null;
  createdAt: string;
  user: ApprovalUser;
}

interface ApprovalAction {
  id: string;
  action: string;
  comment?: string | null;
  createdAt: string;
  actor: ApprovalUser;
}

interface ApprovalRequest {
  id: string;
  subjectType: "BOOKING" | "EXPENSE";
  status: string;
  requesterId: string;
  createdAt: string;
  respondedAt?: string | null;
  booking?: ApprovalBooking | null;
  expense?: ApprovalExpense | null;
  actions: ApprovalAction[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseViolations(raw?: string | null): string[] {
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return raw ? [raw] : [];
  }
}

function bookingTypeLabel(type: string): string {
  switch (type.toUpperCase()) {
    case "FLIGHT":
      return "Flight Booking";
    case "HOTEL":
      return "Hotel Booking";
    case "CAR":
      return "Car Rental";
    case "TRAIN":
      return "Train Booking";
    default:
      return `${type} Booking`;
  }
}

function expenseCategoryLabel(cat: string): string {
  return cat
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function AvatarFallback({ name, className }: { name: string; className?: string }) {
  return (
    <div
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f0f0f0] text-sm font-semibold text-[#0a0a0a]",
        className
      )}
    >
      {initials(name)}
    </div>
  );
}

function ViolationPills({ violations }: { violations: string[] }) {
  if (violations.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mt-1.5">
      {violations.map((v, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 ring-1 ring-red-200"
        >
          <AlertTriangle className="h-3 w-3" />
          {v}
        </span>
      ))}
    </div>
  );
}

interface ApprovalCardProps {
  request: ApprovalRequest;
  onAction: (id: string, action: "APPROVE" | "REJECT") => void;
  isPending: boolean;
  actionLoading: string | null;
}

function ApprovalCard({ request, onAction, isPending, actionLoading }: ApprovalCardProps) {
  const isBooking = request.subjectType === "BOOKING";
  const user = isBooking ? request.booking?.user : request.expense?.user;
  const amount = isBooking ? request.booking?.totalAmount : request.expense?.amount;
  const currency = isBooking ? request.booking?.currency : request.expense?.currency;
  const violations = parseViolations(
    isBooking ? request.booking?.policyViolations : request.expense?.policyViolations
  );
  const justification =
    isBooking
      ? request.booking?.justification || request.booking?.purpose
      : request.expense?.notes || request.expense?.description;
  const typeLabel = isBooking
    ? bookingTypeLabel(request.booking?.type ?? "")
    : expenseCategoryLabel(request.expense?.category ?? "Expense");

  const isActing = actionLoading === request.id;

  // Last action comment for history view
  const lastAction = request.actions[request.actions.length - 1];

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-start gap-4 p-5">
          {/* Avatar */}
          {user ? <AvatarFallback name={user.name} /> : <div className="h-9 w-9 rounded-full bg-[#f0f0f0]" />}

          {/* Main info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-[#0a0a0a] text-sm">
                    {user?.name ?? "Unknown"}
                  </span>
                  <span className="text-xs text-[#a3a3a3]">&bull;</span>
                  <span className="text-xs text-[#737373]">{user?.department}</span>
                  <span className="text-xs text-[#a3a3a3]">&bull;</span>
                  <span className="text-xs text-[#737373]">{timeAgo(request.createdAt)}</span>
                </div>
                <div className="mt-0.5 flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-[#0a0a0a] font-medium">{typeLabel}</span>
                  {violations.length > 0 && (
                    <Badge variant="destructive" className="text-[10px] py-0">
                      {violations.length} violation{violations.length > 1 ? "s" : ""}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Amount */}
              <div className="text-right shrink-0">
                <div className="text-lg font-bold text-[#0a0a0a]">
                  {amount != null ? formatCurrency(amount, currency ?? "USD") : "—"}
                </div>
                <div className="text-xs text-[#a3a3a3]">{formatDate(request.createdAt)}</div>
              </div>
            </div>

            {/* Violations */}
            <ViolationPills violations={violations} />

            {/* Justification */}
            {justification && (
              <p className="mt-2 text-sm text-[#737373] italic line-clamp-2">
                &ldquo;{justification}&rdquo;
              </p>
            )}

            {/* History: show action taken */}
            {!isPending && lastAction && (
              <div className="mt-2 flex items-center gap-1.5">
                {lastAction.action === "APPROVE" ? (
                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                )}
                <span className="text-xs text-[#737373]">
                  {lastAction.action === "APPROVE" ? "Approved" : "Rejected"} by{" "}
                  <span className="font-medium text-[#0a0a0a]">{lastAction.actor.name}</span>
                  {lastAction.comment ? ` — "${lastAction.comment}"` : ""}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Pending actions footer */}
        {isPending && (
          <div className="flex items-center justify-end gap-2 border-t border-[#f0f0f0] bg-[#f7f7f7] px-5 py-3">
            <Button
              variant="outline"
              size="sm"
              disabled={isActing}
              onClick={() => onAction(request.id, "REJECT")}
              className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
            >
              <XCircle className="h-4 w-4" />
              Reject
            </Button>
            <Button
              variant="success"
              size="sm"
              disabled={isActing}
              onClick={() => onAction(request.id, "APPROVE")}
              className="gap-1.5"
            >
              <CheckCircle className="h-4 w-4" />
              {isActing ? "Processing…" : "Approve"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ApprovalsPage() {
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/approvals");
      if (!res.ok) throw new Error("Failed to fetch");
      const data: ApprovalRequest[] = await res.json();
      setRequests(data);
    } catch {
      // keep empty state on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleAction = async (id: string, action: "APPROVE" | "REJECT") => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/approvals/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error("Action failed");
      const updated: ApprovalRequest = await res.json();
      // Optimistic update: replace in list
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? updated : r))
      );
    } catch {
      // leave as-is on error; user can retry
    } finally {
      setActionLoading(null);
    }
  };

  const pendingRequests = requests.filter((r) => r.status === "PENDING");
  const historyRequests = requests.filter((r) => r.status !== "PENDING");

  return (
    <div className="flex flex-col gap-6 px-4 py-5 sm:px-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-[#0a0a0a]">Approvals</h1>
          {pendingRequests.length > 0 && (
            <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-[#0a0a0a] px-2 text-xs font-bold text-white">
              {pendingRequests.length}
            </span>
          )}
        </div>
        <button
          onClick={fetchRequests}
          className="text-sm text-[#0a0a0a] hover:text-[#0a0a0a] font-medium"
        >
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "pending" | "history")}
      >
        <TabsList>
          <TabsTrigger value="pending" className="gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Pending
            {pendingRequests.length > 0 && (
              <span className="ml-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#0a0a0a] px-1 text-[10px] font-bold text-white">
                {pendingRequests.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-1.5">
            <CheckCheck className="h-3.5 w-3.5" />
            History
            {historyRequests.length > 0 && (
              <span className="ml-1 text-[#a3a3a3] text-xs">({historyRequests.length})</span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Pending Tab */}
        <TabsContent value="pending">
          {loading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-36 animate-pulse rounded-xl bg-[#f0f0f0]" />
              ))}
            </div>
          ) : pendingRequests.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="flex flex-col gap-3">
              {pendingRequests.map((r) => (
                <ApprovalCard
                  key={r.id}
                  request={r}
                  onAction={handleAction}
                  isPending
                  actionLoading={actionLoading}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          {loading ? (
            <div className="flex flex-col gap-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-32 animate-pulse rounded-xl bg-[#f0f0f0]" />
              ))}
            </div>
          ) : historyRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-[#a3a3a3]">
              <CheckCheck className="h-10 w-10" />
              <p className="text-sm">No history yet.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {historyRequests.map((r) => (
                <ApprovalCard
                  key={r.id}
                  request={r}
                  onAction={handleAction}
                  isPending={false}
                  actionLoading={actionLoading}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-[#e5e5e5] py-24">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
        <CheckCircle className="h-7 w-7 text-emerald-500" />
      </div>
      <div className="text-center">
        <p className="font-semibold text-[#0a0a0a]">No pending approvals</p>
        <p className="mt-1 text-sm text-[#737373]">
          All requests have been reviewed. Check back later.
        </p>
      </div>
    </div>
  );
}
