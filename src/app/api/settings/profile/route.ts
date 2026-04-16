import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  name:       z.string().min(2).max(100),
  department: z.string().max(100).optional(),
  title:      z.string().max(100).optional(),
  phone:      z.string().max(30).optional(),
});

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = schema.parse(body);

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name:       data.name,
        department: data.department ?? undefined,
        title:      data.title ?? undefined,
        phone:      data.phone ?? undefined,
      },
    });

    return NextResponse.json({ name: updated.name, department: updated.department });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
