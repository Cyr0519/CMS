"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

import { buttonClasses, type ButtonSize, type ButtonVariant } from "@/components/ui/button-styles";
import Icon, { type IconName } from "@/components/ui/Icon";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: IconName;
  iconRight?: IconName;
  fullWidth?: boolean;
  children?: ReactNode;
};

/** Système de boutons : 5 intentions, 3 tailles, forme en pilule. */
export default function Button({ variant = "primary", size = "md", loading = false, icon, iconRight, fullWidth = false, disabled, className = "", children, ...props }: Props) {
  return (
    <button disabled={disabled || loading} className={`${buttonClasses(variant, size, fullWidth)} ${className}`} {...props}>
      {loading
        ? <span className="size-3.5 animate-spin rounded-full border-[1.5px] border-current border-r-transparent" aria-hidden="true" />
        : icon && <Icon name={icon} size={size === "sm" ? 14 : 16} />}
      {children}
      {iconRight && !loading && <Icon name={iconRight} size={size === "sm" ? 14 : 16} />}
    </button>
  );
}
