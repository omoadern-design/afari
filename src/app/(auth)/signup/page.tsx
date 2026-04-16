import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Mail, Lock, Building, ArrowRight, Shield } from "@/components/icons";

export const metadata: Metadata = { title: "Create your workspace" };

export default function SignupPage() {
  return (
    <div className="animate-fade-in-up">
      <h1 className="font-display text-display-3 text-navy-800">
        Create your workspace
      </h1>
      <p className="mt-2 text-navy-500">
        Already on AFARI?{" "}
        <Link
          href="/login"
          className="text-terracotta-500 font-medium hover:underline underline-offset-4"
        >
          Sign in
        </Link>
      </p>

      <form className="mt-8 space-y-5" action="/home">
        <Input
          label="Company name"
          placeholder="e.g. Baobab Energy Group"
          iconLeft={<Building size={16} />}
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <Input label="First name" placeholder="Amaka" required />
          <Input label="Last name" placeholder="Okafor" required />
        </div>
        <Input
          type="email"
          label="Work email"
          placeholder="you@yourcompany.com"
          iconLeft={<Mail size={16} />}
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <Select label="Country" defaultValue="NG">
            <option value="NG">Nigeria</option>
            <option value="KE">Kenya</option>
            <option value="ZA">South Africa</option>
            <option value="GH">Ghana</option>
            <option value="EG">Egypt</option>
            <option value="MA">Morocco</option>
            <option value="ET">Ethiopia</option>
            <option value="SN">Senegal</option>
            <option value="CI">Côte d'Ivoire</option>
            <option value="RW">Rwanda</option>
            <option value="TZ">Tanzania</option>
            <option value="UG">Uganda</option>
          </Select>
          <Select label="Team size" defaultValue="20-100">
            <option>1–20</option>
            <option>20–100</option>
            <option>100–500</option>
            <option>500+</option>
          </Select>
        </div>
        <Input
          type="password"
          label="Password"
          placeholder="At least 10 characters"
          iconLeft={<Lock size={16} />}
          hint="Min 10 chars · We check strength with zxcvbn."
          required
        />

        <label className="flex items-start gap-3 text-sm text-navy-600">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-sand-300 text-terracotta-500 focus:ring-terracotta-400/30"
            required
          />
          <span>
            I agree to AFARI's{" "}
            <Link href="#" className="text-terracotta-500 hover:underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="#" className="text-terracotta-500 hover:underline">
              Privacy Policy
            </Link>
            . We comply with GDPR, NDPR and POPIA.
          </span>
        </label>

        <Button type="submit" size="lg" className="w-full" iconRight={<ArrowRight size={18} />}>
          Create workspace
        </Button>
      </form>

      <div className="mt-10 flex items-center gap-2 text-xs text-navy-500">
        <Shield size={14} />
        30 days free · No card needed · Cancel any time
      </div>
    </div>
  );
}
