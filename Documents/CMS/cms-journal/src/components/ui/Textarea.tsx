"use client";

import type { TextareaHTMLAttributes } from "react";

import Field, { controlClasses } from "@/components/ui/Field";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; hint?: string; error?: string; counter?: boolean; wrapperClassName?: string };

export default function Textarea({ label, hint, error, counter = false, className = "", wrapperClassName = "", id, ...props }: Props) {
  const textareaId = id || props.name;
  const length = typeof props.value === "string" ? props.value.length : 0;
  return (
    <Field id={textareaId} label={label} hint={hint} error={error} required={props.required} className={wrapperClassName}>
      <textarea id={textareaId} className={controlClasses(error, `resize-y px-3 py-2.5 leading-relaxed ${className}`)} {...props} />
      {counter && props.maxLength && <span className="mt-1 block text-right text-caption text-ink-muted tabular">{length}/{props.maxLength}</span>}
    </Field>
  );
}
