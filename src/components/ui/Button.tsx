import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-tight transition-all duration-200 ease-out-soft disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary:
    "bg-terracotta-400 text-white hover:bg-terracotta-500 active:bg-terracotta-600 shadow-soft hover:shadow-lift",
  secondary:
    "bg-navy-800 text-white hover:bg-navy-700 active:bg-navy-900 shadow-soft hover:shadow-lift",
  ghost:
    "bg-transparent text-navy-800 hover:bg-sand-100 active:bg-sand-200",
  outline:
    "bg-white text-navy-800 border border-sand-300 hover:bg-sand-50 hover:border-navy-300",
  danger:
    "bg-ruby text-white hover:bg-ruby/90",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-[0.95rem]",
  lg: "h-14 px-8 text-base",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
};

type ButtonProps = CommonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type LinkButtonProps = CommonProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    href: string;
  };

export function Button(props: ButtonProps | LinkButtonProps) {
  const {
    variant = "primary",
    size = "md",
    className,
    children,
    iconLeft,
    iconRight,
    ...rest
  } = props;
  const classes = cn(base, variants[variant], sizes[size], className);
  const inner = (
    <>
      {iconLeft && <span className="-ml-1 flex shrink-0">{iconLeft}</span>}
      <span>{children}</span>
      {iconRight && <span className="-mr-1 flex shrink-0">{iconRight}</span>}
    </>
  );
  if ("href" in props && props.href) {
    const { href, ...anchorRest } = rest as LinkButtonProps;
    return (
      <Link href={href} className={classes} {...anchorRest}>
        {inner}
      </Link>
    );
  }
  return (
    <button className={classes} {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
      {inner}
    </button>
  );
}
