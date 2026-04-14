import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const expense = await prisma.expense.findUnique({
    where: { id },
    include: { approvalRequest: { include: { actions: true } } },
  });

  if (!expense) {
    return NextResponse.json({ error: "Expense not found" }, { status: 404 });
  }

  const userRole = session.user.role as string;
  const isOwner = expense.userId === session.user.id;
  const isManagerOrAdmin = userRole === "MANAGER" || userRole === "FINANCE" || userRole === "ADMIN";

  if (!isOwner && !isManagerOrAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(expense);
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const expense = await prisma.expense.findUnique({ where: { id } });

  if (!expense) {
    return NextResponse.json({ error: "Expense not found" }, { status: 404 });
  }

  if (expense.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (expense.status !== "DRAFT") {
    return NextResponse.json({ error: "Only DRAFT expenses can be updated" }, { status: 409 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Whitelist of updatable fields
  const allowedFields = [
    "category",
    "amount",
    "currency",
    "description",
    "merchantName",
    "merchantCity",
    "transactionDate",
    "receiptUrl",
    "notes",
  ];

  const updateData: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (field in body) {
      if (field === "transactionDate" && typeof body[field] === "string") {
        updateData[field] = new Date(body[field] as string);
      } else if (field === "amount") {
        const parsed = Number(body[field]);
        if (!isNaN(parsed) && parsed > 0) {
          updateData[field] = parsed;
        }
      } else {
        updateData[field] = body[field];
      }
    }
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const updated = await prisma.expense.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const expense = await prisma.expense.findUnique({ where: { id } });

  if (!expense) {
    return NextResponse.json({ error: "Expense not found" }, { status: 404 });
  }

  if (expense.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (expense.status !== "DRAFT") {
    return NextResponse.json({ error: "Only DRAFT expenses can be deleted" }, { status: 409 });
  }

  await prisma.expense.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
