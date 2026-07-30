import type { ReactNode } from "react";

type Variant = "default" | "success" | "warning" | "danger" | "info";
const variants: Record<Variant, string> = { default: "bg-gray-100 text-gray-600", success: "bg-emerald-100 text-emerald-700", warning: "bg-amber-100 text-amber-700", danger: "bg-red-100 text-red-700", info: "bg-indigo-100 text-indigo-700" };

export default function Badge({ children, variant = "default", className = "" }: { children: ReactNode; variant?: Variant; className?: string }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${variants[variant]} ${className}`}>{children}</span>;
}
