"use client";

import type { InputHTMLAttributes, ReactNode } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string; iconLeft?: ReactNode; iconRight?: ReactNode };

export default function Input({ label, error, iconLeft, iconRight, className = "", id, ...props }: Props) {
  const inputId = id || props.name;
  return <label className="block text-sm font-medium text-primary" htmlFor={inputId}>{label && <span className="mb-1.5 block">{label}</span>}<span className="relative block">{iconLeft && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{iconLeft}</span>}<input id={inputId} className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-primary placeholder:text-gray-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 ${error ? "border-danger" : "border-gray-200"} ${iconLeft ? "pl-10" : ""} ${iconRight ? "pr-10" : ""} ${className}`} {...props} />{iconRight && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{iconRight}</span>}</span>{error && <span className="mt-1 block text-xs text-danger">{error}</span>}</label>;
}
