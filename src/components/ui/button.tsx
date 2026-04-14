import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1dbd80] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[#1dbd80] text-white shadow-sm hover:bg-[#19a870]",
        destructive:
          "bg-red-500 text-white hover:bg-red-600",
        outline:
          "border border-[#e5e9f0] bg-white text-[#0c1d3d] hover:bg-[#f4f6f9] hover:border-[#c4cdd8]",
        secondary:
          "bg-[#f1f4f9] text-[#0c1d3d] hover:bg-[#e5e9f0]",
        ghost:
          "text-[#6b7a99] hover:bg-[#f1f4f9] hover:text-[#0c1d3d]",
        link:
          "text-[#1dbd80] underline-offset-4 hover:underline",
        success:
          "bg-[#1dbd80] text-white hover:bg-[#19a870]",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-lg px-8 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
