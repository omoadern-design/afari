import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Users, Plus, Search, Mail, Building2 } from "lucide-react";
import { initials, formatDate } from "@/lib/utils";

export default async function UsersPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { bookings: true, expenses: true },
      },
    },
  });

  const roleColors: Record<string, string> = {
    ADMIN: "bg-purple-100 text-purple-700",
    FINANCE: "bg-emerald-100 text-emerald-700",
    MANAGER: "bg-[#f0f0f0] text-[#0a0a0a]",
    EMPLOYEE: "bg-[#f0f0f0] text-[#737373]",
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0a0a0a]">Users</h1>
          <p className="text-[#737373] text-sm mt-0.5">{users.length} team members</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-[#0a0a0a] px-4 py-2 text-sm font-medium text-white hover:bg-[#262626]">
          <Plus className="h-4 w-4" />
          Invite User
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {["EMPLOYEE", "MANAGER", "FINANCE", "ADMIN"].map((role) => {
          const count = users.filter((u) => u.role === role).length;
          return (
            <div key={role} className="rounded-xl border border-[#e5e5e5] bg-white p-4 shadow-sm">
              <p className="text-2xl font-bold text-[#0a0a0a]">{count}</p>
              <p className="text-xs text-[#737373] mt-0.5 capitalize">{role.toLowerCase()}s</p>
            </div>
          );
        })}
      </div>

      {/* Users table */}
      <div className="rounded-xl border border-[#e5e5e5] bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#f0f0f0]">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a3a3a3]" />
              <input
                type="text"
                placeholder="Search users..."
                className="w-full rounded-lg border border-[#e5e5e5] bg-white pl-9 pr-3 py-2 text-sm placeholder:text-[#a3a3a3] focus:border-[#e5e5e5] focus:outline-none focus:ring-2 focus:ring-[#0a0a0a]/20"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#f0f0f0] bg-[#f7f7f7]">
                <th className="px-5 py-3 text-left text-xs font-semibold text-[#737373] uppercase tracking-wide">
                  User
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-[#737373] uppercase tracking-wide">
                  Role
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-[#737373] uppercase tracking-wide">
                  Department
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-[#737373] uppercase tracking-wide">
                  Activity
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-[#737373] uppercase tracking-wide">
                  Joined
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-[#737373] uppercase tracking-wide">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f7f7f7]">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-[#f7f7f7] transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f0f0f0] text-xs font-semibold text-[#0a0a0a] flex-shrink-0">
                        {initials(user.name)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#0a0a0a]">{user.name}</p>
                        <p className="text-xs text-[#a3a3a3] flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${roleColors[user.role] ?? "bg-[#f0f0f0] text-[#737373]"}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5 text-sm text-[#737373]">
                      <Building2 className="h-3.5 w-3.5 text-[#a3a3a3]" />
                      {user.department}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs text-[#737373]">
                      {user._count.bookings} trips · {user._count.expenses} expenses
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs text-[#737373]">{formatDate(user.createdAt)}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        user.isActive ? "bg-emerald-100 text-emerald-700" : "bg-[#f0f0f0] text-[#737373]"
                      }`}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
