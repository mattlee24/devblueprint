import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm text-[var(--text-secondary)] mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[var(--radius-input)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--border-active)] focus:outline-none transition-[var(--transition)] ${error ? "border-[var(--accent-red)]" : ""} ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-[var(--accent-red)]">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
