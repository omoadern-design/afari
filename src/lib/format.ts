// Formatting helpers — currency, dates, durations.
// All formatting is locale-aware and falls back to en-US.

export function formatMoney(
  amount: number,
  currency: string = "USD",
  locale: string = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

export function formatCompact(amount: number, locale: string = "en-US"): string {
  return new Intl.NumberFormat(locale, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
}

export function formatDate(
  iso: string | Date,
  opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" }
): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return new Intl.DateTimeFormat("en-US", opts).format(d);
}

export function formatDateRange(start: string | Date, end?: string | Date | null) {
  const s = typeof start === "string" ? new Date(start) : start;
  if (!end) return formatDate(s, { month: "short", day: "numeric" });
  const e = typeof end === "string" ? new Date(end) : end;
  const sameMonth = s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear();
  if (sameMonth) {
    return `${new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(s)}–${e.getDate()}`;
  }
  return `${formatDate(s, { month: "short", day: "numeric" })} → ${formatDate(e, { month: "short", day: "numeric" })}`;
}

export function formatTime(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function relativeTime(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  const diffMs = d.getTime() - Date.now();
  const diffMin = Math.round(diffMs / (60 * 1000));
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, "minute");
  const diffHour = Math.round(diffMin / 60);
  if (Math.abs(diffHour) < 48) return rtf.format(diffHour, "hour");
  const diffDay = Math.round(diffHour / 24);
  return rtf.format(diffDay, "day");
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
