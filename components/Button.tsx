import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({
  children,
  variant = "primary",
  className = "",
  type = "button",
  ...rest
}: Props) {
  const base =
    "inline-flex items-center justify-center rounded-2xl px-5 py-2.5 text-sm font-semibold transition-all duration-150 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-400";
  const styles =
    variant === "primary"
      ? "bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.98]"
      : variant === "secondary"
        ? "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 active:scale-[0.98]"
        : "bg-transparent text-slate-600 hover:bg-slate-100";

  return (
    <button type={type} className={`${base} ${styles} ${className}`} {...rest}>
      {children}
    </button>
  );
}
