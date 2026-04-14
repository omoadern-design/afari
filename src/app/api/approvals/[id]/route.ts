import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const userId = session.user.id;

  let body: { action: string; comment?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { action, comment } = body;

  if (!["APPROVE", "REJECT", "ESCALATE"].includes(action)) {
    return NextResponse.json(
      { error: "action must be APPROVE, REJECT, or ESCALATE" },
      { status: 400 }
    );
  }

  // Load the request and verify this user is the current approver
  const approvalRequest = await prisma.approvalRequest.findUnique({
    where: { id },
    include: {
      booking: { include: { user: true } },
      expense: { include: { user: true } },
    },
  });

  if (!approvalRequest) {
    return NextResponse.json({ error: "Approval request not found" }, { status: 404 });
  }

  // Allow FINANCE / ADMIN to act on any request; otherwise must be currentApprover
  const role = session.user.role;
  const isPrivileged = role === "FINANCE" || role === "ADMIN";
  if (!isPrivileged && approvalRequest.currentApproverId !== userId) {
    return NextResponse.json({ error: "Forbidden — not the current approver" }, { status: 403 });
  }

  if (approvalRequest.status !== "PENDING") {
    return NextResponse.json(
      { error: "Request is no longer pending" },
      { status: 409 }
    );
  }

  const now = new Date();

  // Determine new statuses
  let newApprovalStatus: string;
  let newEntityStatus: string;

  switch (action) {
    case "APPROVE":
      newApprovalStatus = "APPROVED";
      newEntityStatus =
        approvalRequest.subjectType === "BOOKING" ? "CONFIRMED" : "APPROVED";
      break;
    case "REJECT":
      newApprovalStatus = "REJECTED";
      newEntityStatus = "REJECTED";
      break;
    case "ESCALATE":
      newApprovalStatus = "ESCALATED";
      newEntityStatus =
        approvalRequest.subjectType === "BOOKING" ? "PENDING_APPROVAL" : "PENDING_APPROVAL";
      break;
    default:
      newApprovalStatus = "PENDING";
      newEntityStatus = "PENDING_APPROVAL";
  }

  // Run everything in a transaction
  const updated = await prisma.$transaction(async (tx) => {
    // 1. Update the ApprovalRequest
    const updatedRequest = await tx.approvalRequest.update({
      where: { id },
      data: {
        status: newApprovalStatus,
        respondedAt: action !== "ESCALATE" ? now : undefined,
        escalatedAt: action === "ESCALATE" ? now : undefined,
        updatedAt: now,
      },
      include: {
        booking: { include: { user: true } },
        expense: { include: { user: true } },
        actions: { include: { actor: true } },
      },
    });

    // 2. Update linked Booking or Expense
    if (approvalRequest.subjectType === "BOOKING" && approvalRequest.bookingId) {
      await tx.booking.update({
        where: { id: approvalRequest.bookingId },
        data: { status: newEntityStatus, updatedAt: now },
      });
    } else if (approvalRequest.subjectType === "EXPENSE" && approvalRequest.expenseId) {
      await tx.expense.update({
        where: { id: approvalRequest.expenseId },
        data: { status: newEntityStatus, updatedAt: now },
      });
    }

    // 3. Create ApprovalAction record
    await tx.approvalAction.create({
      data: {
        approvalRequestId: id,
        actorId: userId,
        action,
        comment: comment ?? null,
        createdAt: now,
      },
    });

    // 4. Notify the original requester
    const requesterId = approvalRequest.requesterId;
    const subjectLabel =
      approvalRequest.subjectType === "BOOKING" ? "booking" : "expense report";
    const actionLabel =
      action === "APPROVE" ? "approved" : action === "REJECT" ? "rejected" : "escalated";

    const amountRaw =
      approvalRequest.subjectType === "BOOKING"
        ? approvalRequest.booking?.totalAmount
        : approvalRequest.expense?.amount;
    const amountStr = amountRaw != null ? ` ($${amountRaw.toFixed(2)})` : "";

    await tx.notification.create({
      data: {
        userId: requesterId,
        type: `APPROVAL_${action}`,
        title: `Your ${subjectLabel} was ${actionLabel}`,
        body: comment
          ? `${actionLabel.charAt(0).toUpperCase() + actionLabel.slice(1)}${amountStr}: "${comment}"`
          : `Your ${subjectLabel}${amountStr} has been ${actionLabel}.`,
        linkUrl:
          approvalRequest.subjectType === "BOOKING"
            ? `/travel`
            : `/expenses`,
        createdAt: now,
      },
    });

    return updatedRequest;
  });

  return NextResponse.json(updated);
}
