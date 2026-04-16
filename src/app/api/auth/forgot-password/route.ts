import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import crypto from "crypto";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = schema.parse(body);

    const user = await prisma.user.findUnique({ where: { email } });

    // Always return 200 — don't leak whether email exists
    if (!user || !user.isActive) {
      return NextResponse.json({ ok: true });
    }

    // Generate a secure token and store it in an audit log for now.
    // TODO: store in a dedicated PasswordResetToken table + send via email provider
    const token = crypto.randomBytes(32).toString("hex");
    const resetUrl = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/reset-password?token=${token}`;
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "PASSWORD_RESET_REQUESTED",
        entityType: "User",
        entityId: user.id,
        metadata: JSON.stringify({ token, expiresAt: expiresAt.toISOString(), resetUrl }),
      },
    });

    // In development / until email is configured, log so admins can share manually
    if (process.env.NODE_ENV !== "production") {
      console.log(`[forgot-password] Reset link for ${email}: ${resetUrl}`);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }
    console.error("[forgot-password]", error);
    return NextResponse.json({ error: "Request failed. Please try again." }, { status: 500 });
  }
}
