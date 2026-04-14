import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { evaluateExpensePolicy } from "@/lib/policy-engine";
import { detectAnomaly } from "@/lib/ai-engine";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const expenses = await prisma.expense.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { approvalRequest: true },
  });

  return NextResponse.json(expenses);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    category: string;
    amount: number;
    currency: string;
    description: string;
    merchantName?: string;
    merchantCity?: string;
    transactionDate: string;
    receiptUrl?: string;
    notes?: string;
    bookingId?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { category, amount, currency, description, merchantName, merchantCity, transactionDate, receiptUrl, notes, bookingId } = body;

  if (!category || amount === undefined || !currency || !description || !transactionDate) {
    return NextResponse.json({ error: "Missing required fields: category, amount, currency, description, transactionDate" }, { status: 400 });
  }

  const parsedAmount = Number(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return NextResponse.json({ error: "amount must be a positive number" }, { status: 400 });
  }

  // Fetch active policies
  const policies = await prisma.policy.findMany({ where: { isActive: true } });

  // Evaluate policy
  const policyEval = evaluateExpensePolicy(
    { amount: parsedAmount, category, merchantName, date: new Date(transactionDate) },
    policies
  );

  // Fetch last 30 days of user expenses for anomaly detection
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentExpenses = await prisma.expense.findMany({
    where: {
      userId: session.user.id,
      transactionDate: { gte: thirtyDaysAgo },
    },
    select: { amount: true, category: true, transactionDate: true, merchantName: true },
  });

  // Run anomaly detection
  const anomalyResult = detectAnomaly({
    amount: parsedAmount,
    category,
    merchantName,
    date: new Date(transactionDate),
    userId: session.user.id,
    recentExpenses: recentExpenses.map((e) => ({
      amount: e.amount,
      category: e.category,
      date: e.transactionDate,
      merchantName: e.merchantName ?? undefined,
    })),
  });

  // Determine initial status
  const needsApproval =
    policyEval.result === "REQUIRES_APPROVAL" ||
    policyEval.result === "BLOCKED" ||
    anomalyResult.score > 0.3;

  const initialStatus = needsApproval ? "PENDING_APPROVAL" : "SUBMITTED";

  // Find the best-matching policy id (highest priority active policy)
  const topPolicy = policies.sort((a, b) => b.priority - a.priority)[0];

  // Create the expense record
  const expense = await prisma.expense.create({
    data: {
      userId: session.user.id,
      bookingId: bookingId ?? null,
      policyId: topPolicy?.id ?? null,
      category,
      status: initialStatus,
      policyResult: policyEval.result,
      policyViolations: JSON.stringify(policyEval.violations),
      amount: parsedAmount,
      currency,
      description,
      merchantName: merchantName ?? null,
      merchantCity: merchantCity ?? null,
      transactionDate: new Date(transactionDate),
      receiptUrl: receiptUrl ?? null,
      notes: notes ?? null,
      aiAnomalyScore: anomalyResult.score,
      aiAnomalyReason: anomalyResult.reasons.length > 0 ? anomalyResult.reasons.join("; ") : null,
    },
  });

  // Create approval request if needed
  if (needsApproval) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { managerId: true },
    });

    await prisma.approvalRequest.create({
      data: {
        requesterId: session.user.id,
        subjectType: "EXPENSE",
        status: "PENDING",
        expenseId: expense.id,
        currentApproverId: user?.managerId ?? null,
        dueAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      },
    });
  }

  return NextResponse.json(expense, { status: 201 });
}
