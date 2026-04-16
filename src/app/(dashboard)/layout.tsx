import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  let pendingApprovals = 0;
  if (["MANAGER", "FINANCE", "ADMIN"].includes(session.user.role)) {
    pendingApprovals = await prisma.approvalRequest.count({
      where: {
        currentApproverId: session.user.id,
        status: "PENDING",
      },
    });
  }

  const unreadNotifications = await prisma.notification.count({
    where: {
      userId: session.user.id,
      isRead: false,
    },
  });

  return (
    <DashboardShell
      role={session.user.role}
      pendingApprovals={pendingApprovals}
      user={{
        name: session.user.name ?? "",
        email: session.user.email ?? "",
        role: session.user.role,
        avatarUrl: session.user.avatarUrl,
      }}
      unreadNotifications={unreadNotifications}
    >
      {children}
    </DashboardShell>
  );
}
