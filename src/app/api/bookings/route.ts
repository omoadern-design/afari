import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const type = searchParams.get("type");

  const where: any = { userId: session.user.id };
  if (status) where.status = status;
  if (type) where.type = type;

  const bookings = await prisma.booking.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      approvalRequest: {
        include: {
          actions: { include: { actor: true }, orderBy: { createdAt: "desc" }, take: 1 },
        },
      },
    },
  });

  return NextResponse.json(bookings);
}
