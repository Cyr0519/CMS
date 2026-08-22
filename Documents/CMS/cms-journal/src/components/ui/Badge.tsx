import type { ReactNode } from "react";

import Icon, { type IconName } from "@/components/ui/Icon";

type Variant = "default" | "success" | "warning" | "danger" | "error" | "info" | "brand";

const variants: Record<Variant, string> = {
  default: "bg-gray-100 text-ink-soft",
  brand: "bg-brand-soft text-brand-ink",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-error-soft text-error",
  error: "bg-error-soft text-error",
  info: "bg-info-soft text-info",
};

type Props = { children: ReactNode; variant?: Variant; icon?: IconName; dot?: boolean; className?: string };

/** Badge de statut : pilule discrète, jamais un bloc de couleur criard. */
export default function Badge({ children, variant = "default", icon, dot = false, className = "" }: Props) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-label font-medium ${variants[variant]} ${className}`}>
      {dot && <span className="size-1.5 rounded-full bg-current opacity-70" aria-hidden="true" />}
      {icon && <Icon name={icon} size={12} strokeWidth={2} />}
      {children}
    </span>
  );
}
