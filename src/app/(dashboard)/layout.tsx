import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
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

  // Fetch pending approvals count for sidebar badge
  let pendingApprovals = 0;
  if (["MANAGER", "FINANCE", "ADMIN"].includes(session.user.role)) {
    pendingApprovals = await prisma.approvalRequest.count({
      where: {
        currentApproverId: session.user.id,
        status: "PENDING",
      },
    });
  }

  // Fetch unread notifications count
  const unreadNotifications = await prisma.notification.count({
    where: {
      userId: session.user.id,
      isRead: false,
    },
  });

  return (
    <div className="flex h-screen overflow-hidden bg-[#f7f7f7]">
      <Sidebar role={session.user.role} pendingApprovals={pendingApprovals} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar
          user={{
            name: session.user.name ?? "",
            email: session.user.email ?? "",
            role: session.user.role,
            avatarUrl: session.user.avatarUrl,
          }}
          unreadNotifications={unreadNotifications}
        />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
