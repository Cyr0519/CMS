"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "outline" | "danger" | "ghost";
type Size = "sm" | "md" | "lg";
type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children: ReactNode;
};

const variants: Record<Variant, string> = {
  primary: "bg-accent text-white hover:bg-[#d63852]",
  secondary: "bg-primary text-white hover:bg-secondary",
  outline: "border border-gray-300 bg-white text-primary hover:bg-gray-50",
  danger: "bg-danger text-white hover:bg-red-600",
  ghost: "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-primary",
};
const sizes: Record<Size, string> = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm", lg: "px-5 py-3 text-base" };

export default function Button({ variant = "primary", size = "md", loading = false, disabled, className = "", children, ...props }: Props) {
  return <button disabled={disabled || loading} className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition duration-200 ease-out active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`} {...props}>{loading && <span className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden="true" />}<span>{children}</span></button>;
}
