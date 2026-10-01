import type { ComponentPropsWithoutRef } from "react";

interface FieldProps extends ComponentPropsWithoutRef<"input"> {
  label: string;
  name: string;
}

export function Field({ label, name, className = "", ...props }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium text-text">
        {label}
      </label>
      <input
        id={name}
        name={name}
        className={`rounded-[var(--radius-md)] border border-border bg-surface px-3.5 py-2.5 text-sm text-text placeholder:text-text-faint transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-soft ${className}`}
        {...props}
      />
    </div>
  );
}

interface SelectFieldProps extends ComponentPropsWithoutRef<"select"> {
  label: string;
  name: string;
}

export function SelectField({ label, name, className = "", children, ...props }: SelectFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium text-text">
        {label}
      </label>
      <select
        id={name}
        name={name}
        className={`rounded-[var(--radius-md)] border border-border bg-surface px-3.5 py-2.5 text-sm text-text transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-soft ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}
