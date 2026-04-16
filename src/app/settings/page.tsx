import type { Metadata } from "next";
import { AppShell } from "@/components/shell/AppShell";
import { employeeNav } from "@/components/shell/employeeNav";
import { PageHeader } from "@/components/shell/PageHeader";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { store } from "@/lib/mock/store";

export const metadata: Metadata = { title: "Settings" };

export default function EmployeeSettings() {
  const me = store.user("usr_femi")!;
  return (
    <AppShell
      scope="Employee"
      scopeName={store.org.name}
      nav={employeeNav("settings")}
      user={{ name: `${me.firstName} ${me.lastName}`, jobTitle: me.jobTitle }}
    >
      <PageHeader
        eyebrow="Profile"
        title="Your settings"
        subtitle="Travel preferences, documents, and notification posture."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardBody className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar name={`${me.firstName} ${me.lastName}`} size={64} />
              <div>
                <Button variant="outline" size="sm">
                  Change photo
                </Button>
                <div className="mt-1 text-xs text-navy-500">PNG or JPG · max 2MB</div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <Input label="First name" defaultValue={me.firstName} />
              <Input label="Last name" defaultValue={me.lastName} />
              <Input label="Work email" defaultValue={me.email} disabled />
              <Input label="Job title" defaultValue={me.jobTitle} />
              <Select label="Preferred language" defaultValue="en">
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="pt">Português</option>
                <option value="sw">Kiswahili</option>
              </Select>
              <Select label="Home airport" defaultValue="LOS">
                <option>LOS · Lagos</option>
                <option>NBO · Nairobi</option>
                <option>JNB · Johannesburg</option>
                <option>ACC · Accra</option>
              </Select>
            </div>
            <div className="flex justify-end">
              <Button>Save changes</Button>
            </div>
          </CardBody>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Travel documents</CardTitle>
            </CardHeader>
            <CardBody className="space-y-3 text-sm">
              <Row label="Passport" value="A•••• •••3 (NG)" />
              <Row label="Expires" value="Aug 14, 2031" />
              <Row label="Frequent flyer" value="KQ · ET" />
              <Button variant="outline" size="sm" className="w-full">
                Update documents
              </Button>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
            </CardHeader>
            <CardBody className="space-y-3 text-sm">
              <Row label="Seat" value="Window" />
              <Row label="Meal" value="Standard" />
              <Row label="Notifications" value="Email + WhatsApp" />
              <Badge tone="terracotta" dot>
                MFA enabled
              </Badge>
            </CardBody>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-navy-500">{label}</span>
      <span className="text-navy-800 font-medium">{value}</span>
    </div>
  );
}
