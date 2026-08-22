"use client";

import type { InputHTMLAttributes, ReactNode } from "react";

import Field, { controlClasses } from "@/components/ui/Field";
import Icon, { type IconName } from "@/components/ui/Icon";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
  icon?: IconName;
  /** Conservé pour compatibilité : accepte un nœud libre à gauche du champ. */
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  wrapperClassName?: string;
};

export default function Input({ label, hint, error, icon, iconLeft, iconRight, className = "", wrapperClassName = "", id, ...props }: Props) {
  const inputId = id || props.name;
  const left = icon ? <Icon name={icon} size={16} /> : iconLeft;
  return (
    <Field id={inputId} label={label} hint={hint} error={error} required={props.required} className={wrapperClassName}>
      <span className="relative block">
        {left && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted">{left}</span>}
        <input id={inputId} className={controlClasses(error, `h-10 px-3 ${left ? "pl-9" : ""} ${iconRight ? "pr-9" : ""} ${className}`)} {...props} />
        {iconRight && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted">{iconRight}</span>}
      </span>
    </Field>
  );
}
