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
    "inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0B0F14] focus-visible:outline-offset-2";
  const styles =
    variant === "primary"
      ? "border-2 border-[#0B0F14] bg-[#0B0F14] text-[#FFFDF8] hover:bg-[#1a2330] active:scale-[0.98]"
      : variant === "secondary"
        ? "border-2 border-[#0B0F14] bg-white text-[#0B0F14] hover:bg-[#edeae4] active:scale-[0.98]"
        : "border-2 border-transparent text-[#0B0F14]/70 hover:bg-[#edeae4]";

  return (
    <button type={type} className={`${base} ${styles} ${className}`} {...rest}>
      {children}
    </button>
  );
}
