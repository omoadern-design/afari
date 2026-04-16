import Link from "next/link";
import { cn } from "@/lib/cn";

export function Logo({
  className,
  href = "/",
  variant = "default",
}: {
  className?: string;
  href?: string;
  variant?: "default" | "light";
}) {
  const tone = variant === "light" ? "text-white" : "text-navy-800";
  const accent = "text-terracotta-400";
  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-2 group", className)}
    >
      <LogoMark />
      <span
        className={cn(
          "font-display text-[1.45rem] font-semibold tracking-tight leading-none",
          tone
        )}
      >
        afari<span className={accent}>.</span>
      </span>
    </Link>
  );
}

export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Continent silhouette abstracted into a flowing arc */}
      <defs>
        <linearGradient id="afari-mark" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0B1F3A" />
          <stop offset="100%" stopColor="#D97449" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="14" stroke="url(#afari-mark)" strokeWidth="1.5" />
      <path
        d="M9 22 C 13 14, 19 14, 23 22"
        stroke="#D97449"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="9" cy="22" r="1.6" fill="#0B1F3A" />
      <circle cx="23" cy="22" r="1.6" fill="#0B1F3A" />
    </svg>
  );
}
