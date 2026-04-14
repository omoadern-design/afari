import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0a0a0a] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        default:     "bg-[#0a0a0a] text-white hover:bg-[#262626] shadow-sm",
        destructive: "bg-[#dc2626] text-white hover:bg-[#b91c1c]",
        outline:     "border border-[#e5e5e5] bg-white text-[#0a0a0a] hover:bg-[#f7f7f7]",
        secondary:   "bg-[#f0f0f0] text-[#0a0a0a] hover:bg-[#e5e5e5]",
        ghost:       "text-[#737373] hover:bg-[#f0f0f0] hover:text-[#0a0a0a]",
        link:        "text-[#0a0a0a] underline-offset-4 hover:underline",
        success:     "bg-[#16a34a] text-white hover:bg-[#15803d]",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm:      "h-8 rounded-md px-3 text-xs",
        lg:      "h-11 rounded-lg px-8 text-base",
        icon:    "h-9 w-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  )
);
Button.displayName = "Button";

export { Button, buttonVariants };
