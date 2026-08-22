"use client";

import type { ButtonHTMLAttributes } from "react";

import Icon, { type IconName } from "@/components/ui/Icon";

type Variant = "ghost" | "surface" | "destructive";
type Props = ButtonHTMLAttributes<HTMLButtonElement> & { icon: IconName; label: string; variant?: Variant; size?: "sm" | "md" };

const variants: Record<Variant, string> = {
  ghost: "text-ink-muted hover:bg-gray-100 hover:text-ink",
  surface: "border border-line bg-surface text-ink-soft hover:border-line-strong hover:text-ink",
  destructive: "text-ink-muted hover:bg-error-soft hover:text-error",
};

/** Bouton icône seule : la légende accessible est obligatoire, jamais optionnelle. */
export default function IconButton({ icon, label, variant = "ghost", size = "md", className = "", ...props }: Props) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex items-center justify-center rounded-full ${size === "sm" ? "size-7" : "size-8"} ${variants[variant]} ${className}`}
      {...props}
    >
      <Icon name={icon} size={size === "sm" ? 14 : 16} />
    </button>
  );
}
