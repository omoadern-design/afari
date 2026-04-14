import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const all = searchParams.get("all") === "true";

  const userId = session.user.id;
  const role = session.user.role;

  // ?all=true is only for FINANCE or ADMIN users — returns every pending request
  const where =
    all && (role === "FINANCE" || role === "ADMIN")
      ? { status: "PENDING" }
      : { currentApproverId: userId, status: "PENDING" };

  const requests = await prisma.approvalRequest.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      booking: {
        include: {
          user: true,
        },
      },
      expense: {
        include: {
          user: true,
        },
      },
      actions: {
        include: {
          actor: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return NextResponse.json(requests);
}
