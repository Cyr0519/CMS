import Link from "next/link";
import type { ComponentProps } from "react";

import { buttonClasses, type ButtonSize, type ButtonVariant } from "@/components/ui/button-styles";
import Icon, { type IconName } from "@/components/ui/Icon";

type Props = ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  iconRight?: IconName;
  fullWidth?: boolean;
};

/** Navigation présentée comme une action : mêmes styles que Button, sémantique de lien. */
export default function ButtonLink({ variant = "primary", size = "md", icon, iconRight, fullWidth = false, className = "", children, ...props }: Props) {
  return (
    <Link className={`${buttonClasses(variant, size, fullWidth)} ${className}`} {...props}>
      {icon && <Icon name={icon} size={size === "sm" ? 14 : 16} />}
      {children}
      {iconRight && <Icon name={iconRight} size={size === "sm" ? 14 : 16} />}
    </Link>
  );
}
