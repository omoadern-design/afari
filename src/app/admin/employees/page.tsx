import type { Metadata } from "next";
import { AppShell } from "@/components/shell/AppShell";
import { adminNav } from "@/components/shell/adminNav";
import { PageHeader } from "@/components/shell/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { PlusCircle, Mail } from "@/components/icons";
import { store } from "@/lib/mock/store";

export const metadata: Metadata = { title: "Employees" };

const roleTone: Record<string, "navy" | "terracotta" | "emerald" | "amber"> = {
  admin: "terracotta",
  manager: "navy",
  finance: "emerald",
  employee: "amber",
};

export default function EmployeesPage() {
  const me = store.currentUser();
  const users = store.users();
  const pending = store.pendingApprovals();

  return (
    <AppShell
      scope="Admin"
      scopeName={store.org.name}
      nav={adminNav("employees", pending.length)}
      user={{ name: `${me.firstName} ${me.lastName}`, jobTitle: me.jobTitle }}
    >
      <PageHeader
        eyebrow={`${users.length} people`}
        title="Your team"
        subtitle="Roles, departments, managers, and approval chains."
        actions={
          <>
            <Button variant="outline" iconLeft={<Mail size={14} />}>
              Bulk invite
            </Button>
            <Button iconLeft={<PlusCircle size={16} />}>Invite person</Button>
          </>
        }
      />

      <Card>
        <CardBody className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.18em] text-navy-500 border-b border-sand-200">
                <th className="px-5 py-3 font-medium">Person</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Department</th>
                <th className="px-5 py-3 font-medium">Manager</th>
                <th className="px-5 py-3 font-medium">Country</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const mgr = store.manager(u);
                return (
                  <tr
                    key={u.id}
                    className="border-b border-sand-200 last:border-0 hover:bg-sand-50"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={`${u.firstName} ${u.lastName}`} size={36} />
                        <div className="min-w-0">
                          <div className="font-medium text-navy-800 truncate">
                            {u.firstName} {u.lastName}
                          </div>
                          <div className="text-xs text-navy-500 truncate">
                            {u.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={roleTone[u.role] ?? "neutral"}>
                        {u.role}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-navy-700">{u.department}</td>
                    <td className="px-5 py-3 text-navy-600">
                      {mgr ? `${mgr.firstName} ${mgr.lastName}` : "—"}
                    </td>
                    <td className="px-5 py-3 text-navy-600">{u.countryCode}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </AppShell>
  );
}
