import { AppShell, type ShellNavItem } from "./AppShell";
import { PageHeader } from "./PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Sparkles, ArrowRight } from "@/components/icons";

export function StubPage({
  scope,
  scopeName,
  nav,
  user,
  eyebrow,
  title,
  subtitle,
  body,
  cta,
}: {
  scope: "Employee" | "Admin" | "Finance";
  scopeName: string;
  nav: ShellNavItem[];
  user: { name: string; jobTitle: string };
  eyebrow: string;
  title: string;
  subtitle: string;
  body: string;
  cta?: { href: string; label: string };
}) {
  return (
    <AppShell scope={scope} scopeName={scopeName} nav={nav} user={user}>
      <PageHeader eyebrow={eyebrow} title={title} subtitle={subtitle} />
      <Card className="bg-sand-50 border-sand-200">
        <CardBody className="p-10 text-center">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-white border border-sand-200 flex items-center justify-center text-terracotta-500">
            <Sparkles size={22} />
          </div>
          <p className="mt-5 max-w-xl mx-auto text-navy-600 leading-relaxed">
            {body}
          </p>
          {cta && (
            <div className="mt-6">
              <Button href={cta.href} iconRight={<ArrowRight size={16} />}>
                {cta.label}
              </Button>
            </div>
          )}
        </CardBody>
      </Card>
    </AppShell>
  );
}
