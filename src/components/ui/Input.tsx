import * as React from "react";
import { cn } from "@/lib/cn";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, iconLeft, iconRight, className, id, ...props }, ref) => {
    const reactId = React.useId();
    const inputId = id ?? reactId;
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-navy-700 mb-1.5 tracking-tight"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {iconLeft && (
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-navy-400">
              {iconLeft}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "block w-full rounded-xl border border-sand-300 bg-white px-4 h-12 text-[0.95rem] text-navy-800 placeholder:text-navy-400/70 transition-colors",
              "focus:border-terracotta-400 focus:ring-2 focus:ring-terracotta-400/20",
              iconLeft && "pl-10",
              iconRight && "pr-10",
              error && "border-ruby focus:border-ruby focus:ring-ruby/20",
              className
            )}
            {...props}
          />
          {iconRight && (
            <span className="absolute inset-y-0 right-3 flex items-center text-navy-400">
              {iconRight}
            </span>
          )}
        </div>
        {hint && !error && (
          <p className="mt-1.5 text-xs text-navy-500/80">{hint}</p>
        )}
        {error && <p className="mt-1.5 text-xs text-ruby">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, hint, error, className, id, rows = 4, ...props }, ref) => {
    const reactId = React.useId();
    const inputId = id ?? reactId;
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-navy-700 mb-1.5 tracking-tight"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
          className={cn(
            "block w-full rounded-xl border border-sand-300 bg-white px-4 py-3 text-[0.95rem] text-navy-800 placeholder:text-navy-400/70 transition-colors",
            "focus:border-terracotta-400 focus:ring-2 focus:ring-terracotta-400/20",
            error && "border-ruby",
            className
          )}
          {...props}
        />
        {hint && !error && (
          <p className="mt-1.5 text-xs text-navy-500/80">{hint}</p>
        )}
        {error && <p className="mt-1.5 text-xs text-ruby">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, hint, error, className, id, children, ...props }, ref) => {
    const reactId = React.useId();
    const inputId = id ?? reactId;
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-navy-700 mb-1.5 tracking-tight"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={cn(
            "block w-full rounded-xl border border-sand-300 bg-white px-4 h-12 text-[0.95rem] text-navy-800 transition-colors appearance-none",
            "bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%230B1F3A%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><polyline points=%226 9 12 15 18 9%22/></svg>')] bg-no-repeat bg-[right_1rem_center] pr-10",
            "focus:border-terracotta-400 focus:ring-2 focus:ring-terracotta-400/20",
            error && "border-ruby",
            className
          )}
          {...props}
        >
          {children}
        </select>
        {hint && !error && (
          <p className="mt-1.5 text-xs text-navy-500/80">{hint}</p>
        )}
        {error && <p className="mt-1.5 text-xs text-ruby">{error}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";
