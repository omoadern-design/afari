"use client";

import { useState } from "react";
import { User, Lock, Plane, Bell, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

const DEPARTMENTS = [
  "Engineering", "Sales", "Marketing", "Finance", "Operations",
  "Human Resources", "Legal", "Product", "Design", "Customer Success", "Executive", "Other",
];

const AIRPORTS = [
  { code: "LOS", name: "Lagos — Murtala Muhammed" },
  { code: "NBO", name: "Nairobi — Jomo Kenyatta" },
  { code: "JNB", name: "Johannesburg — O.R. Tambo" },
  { code: "ACC", name: "Accra — Kotoka" },
  { code: "ABJ", name: "Abidjan — Félix Houphouët-Boigny" },
  { code: "ADD", name: "Addis Ababa — Bole" },
  { code: "CMN", name: "Casablanca — Mohammed V" },
  { code: "CPT", name: "Cape Town — Cape Town Intl" },
  { code: "DKR", name: "Dakar — Blaise Diagne" },
  { code: "DXB", name: "Dubai — Dubai Intl" },
  { code: "LHR", name: "London — Heathrow" },
];

const INPUT =
  "w-full rounded-lg border border-[#e5e5e5] bg-[#f7f7f7] px-3.5 py-2.5 text-sm text-[#0a0a0a] placeholder:text-[#a3a3a3] transition-all focus:border-[#7400CC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7400CC]/10 disabled:opacity-60 disabled:cursor-not-allowed";

const LABEL = "mb-1.5 block text-xs font-semibold uppercase tracking-widest text-[#737373]";

type Tab = "profile" | "security" | "preferences" | "notifications";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const user = session?.user;

  const [activeTab, setActiveTab] = useState<Tab>("profile");

  // Profile form
  const [profileForm, setProfileForm] = useState({
    name: user?.name ?? "",
    department: (user as any)?.department ?? "",
    title: "",
    phone: "",
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Password form
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [showPw, setShowPw] = useState(false);

  // Preferences form
  const [prefForm, setPrefForm] = useState({
    homeAirport: "LOS",
    cabin: "ECONOMY",
    seat: "AISLE",
    currency: "USD",
  });

  // Notification settings
  const [notifForm, setNotifForm] = useState({
    approvalUpdates: true,
    expenseReminders: true,
    tripAlerts: true,
    weeklyDigest: false,
  });

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      const res = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      });
      if (!res.ok) throw new Error();
      await update(); // refresh session
      setProfileMsg({ ok: true, text: "Profile updated." });
    } catch {
      setProfileMsg({ ok: false, text: "Failed to save. Try again." });
    } finally {
      setProfileSaving(false);
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pwForm.next !== pwForm.confirm) {
      setPwMsg({ ok: false, text: "New passwords do not match." });
      return;
    }
    if (pwForm.next.length < 8) {
      setPwMsg({ ok: false, text: "Password must be at least 8 characters." });
      return;
    }
    setPwSaving(true);
    setPwMsg(null);
    try {
      const res = await fetch("/api/settings/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setPwMsg({ ok: true, text: "Password changed successfully." });
      setPwForm({ current: "", next: "", confirm: "" });
    } catch (err) {
      setPwMsg({ ok: false, text: err instanceof Error ? err.message : "Failed. Try again." });
    } finally {
      setPwSaving(false);
    }
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "profile",       label: "Profile",        icon: <User className="h-3.5 w-3.5" /> },
    { id: "security",      label: "Security",       icon: <Lock className="h-3.5 w-3.5" /> },
    { id: "preferences",   label: "Travel prefs",   icon: <Plane className="h-3.5 w-3.5" /> },
    { id: "notifications", label: "Notifications",  icon: <Bell className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#0a0a0a]">Settings</h1>
        <p className="text-sm text-[#737373] mt-0.5">Manage your profile, security, and preferences</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap gap-1 rounded-xl border border-[#e5e5e5] bg-[#f7f7f7] p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === t.id
                ? "bg-white text-[#0a0a0a] shadow-sm"
                : "text-[#737373] hover:text-[#0a0a0a]"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="rounded-2xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-sm font-semibold text-[#0a0a0a]">Personal information</h2>
          <form onSubmit={saveProfile} className="space-y-4">
            {/* Avatar */}
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0a0a0a] text-lg font-bold text-white">
                {(user?.name ?? "?").substring(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0a0a0a]">{user?.name}</p>
                <p className="text-xs text-[#737373]">{user?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={LABEL}>Full name</label>
                <input
                  className={INPUT}
                  value={profileForm.name}
                  onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className={LABEL}>Work email</label>
                <input className={INPUT} value={user?.email ?? ""} disabled />
                <p className="mt-1 text-[11px] text-[#a3a3a3]">Email cannot be changed. Contact admin.</p>
              </div>
              <div>
                <label className={LABEL}>Department</label>
                <select
                  className={INPUT}
                  value={profileForm.department}
                  onChange={(e) => setProfileForm((p) => ({ ...p, department: e.target.value }))}
                >
                  <option value="">Select department</option>
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className={LABEL}>Job title</label>
                <input
                  className={INPUT}
                  placeholder="e.g. Senior Engineer"
                  value={profileForm.title}
                  onChange={(e) => setProfileForm((p) => ({ ...p, title: e.target.value }))}
                />
              </div>
              <div>
                <label className={LABEL}>Phone number</label>
                <input
                  className={INPUT}
                  type="tel"
                  placeholder="+234 800 000 0000"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                />
              </div>
              <div>
                <label className={LABEL}>Role</label>
                <input className={INPUT} value={(user as any)?.role ?? ""} disabled />
              </div>
            </div>

            {profileMsg && (
              <div className={`flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-sm ${profileMsg.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                {profileMsg.ok ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                {profileMsg.text}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={profileSaving} size="sm">
                {profileSaving ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />Saving…</> : "Save changes"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <div className="rounded-2xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-sm font-semibold text-[#0a0a0a]">Change password</h2>
          <form onSubmit={changePassword} className="space-y-4 max-w-sm">
            <div>
              <label className={LABEL}>Current password</label>
              <input
                type={showPw ? "text" : "password"}
                className={INPUT}
                placeholder="••••••••"
                value={pwForm.current}
                onChange={(e) => setPwForm((p) => ({ ...p, current: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className={LABEL}>New password</label>
              <input
                type={showPw ? "text" : "password"}
                className={INPUT}
                placeholder="Min. 8 characters"
                value={pwForm.next}
                onChange={(e) => setPwForm((p) => ({ ...p, next: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className={LABEL}>Confirm new password</label>
              <input
                type={showPw ? "text" : "password"}
                className={INPUT}
                placeholder="••••••••"
                value={pwForm.confirm}
                onChange={(e) => setPwForm((p) => ({ ...p, confirm: e.target.value }))}
                required
              />
            </div>
            <label className="flex items-center gap-2 text-xs text-[#737373] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showPw}
                onChange={(e) => setShowPw(e.target.checked)}
                className="rounded"
              />
              Show passwords
            </label>

            {pwMsg && (
              <div className={`flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-sm ${pwMsg.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                {pwMsg.ok ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                {pwMsg.text}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={pwSaving} size="sm">
                {pwSaving ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />Updating…</> : "Update password"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Travel Preferences Tab */}
      {activeTab === "preferences" && (
        <div className="rounded-2xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-sm font-semibold text-[#0a0a0a]">Travel preferences</h2>
          <div className="space-y-4 max-w-sm">
            <div>
              <label className={LABEL}>Home airport</label>
              <select className={INPUT} value={prefForm.homeAirport} onChange={(e) => setPrefForm((p) => ({ ...p, homeAirport: e.target.value }))}>
                {AIRPORTS.map((a) => <option key={a.code} value={a.code}>{a.code} — {a.name}</option>)}
              </select>
            </div>
            <div>
              <label className={LABEL}>Preferred cabin class</label>
              <select className={INPUT} value={prefForm.cabin} onChange={(e) => setPrefForm((p) => ({ ...p, cabin: e.target.value }))}>
                <option value="ECONOMY">Economy</option>
                <option value="PREMIUM_ECONOMY">Premium Economy</option>
                <option value="BUSINESS">Business</option>
              </select>
            </div>
            <div>
              <label className={LABEL}>Seat preference</label>
              <select className={INPUT} value={prefForm.seat} onChange={(e) => setPrefForm((p) => ({ ...p, seat: e.target.value }))}>
                <option value="AISLE">Aisle</option>
                <option value="WINDOW">Window</option>
                <option value="NO_PREF">No preference</option>
              </select>
            </div>
            <div>
              <label className={LABEL}>Preferred currency</label>
              <select className={INPUT} value={prefForm.currency} onChange={(e) => setPrefForm((p) => ({ ...p, currency: e.target.value }))}>
                <option value="USD">USD — US Dollar</option>
                <option value="NGN">NGN — Nigerian Naira</option>
                <option value="KES">KES — Kenyan Shilling</option>
                <option value="ZAR">ZAR — South African Rand</option>
                <option value="GHS">GHS — Ghanaian Cedi</option>
                <option value="EUR">EUR — Euro</option>
              </select>
            </div>
            <div className="flex justify-end pt-2">
              <Button size="sm" onClick={() => {}}>Save preferences</Button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <div className="rounded-2xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-sm font-semibold text-[#0a0a0a]">Notification preferences</h2>
          <div className="space-y-4">
            {([
              { key: "approvalUpdates",  label: "Approval updates",    desc: "When your requests are approved or rejected" },
              { key: "expenseReminders", label: "Expense reminders",   desc: "Prompts to submit outstanding receipts" },
              { key: "tripAlerts",       label: "Trip alerts",         desc: "Flight delays, gate changes, hotel check-in reminders" },
              { key: "weeklyDigest",     label: "Weekly spend digest", desc: "Summary of your travel spend every Monday" },
            ] as const).map((n) => (
              <label key={n.key} className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-[#e5e5e5] p-4 hover:bg-[#f7f7f7] transition-colors">
                <div>
                  <p className="text-sm font-medium text-[#0a0a0a]">{n.label}</p>
                  <p className="mt-0.5 text-xs text-[#737373]">{n.desc}</p>
                </div>
                <div className="relative shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={notifForm[n.key]}
                    onChange={(e) => setNotifForm((p) => ({ ...p, [n.key]: e.target.checked }))}
                  />
                  <div className="h-5 w-9 rounded-full bg-[#e5e5e5] peer-checked:bg-[#7400CC] transition-colors" />
                  <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
                </div>
              </label>
            ))}
            <div className="flex justify-end pt-2">
              <Button size="sm">Save preferences</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
