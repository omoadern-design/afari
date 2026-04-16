import * as React from "react";
import { cn } from "@/lib/cn";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  as?: React.ElementType;
  interactive?: boolean;
};

export function Card({
  as: As = "div",
  className,
  interactive,
  ...props
}: CardProps) {
  return (
    <As
      className={cn(
        "rounded-2xl border border-sand-200 bg-white shadow-soft",
        interactive && "transition-all duration-200 ease-out-soft hover:shadow-lift hover:-translate-y-0.5",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-6 pt-6 pb-4", className)} {...props} />;
}

export function CardBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-6 pb-6", className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "px-6 py-4 border-t border-sand-200 flex items-center justify-between gap-4",
        className
      )}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-lg font-semibold tracking-tight text-navy-800", className)}
      {...props}
    />
  );
}

export function CardSubtitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-navy-500/80 mt-1", className)} {...props} />;
}
