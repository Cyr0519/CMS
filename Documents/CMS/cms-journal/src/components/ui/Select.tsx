"use client";

import type { SelectHTMLAttributes } from "react";

import Field, { controlClasses } from "@/components/ui/Field";
import Icon from "@/components/ui/Icon";

type Props = SelectHTMLAttributes<HTMLSelectElement> & { label?: string; hint?: string; error?: string; wrapperClassName?: string };

export default function Select({ label, hint, error, className = "", wrapperClassName = "", id, children, ...props }: Props) {
  const selectId = id || props.name;
  return (
    <Field id={selectId} label={label} hint={hint} error={error} required={props.required} className={wrapperClassName}>
      <span className="relative block">
        <select id={selectId} className={controlClasses(error, `h-10 appearance-none pl-3 pr-9 ${className}`)} {...props}>
          {children}
        </select>
        <Icon name="chevronDown" size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted" />
      </span>
    </Field>
  );
}
