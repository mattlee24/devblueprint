import { forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "text-[var(--accent-foreground)] border border-transparent hover:opacity-90 active:opacity-95 cursor-pointer",
  secondary:
    "bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border)] hover:border-[var(--border-active)] hover:bg-[var(--bg-hover)] active:bg-[var(--bg-active)] cursor-pointer",
  ghost:
    "bg-transparent text-[var(--text-primary)] border border-transparent hover:bg-[var(--bg-hover)] active:bg-[var(--bg-active)] cursor-pointer",
  danger:
    "bg-[var(--accent-red)] text-white border border-transparent hover:opacity-90 active:opacity-95 cursor-pointer",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", className = "", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-[var(--radius-button)] font-medium text-sm transition-[opacity,background-color,border-color] duration-[var(--transition)] disabled:opacity-50 disabled:cursor-not-allowed outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 ${variantStyles[variant]} ${className}`}
        style={variant === "primary" ? { background: "var(--gradient-accent)" } : undefined}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
